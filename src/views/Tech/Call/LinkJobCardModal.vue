<template>
    <div class="app-modal-lightbox" v-if="active" :class="{ active : active }">
        
        <div class="link-jc-modal-modal app-modal-content">

            <h4>Link Job Card</h4>

            <div class="link-jc-modal-input-wrap">
                <input type="tel" v-model="jobCardId" @input="jobCardIdVerified = false" placeholder="Job Card Number">
                <font-awesome-icon v-if="!verifying" class="link-jc-verify-jc-id-icon" :class="{ 'warning-orange' : !jobCardIdVerified, okay : jobCardIdVerified, verifying : verifying }" @click="verifyJobCard()" :icon="['far', 'check-circle']" size="lg" />
                <font-awesome-icon v-else class="verifying-jc-id-loading-icon" :icon="['fa', 'circle-notch']" size="lg" spin />
                <!-- <font-awesome-icon class="link-jc-add-jc-id-icon" :class="{ disabled : !jobCardIdVerified }" @click="addJobCard(), jobCardId = ''" :icon="['fa', 'plus-square']" size="lg" /> -->
                
            </div>

            

            <div class="job-card-id-grid-scroll-section">
                <div class="job-card-id-grid" v-for="(jc, index) in jobCardArray" :key="jc">
                    <p>{{ jc.id }}</p>
                    <font-awesome-icon @click="jobCardArray.splice(index, 1)" class="warning" :icon="['fa', 'trash']" size="lg" />
                </div>
            </div>

            


            
            
            <div class="link-jc-modal-btn-wrap">
                <button :disabled="jobCardArray.length <= 0" @click="linkJobCards()">Submit</button>
                <button class="warning" @click="closeLinkJobCardModal()">Cancel</button>
            </div>

        </div>

    </div>
</template>


<script>
import { mapGetters } from 'vuex';
import { axiosOffice } from '../../../axios/axios';
export default {

    data() {
        return {
            jobCard: '',
            jobCardId: '',
            verifying: false,
            jobCardIdVerified: false,
            jobCardArray: [],
            debounce: '',
            user: JSON.parse(localStorage.getItem('user')),
            
        }
    },




    computed: {
        ...mapGetters({
            active: ['Call/linkJobCardModal'],
            call: ['Call/call']
        })
    },




    watch: {
        verifying: {
            handler: function() {
                console.log('verifying?', this.verifying);
            },
            deep: true,
            immediate: true
        }
    },




    mounted() {
        this.reason = '';
    },




    methods: {



        clearFileList: function() {
            this.fileList = [];
        },




        addJobCard: function() {
            if(!this.jobCardIdVerified) { return }

            this.jobCard.customerCallId = this.call.id;

            this.jobCardArray.push(this.jobCard);
            this.jobCardId = '';
            this.jobCard = '';
            this.jobCardIdVerified = false;
        },





        verifyJobCard: function() {

            if(this.verifying) { return }

            // console.log('Verifying JC with: ', this.jobCardId.toString().length);
            this.jobCardIdVerified = false;


            var alreadyLinked = this.call.jobCards.filter(jc => jc.id == this.jobCardId);
            if(alreadyLinked.length >= 1) 
            { 
                var toast = {
                    shown: false,
                    type: 'warning', // ['info', 'warning', 'error', 'okay']
                    heading: 'Already linked to Call', // (Optional)
                    body: '', 
                    time: 2000, // in milliseconds
                    icon: '' // leave blank for default type icon
                }

                this.$store.dispatch('Toast/toast', toast, {root: true});
                this.jobCardIdVerified = false;
                return 
            }

            
            var alreadyHaveId = this.jobCardArray.filter(jobCard => jobCard.id == this.jobCardId);

            
            if(alreadyHaveId.length >= 1) 
            { 
                var toast = {
                    shown: false,
                    type: 'info', // ['info', 'warning', 'error', 'okay']
                    heading: 'Already added', // (Optional)
                    body: '', 
                    time: 2000, // in milliseconds
                    icon: '' // leave blank for default type icon
                }

                this.$store.dispatch('Toast/toast', toast, {root: true});
                this.jobCardIdVerified = false;
                return 
            }



            this.verifying = true;

            axiosOffice.get('job_cards/' + this.jobCardId)
            .then(resp => {
                if(resp.status == 200)
                {
                    if(resp.data.allocatedEmployeeCode === this.user.employeeCode)
                    {
                        if(!resp.data.customerCallId)
                        {
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
                                this.jobCard = '';
                                this.jobCardIdVerified = false;
                                return
                            }
                            this.jobCard = resp.data;
                            this.jobCardIdVerified = true;
                            this.addJobCard();
                        }
                        else
                        {
                            var toast = {
                                shown: false,
                                type: 'warning', // ['info', 'warning', 'error', 'okay']
                                heading: 'Job Card already linked to a Call', // (Optional)
                                body: '', 
                                time: 3000, // in milliseconds
                                icon: '' // leave blank for default type icon
                            }

                            this.$store.dispatch('Toast/toast', toast, {root: true});
                            this.jobCard = '';
                            this.jobCardIdVerified = false;
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
                        this.jobCard = '';
                        this.jobCardIdVerified = false;
                    }
                }

                this.verifying = false;
            })  
            .catch(err => {
                console.error('Axios Office Error: ', err);
                console.error('Axios Office Error Response: ', err.response);
                this.verifying = false;
            })


        },






        closeLinkJobCardModal: function() {
            this.$store.dispatch('Call/linkJobCardModal', false);
            this.jobCardArray = [];
            this.jobCardId = '';
            this.jobCardIdVerified = false;
            this.verifying = false;
        },



        linkJobCards: function() {
            this.$emit('linkJobCards', this.jobCardArray);
            this.$store.dispatch('Call/linkJobCardModal', false);
            setTimeout(() => {
                this.jobCardArray = [];
                this.jobCardId = '';
                this.jobCardIdVerified = false;
                this.verifying = false;
            }, 500);
        }

    }

}
</script>


