<template>
    <div class="document-uploads-wrap">

        <div class="loading-lightbox-wrap on-top" v-if="loading">
            <font-awesome-icon class="loading-lightbox-icon" :icon="['fa','circle-notch']" size="lg" spin />
        </div>
        
        <div class="document-upload-display-scroll-section">
            <div class="document-upload-display" v-for="call in calls" :key="call.id" @click="selectCall(call)">
                <div class="doc-upload-store-heading-wrap" :class="{ 'margin-one-bottom' : !call.showCallDocuments }">
                    <h4 @click="showCallDocs(call)">
                        {{ call.customerStoreName }} 
                        <font-awesome-icon v-if="call.techStateId == 4" class="doc-upload-tech-state-icon on-site" :icon="['fa', 'map-marker-alt']" size="lg" />
                        <span class="call-id-small"> ({{ call.id }})</span>
                        <!-- <span v-if="call.canArchive"><font-awesome-icon :icon="['fa', 'box-archive']" size="lg" /> Archive</span> -->
                        <font-awesome-icon class="show-hide-call-docs-icon" :class="{ 'rotate' : call.showCallDocuments }" :icon="['fa', 'caret-right']" size="lg" />
                    </h4>

                    <font-awesome-icon v-if="call.canArchive" @click="checkCanArchiveDocs(call.id)" class="archive-call-documents-icon" :class="{ 'requires-docs' : call.requiresDocs }" :icon="['fa', 'box-archive']" size="lg" />
                    <font-awesome-icon v-else-if="!call.canArchive && call.techStateId && call.techStateId >= 4" @click="$store.dispatch('DocUploads/uploadDocModal', true)" class="add-document-icon" :class="{ 'requires-docs' : call.requiresDocs }" :icon="['fa', 'plus-circle']" size="lg" />
                </div>
                <div class="call-documents-grid-scroll-section custom-scroller" v-if="call.showCallDocuments" :class="{ 'extra-bottom' : call.documents.length > 1 }">
                    <p class="no-docs-info-text" v-if="call.documents.length <= 0">No documents yet...</p>
                    <p class="no-docs-info-text" v-if="call.documents.length <= 0">You can add a document by clicking on the green "+" plus icon next to the store's name where you would like to upload the document. If it's not available, you haven't been On Site yet.</p>
                    <div class="call-documents-grid" v-for="doc in call.documents" :key="doc.name" @click="uploadRequiredDocument(doc)">
                        <img class="upload-thumbnail align-center" :src="doc.thumbnail_url" v-if="doc.thumbnail">
                        <font-awesome-icon class="pdf-document-thumbnail-icon align-center" v-else :icon="['fa', 'file-pdf']" size="lg" />
                        <p v-if="!doc.job_card_id" class="small-text">{{ doc.size ? (doc.size / 1000).toFixed(2) + ' kB' : '--' }}</p>
                        <p v-else class="small-text">{{ doc.job_card_id }}</p>
                        <p>{{ getDocumentTypeName(doc.type) }}</p>
                        <p>{{ doc.status }}</p>
                        <font-awesome-icon class="doc-upload-icon required align-center" v-if="doc.status == 'document required'"  :icon="['fa', 'file-circle-exclamation']" size="lg" />
                        <font-awesome-icon class="doc-upload-icon pending align-center" v-if="doc.status == 'pending upload'" :icon="['fa', 'clock-rotate-left']" size="lg" />
                        <font-awesome-icon @click="retryDocUpload(doc)" class="doc-upload-icon uploading align-center" v-if="doc.status == 'uploading'" :icon="['fa', 'file-arrow-up']" size="lg" />
                        <font-awesome-icon class="doc-upload-icon complete align-center" v-if="doc.status == 'complete'" :icon="['fa', 'check-circle']" size="lg" />
                        <font-awesome-icon class="doc-upload-icon retrying align-center" v-if="doc.status == 'retrying'" :icon="['fa', 'sync-alt']" size="lg" />
                        
                    </div>
                </div>
            </div>
        </div>


        <div class="document-uploads-btn-wrap">
            <button @click="syncDocsAndStartUploads()"><font-awesome-icon class="refresh-upload-docs-icon" :icon="['fa', 'sync-alt']" size="lg" /> Refresh</button>
        </div>

        <UploadDocument @uploadDocs="uploadDocs($event)" :call="call" />
        <!-- <LinkJobCardModal @linkOrderNumber="linkOrderNumber($event)" :call="call" /> -->

    </div>
