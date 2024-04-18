<template>
    <div>
        Welcome to IDB Test Page
        <br>

        <button @click="uploadModalActive = true">Upload Docs</button>

        <br><br>
        <select v-model="selectedFileType">
            <option v-for="fileType in fileTypes" :key="fileType.id" :value="fileType.name">{{ fileType.name }}</option>
        </select>
        <button @click="getAllPhotos()">Get All Docs</button>

        <br><br>
        <input type="text" v-model="testCallId">
        <button @click="testGetCallPhotos()">Get Call Id Files</button>

        <br><br>

        <select v-model="deleteRecordId">
            <option v-for="num in 20" :value="num - 1">{{ num - 1 }}</option>
        </select>
        <button @click="testUpdateRecord()">Update Test</button>

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
            testCallId: '109001',

            fileTypes: JSON.parse(localStorage.getItem('document_types')),
            selectedFileType: '',

            deleteRecordId: 0
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



        getAllPhotos: async function() {
            var allCallPhotos = await idb.getAllRecords(this.selectedFileType, 1)
            console.log('All '+this.selectedFileType+'s: ', allCallPhotos);
        },


        testGetCallPhotos: async function() {
            var callId = this.testCallId;
            var allCallPhotos = await idb.getAllRecordsOfCustomIndex(this.selectedFileType, 1, 'call_id', Number(callId))
            console.log('All Call '+this.selectedFileType+'s: ', allCallPhotos);
        },


        testUpdateRecord: async function() {
            var record = {
                id: this.deleteRecordId,
                uploading: false,
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