<style>

.link-jc-modal-modal {
    height: 70vh;
}


.link-jc-modal-modal.active {
    top: 120px;
}


.link-jc-modal-modal h4 {
    margin-bottom: 10px;
}


.link-jc-modal-modal input {
    
}

.link-jc-modal-modal button {
    margin-bottom: 10px;
}




.link-jc-modal-input-wrap {
    display: flex;
    align-items: center;
    justify-content: center;
    margin-bottom: 25px;
}

.link-jc-modal-input-wrap input {
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

.link-jc-modal-input-wrap input::placeholder {
    font-size: 12px;
}


.link-jc-modal-input-wrap button {
    display: flex;
    align-items: center;
    margin-bottom: 0;
}




.link-jc-modal-btn-wrap {
    display: flex;
    align-items: center;
    justify-content: space-evenly;
    padding: 0 5px;
}





.link-jc-add-jc-id-icon {
    color: var(--OkayGreen);
    font-size: 24px;
}

.link-jc-add-jc-id-icon.disabled {
    color: var(--MidGrey);
}



.verifying-jc-id-loading-icon {
    margin-right: 20px;
    animation: color-change 8000ms ease alternate-reverse infinite, rotate 2s linear infinite;
}




.link-jc-verify-jc-id-icon {
    margin-right: 20px;
}


.link-jc-verify-jc-id-icon.okay {
    color: var(--OkayGreen);
}


.link-jc-verify-jc-id-icon.verifying {
    animation: color-change 8000ms ease alternate-reverse infinite;
}






.job-card-id-grid-scroll-section {
    height: 20%;
    text-align: left;
}


.job-card-id-grid {
    display: grid;
    grid-template-columns: 2fr 0.5fr;
    padding: 5px 0;
    padding-left: 10px;
    border-bottom: 1px dashed rgba(255,255,255,0.2);
}

.job-card-id-grid:last-child {
    border-bottom: none;
}











</style>