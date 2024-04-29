<template>
    <div class="call-uploads-wrap">

        <div class="uploads-action-bar-wrap">

            <div class="uploads-actions-buttons-wrap">
                <button class="uploads-back-to-call-btn" @click="$router.go(-1)">
                    <font-awesome-icon class="uploads-back-to-call-icon" :icon="['fa', 'arrow-alt-circle-left']" size="lg" />
                </button>
                <button class="uploads-refresh-btn" @click="getCallRecords()">
                    <font-awesome-icon class="uploads-refresh-icon" :icon="['fa', 'sync-alt']" size="lg" />
                </button>
            </div>

            <div class="doc-type-select-wrap">
                <template v-for="docCollection in allCallDocs" :key="docCollection.docType.id">
                    <p v-if="docCollection.docs.length >= 1" class="doc-type-selection" @click="scrollToDocType(docCollection.docType.id)" :id="'DocType' + docCollection.docType.id" :class="{ highlight : docCollection.highlighted }">
                        <font-awesome-icon class="uploads-doc-type-icon" :style="{ color: 'var(--AllocatedCall)' }" :icon="getIcon(docCollection.docType.id)" size="lg" /> 
                        <span class="uploads-doc-type-abbrev">{{ docCollection.docType.abbreviation }}</span>
                    </p>
                </template>
            </div>

        </div>


        <!-- <div class="upload-doc-info-wrap">
            
        </div> -->


        <div class="upload-documents-view">
            <template v-for="docCollection in allCallDocs" :key="docCollection.docType.id">
                <div class="document-preview-info-wrap" v-if="docCollection.docs.length >= 1" :id="'UploadsDocType' + docCollection.docType.id">
                    
                    <h3><font-awesome-icon class="uploads-doc-type-icon" :style="{ color: 'var(--AllocatedCall)' }" :icon="getIcon(docCollection.docType.id)" size="lg" /> {{ docCollection.docType.name }}</h3>

                    <div v-for="doc in docCollection.docs">
                        <img v-if="doc.thumbnailURL" :src="doc.thumbnailURL" :alt="doc.uploadFileName">
                        <div class="upload-doc-info-wrap">
                            <div class="doc-file-name-wrap">
                                <h5>Original Name:</h5>
                                <p class="doc-upload-name smaller-text">{{ doc.originalFileName }}</p>
                                <h5>Upload Name:</h5>
                                <p class="doc-upload-name smaller-text">{{ doc.uploadFileName }}</p>
                            </div>
                            <p class="doc-upload-status-wrap" v-if="doc.uploading"><font-awesome-icon class="doc-uploading-icon on" :icon="['fa', 'file-arrow-up']" size="lg" /><span class="tiny-text">Uploading</span></p>
                            <p class="doc-upload-status-wrap" v-else-if="!doc.uploading && !doc.uploadComplete"><font-awesome-icon class="doc-uploading-icon off" :icon="['fa', 'file-circle-xmark']" size="lg" /><span class="tiny-text">Uploading</span></p>
                            <p class="doc-upload-status-wrap" v-else><font-awesome-icon class="doc-uploading-icon inactive" :icon="['fa', 'file-arrow-up']" size="lg" /><span class="tiny-text doc-uploading-text-inactive">Uploading</span></p>
                            <p class="doc-upload-status-wrap" v-if="doc.uploadComplete"><font-awesome-icon class="doc-uploaded-icon on" :icon="['fa', 'file-circle-check']" size="lg" /><span class="tiny-text">Complete</span></p>
                            <p class="doc-upload-status-wrap" v-else><font-awesome-icon class="doc-uploaded-icon off" :icon="['fa', 'file-circle-xmark']" size="lg" /><span class="tiny-text">Complete</span></p>
                            <!-- <p v-if="docCollection.docType.id == 19">...</p> -->
                        </div>
                    </div>



                </div>
            </template>
        </div>



    </div>
</template>




<script>
import { mapGetters } from 'vuex';
import idb from '../../../idb';

