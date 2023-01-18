<template>
    <div class="add-call-wrap">

        <div class="loading-lightbox-wrap" v-if="(loading || loadingStores)">
            <font-awesome-icon class="loading-lightbox-icon" :icon="['fa','circle-notch']" size="lg" spin />
        </div>

        <SearchSelect class="add-call-search-select" :searchArray="this.customerStores" :heading="storeSearch.heading" :displayText="storeSearch.displayText" @select="selectCustomerStore($event)" @backspace="resetAddCall()" />
        
        <CustomerDetail />
        <PreviousCall />
        <LogCallForm :resetCall="resetCall" />


        <button class="submit-call-btn" @click="submitCall()" v-if="customerStore" :disabled="!canSubmitCall" :class="{ disabled : !canSubmitCall }">Submit Call</button>
        
    </div>
</template>



<script>
import { mapGetters } from 'vuex';

import SearchSelect from '../../../components/SearchSelect/SearchSelect.vue';
const LZString = require('lz-string');

import CustomerDetail from './CustomerDetail.vue'
import PreviousCall from './PreviousCall.vue';
import LogCallForm from './LogCallForm.vue'

export default {

    components: {
        SearchSelect,
        CustomerDetail,
        PreviousCall,
        LogCallForm
    },



    data() {
        return {
            customerStores: [],
            user: JSON.parse(localStorage.getItem('user')),
            branches: JSON.parse(localStorage.getItem('branches')),

            storeSearch: {
                data: this.customerStores,
                heading: 'Select Customer Store',
                displayText: ''
            },

            resetCall: false
        }
    },




    computed: {
        ...mapGetters({
            loading: ['AddCall/loading'],
            customerStore: ['AddCall/customerStore'],
            customerAccount: ['AddCall/customerAccount'],
            canSubmitCall: ['AddCall/canSubmitCall'],
            modal: ['Modal/modal'],
            resetTextInput: ['AddCall/resetTextInput']
        }),
    },





    watch: {

        modal: {
            handler: function() {
                if(this.modal.confirmAction === true && this.modal.actionFrom.indexOf('checkSubmitNewCall') !== -1)
                {
                    this.$store.dispatch('AddCall/submitCall');
                }
            },
            deep: true
        },


        customerStores: function() {
            this.loadingStores = true;
            if(this.customerStores.length <= 0)
            {
                setTimeout(() => {
                    this.customerStores = JSON.parse(LZString.decompress(localStorage.getItem('customer_stores')));
                    this.loadingStores = false;
                }, 250);
            }
            else
            {
                this.loadingStores = false;
            }
        },


        resetTextInput: {
            handler: function() {
                if(this.resetTextInput === true)
                    this.storeSearch.displayText = ''
            },
            deep: true
        },



        customerStore: {
            handler: function() {
                if(this.customerStore)
                {
                    this.storeSearch.displayText = this.customerStore && this.customerStore.name ? this.customerStore.name + ' ('+this.customerStore.branchCode+')' : '';
                }
            },
            deep: true,
            immediate: true
        }

    },





    mounted() {
        this.loadingStores = true;
        if(this.customerStores.length <= 0)
        {
            setTimeout(() => {
                this.customerStores = JSON.parse(LZString.decompress(localStorage.getItem('customer_stores')));
                this.loadingStores = false;
            }, 250);   
        }
        this.loadingStores = false;
    },




    methods: {


        submitCall: function() {
            this.resetCall = true;
            this.$store.dispatch('AddCall/checkSubmitCall');
            setTimeout(() => {
                this.resetCall = false;
            }, 850);
        },



        resetAddCall: function() {
            this.resetCall = true;
            this.$store.dispatch('AddCall/resetAddCall');
            setTimeout(() => {
                this.resetCall = false;
            }, 850);
        },



        selectCustomerStore: function(customerStore) {
            if(!customerStore) { 
                this.storeSearch.displayText = '';
                this.$store.dispatch('AddCall/resetAddCall');
                return 
            }

            if(customerStore.bubbles) { return }


            if(this.user.branchId !== customerStore.managingBranchId)
            {
                var modal = 
                {
                    active: true, // true to show modal
                    type: 'warning', // ['info', 'warning', 'error', 'okay']
                    icon: ['fa', 'exclamation-triangle'], // Leave blank for no icon
                    heading: 'Branch Warning',
                    body:   '<p>This store is managed by:</p>'
                            +'<p class="bold">'+ this.branches.filter(branch => branch.id === customerStore.managingBranchId)[0].name +'</p>',
                }

            this.$store.dispatch('Modal/modal', modal);
            }


            this.storeSearch.displayText = customerStore && customerStore.name ? customerStore.name + ' ('+customerStore.branchCode+')' : '';
            this.$store.dispatch('AddCall/selectCustomerStore', customerStore);
        }

    }   

}
</script>



<style>

.add-call-wrap {
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    padding-top: 10px;
}



.add-call-search-select {
    margin-bottom: 15px;
}






.submit-call-btn {
    margin-top: 30px;
}

</style>