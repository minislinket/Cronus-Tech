<template>
    <div>
        Welcome to IDB Test Page
        <br>

        <button @click="uploadModalActive = true">Upload Docs</button>

        <br><br>
        <select v-model="selectedFileType">
            <option v-for="fileType in fileTypes" :key="fileType.id" :value="fileType.name">{{ fileType.name }}</option>
        </select>
        <button @click="getAllDocs()">Get All Docs</button>

        <br><br>
        <input type="text" v-model="testCallId">
        <button @click="testGetCallDocs()">Get Call Id Files</button>

        <br><br>

        <select v-model="deleteRecordId">
            <option v-for="num in 20" :value="num - 1">{{ num - 1 }}</option>
        </select>
        <button @click="testUpdateRecord()">Update Test</button>

        <div style="display: flex; flex-wrap: wrap; width: 100%; align-items: center; justify-content: center;">
            <div v-for="doc in allCallDocs" :key="doc.id">
                <img :src="doc.thumbnailImage" :alt="doc.name">
                <p>{{ doc.originalFileName }} - uploading: {{ doc.uploading ? 'Yes' : 'No' }}, upload complete: {{ doc.uploadComplete ? 'Yes' : 'No' }}</p>
            </div>
        </div>

        <UploadDocument :active="uploadModalActive" @close="uploadModalActive = false" />

    </div>
</template>



<script>
import UploadDocument from './UploadDocument.vue';
import idb from '../../idb';

export default {

    components: {
        UploadDocument
    },

    data() {
        return {
            uploadModalActive: false,
            testCallId: '161621',

            fileTypes: JSON.parse(localStorage.getItem('document_types')),
            selectedFileType: '',

            deleteRecordId: 0,

            allCallDocs: []
        }
    },


    mounted() {

    },



    methods: {

        // START HERE:
        /*
            - idb.js should be complete.
            - we can start working on a queue for the uploads,
            - then handle the uploads in the service worker,
            - and lastly we'll show the uploads (or navigate to them) from a call.
        */



        getAllDocs: async function() {
            var allCallDocs = await idb.getAllRecords(this.selectedFileType, 1)
            console.log('All '+this.selectedFileType+'s: ', allCallDocs);
        },


        testGetCallDocs: async function() {
            var callId = this.testCallId;
            var allCallDocs = await idb.getAllRecordsOfCustomIndex(this.selectedFileType, 1, 'call_id', Number(callId))
            console.log('All Call '+this.selectedFileType+'s: ', allCallDocs);

            await Promise.all(allCallDocs.map(async (doc) => {
                doc['thumbnailImage'] = doc.thumbnail ? URL.createObjectURL(doc.thumbnail) : null;
            }));

            this.allCallDocs = allCallDocs;
        },


        testUpdateRecord: async function() {
            var record = {
                id: this.deleteRecordId,
                uploading: false,
                uploadComplete: false,
            }
            var updatedRecord = await idb.updateRecord('Photo', 1, record);
            console.log('Updated Record: ', updatedRecord);
        },



        testDeleteRecord: function() {
            idb.deleteRecord('Photo', 1, this.deleteRecordId);
        }
    }
    
}
</script>



<style>
    
</style>