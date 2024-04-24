<template>
    <div class="app-modal-lightbox" v-if="active" :class="{ active : active }">

        <div class="loading-lightbox-fullscreen compressing-files" v-if="compressing">
            <font-awesome-icon class="loading-lightbox-icon" :icon="['fa','circle-notch']" size="lg" spin />
            <br>
            <h3>Compressing...</h3>
        </div>

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
import { axiosOffice } from '../../../axios/axios.js';
import Compressor from 'compressorjs';
import idb from '../../../idb';

export default {

    props: ['active'],

    data() {
        return {
            fileTypes: JSON.parse(localStorage.getItem('document_types')),
            fileTypeId: '',
            fileList: [],

            verifying: false,
            jobCardIdVerified: false,
            jobCardId: '',

            user: JSON.parse(localStorage.getItem('user')),

            compressing: false,
        }
    },



    computed: {
        ...mapGetters({
            // active: ['Call/uploadDocModal'],
            call: ['Call/call'],
            modal: ['Modal/modal']
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
        },


        modal: {
            handler: async function() {
                if(this.modal.confirmAction === true && this.modal.actionFrom.indexOf('complete_call_'+this.call.id) !== -1)
                {
                    this.updateCall(8, this.call);             
                }
                
            },
            deep: true
        }
    },




    mounted() {
        
    },


    /*

    To Test:
    - WORKS! event.lastChance in SW; ie fail an upload enough to trigger lastChance and see if it registers a new sync event
    - Upload of multiple files, go nuts(30+)! Especially photos
    
    To Build:
    - Add a 'remove' button to each file in the list ----MAYBE (gpt suggestion)
    - View uploaded/uploading files in/from the call view with thumbnails (photos only)
    - Trigger Sync for uploads - need to think about when and if manual/user trigger is viable (don't like the idea of a user trigger)
    - Look at deleting entries from IDB when call is no longer with the technician
    - Set photo max size by width, not quality <- Looked at it, photo size is still good (3000 x 4000) and size is low (0.5mb), leave as is.
    */





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

                            var modal = {
                                active: true, // true to show modal
                                type: 'okay', // ['info', 'warning', 'error', 'okay']
                                icon: [], // Leave blank for no icon
                                heading: 'Link Job Card?',
                                body:   '<p>Job Card ' + this.jobCardId + ' is not linked to yet.</p>'
                                        +'<br><p>Would you like to link it to call '+ this.call.id +'?</p>',
                                confirmAction: 'init',
                                actionFrom: 'link_job_card_from_upload_' + this.jobCardId,
                                actionData: '',
                                resolveText: 'Yes',
                                rejectText: 'No'
                                
                            }
                            this.$store.dispatch('Modal/modal', modal);                            
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
            var uploadData = [];
            
            await Promise.all(this.fileList.map(file => {
                var fileExtension = file.file.type.split('/')[1];
                var newFile = new File([file.file], file.name + '.' + fileExtension, { type: file.file.type, lastModified: file.file.lastModified })

                uploadData.push
                (
                    {
                        file: newFile,
                        fileTypeId: this.fileTypeId,
                        jobCardId: this.fileTypeId == 19 ? this.jobCardId : null,
                        uploading: false,
                        uploadComplete: false,
                        originalFileName: file.file.name,
                        uploadFileName: file.name,
                        call_id: this.call.id,
                        customerStoreId: this.call.customerStoreId,
                        thumbnail: file.thumbnail ? file.thumbnail : null
                    }
                )

            }))

            console.log('Upload Data: ', uploadData);

            // console.log('IDB: ', idb)

            var fileTypeName = this.fileTypes.find(type => type.id == this.fileTypeId).name;

            await Promise.all(uploadData.map(async fileData => {
                var result = await idb.addRecord(fileTypeName, 1, [{name: 'call_id', key: 'call_id', unique: false}], fileData);
                console.log('Result: ', result);
            }));

            
            console.log('--------------------');
            console.log('');

            navigator.serviceWorker.getRegistration()
            .then(reg => {
				reg.active.postMessage({type: 'startNewUploads'});
			});

            // if(this.fileTypeId == 19)
            // {
            //     this.call.allJobCardsHaveCMIS = true;
            // }

            this.$emit('close', fileTypeName);
            
        },



        closeUploadDocumentsModal: function() {
            this.$emit('close');
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
            var hours = date.getHours();
            hours = hours < 10 ? '0' + hours.toString() : hours.toString();
            var minutes = date.getMinutes();
            minutes = minutes < 10 ? '0' + minutes.toString() : minutes.toString();
            var seconds = date.getSeconds();
            seconds = seconds < 10 ? '0' + seconds.toString() : seconds.toString();

            console.log('Hours: ', hours, 'Minutes: ', minutes, 'Seconds: ', seconds);

            var time = hours + '.' + minutes + '.' + seconds;

            var fileTypeName = this.fileTypes.find(type => type.id == this.fileTypeId).name;

            if(this.fileList.length >= 1)
            {

                if(this.fileTypeId == 19)
                {
                    this.fileList.map((file, i) => {
                        file.name = fileTypeName + ' ' + this.jobCardId + ' ' + time;
                    })
                    
                }
                else
                {
                    this.fileList.map((file, i) => {
                        file.name = fileTypeName + '_' + (i + 1) + ' ' + date.toLocaleString("en-GB").split(',')[0].replaceAll('/','-') + ' ' + time;
                    })
                }
            }

            

            console.log('Files renamed, list: ', this.fileList);
        },



        addFiles: async function(data) {
            // console.log(data);

            this.compressing = true;
            
            setTimeout(async() => {
                
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

                    // console.log('We have files! ', files);

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
                                    this.compressing = false;
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
                                        heading: 'File must be a video', // (Optional)
                                        body: files[i].name, 
                                        time: 3000, // in milliseconds
                                        icon: '' // leave blank for default type icon
                                    }

                                    this.$store.dispatch('Toast/toast', toast, {root: true});
                                    this.compressing = false;
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
                                this.compressing = false;
                                return flag = true;
                            }
                            break
                        }

                        


                        
                        // console.log('File List: ', this.fileList)
                        if(this.fileList.length > 0)
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
                            this.compressing = false;
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


                            if(this.fileTypeId == 1)
                            {
                                await this.compressFile(files[i], 0.5)
                                .then(compressedFile => {
                                    preppedFile.file = compressedFile;
                                    preppedFile.url = URL.createObjectURL(compressedFile)
                                })
                                .catch(err => {
                                    console.error('Compression Error: ', err);

                                    var toast = {
                                        shown: false,
                                        type: 'error', // ['info', 'warning', 'error', 'okay']
                                        heading: 'Error compressing image', // (Optional)
                                        body: files[i].name, 
                                        time: 5000, // in milliseconds
                                        icon: '' // leave blank for default type icon
                                    }

                                    this.$store.dispatch('Toast/toast', toast, {root: true});
                                })

                                await this.makeThumbnail(files[i], 100)
                                .then(thumbnail => {
                                    preppedFile.thumbnail = thumbnail;
                                    preppedFile.url = URL.createObjectURL(thumbnail);
                                })
                            }

                            

                            this.fileList.push(preppedFile);
                        }
                        else
                        {
                            this.compressing = false;
                        }
                        
                    }

                    this.renameFiles();
                }

                
                console.log('-----------------');
                console.log('');

                if(data.target && data.target) 
                {
                    data.target.value = '';
                }

                this.compressing = false;

            }, 50);
            
        },





        compressFile: function(file, quality) {
            return new Promise((resolve, reject) => {
                new Compressor(file, {
                    quality: quality,

                    // The compression process is asynchronous,
                    // which means you have to access the `result` in the `success` hook function.
                    success(result) {
                        // console.log('Compressed File: ', result);
                        resolve(result);
                    },
                    error(err) {
                        // console.log(err.message);
                        reject(err);
                    },
                });
            })
        },




        makeThumbnail: function(file, width) {
            return new Promise((res, rej) => {
                new Compressor(file, {
                    width: width,
                    success(result) {
                        res(result);
                    },
                    error(err) {
                        rej(err);
                    },
                });
            })
        }


    

    }



}
</script>



<style>


.loading-lightbox-fullscreen.compressing-files {
    display: flex;
    flex-direction: column;
	align-items: center;
	justify-content: center;
}



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