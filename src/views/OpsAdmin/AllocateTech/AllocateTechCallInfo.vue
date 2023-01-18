<template>
    <div class="allocate-tech-call-info-wrap">

        <div class="allocate-tech-call-header-wrap" v-if="call" :class="
            { 
                'open' : call.callStatusId == 1, 
                'allocated' : call.callStatusId == 2,
                'cancelled' : call.callStatusId == 3,
                'closed' : call.callStatusId == 5,
                'completed' : call.callStatusId == 4, 
            }">
            <h4>{{ call.id }}</h4>
            <p>{{ getCallStatusId(call.callStatusId) }}</p>
        </div>

        <div class="allocate-tech-call-info-grid" v-if="call">
            <p>Call Logged:</p>
            <span class="bold">{{ call.openTime }}</span>
            <p>Operator</p>
            <span class="bold">{{ getCallOperator(call.operatorEmployeeCode) }} <span class="small-text">({{ call.operatorEmployeeCode }})</span></span>
            <p>Store:</p>
            <span class="bold">{{ customerStore.name }}</span>
            <p>Branch Code:</p>
            <span class="bold">{{ customerStore.branchCode }}</span>
            <p>Account: </p>
            <span class="bold">{{ customerAccount.name }}</span>
            <p>Address:</p>
            <span class="bold"> {{ customerStore.address }}</span>
            <p>Managed By:</p>
            <span class="bold">{{ call ? getBranch(customerStore.managingBranchId) : '' }}</span>
            <p>Phone:</p>
            <span class="bold">{{ call.contactNumber }}</span>
            <p>Contact Person</p>
            <span class="bold">{{ call.callerName }}</span>
            <p>Call Type</p>
            <span class="bold">{{ getCallTypeName(call.callTypeId) }}</span>
            <p>Order Number</p>
            <span class="bold">{{ call.orderNumber }}</span>
            <p>Details:</p>
            <span class="bold" v-html="call ? processCallDetails(call.callDetails) : ''"></span>
        </div>
    </div>
</template>



<script>
import { mapGetters } from 'vuex'
export default {

    data() {
        return {
            customerStore: '',
            customerAccount: '',
            employees: JSON.parse(localStorage.getItem('employees')),
            branches: JSON.parse(localStorage.getItem('branches')),
            call_types: JSON.parse(localStorage.getItem('call_types')),
            call_statuses: JSON.parse(localStorage.getItem('call_statuses')),
        }
    },



    computed: {
        ...mapGetters({
            call: ['AllocateTech/call'],
        })
    },




    watch: {
        call: {
            handler: function() {
                if(this.call)
                {
                    this.customerStore = this.call.customerStore;
                    this.customerAccount = this.call.customerAccount;
                }
                else
                {
                    this.customerStore = '';
                    this.customerAccount = '';
                }
            },
            deep: true,
            immediate: true
        }
    },





    mounted() {

    },





    methods: {

        getCallStatusId: function(callStatusId) {
            return callStatusId ? this.call_statuses.filter(status => status.id === callStatusId)[0].name : '';
        },

        getCallTypeName: function(callTypeId) {
            return this.call_types.filter(callType => callType.id === callTypeId)[0].name;
        },

        getCallOperator: function(empCode) {
            return this.employees.filter(emp => emp.employeeCode === empCode)[0].displayName;
        },

        getBranch: function(customerBranchId) {
            return this.branches.filter(branch => branch.id === customerBranchId)[0].name;
        },



        processCallDetails: function(callDetails) {

            if(!callDetails){ return }

            var returnDetails = '';
            var splits = callDetails.split('UPDATE:');

            if(splits.length >= 1)
            {
                splits.map((split, index) => index >= 1 ? returnDetails += '<p><span style="color: var(--PendingLight); font-weight: 700">UPDATE:</span> '+ split +'</p>' : returnDetails += '<p style="margin-bottom: 10px;">'+ split +'</p>' );
            }

            return returnDetails;
        },

    }

}
</script>



<style>

.allocate-tech-call-info-wrap {
    background: var(--OffWhite);
    color: var(--TextBlack);
    overflow-y: scroll;
    text-align: left;
    border-top-left-radius: 5px;
    border-top-right-radius: 5px;
    position: relative;
    margin: 0 10px;
    box-shadow: inset 0px -8px 6px -6px rgba(0,0,0,0.4);
}


.allocate-tech-call-info-grid {
    display: grid;
    grid-template-columns: .9fr 1.5fr;
    padding: 0 10px;
    /* box-shadow: inset 0 -4px 20px 0 rgb(0 0 0 / 40%); */
    padding-top: 15px;
}

.allocate-tech-call-info-grid span {
    margin-bottom: 5px;
}




.allocate-tech-call-header-wrap {
    position: sticky;
    top: 0;
    left: 0;
    width: 100%;
    height: 40px;
    background: var(--OpenCall);
    color: var(--TextBlack);
    grid-column: 1 / span 2;
    display: flex;
    align-items: center;
    justify-content: space-between;
    
    padding: 0 10px;
    border-top-left-radius: 5px;
    border-top-right-radius: 5px;
    
}



.allocate-tech-call-header-wrap h4 {
    font-size: 16px;
}





.allocate-tech-call-header-wrap.open {
    background: var(--OpenCall);
    color: var(--TextBlack);
}


.allocate-tech-call-header-wrap.allocated {
    background: var(--AllocatedCall);
    color: var(--TextBlack);
}



.allocate-tech-call-header-wrap.cancelled {
    background: var(--CancelledCall);
    color: var(--TextBlack);
}


.allocate-tech-call-header-wrap.closed {
    background: var(--ClosedCall);
    color: var(--OffWhite);
}


.allocate-tech-call-header-wrap.completed {
    background: var(--CompletedCall);
    color: var(--TextBlack);
}
</style>