</template>




<script>
import { mapGetters } from 'vuex';

import UploadDocument from './UploadDocument.vue'
import idb from '../../../idb/idb'
// import LinkJobCardModal from '../Call/LinkJobCardModal.vue';

export default {

    components: {
        UploadDocument,
        // LinkJobCardModal
    },


    data() {
        return {
            now: new Date().getTime(),
            document_types: JSON.parse(localStorage.getItem('document_types')),
            calls: [],
        }
    },



    computed: {
        ...mapGetters({
            documents: ['DocUploads/documents'],
            activeCalls: ['Calls/activeCalls'],
            loading: ['DocUploads/loading'],
            modal: ['Modal/modal']
        })
    },



    watch: {
        documents: {
            handler: function() {

                // console.log('Documents in watcher: ', this.documents);

                if(this.documents && this.documents.length >= 1)
                {

                    // This is to assign the previously created Blob URL to the thumbnail_url property of the document object
                    // prevents unnecessary re-rendering of the document thumbnails
                    var previouslyLoadedCalls = JSON.parse(JSON.stringify(this.calls));
                    this.calls = [];

                    // Make a call entry for every active call
                    this.activeCalls.map(call => {

                        var previouslyLoadedCallDocuments = previouslyLoadedCalls.find(c => c.id == call.id) ? previouslyLoadedCalls.find(c => c.id == call.id).documents : [];
                        var newCallDocuments = this.documents.filter(doc => doc.call_id == call.id);

                        newCallDocuments.map(callDoc => {
                            var oldDoc = previouslyLoadedCallDocuments.find(doc => doc.id == callDoc.id);
                            if(oldDoc && oldDoc.thumbnail_url)
                            {
                                callDoc.thumbnail_url = oldDoc.thumbnail_url;
                            }
                        })


                        var pushCall = {
                            id: call.id,
                            techStateId: call.techStateId,
                            jobCards: call.jobCards,
                            customerStoreId: call.customerStoreId,
                            customerStoreName: call.customerStoreName,
                            allDocumentsHaveCMIS: false,
                            showCallDocuments: previouslyLoadedCalls.find(c => c.id == call.id) ? previouslyLoadedCalls.find(c => c.id == call.id).showCallDocuments : false,
                            documents: newCallDocuments,
                            canArchive: false, 
                        };

                        // now let's add the call object to the calls array
                        this.calls.push(pushCall);
                    });


                    // check the documents for missing call ids and add them to this.calls
                    // first make an array of missing call ids, then add their documents as an array to var pushCall
                    var missingCallIds = this.documents.filter(doc => !this.calls.find(call => call.id == doc.call_id)).map(doc => doc.call_id);
                    missingCallIds = [...new Set(missingCallIds)];
                    missingCallIds.map(id => {

                        var callDocs = this.documents.filter(doc => doc.call_id == id);

                        var pushCall = {
                            id: id,
                            jobCards: [], 
                            customerStoreId: callDocs[0].customer_store_id,
                            customerStoreName: callDocs[0].customer_store_name,
                            allDocumentsHaveCMIS: false,
                            showCallDocuments: false,
                            documents: callDocs,
                            canArchive: callDocs.filter(doc => doc.status != 'complete').length >= 1 ? false : true, 
                        };
                        this.calls.push(pushCall);
                    })


                    this.calls.map(call => {

                        call.requiresDocs = false;

                        if(call.documents.length >= 1)
                        {
                            call.requiresDocs = call.documents.filter(doc => doc.status == 'document required' && !doc.size).length >= 1 ? true : null;
                            call.requiresDocs ? call.showCallDocuments = true : null;
                            call.documents.sort((a,b) => {
                                return Number(b.required) - Number(a.required);
                            })
                            call.documents.map(doc => {
                                doc.type === 1 && !doc.thumbnail_url ? doc['thumbnail_url'] = URL.createObjectURL(doc.thumbnail) : null;
                            })
                        }


                        call.allDocumentsHaveCMIS = true;

                        if(call.jobCards.length >= 1)
                        {
                            //check the jc for a cmisDocumentId
                            call.jobCards.map(jc => {
                                if(jc.cmisDocumentId === null)
                                {
                                    call.allDocumentsHaveCMIS = false;
                                }
                                !call.allDocumentsHaveCMIS ? call.showCallDocuments = true : null;
                            })
                            
                        }
                    })

                    // sort calls by requiresDocs, then by customerStoreName
                    this.calls.sort((a,b) => {
                        return Number(b.requiresDocs) - Number(a.requiresDocs) || a.customerStoreName.localeCompare(b.customerStoreName);
                    })

                }
                // if there are no documents, just show the user their active calls
                else
                {
                    this.calls = [];
                    this.activeCalls.map(call => {
                        var pushCall = {
                            id: call.id,
                            jobCards: call.jobCards,
                            techStateId: call.techStateId,
                            customerStoreId: call.customerStoreId,
                            customerStoreName: call.customerStoreName,
                            allDocumentsHaveCMIS: false,
                            showCallDocuments: false,
                            documents: [] 
                        };

                        // now let's add the call object to the calls array
                        this.calls.push(pushCall);
                    });

                    this.calls.sort((a,b) => {
                        return a.customerStoreName.localeCompare(b.customerStoreName);
                    })
                }
            },
            deep: true,
            /* immediate: true */
        },




        modal: {
            handler: function() {
                var callId = this.modal.actionData ? JSON.parse(JSON.stringify(this.modal.actionData)) : '';
                // console.log('Checking call id: ', callId);
                if(this.modal.confirmAction === true && this.modal.actionFrom.indexOf('archive_call_docs'+callId) !== -1)
                {
                    callId ? this.$store.dispatch('DocUploads/archiveCallDocuments', callId) : null;
                }
                
            },
            deep: true
        }
    },




    mounted() {

        // this.startDocumentUploads();     
        this.getDocumentsFromIDB();   
        !this.activeCalls || this.activeCalls.length <= 0 ? this.$store.dispatch('Calls/getTechnicianCalls') : null;

    },




    methods: {


        checkCanArchiveDocs: function(callId) {
            var modal = {
                active: true, // true to show modal
                type: 'okay', // ['info', 'warning', 'error', 'okay']
                icon: [], // Leave blank for no icon
                heading: 'Archive Documents?',
                body:   '<p>This will archive the documents associated with call '+ callId +' on your device.</p>'
                        +'<p>Your documents are safely stored on our server and can be accessed from Cronus 2.1 if needed.</p>'
                        +'<br>'
                        +'<p>Would you like to continue?</p>',
                confirmAction: 'init',
                actionFrom: 'archive_call_docs'+callId,
                actionData: callId,
                resolveText: 'Okay',
                rejectText: 'Cancel'
                
            }
            this.$store.dispatch('Modal/modal', modal);
            
        },


        olderThan1Hour: function(uploadedDate) {
            var now = new Date().getTime();
            var uploaded = new Date(uploadedDate).getTime();
            var diff = now - uploaded;
            var diffInHours = diff / (1000 * 3600);
            return diffInHours > 1 ? true : false;
        },


        retryDocUpload: function(doc) {
            doc.status = 'retrying';
            this.$store.dispatch('DocUploads/updateDocument', doc);
        },



        uploadRequiredDocument: function(document) {
            if(!document.required || document.required && document.size) { return }

            document.type ? this.$store.dispatch('DocUploads/selectedDocumentTypeId', document.type) : null;
            this.$store.dispatch('DocUploads/selectedDocument', document)
            this.$store.dispatch('DocUploads/uploadDocModal', true);
        },




        showCallDocs: function(call) {
            call.showCallDocuments = !call.showCallDocuments;
        },


        selectCall: function(call) {
            if(call.canArchive) { return }
            this.$store.dispatch('Call/loadCall', call.id);
        },


        getDocumentTypeName: function(typeId) {
            var type = this.document_types.filter(type => type.id == typeId);
            return type[0].name;
        },


        createImageUrl: function(thumbnail) {
            return URL.createObjectURL(thumbnail);
        },

        syncDocsAndStartUploads: function() {
            this.getDocumentsFromIDB();
            this.startDocumentUploads();
        },

        getDocumentsFromIDB: function() {
            this.$store.dispatch('DocUploads/getDocuments');
        },

        startDocumentUploads: function() {
            console.log('Starting background sync for DocUploads...');
            idb.startDocumentUploads();
            // this.$store.dispatch('DocUploads/startDocumentUploadSync');
        },

    }
    
}
</script>




