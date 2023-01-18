<template>
    <div class="add-call-customer-detail-wrap" v-if="customerStore" @click="showCustomerDetails = !showCustomerDetails">

        <div class="add-call-customer-details-grid" v-if="showCustomerDetails">

            <p>Store:</p>
            <span class="bold">{{ customerStore.name }}</span>
            <p>Account: </p>
            <span class="bold">{{ customerAccount.name }}</span>
            <p>Address:</p>
            <span class="bold"> {{ customerStore.address }}</span>
        
            <p>Managed By:</p>
            <span class="bold">{{ getBranch(customerStore.managingBranchId) }}</span>
            <p>Branch Code:</p>
            <span class="bold">{{ customerStore.branchCode }}</span>
            <p>Phone:</p>
            <span class="bold">{{ customerStore.phoneNumber }}</span>
            
        </div>

        <div class="add-call-customer-details-collapsed" v-else>
            <h4>Customer Details</h4>
        </div>

        <font-awesome-icon class="expand-collapse-icon" :class="{ collapse : showCustomerDetails }" :icon="showCustomerDetails ? ['fa','minus-square'] : ['fa','plus-square']" size="lg" />
        
    </div>
</template>




<script>
import { mapGetters } from 'vuex'
export default {

    data() {
        return{
            branches: JSON.parse(localStorage.getItem('branches')),
            showCustomerDetails: true,
            showPreviousCall: true
        }
    },



    computed: {
        ...mapGetters({
            customerStore: ['AddCall/customerStore'],
            customerAccount: ['AddCall/customerAccount']
        })
    },




    watch: {
        customerStore: {
            handler: function() {
                if(this.customerStore)
                    this.showCustomerDetails = true;
            },
            deep: true
        }
    },





    methods: {
        getBranch: function(customerBranchId) {
            return this.branches.filter(branch => branch.id === customerBranchId)[0].name;
        }
    }

}
</script>




<style>

.add-call-customer-detail-wrap {
    width: 90vw;
    border: 2px solid var(--BlockBorder);
    border-radius: 3px;
    padding: 10px 5px;
    position: relative;
    margin-bottom: 10px;
    background: var(--BlueAlt);
}






.add-call-customer-details-grid {
    display: grid;
    grid-template-columns: 0.9fr 1.5fr;
    text-align: left;
    transition: all 250ms ease;
    animation: fade-in-add-call 600ms ease-out;
}





@keyframes fade-in-add-call {
    0% {
        opacity: 0.15;
    }
    100% {
        opacity: 1;
    }
}



.add-call-customer-details-collapsed {

}


.add-call-customer-details-collapsed h4 {
    animation: fade-in-add-call 300ms ease-out;
}









.expand-collapse-icon {
    position: absolute;
    top: 0;
    bottom: 0;
    right: 10px;
    margin: auto 0;
}


.expand-collapse-icon.collapse {
    top: unset;
    bottom: 10px;
    margin: 0;
}


</style>