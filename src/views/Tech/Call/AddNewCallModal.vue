<template>
    <div class="app-modal-lightbox" v-if="active" :class="{ active : active }">
        
        <div class="add-new-call-modal app-modal-content">


            <div class="add-new-call-headers-wrap">
                <h4>{{ call.customerStoreName }} ({{ call.customerStoreBranchCode }})</h4>                
            </div>

            <h3>Additional Work - Details</h3>

            <div class="add-new-call-modal-scroll-section">

                <div class="call-types-wrap">
                    <h4>Call Type 
                        <font-awesome-icon class="field-okay-check-icon" v-if="callTypeId" :icon="['fa', 'check']" size="lg" />
                        <font-awesome-icon class="field-required-icon" v-else :icon="['fa', 'exclamation']" size="lg" />
                    </h4>
                    <select v-model="callTypeId">
                        <option v-for="callType in call_types" :key="callType.id" :value="callType.id">{{ callType.name }}</option>
                    </select>

                    <h4>Call Sub Type 
                        <font-awesome-icon class="field-okay-check-icon" v-if="callSubTypeId" :icon="['fa', 'check']" size="lg" />
                        <font-awesome-icon class="field-required-icon" v-else :icon="['fa', 'exclamation']" size="lg" />
                    </h4>
                    <select v-model="callSubTypeId">
                        <option v-for="callSubType in call_sub_types" :key="callSubType.id" :value="callSubType.id">{{ callSubType.name }}</option>
                    </select>
                </div>




                <div class="contact-details-wrap">
                    <h4>Contact Person
                        <font-awesome-icon class="field-okay-check-icon" v-if="contactPerson.length >= 3" :icon="['fa', 'check']" size="lg" />
                        <font-awesome-icon class="field-required-icon" v-else :icon="['fa', 'exclamation']" size="lg" />
                    </h4>
                    <input type="text" v-model="contactPerson" placeholder="Who requested the work?">

                    <h4>Contact Number</h4>
                    <input type="text" v-model="contactNumber" @input="verifyPhoneNumber()">
                </div>



                <div class="call-details-entry-wrap">
                    <h4>Work detail 
                        <font-awesome-icon class="field-okay-check-icon" v-if="callDetails.length > 10" :icon="['fa', 'check']" size="lg" />
                        <font-awesome-icon class="field-required-icon" v-else :icon="['fa', 'exclamation']" size="lg" />
                    </h4>
                    <textarea maxlength="500" class="new-call-details-textarea" v-model="callDetails" placeholder="Please describe in detail the work that needs to be done..."></textarea>
                    <p class="warning small-text warn-over-char-new-call" v-if="maxCharsReached">Maximum characters: 500</p>
                </div>

                

                
                
                <div class="add-new-call-btn-wrap">
                    <button :disabled="callDetails.length < 10 || !callTypeId || !callSubTypeId || contactPerson.length < 3" @click="submitNewCallInfo()">Submit</button>
                    <button class="warning" @click="closeCommentModal()">Cancel</button>
                </div>

            </div>

        </div>

    </div>
</template>


<script>
import { mapGetters } from 'vuex';

export default {

    data() {
        return {
            callDetails: '',
            maxCharsReached: false,
            callTypeId: '',
            callSubTypeId: '',
            contactPerson: '',
            contactNumber: '',
            call_types: JSON.parse(localStorage.getItem('call_types')),
            call_sub_types: JSON.parse(localStorage.getItem('call_sub_types')),
        }
    },




    computed: {
        ...mapGetters({
            active: ['Call/addNewCallModal'],
            call: ['Call/call'],
        })
    },




    watch: {
        callDetails: function() {
            if (this.callDetails.length >= 500) {
                this.maxCharsReached = true;
            } else {
                this.maxCharsReached = false;
            }
        }
    },




    mounted() {
        
    },




    methods: {


        verifyPhoneNumber: function() {
            if (this.contactNumber.length > 10) {
                this.contactNumber = this.contactNumber.slice(0, 10);
            }
        },


        closeCommentModal: function() {
            this.$store.dispatch('Call/addNewCallModal', false);
        },



        submitNewCallInfo: function() {
            this.$emit('submitNewCallInfo', { callDetails: this.callDetails, callTypeId: this.callTypeId, callSubTypeId: this.callSubTypeId, contactPerson: this.contactPerson, contactNumber: this.contactNumber });
            this.closeCommentModal();
        }

    }

}
</script>


<style>


.app-modal-content.add-new-call-modal {
    text-align: left;
    height: 80vh;
    max-height: 450px;
    width: 90vw;
    padding-bottom: 50px;
    padding-top: 0;
}

.add-new-call-modal.active {
    top: 120px;
}





.app-modal-content.add-new-call-modal h3 {
    margin-top: 20px;
    margin-bottom: 20px;
    text-align: center;
}





.add-new-call-modal-scroll-section {
    height: calc(100% - 65px);
    overflow-y: scroll;
    padding-bottom: 30px;
}


.add-new-call-modal-scroll-section input,
.add-new-call-modal-scroll-section select {
    width: 60%;
}


.add-new-call-modal-scroll-section h4 {
    margin-top: 15px;
}





.add-new-call-headers-wrap {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin: 0 -8px;
    padding: 5px 8px;
    margin-bottom: 5px;
    border-bottom: 1px solid var(--OffWhite);
}






.call-types-wrap {
    margin-bottom: 10px;
    margin-top: 20px;
}







.call-details-entry-wrap {
    position: relative;
    margin-bottom: 30px;
}

.call-details-entry-wrap h4 {
    margin-bottom: 10px;
    margin-top: 20px;
}


.warn-over-char-new-call {
    color: var(--WarningOrange);
    font-size: 12px;
    position: absolute;
    bottom: -12px;
    left: 0;
}






.new-call-details-textarea {
    width: 100%;
    height: 200px;
    padding: 5px 10px;
    position: relative;
}


.new-call-details-textarea::placeholder {
    color: rgba(0,0,0,0.4);
}


.new-call-details-textarea.max-chars::after {
    content: 'Max characters reached';
    position: absolute;
    width: 100%;
    height: max-content;
    bottom: 0;
    right: 0;
    font-size: 12px;
    color: var(--WarningOrange);
    padding: 5px;
}








.field-okay-check-icon {
    color: var(--CompletedLight);
    margin-left: 5px;
}


.field-required-icon {
    color: var(--WarningOrange);
    margin-left: 5px;
}








.add-new-call-btn-wrap {
    display: flex;
    align-items: center;
    justify-content: space-evenly;
    /* padding: 0 5px;
    position: absolute;
    width: 100%;
    bottom: 10px;
    left: 0;
    right: 0;
    margin: 0 auto; */
}



.add-new-call-btn-wrap button.warning.orange {
    color: var(--WarningOrange);
}

</style>