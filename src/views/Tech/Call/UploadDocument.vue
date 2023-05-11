<template>
    <div class="app-modal-lightbox" v-if="active" :class="{ active : active }">

        <div class="upload-documents-modal app-modal-content">
  
            <h4>Upload Documents</h4>
            
            <select class="select-doc-type-dropdown" v-model="fileTypeId" @change="clearFileList()">
                <option v-for="type in fileTypes" :key="type.id" :value="type.id">{{ type.name }}</option>
            </select>


            <div class="upload-docs-verify-jc-input-wrap" v-if="fileTypeId == 19">
                <input type="tel" v-model="jobCardId" :disabled="jobCardIdVerified == true && fileList.length >= 1" @input="jobCardIdVerified = false" placeholder="Job Card Number">
                <font-awesome-icon v-if="!verifying" class="upload-docs-verify-jc-icon" :class="{ 'warning-orange' : !jobCardIdVerified, okay : jobCardIdVerified, verifying : verifying }" @click="verifyJobCard()" :icon="['far', 'check-circle']" size="lg" />
                <font-awesome-icon v-else class="verifying-jc-id-loading-icon" :icon="['fa', 'circle-notch']" size="lg" spin />
            </div>

            <div class="custom-file-upload-btn-wrap">
                <label class="custom-file-upload-button" v-if="fileTypeId && fileTypeId !== 19 || fileTypeId && fileTypeId == 19 && jobCardIdVerified == true" >
                    <input class="add-files-input" type="file" @change="addFiles($event)" multiple="multiple">
                    <span>Upload {{ fileTypeId == 19 ? 'Job Card' : fileTypeId == 1 ? '/Take Photo' : 'Document' }}</span>
                </label>
            </div>


            <div class="file-upload-scroll-section">
                <div class="file-upload-grid" v-for="(file, index) in fileList" :key="file.url" :class="{ 'two-columns' : fileTypeId !== 1 }">
                    <img class="thumbnail-image-upload" :src="file.url" v-if="fileTypeId == 1">
                    <span>{{ file.name }}</span>
                    <font-awesome-icon @click="removeFile(index)" class="remove-doc-upload-icon warning" :icon="['fa', 'trash']" size="lg" />
                </div>
                
            </div>



            <div class="upload-docs-modal-btn-wrap">
                <button :disabled="fileList.length <= 0 || fileTypeId == 19 && jobCardIdVerified == false" @click="emitFiles()">Submit</button>
                <button class="warning" @click="closeUploadDocumentsModal()">Cancel</button>
            </div>

        </div>

    </div>
</template>



