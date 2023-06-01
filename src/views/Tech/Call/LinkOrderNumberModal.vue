<template>
    <div class="app-modal-lightbox" v-if="active" :class="{ active : active }">
        
        <div class="link-order-number-modal app-modal-content">

            <h4>Upload Order Number</h4>

            <div class="link-order-number-modal-input-wrap">
                <input type="text" v-model="orderNumber" @input="abortOrderNumberCheck()" placeholder="Order Number">
                <font-awesome-icon v-if="!verifying && orderNumberVerified !== false" class="link-order-number-icon" :class="{ 'warning-orange' : orderNumberVerified == 'init', okay : orderNumberVerified == true, verifying : verifying }" @click="verifyOrderNumber()" :icon="['far', 'check-circle']" size="lg" />
                <font-awesome-icon v-else-if="!verifying && orderNumberVerified == false" class="link-order-number-icon warning" :class="{ 'used' : orderNumberVerified == false, verifying : verifying }" @click="verifyOrderNumber()" :icon="['far', 'times-circle']" size="lg" />
                <font-awesome-icon v-if="verifying" class="verifying-order-number-id-loading-icon" :icon="['fa', 'circle-notch']" size="lg" spin />
                <!-- <font-awesome-icon class="link-order-number-add-jc-id-icon" :class="{ disabled : !jobCardIdVerified }" @click="addJobCard(), jobCardId = ''" :icon="['fa', 'plus-square']" size="lg" /> -->
                
            </div>

            
            <div class="link-order-number-modal-btn-wrap">
                <button :disabled="!this.orderNumber || !this.orderNumberVerified || this.orderNumberVerified == 'init' || verifying == true" @click="linkOrderNumber()">Submit</button>
                <button class="warning" @click="closeLinkOrderNumberModal()">Cancel</button>
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
            orderNumber: '',
            verifying: false,
            orderNumberVerified: 'init',
            axiosController: ''
        }
    },




    computed: {
        ...mapGetters({
            active: ['Call/linkOrderNumberModal'],
            call: ['Call/call']
        })
    },




    watch: {
        verifying: {
            handler: function() {
                // console.log('verifying?', this.verifying);
                if(!this.verifying && this.axiosController)
                {

                }
            },
            deep: true,
            immediate: true
        }
    },




    mounted() {
        this.axiosController = new AbortController();
        this.orderNumber = '';
        this.orderNumberVerified = 'init';
        this.verifying = false;
    },




    methods: {


        



        abortOrderNumberCheck: function() {
    
            this.orderNumberVerified = 'init';
            if(this.verifying)
            {
                this.axiosController.abort();
                this.axiosController = new AbortController();
            }
        },




        looksLikeAnOrderNumber: function() {

            var vowelMatch = this.orderNumber.match(/[aeiou]/gi);
            // console.log(vowelMatch === null ? 0 : vowelMatch.length);

            if(vowelMatch && vowelMatch.length >= 3)
            {
                var modal = {
                    active: true, // true to show modal
                    type: 'warning', // ['info', 'warning', 'error', 'okay']
                    icon: [], // Leave blank for no icon
                    heading: 'Order Number?',
                    body:   '<p>That doesn\'t look like an Order Number.</p><br>'
                            +'<p>If you\'re having trouble getting the Order from the Store, please place this Job/Call On-Hold with a reason of "Awaiting Order".</p>',
                    confirmAction: 'init',
                    actionFrom: '',
                    actionData: '',
                    resolveText: 'Okay',
                    rejectText: 'Cancel'
                    
                }
                this.$store.dispatch('Modal/modal', modal);
                return false;
            }
            else
            {
                return true;
            }
            

            

        },





        verifyOrderNumber: async function() {

            const signal = this.axiosController ? this.axiosController.signal : '';


            if(!this.looksLikeAnOrderNumber()) { return }



            this.verifying = true;

            
            await axiosOffice.get('invoices/?orderNumber=' + this.orderNumber + '&customerAccountId=' + this.call.customerAccount.id, { signal })
            .then(async resp => {

                if(resp.status === 200)
                {

                    //console.log(resp);

                    var invoices = resp.data;
                    var flag = false;

                    await Promise.all(invoices.map(async invoice => {

                        if(invoice.orderNumber === this.orderNumber)
                        {
                            flag = true;
                        }
                        
                    }))

                    .then(() => {
                        // console.log(flag);

                        if(!flag)
                            this.orderNumberVerified = true;
                        else
                            this.orderNumberVerified = false;
                    })

                }

                this.verifying = false;
            })

            .catch(err => {
                console.error('Axios Office Error: ', err);
                console.error('Axios Office Error Response: ',err.response);
                this.verifying = false;
                this.orderNumberVerified = 'init';
            }) 
        },



        closeLinkOrderNumberModal: function() {
            this.$store.dispatch('Call/linkOrderNumberModal', false);
            this.orderNumber = '';
            this.orderNumberVerified = 'init';
            this.verifying = false;
        },



        linkOrderNumber: function() {
            this.$emit('linkOrderNumber', this.orderNumber);
            this.closeLinkOrderNumberModal();
        }

    }

}
</script>


<style>

.link-order-number-modal {
    height: 25vh;
}


.link-order-number-modal.active {
    top: 120px;
}


.link-order-number-modal h4 {
    margin-bottom: 10px;
}


.link-order-number-modal input {
    
}

.link-order-number-modal button {
    margin-bottom: 10px;
}




.link-order-number-modal-input-wrap {
    display: flex;
    align-items: center;
    justify-content: center;
    margin-bottom: 25px;
}

.link-order-number-modal-input-wrap input {
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

.link-order-number-modal-input-wrap input::placeholder {
    font-size: 12px;
}


.link-order-number-modal-input-wrap button {
    display: flex;
    align-items: center;
    margin-bottom: 0;
}




.link-order-number-modal-btn-wrap {
    display: flex;
    align-items: center;
    justify-content: space-evenly;
    padding: 0 5px;
}





.link-order-number-add-jc-id-icon {
    color: var(--OkayGreen);
    font-size: 24px;
}

.link-order-number-add-jc-id-icon.disabled {
    color: var(--MidGrey);
}



.verifying-order-number-id-loading-icon {
    margin-right: 20px;
    animation: color-change 8000ms ease alternate-reverse infinite, rotate 2s linear infinite;
}




.link-order-number-icon {
    margin-right: 20px;
}


.link-order-number-icon.okay {
    color: var(--OkayGreen);
}


.link-order-number-icon.verifying {
    animation: color-change 8000ms ease alternate-reverse infinite;
}






/* .job-card-id-grid-scroll-section {
    height: 60%;
    text-align: left;
} */


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