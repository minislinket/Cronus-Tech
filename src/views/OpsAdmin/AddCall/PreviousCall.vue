<template>
    <div class="add-call-previous-call-wrap" v-if="previousCall" @click="showPreviousCall = !showPreviousCall">

        <div v-if="showPreviousCall" class="add-call-previous-call-grid-wrap">
            <h3>Previous Call</h3>
            <div class="add-call-previous-call-grid" >

                <p>Call Ref:</p>
                <span class="bold">{{ previousCall.id }}</span>
                <p>Details:</p>
                <span class="bold">{{ previousCall.callDetails }}</span>
                <p>Opened: </p>
                <span class="bold">{{ previousCall.openTime }}</span>
                <p>Closed:</p>
                <span class="bold"> {{ previousCall.closeTime }}</span>
            
                <p>Operator:</p>
                <span style="padding-right: 20px" class="bold">{{ getOperator(previousCall.operatorEmployeeCode) }}</span>

                <p  class="add-call-call-status"
                    :class="{
                        open : previousCall.callStatusId == 1,
                        allocated : previousCall.callStatusId == 2,
                        closed : previousCall.callStatusId == 5,
                        cancelled : previousCall.callStatusId == 3,
                        completed : previousCall.callStatusId == 4
                    }">
                    {{ getCallStatusId(previousCall.callStatusId) }}
                </p>
                
                
            </div>
        </div>

        <div class="add-call-previous-call-collapsed" v-else>
            <h4>Previous Call</h4>
        </div>

        <font-awesome-icon class="expand-collapse-icon" :class="{ collapse : showPreviousCall }" :icon="showPreviousCall ? ['fa','minus-square'] : ['fa','plus-square']" size="lg" />
        
    </div>
</template>




<script>
import { mapGetters } from 'vuex'
export default {

    data() {
        return{
            employees: JSON.parse(localStorage.getItem('employees')),
            call_statuses: JSON.parse(localStorage.getItem('call_statuses')),
            showPreviousCall: true
        }
    },



    computed: {
        ...mapGetters({
            previousCall: ['AddCall/previousCall'],
        })
    },




    watch: {

    },





    methods: {
        getOperator: function(employeeCode) {
            return this.employees.filter(emp => emp.employeeCode === employeeCode)[0].displayName;
        },


        getCallStatusId: function(callStatusId) {
            return callStatusId ? this.call_statuses.filter(status => status.id === callStatusId)[0].name : '';
        },
    }

}
</script>




<style>

.add-call-previous-call-wrap {
    width: 90vw;
    border: 2px solid var(--BlockBorder);
    border-radius: 3px;
    padding: 10px 5px;
    position: relative;
    background: var(--BlueAlt);
}









.add-call-previous-call-grid-wrap {
    transition: all 250ms ease;
    animation: fade-in-add-call 600ms ease-out;
}


.add-call-previous-call-grid-wrap h3 {
    text-align: left;
    margin-bottom: 10px;
}





.add-call-previous-call-grid {
    display: grid;
    grid-template-columns: 0.9fr 1.5fr;
    text-align: left;
    
}





@keyframes fade-in-add-call {
    0% {
        opacity: 0.15;
    }
    100% {
        opacity: 1;
    }
}



.add-call-previous-call-collapsed {

}


.add-call-previous-call-collapsed h4 {
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




.add-call-call-status {
    position: absolute;
    top: 7px;
    right: 8px;
    padding: 2px 7px;
    border-radius: 3px;
    width: max-content;
}


.add-call-call-status.open {
    background: var(--OpenCall);
}

.add-call-call-status.allocated {
    background: var(--AllocatedCall);
}

.add-call-call-status.closed {
    background: var(--ClosedCall);
}

.add-call-call-status.cancelled {
    background: var(--CancelledCall);
}

.add-call-call-status.completed {
    background: var(--CompletedCall);
}

</style>