<template>
    <div class="app-modal-lightbox" v-if="active" :class="{ active: active }">
        <div class="app-modal-content combine-open-calls-modal-content custom-scroller">
            <div class="call-combine-grid" v-for="call in callsToCombine" :key="call.id">
                <h4>Call:</h4>
                <span>{{ call.id }}</span>
                <h4>Call Logged:</h4>
                <span>{{ call.openTime }}</span>
                <h4>Call Type: </h4>
                <span>{{ getCallTypeName(call.callTypeId) }}</span>
                <h4>Call Sub Type: </h4>
                <span>{{ getCallSubTypeName(call.callSubTypeId) }}</span>
                <h4>Operator: </h4>
                <span>{{ getCallOperatorName(call.operatorEmployeeCode) }}</span>
                <h4>Caller: </h4>
                <span>{{ call.callerName }}</span>
                <h4 class="call-combine-details-heading">Details: </h4>
                <span class="call-combine-details">{{ call.callDetails }}</span>
                <button @click="combineWithCall(call)" class="combine-call-btn">Combine</button>
            </div>
            <div class="call-combine-buttons-wrap">
                <button class="make-new-call-btn" @click="createNewCall()">Create New Call</button>
                <button class="cancel-combine-call-btn" @click="cancelCombineCall()">Cancel</button>
            </div>
        </div>
    </div>
</template>




<script>
import { mapGetters } from 'vuex';


export default {

    data() {
        return {
            selectedCall: '',
            callTypes: JSON.parse(localStorage.getItem('call_types')),
            callSubTypes: JSON.parse(localStorage.getItem('call_sub_types')),
            employees: JSON.parse(localStorage.getItem('employees')),
        }
    },


    computed: {
        ...mapGetters({
            active: ['AddCall/callCombineModal'],
            callsToCombine: ['AddCall/openCalls'],
        })
    },




    mounted() {

    },




    methods: {

        cancelCombineCall: function() {
            this.$store.dispatch('AddCall/cancelCombineCall');
        },

        getCallTypeName: function(callTypeId) {
            var callType = this.callTypes.filter(type => type.id === callTypeId)[0].name;
            return callType || '';
        },

        getCallSubTypeName: function(callSubTypeId) {
            var subType = this.callSubTypes.filter(subtype => subtype.id === callSubTypeId)[0].name;
            return subType || '';
        },


        getCallOperatorName: function(empCode) {
            var operator = this.employees.filter(emp => emp.employeeCode === empCode)[0].displayName;
            return operator || '';
        },



        combineWithCall: function(call) {
            this.$store.dispatch('AddCall/combineCall', call);
        },



        createNewCall: function() {
            this.$store.dispatch('AddCall/submitCall');
        }

    }
    
}
</script>




<style>


.combine-open-calls-modal-content {
    overflow-y: scroll;
    height: 100%;
    position: absolute;
    width: 85vw;
}


.call-combine-buttons-wrap {
    position: absolute;
    bottom: 0;
    left: 0;
    display: flex;
    justify-content: space-around;
    width: 100%;
    padding: 10px;

}


.make-new-call-btn {
    color: var(--WarningOrange);
}

.cancel-combine-call-btn {
    color: var(--WarningRed);
}


.call-combine-grid {
    display: grid;
    grid-template-columns: 1fr 2fr;
    column-gap: 10px;
    border-bottom: 1px dashed rgba(230,230,230,0.6);
    margin-bottom: 10px;
    padding-bottom: 15px;
    text-align: left;
}



.combine-call-btn {
    grid-column: 1 / span 2;
    justify-self: center;
}


.call-combine-details-heading {
    justify-self: flex-start;
    grid-column: 1 / span 2;
    text-align: left;
}


.call-combine-details {
    grid-column: 1 / span 2;
    justify-self: flex-start;
    text-align: left;
    margin-bottom: 10px;
}
    
</style>