<style>

.document-uploads-wrap {
    
}




.document-upload-display-scroll-section {
    max-height: 80vh;
    overflow-y: scroll;
    text-align: left;
    font-size: 14px;
}





.doc-upload-store-heading-wrap {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 5px 10px;
    position: relative;
    background: var(--DarkBlue);
}

.doc-upload-store-heading-wrap.margin-one-bottom {
    margin-bottom: 1px;
}



.doc-upload-store-heading-wrap h4 {
    font-size: 20px;
    display: flex;
    align-items: center;
    padding-right: 95px;
}



.doc-upload-store-heading-wrap h4 span.call-id-small {
    font-size: 14px;
    color: var(--LightGrey);
    display: flex;
    align-items: center;
    margin-left: 3px;
    position: absolute;
    right: 65px;
}

.doc-upload-store-heading-wrap .add-document-icon {
    color: var(--ReceivedLight);
    font-size: 24px;
}


.doc-upload-tech-state-icon.on-site {
    color: var(--OnSiteLight);
    margin-left: 8px;
}



.add-document-icon.requires-docs {
    color: var(--Pending);
}


.show-hide-call-docs-icon {
    position: absolute;
    right: 45px;
    transition: transform 0.3s ease-in-out;
}

.show-hide-call-docs-icon.rotate {
    transform: rotate(90deg);
}

