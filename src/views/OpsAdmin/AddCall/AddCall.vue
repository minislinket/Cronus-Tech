<template>
    <div class="add-call-wrap">
        <SearchSelect :searchArray="this.customerStores" :heading="storeSearch.heading" :displayText="storeSearch.displayText" @select="selectCustomerStore($event)" />
        
    </div>
</template>



<script>
import { mapGetters } from 'vuex';

import SearchSelect from '../../../components/SearchSelect/SearchSelect.vue';
const LZString = require('lz-string');

export default {

    components: {
        SearchSelect
    },



    data() {
        return {
            customerStores: [],
            user: JSON.parse(localStorage.getItem('user')),

            storeSearch: {
                data: this.customerStores,
                heading: 'Select Customer Store',
                displayText: ''
            }
        }
    },




    computed: {
        ...mapGetters({
            customerStore: ['AddCall/customerStore'],
            customerAccount: ['AddCall/customerAccount']
        }),
    },





    watch: {
        customerStores: function() {
            if(this.customerStores.length <= 0)
            {
                this.customerStores = JSON.parse(LZString.decompress(localStorage.getItem('customer_stores')));
            }
        }
    },





    mounted() {
        if(this.customerStores.length <= 0)
        {
            this.customerStores = JSON.parse(LZString.decompress(localStorage.getItem('customer_stores')));
        }
    },




    methods: {

        selectCustomerStore: function(customerStore) {
            if(!customerStore) { 
                this.$store.dispatch('AddCall/resetAddCall');
                return 
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

</style>