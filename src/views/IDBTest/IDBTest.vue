<template>
    <div>
        Welcome to IDB Test Page
        <br>

        <button @click="uploadModalActive = true">Upload Docs</button>

        <UploadDocument :active="uploadModalActive" @close="uploadModalActive = false" />

    </div>
</template>



<script>
import UploadDocument from './UploadDocument.vue';

export default {

    components: {
        UploadDocument
    },

    data() {
        return {
            uploadModalActive: false,
        }
    },


    mounted() {

    },



    methods: {

    }
    
}
</script>



<style>
    
</style>