.archive-call-documents-icon {
    font-size: 24px;
    color: var(--CompletedLight);
}





.call-documents-grid-scroll-section {
    max-height: 200px;
    overflow-y: scroll;
    box-shadow: inset 0 -2px 10px 0 rgba(0, 0, 0, 0.15);
    padding: 5px 0 ;
}

.call-documents-grid-scroll-section.extra-bottom {
    box-shadow: inset 0 -2px 10px 0 rgba(0, 0, 0, 0.4);
    padding-bottom: 15px;
}


.call-documents-grid {
    display: grid;
    grid-template-columns: 70px 1fr 1fr 1fr 0.5fr;
    column-gap: 5px;
    align-items: center;
    border-bottom: 1px dashed rgba(255,255,255,0.2);
    padding: 3px 0;
}

.call-documents-grid:last-child {
    border-bottom: none;
}

.call-documents-grid .align-center {
    justify-self: center;
}

.upload-thumbnail {
    max-width: 60px;
}



.call-documents-grid .pdf-document-thumbnail-icon {
    font-size: 32px;
    color: rgb(119, 19, 19);
}




@keyframes upload {
    0% {
        transform: translateY(10px);
        opacity: 1;
    }

    100% {
        transform: translateY(-15px);
        opacity: .1;
    }
}



.doc-upload-icon {

}


.doc-upload-icon.required {
    color: var(--PendingLight);
}
.doc-upload-icon.pending {
    color: var(--WarningOrange);
}
.doc-upload-icon.uploading {
    animation: upload 1500ms ease-in-out infinite;
    color: var(--OpenCall);
}
.doc-upload-icon.complete {
    color: var(--CompletedLight);
}
.doc-upload-icon.retrying {
    color: var(--OpenCall);
}





.document-uploads-btn-wrap {
    position: fixed;
    bottom: 80px;
    left: 0;
    right: 0;
    margin: 0 auto;
    width: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    
}





.no-docs-info-text {
    padding: 0 10px;
    padding-bottom: 3px;
}

    
</style>