export default {

    data() {
        return {
            docTypes: JSON.parse(localStorage.getItem('document_types')),
            allCallDocs: [],

            docTypeIconList: [
                {
                    id: 1,
                    icon: ['fa', 'image'],
                    color: 'var(--BlueLight)'
                },
                {
                    id: 2,
                    icon: ['fa', 'file-pen'],
                    color: 'var(--WarningOrange)'
                },
                {
                    id: 3,
                    icon: ['fa', 'file-circle-question'],
                    color: 'var(--ReroutedLight)'
                },
                {
                    id: 4,
                    icon: ['fa', 'file-lines'],
                    color: 'var(--EnRouteLight)'
                },
                {
                    id: 5,
                    icon: ['fa', 'sim-card'],
                    color: 'var(--BlueLight)'
                },
                {
                    id: 6,
                    icon: ['fa', 'key'],
                    color: 'yellow'
                },
                {
                    id: 7,
                    icon: ['fa', 'moon'],
                    color: 'var(--DarkGrey)'
                },
                {
                    id: 8,
                    icon: ['fa', 'clipboard-check'],
                    color: 'var(--OpenCall)'
                },
                {
                    id: 9,
                    icon: ['fa', 'table-cells-large'],
                    color: 'var(--OnSiteLight)'
                },
                {
                    id: 10,
                    icon: ['fa', 'person-walking-dashed-line-arrow-right'],
                    color: 'var(--GunMetal)'
                },
                {
                    id: 11,
                    icon: ['fa', 'microchip'],
                    color: 'var(--EnRoute)'
                },
                {
                    id: 12,
                    icon: ['fa', 'plug-circle-check'],
                    color: 'var(--AllocatedCall)'
                },
                {
                    id: 13,
                    icon: ['fa', 'eye'],
                    color: 'var(--OkayGreen)'
                },
                {
                    id: 14,
                    icon: ['fa', 'network-wired'],
                    color: 'var(--LightGrey)'
                },
                {
                    id: 15,
                    icon: ['fa', 'video'],
                    color: 'var(--LeftSiteLight)'
                },
                {
                    id: 16,
                    icon: ['fa', 'file-lines'],
                    color: 'var(--Received)'
                },
                {
                    id: 17,
                    icon: ['fa', 'link'],
                    color: 'var(--GunMetal)'
                },
                {
                    id: 18,
                    icon: ['fa', 'mask'],
                    color: 'var(--LightGrey)'
                },
                {
                    id: 19,
                    icon: ['fa', 'clipboard'],
                    color: 'var(--LightGrey)'
                }
            ]
        }
    },




    computed: {
        ...mapGetters({
            call: ['Call/call']
        })
    },




    watch: {
        '$route.params.callId': {
            handler: function() {

                
                if(this.$route.params.callId)
                {
                    // console.log('Call ID Changed...')

                    this.$store.dispatch('Menu/setTitle', { title: 'Uploads on Call #' + this.$route.params.callId, icon: ['fa', 'toolbox'] });
                    setTimeout(() => {
                        this.getCallRecords();    
                    }, 50);
                    
                }
                // else
                //     this.$router.go(-1);
            },
            deep:true,
            immediate: true
        },

    },



    mounted() {
        this.docTypes.map(docType => docType.highlighted = false);
        window.addEventListener('scroll', this.highlightDocType);
    },


    beforeDestroy() {
        window.removeEventListener('scroll', this.highlightDocType);
    },



    methods: {


        getColor: function(docTypeId) {
            var docTypeIcon = this.docTypeIconList.find(icon => icon.id == docTypeId);
            if(docTypeIcon)
                return docTypeIcon.color;
            else
                return 'white';
        },


        getIcon: function(docTypeId) {
            var docTypeIcon = this.docTypeIconList.find(icon => icon.id == docTypeId);
            if(docTypeIcon)
                return docTypeIcon.icon;
            else
                return ['fa', 'file'];
        },


        highlightDocType: function() {
            
            var screenOffSet = window.scrollY + 70;
            
            this.allCallDocs.map(docCollection => {
                if(screenOffSet >= docCollection.elementTop && screenOffSet <= docCollection.elementBottom)
                    docCollection.highlighted = true;
                else
                    docCollection.highlighted = false;
            });
            
        },





        setElementTopAndBottom: function(allCallDocs) {

            allCallDocs.map((docCollection, index) => {
                var docTypeElement = document.getElementById('UploadsDocType' + docCollection.docType.id);
                if(docTypeElement)
                {
                    docCollection.elementTop = docTypeElement.offsetTop;
                    docCollection.elementBottom = docCollection.elementTop + docTypeElement.offsetHeight;
                }

                if(index == 0)
                    docCollection.highlighted = true;

            })

        },





        scrollToDocType: function(docTypeId) {
            const element = document.getElementById('UploadsDocType' + docTypeId);
            const y = element.getBoundingClientRect().top + window.scrollY - 60;
            window.scrollTo({top: y, behavior: 'smooth'});
        },





        getCallRecords: async function() {
            var allCallDocs = [];

            await Promise.all(this.docTypes.map(async docType => {
                return idb.getAllRecordsOfCustomIndex(docType.name, 1, 'call_id', this.call.id)
                .then(async docs => {
                    await Promise.all(docs.map(async doc => {
                        if(doc.thumbnail)
                            doc['thumbnailURL'] = URL.createObjectURL(doc.thumbnail);
                    }));
                    allCallDocs.push(
                        { 
                            docType: docType, 
                            docs: docs, 
                            highlighted: docType.id == 19 ? true : false,
                            elementTop: 0,
                            elementBottom: 0
                        }
                    );
                });
            }));


            allCallDocs.sort((a, b) => a.docType.id - b.docType.id);
            var jobCardDocCollection = allCallDocs.find(docCollection => docCollection.docType.id == 19);
            if(jobCardDocCollection)
            {
                allCallDocs = allCallDocs.filter(docCollection => docCollection.docType.id != 19);
                allCallDocs.unshift(jobCardDocCollection);
            }
            

            setTimeout(() => {
                this.setElementTopAndBottom(allCallDocs);    
            }, 50);
            

            this.allCallDocs = allCallDocs;
        },

    }
    
}
</script>




