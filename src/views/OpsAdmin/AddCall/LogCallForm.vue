<template>
    <div class="add-call-log-call-form" v-if="customerStore">
        
        
        <h4>Order Number <span v-if="(orderNumberConfirmed === false)" class="small-text warning">(Already used)</span></h4>
        <div class="log-call-order-number-wrap">
            <input type="text" v-model="call.orderNumber" @input="checkOrderNumberInput()" :class="{ 'order-number-used' : orderNumberConfirmed === false || orderNumberConfirmed === 'init' && call.orderNumber.length >= 1, 'confirmed' : orderNumberConfirmed === true }">
            <button @click="confirmOrderNumber()" v-if="!checkingOrderNumber" class="confirm-order-number-btn" :class="{  'not-checked' : orderNumberConfirmed === 'init' && call.orderNumber.length >= 1, 'init' : orderNumberConfirmed === 'init' && call.orderNumber.length === 0, 'in-use' : orderNumberConfirmed === false, 'confirmed' : orderNumberConfirmed === true }"><font-awesome-icon :icon="orderNumberConfirmed === true ? ['far','check-circle'] : orderNumberConfirmed === 'init' ? ['fa','question-circle'] : ['fa','times-circle']" size="lg" /></button>
            <font-awesome-icon v-else class="checking-order-number-loading-icon" :icon="['fa','circle-notch']" size="lg" />
        </div>
        

        <h4>Contact Person</h4>
        <div class="log-call-input-wrap">
            <input type="text" v-model="call.callerName" :class="{ 'init' : callerNameConfirmed === 'init' || callerNameConfirmed === false, 'confirmed' : callerNameConfirmed === true }" @input="confirmContactPerson()">
            <font-awesome-icon v-if="callerNameConfirmed !== 'init'" class="confirm-icon" :class="{ 'bad-input' : callerNameConfirmed === false, 'confirmed' : callerNameConfirmed === true }" :icon="callerNameConfirmed === true ? ['far','check-circle'] : ['fa', 'times-circle']" size="lg" />
        </div>


        <h4>Contact Number</h4>
        <div class="log-call-input-wrap">
            <input type="tel" v-model="call.contactNumber" :class="{ 'init' : contactNumberConfirmed === 'init' || contactNumberConfirmed === false, 'confirmed' : contactNumberConfirmed === true }" @input="confirmContactNumber()">
            <button @click="confirmContactNumber()" v-if="contactNumberConfirmed === 'init'" class="confirm-phone-number-btn" :class="{ 'not-checked' : contactNumberConfirmed === 'init' }"><font-awesome-icon :icon="['fa','question-circle']" size="lg" /></button>
            <font-awesome-icon v-else class="confirm-icon" :class="{ 'bad-input' : contactNumberConfirmed === false, 'confirmed' : contactNumberConfirmed === true }" :icon="contactNumberConfirmed === true ? ['far','check-circle'] : ['fa','times-circle']" size="lg" />
        </div>


        <h4>Call Type</h4>
        <div class="log-call-input-wrap">
            <select v-model="call.callTypeId" :class="{ 'init' : callTypeIdConfirmed === 'init', 'confirmed' : callTypeIdConfirmed === true }" @change="confirmCallType()">
                <option v-for="callType in callTypes" :key="callType.id" :value="callType.id">{{ callType.name }}</option>
            </select>
            {{ callTypeId }}
            <font-awesome-icon v-if="(callTypeIdConfirmed !== 'init')" class="confirm-icon" :class="{ 'bad-input' : callTypeIdConfirmed === false , 'confirmed' : callTypeIdConfirmed === true }" :icon="callTypeIdConfirmed === true ? ['far','check-circle'] : ['fa','times-circle']" size="lg" />
        </div>


        <h4>Call Sub Type</h4>
        <div class="log-call-input-wrap">
            <select v-model="call.callSubTypeId" :class="{ 'init' : callSubTypeIdConfirmed === 'init', 'confirmed' : callSubTypeIdConfirmed === true }" @change="confirmCallSubType()">
                <option v-for="callSubType in callSubTypes" :key="callSubType.id" :value="callSubType.id">{{ callSubType.name }}</option>
            </select>
            <font-awesome-icon v-if="(callSubTypeIdConfirmed !== 'init')" class="confirm-icon" :class="{ 'bad-input' : callSubTypeIdConfirmed === false , 'confirmed' : callSubTypeIdConfirmed === true }" :icon="callSubTypeIdConfirmed === true ? ['far','check-circle'] : ['fa','times-circle']" size="lg" />
        </div>


        <div class="add-call-form-inline-flex">
            <h4>Site Ready?</h4>
            <input type="checkbox" v-model="call.siteReady">
        </div>

        <h4>Site Ready Date</h4>
        <input type="date" v-model="call.siteReadyDate">



        <h4>
            Call Details
            <font-awesome-icon v-if="(callDetailsConfirmed !== 'init')" style="margin-left: 5px;" class="confirm-icon" :class="{ 'bad-input' : callDetailsConfirmed === false , 'confirmed' : callDetailsConfirmed === true }" :icon="callDetailsConfirmed === true ? ['far','check-circle'] : ['fa','times-circle']" size="lg" />
        </h4>
        <div class="log-call-input-wrap">
            <textarea v-model="call.callDetails" maxlength="500" :class="{ 'init' : callDetailsConfirmed === 'init' || callDetailsConfirmed === false, 'confirmed' : callDetailsConfirmed === true }" @input="confirmCallDetails()"></textarea>
        </div>
        <p v-if="(call.callDetails.length >= 500)" class="small-text warning">Max characters reached (500)</p>
    </div>
    