<script>
import { mapGetters } from 'vuex'
import { axiosOffice } from '../../../axios/axios';
import Compressor from 'compressorjs';
export default {

    data() {
        return {
            fileTypes: JSON.parse(localStorage.getItem('document_types')),
            fileTypeId: '',
            fileList: [],

            verifying: false,
            jobCardIdVerified: false,
            jobCardId: '',

            user: JSON.parse(localStorage.getItem('user')),
        }
    },



    computed: {
        ...mapGetters({
            active: ['Call/uploadDocModal'],
            call: ['Call/call']
        })
    },



    watch: {
        active: {
            handler: function() {
                if(this.active)
                {
                    this.fileTypeId = '';
                    this.fileList = [];
                    this.verifying = false;
                    this.jobCardId = '';
                    this.jobCardIdVerified = false;
                }
            },
            deep: true,
        }
    },




    mounted() {
        
    },




    methods: {  




        verifyJobCard: function() {

            if(this.verifying || !this.jobCardId) { return }

            // console.log('Verifying JC with: ', this.jobCardId.toString().length);
            this.jobCardIdVerified = false;

            this.verifying = true;

            axiosOffice.get('job_cards/' + this.jobCardId)
            .then(resp => {
                if(resp.status == 200)
                {
                    if(resp.data.allocatedEmployeeCode === this.user.employeeCode)
                    {
                        if(!resp.data.customerCallId)
                        {

                            var toast = {
                                shown: false,
                                type: 'warning', // ['info', 'warning', 'error', 'okay']
                                heading: 'Job Card not linked to a Job/Call', // (Optional)
                                body: 'Please link your Job Card first', 
                                time: 5000, // in milliseconds
                                icon: '' // leave blank for default type icon
                            }

                            this.$store.dispatch('Toast/toast', toast, {root: true});                            
                            this.jobCardIdVerified = false;
                            this.verifying = false;
                            return
                            
                        }
                        else
                        {
                            this.jobCardIdVerified = true;
                        }



                        if(resp.data.documentStatusId === 8)
                        {
                            var toast = {
                                shown: false,
                                type: 'error', // ['info', 'warning', 'error', 'okay']
                                heading: 'Job Card has been Cancelled', // (Optional)
                                body: '', 
                                time: 3000, // in milliseconds
                                icon: '' // leave blank for default type icon
                            }

                            this.$store.dispatch('Toast/toast', toast, {root: true});                                
                            this.jobCardIdVerified = false;
                            this.verifying = false;
                            return
                        }
                        
                        
                    }
                    else
                    {
                        var toast = {
                            shown: false,
                            type: 'warning', // ['info', 'warning', 'error', 'okay']
                            heading: 'Not your Job Card', // (Optional)
                            body: '', 
                            time: 2000, // in milliseconds
                            icon: '' // leave blank for default type icon
                        }

                        this.$store.dispatch('Toast/toast', toast, {root: true});                        
                        this.jobCardIdVerified = false;
                    }
                }

                this.verifying = false;
            })  
            .catch(err => {
                console.error('Axios Office Error: ', err);
                console.error('Axios Office Error Response: ', err.response);
                this.verifying = false;
                this.jobCardIdVerified = false;
            })


        },







        clearFileList: function() {
            this.fileList = [];
        },



        emitFiles: async function() {
            var formData = new FormData();
            
            await Promise.all(this.fileList.map(file => {
                if(this.fileTypeId == 1)
                {
                    // var compressedImage = await this.compressImage(files[i], 70);
                    // console.log('File to compress: ', file.file)

                    new Compressor(file.file, {
                        quality: 0.5,

                        // The compression process is asynchronous,
                        // which means you have to access the `result` in the `success` hook function.
                        success(result) {
                            // console.log('Compressed File: ', result);
                            file.file = result;
                            file.url = URL.createObjectURL(result)
                        },
                        error(err) {
                            // console.log(err.message);
                        },
                    });
                    
                }
                var fileExtension = file.file.type.split('/')[1];
                var newFile = new File([file.file], file.name + '.' + fileExtension, { type: file.file.type })
                formData.append('file', newFile);
            }))

            // var formObject = JSON.stringify(Object.fromEntries(formData));
            
            this.$emit('uploadDocs', { formData, fileTypeId: this.fileTypeId, jobCardId: this.jobCardId });
        },



        closeUploadDocumentsModal: function() {
            this.$store.dispatch('Call/uploadDocModal', false);
        },



        removeFile: function(index) {
            this.fileList.splice(index,1);
            this.renameFiles();
        },



        renameFiles: function() {
            var date = new Date()
            // console.log(date);
            // var dateTime = date.replace(/\//g,'.');
            // dateTime = dateTime.replace(',', '');
            var time = date.getHours() + '.' + date.getMinutes() + '.' + date.getSeconds();
            if(this.fileList.length >= 1)
            {
                this.fileList.map((file, i) => {
                    file.name = this.fileTypeId == 19 ? this.jobCardId + ' ' + time : this.call.id + ' ' + time + ' ' + this.user.employeeCode + ' ('+(i+1)+')';
                })
            }

            

            console.log(this.fileList);
        },



        addFiles: function(data) {
            // console.log(data);

            var this2 = this;
            
            
            if(this.fileTypeId == 19 && this.fileList.length >= 1)
            {
                var toast = {
                    shown: false,
                    type: 'warning', // ['info', 'warning', 'error', 'okay']
                    heading: 'Only 1 file can be uploaded', // (Optional)
                    body: '', 
                    time: 3500, // in milliseconds
                    icon: '' // leave blank for default type icon
                }

                this.$store.dispatch('Toast/toast', toast, {root: true});
                return
            }


            if(data.target && data.target.files)
            {

                var files = data.target.files;

                for(var i = 0; i < files.length; i++) {

                    var flag = false;

                    // console.log('File Type: ', files[i].type, 'File Name: ', files[i].name)


                    switch(this.fileTypeId)
                    {
                        case 1 : 
                            if(files[i].type.indexOf('image/') === -1) 
                            {
                                // Toast to the user that it's the wrong file type
                                var toast = {
                                    shown: false,
                                    type: 'warning', // ['info', 'warning', 'error', 'okay']
                                    heading: 'File must be an image', // (Optional)
                                    body: files[i].name, 
                                    time: 3000, // in milliseconds
                                    icon: '' // leave blank for default type icon
                                }

                                this.$store.dispatch('Toast/toast', toast, {root: true});
                                
                                return flag = true;
                            }
                            break


                        case 15 :
                            if(files[i].type.indexOf('video/') === -1) 
                            {
                                // Toast to the user that it's the wrong file type
                                var toast = {
                                    shown: false,
                                    type: 'warning', // ['info', 'warning', 'error', 'okay']
                                    heading: 'File must be an video', // (Optional)
                                    body: files[i].name, 
                                    time: 3000, // in milliseconds
                                    icon: '' // leave blank for default type icon
                                }

                                this.$store.dispatch('Toast/toast', toast, {root: true});
                                
                                return flag = true;
                            }
                            break

                        default :
                            if(files[i].type.indexOf('application/pdf') === -1) 
                            {
                            // Toast to the user that it's the wrong file type
                            var toast = {
                                shown: false,
                                type: 'warning', // ['info', 'warning', 'error', 'okay']
                                heading: 'File must be a PDF', // (Optional)
                                body: files[i].name, 
                                time: 3000, // in milliseconds
                                icon: '' // leave blank for default type icon
                            }

                            this.$store.dispatch('Toast/toast', toast, {root: true});
                            return flag = true;
                        }
                        break
                    }

                    


                    

                    if(this.fileList.length >= 1)
                    {

                        this.fileList.map(listFile => {

                            // console.log('File in file list: ', listFile);

                            if(files[i].name == listFile.file.name)
                            {
                                var toast = {
                                    shown: false,
                                    type: 'info', // ['info', 'warning', 'error', 'okay']
                                    heading: 'File already added', // (Optional)
                                    body: listFile.file.name, 
                                    time: 2000, // in milliseconds
                                    icon: '' // leave blank for default type icon
                                }

                                this.$store.dispatch('Toast/toast', toast, {root: true});
                                flag = true;
                            }

                        })
                    }



                    if(this.fileTypeId == 19 && files.length > 1)
                    {
                        var toast = {
                            shown: false,
                            type: 'warning', // ['info', 'warning', 'error', 'okay']
                            heading: 'Only 1 file can be uploaded', // (Optional)
                            body: '', 
                            time: 3500, // in milliseconds
                            icon: '' // leave blank for default type icon
                        }

                        this.$store.dispatch('Toast/toast', toast, {root: true});
                        flag = true;
                        return
                    } 
                    
                    
                    
                    



                    if(!flag)
                    {

                        

                        var preppedFile = 
                        {
                            name: '',
                            file: files[i],
                            url: URL.createObjectURL(files[i])
                        }

                        this.fileList.push(preppedFile);
                    }
                    
                }

                 this.renameFiles();
            }

            

            
        },




    }

}
</script>