<style>


.call-uploads-wrap {
    margin-left: 95px;
}






.uploads-actions-buttons-wrap {
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: space-between;
}

.uploads-actions-buttons-wrap button {
    padding: 7px 12px; 
}


.uploads-refresh-icon {
    color: var(--OkayGreen);
}


.uploads-back-to-call-btn {
    /* width: 100%; */
}







.uploads-action-bar-wrap {
    position: fixed;
    top: 50px;
    left: 0;
    width: 95px;
    height: 100%;
    background: var(--BlueAlt);
    text-align: left;
    /* box shadow bottom inset */
    
}




.doc-type-select-wrap {
    
    height: calc(100% - 147px);
    padding-top: 10px;
    overflow-y: scroll;
    box-shadow: inset 0 -20px 20px -20px rgba(0,0,0,.8);
    padding-bottom: 50px;
}



.doc-type-selection {
    display: grid;
    grid-template-columns: 1fr 2fr;
    align-items: center;
    padding: 8px 0;
    padding-left: 5px;
    border-bottom: 1px dashed rgba(255,255,255,0.2);
}

.doc-type-selection:first-child {
    border-top: 1px dashed rgba(255,255,255,0.2);
}

.doc-type-selection.highlight {
    background: rgba(255,255,255,0.1);
}



.uploads-doc-type-icon.pdf {
    color: red;
}

.uploads-doc-type-icon.image {
    color: var(--BlueLight);
}

.uploads-doc-type-abbrev {
    font-weight: 700;
}








.upload-documents-view {
    text-align: left;
    padding-left: 10px;
    padding-top: 10px;
    padding-bottom: calc(100vh - 240px);
    box-shadow: inset 10px 0 10px -10px rgba(0,0,0,0.3);
}


.upload-documents-view h3 {
    margin-bottom: 10px;
    padding: 8px 0;
    background: rgba(0,0,0,0.1);
    margin-left: -10px;
    padding-left: 10px;
}



.document-preview-info-wrap {
    padding-bottom: 50px;
}








.upload-doc-info-wrap {
    display: grid;
    grid-template-columns: 3fr 1fr 1fr;
    align-items: center;
    padding: 5px 0;
    margin-bottom: 5px;
    border-bottom: 1px dashed rgba(255, 255, 255, 0.3);
}






.doc-upload-status-wrap {
    display: flex;
    flex-direction: column;
    align-items: center;
}



.doc-file-name-wrap {

}


.doc-upload-name {
    font-size: 12px;
}



.doc-uploading-icon.on{
    color: var(--OkayGreen);
}

.doc-uploading-icon.off{
    color: var(--WarningOrange);
}

.doc-uploading-icon.inactive {
    color: rgba(210,210,210,0.5);
}

.doc-uploading-text-inactive {
    color: rgba(210,210,210,0.75);
}


.doc-uploaded-icon.on {
    color: var(--OkayGreen);
}

.doc-uploaded-icon.off {
    color: var(--WarningRed);
}
    
</style>