</template>




<script>
import { mapGetters } from 'vuex'
import { axiosOffice } from '../../../axios/axios';
export default {


    props: ['resetCall'],



    data() {
        return {

            callTypes: JSON.parse(localStorage.getItem('call_types')),
            callSubTypes: JSON.parse(localStorage.getItem('call_sub_types')),

            checkingOrderNumber: false,

            call: {
                orderNumber: '',
                callerName: '',
                contactNumber: '',
                callTypeId: '',
                callSubTypeId: '',
                callDetails: '',
                siteReady: false,
                siteReadyDate: '',
            },

            orderNumberConfirmed: 'init',
            callerNameConfirmed: 'init',
            contactNumberConfirmed: 'init',
            callTypeIdConfirmed: 'init',
            callSubTypeIdConfirmed: 'init',
            callDetailsConfirmed: 'init',

        }
    },



    computed: {
        ...mapGetters({
            customerStore: ['AddCall/customerStore'],
            canSubmitCall: ['AddCall/canSubmitCall']
        })
    },



    watch: {
        customerStore: {
            handler: function() {
                if(this.customerStore && this.customerStore.phoneNumber)
                {
                    this.call.contactNumber = this.customerStore.phoneNumber/* .replace(/[^0-9/+" "]/g,'') */;
                }
            },
            deep: true,
            
        },



        resetCall: {
            handler: function() {
                if(this.resetCall == true)
                {
                    this.call = {
                        orderNumber: '',
                        callerName: '',
                        contactNumber: '',
                        callTypeId: '',
                        callSubTypeId: '',
                        callDetails: '',
                        siteReady: false,
                        siteReadyDate: '',
                    }

                    this.checkingOrderNumber = false;
                    this.orderNumberConfirmed = 'init';
                    this.callerNameConfirmed = 'init';
                    this.contactNumberConfirmed = 'init';
                    this.callTypeIdConfirmed = 'init';
                    this.callSubTypeIdConfirmed = 'init';
                    this.callDetailsConfirmed = 'init';
                }
            },
            deep: true,
            immediate: true
        }
    },




    methods: {



        checkCanSubmitCall: function() {

            // Check Order Number
            if
            (
                this.callerNameConfirmed === true
                && this.contactNumberConfirmed === true
                && this.callTypeIdConfirmed === true
                && this.callSubTypeIdConfirmed === true
                && this.callDetailsConfirmed === true
            ) 
            {
                if(this.orderNumberConfirmed === true || this.orderNumberConfirmed === 'init' && this.call.orderNumber.length === 0)
                {
                    this.$store.dispatch('AddCall/setNewCall', this.call);
                    this.$store.dispatch('AddCall/canSubmitCall', true);
                }
                else
                {
                    this.$store.dispatch('AddCall/canSubmitCall', false);
                }
            }
            else
            {
                this.$store.dispatch('AddCall/canSubmitCall', false);
            }
            
        },






        confirmContactPerson: function() {
            // Check there are at least 3 characters on the name
            this.callerNameConfirmed = this.call.callerName.length >= 3 ? true : false;
            // Reset the confirmed icon if the user deletes the entire name
            this.call.callerName.length === 0 ? this.callerNameConfirmed = 'init' : null;
            this.checkCanSubmitCall();
        },


        confirmContactNumber: function() {
            this.contactNumberConfirmed = this.call.contactNumber.replace(/\s/g, '').length >= 10 ? true : false;
            this.call.contactNumber.length === 0 ? this.contactNumberConfirmed = false : null;
            this.checkCanSubmitCall();
        },


        confirmCallType: function() {
            this.callTypeIdConfirmed = this.call.callTypeId ? true : false;
            this.checkCanSubmitCall();
        },

        confirmCallSubType: function() {
            this.callSubTypeIdConfirmed = this.call.callSubTypeId ? true : false;
            this.checkCanSubmitCall();
        },



        confirmCallDetails: function() {
            this.call.callDetails = this.call.callDetails.replace(/(?:\r\n|\r|\n)/g, '')
            this.call.callDetails = this.call.callDetails.replace(/[^a-zA-Z0-9+@&%!#-: ]/g, '');
            this.call.callDetails = this.call.callDetails.split('/').join('');
            this.callDetailsConfirmed = this.call.callDetails.length >= 10 ? true : false;
            this.call.callDetails.length === 0 ? this.callDetailsConfirmed = 'init' : null;
            this.checkCanSubmitCall();
        },



        checkOrderNumberInput: function() {
            this.orderNumberConfirmed = 'init';
            this.call.orderNumber = this.call.orderNumber.replace(/\s/g, '');
            this.checkCanSubmitCall();
        },


        confirmOrderNumber: async function() {

            if(this.call.orderNumber.length <= 0) { return }
            
            this.checkingOrderNumber = true;

            await axiosOffice.get('invoices/?orderNumber=' + this.call.orderNumber + '&customerAccountId=' + this.customerStore.customerAccountId)
            .then(async resp => {
                console.log(resp);
                if(resp.status === 200)
                {
                    // Initially we'll confirm the Order Number as TRUE
                    this.orderNumberConfirmed = true;

                    if(resp.data && resp.data.length >= 1)
                    {
                        // Mapping through the result set, if any Order Number is an exact String() match, Order Number has been used
                        await Promise.all(resp.data.map(inv => {
                            if(inv.orderNumber.toString() === this.call.orderNumber.toString())
                            {
                                this.orderNumberConfirmed = false;
                            }
                        }))
                    }

                }
                this.checkingOrderNumber = false;
                this.checkCanSubmitCall();

            })
            .catch(err => {
                console.error('Axios Office Error: ', err);
                console.error('Axios Office Error Response: ', err.response);
                this.checkingOrderNumber = false;
                this.checkCanSubmitCall();
            })
        },

    }

}
</script>




<style>


.add-call-log-call-form {
    text-align: left;
    background: var(--OnSiteDark);
    border: 2px solid var(--BlockBorder);
    border-radius: 3px;
    padding: 10px;
    width: 90vw;
    margin-top: 10px;
}


.add-call-log-call-form h4 {
    margin-top: 10px;
}


.add-call-log-call-form input[type=text] {
    width: 75%;
}


.add-call-log-call-form textarea {
    width: 100%;
    height: 150px;
    padding: 10px;
    margin-bottom: 0;
}


.add-call-form-inline-flex {
    display: flex;
    align-items: center;
}

.add-call-form-inline-flex input {
    margin-left: 12px;
    margin-top: 11px;
    width:22px;
}







.log-call-input-wrap {
    display: flex;
    align-items: center;
}




.log-call-input-wrap input,
.log-call-input-wrap select,
.log-call-input-wrap textarea {
    border: none;
}


.log-call-input-wrap input.init,
.log-call-input-wrap select.init,
.log-call-input-wrap textarea.init {
    border: 2px solid var(--WarningRed);
}


.log-call-input-wrap input.confirmed,
.log-call-input-wrap select.confirmed,
.log-call-input-wrap textarea.confirmed {
    border: 2px solid var(--OkayGreen);
}










.log-call-order-number-wrap input {
    border: none;
}  


.log-call-order-number-wrap input.order-number-used {
    border: 2px solid var(--WarningRed);
}

.log-call-order-number-wrap input.confirmed {
    border: 2px solid var(--OkayGreen);
}








.confirm-phone-number-btn,
.confirm-order-number-btn {
    color: var(--TextOnLightGrey);
    margin-left: 10px;
}

.confirm-order-number-btn.init {
    background: var(--LightGrey);
    color: var(--TextOnLightGrey);
}

.confirm-phone-number-btn.not-checked,
.confirm-order-number-btn.not-checked {
    background: var(--WarningOrange);
    color: var(--OffWhite);
}


.confirm-order-number-btn.in-use {
    background: var(--WarningRed);
}


.confirm-order-number-btn.confirmed {
    background: var(--OkayGreen);
}







.confirm-icon {
    margin-left: 10px;
}


.confirm-icon.bad-input {
    color: var(--WarningRed);
}

.confirm-icon.confirmed {
    color: var(--OkayGreen);
}







.checking-order-number-loading-icon {
    margin-left :10px;

    font-size: 24px;
    color: var(--One);
    animation: color-change 8000ms ease-in-out alternate-reverse infinite, rotate 2s linear infinite;
}

</style>