<style>




.upload-documents-modal.app-modal-content {
    height: 75vh;
    max-height: 75vh;
    width: 90vw;
}





.select-doc-type-dropdown {
    margin-bottom: 15px;
}



.add-files-input {
    margin: 15px 0;
    width: 80%;
}




.file-upload-scroll-section {
    height: 60%;
    overflow-y: scroll;
}


.file-upload-grid {
    display: grid;
    grid-template-columns: 50px 2fr 0.4fr;
    align-items: flex-end;
    font-size: 12px;
}


.file-upload-grid.two-columns {
    grid-template-columns: 2fr 0.5fr;
}


.thumbnail-image-upload {
    max-width: 40px;
}








.upload-docs-verify-jc-input-wrap {
    display: flex;
    align-items: center;
    justify-content: center;
    margin-bottom: 25px;
}

.upload-docs-verify-jc-input-wrap input {
    width: 120px;
    text-align: center;
    padding: 0;
    background: transparent;
    border: none;
    border-bottom: 1px solid var(--OffWhite);
    margin-right: 20px;
    color: white;
    border-radius: 0;
}

.upload-docs-verify-jc-input-wrap input::placeholder {
    font-size: 12px;
}


.upload-docs-verify-jc-input-wrap button {
    display: flex;
    align-items: center;
    margin-bottom: 0;
}



.upload-docs-verify-jc-icon.okay {
    color: var(--OkayGreen);
}


.upload-docs-verify-jc-icon.verifying {
    animation: color-change 8000ms ease alternate-reverse infinite;
}







.custom-file-upload-btn-wrap {
    display: flex;
    justify-content: center;
    width: 100%;
    margin-bottom: 15px;
}


.custom-file-upload-button {
    padding: 8px 16px;
	border: none;
	border-radius: 3px;
	box-shadow: -4px 3px 8px 0 rgba(0, 0, 0, 0.2);
	background: var(--OffWhite);
	color: var(--BlueMid);
	font-weight: bold;
	font-size: 16px;
	transition: all 250ms ease;
    display: block;
    width: max-content;
}


.custom-file-upload-button input[type=file] {
    display: none;
}






.upload-docs-modal-btn-wrap {
    position: absolute;
    bottom: 20px;
    left: 0;
    right: 0;
    margin: 0 auto;

    display: flex;
    align-items: center;
    justify-content: space-evenly;
}

</style>