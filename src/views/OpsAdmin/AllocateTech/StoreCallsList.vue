<template>
    <div class="allocate-tech-store-calls-wrap" v-if="(calls && calls.length >= 1)">

        <div id="InfoBox" class="store-calls-scroll-section">

            <template v-if="(calls && calls.length >= 1)">

                <div @click="loadCall(call)" class="store-call-card" v-for="call in calls" :key="call.id" >
                
                    
                    <div class="store-call-card-header" :class="{ 'open' : call.callStatusId == 1, 'allocated' : call.callStatusId == 2, 'no-tech' : call.callStatusId == 2 && !call.technicians || call.callStatusId == 2 && call.technicians.length <= 0 }">
                        <h4 style="text-align: left;">{{ call.id }}</h4>
                        <h4 v-if="call.callStatusId == 2 && !call.technicians || call.callStatusId == 2 && call.technicians.length <= 0" class="no-tech-warning"><font-awesome-icon class="no-tech-warning-icon" :icon="['fa','exclamation-triangle']" size="lg" />  No Tech!</h4>
                        <p class="store-calls-call-status">{{ getCallStatusId(call.callStatusId) }}</p>
                    </div>


                    <p>Call Logged</p>
                    <span class="bold">{{ call.openTime }}</span>
                    <p>Operator</p>
                    <span class="bold">{{ getCallOperator(call.operatorEmployeeCode) }} <span class="small-text">({{ call.operatorEmployeeCode }})</span></span>
                    <p>Call Type</p>
                    <span class="bold">{{ getCallTypeName(call.callTypeId) }}</span>
                    <p>Order Number</p>
                    <span class="bold">{{ call.orderNumber }}</span>
                    <p>Contact Person</p>
                    <span class="bold">{{ call.callerName }}</span>
                    <p>Account</p>
                    <span class="bold">{{ call.customerAccountName }}</span> 
                    
                    <p>Details</p>
                    <span class="bold" v-html="processCallDetails(call.callDetails)"></span>

                    <div class="store-calls-techs-grid-wrap" v-if="call.technicians && call.technicians.length >= 1">
                        <h4>Technicians</h4>
                        <div class="store-calls-techs-grid" v-for="tech in call.technicians" :key="tech.id"
                        :class="{ 
                            'pending': tech.technicianCallStatusId == 1,
                            'received': tech.technicianCallStatusId == 2,
                            'en-route': tech.technicianCallStatusId == 3,
                            'rerouted': tech.technicianCallStatusId == 7,
                            'on-site': tech.technicianCallStatusId == 4,
                            'left-site': tech.technicianCallStatusId == 5,
                            'on-hold': tech.technicianCallStatusId == 6,
                            'completed': tech.technicianCallStatusId == 8
                        }">


                            <p class="technician-name">{{ getTechName(tech.technicianEmployeeCode) }} <span class="smaller-text">({{ tech.technicianEmployeeCode }})</span></p>


                            <p class="store-calls-tech-state">
                                <span v-if="tech.technicianCallStatusId === 1" class="material-symbols-outlined sc-tech-state-icon pending material" >pending_actions</span>
                                <font-awesome-icon v-if="tech.technicianCallStatusId === 2" class="sc-tech-state-icon received" :icon="['fa', 'user-check']" size="lg" />
                                <font-awesome-icon v-if="tech.technicianCallStatusId === 3" class="sc-tech-state-icon en-route" :icon="['fa', 'route']" size="lg" />
                                <span v-if="tech.technicianCallStatusId === 7" class="material-symbols-outlined sc-tech-state-icon rerouted">alt_route</span>
                                <font-awesome-icon v-if="tech.technicianCallStatusId === 4" class="sc-tech-state-icon on-site" :icon="['fa', 'map-marker-alt']" size="lg" />
                                <font-awesome-icon v-if="tech.technicianCallStatusId === 5" class="sc-tech-state-icon left-site" :icon="['fa', 'road']" size="lg" />
                                <font-awesome-icon v-if="tech.technicianCallStatusId === 6" class="sc-tech-state-icon on-hold" :icon="['fa', 'pause-circle']" size="lg" />
                                <font-awesome-icon v-if="tech.technicianCallStatusId === 8" class="sc-tech-state-icon completed" :icon="['fa', 'clipboard-check']" size="lg" />
                                {{ getTechStatus(tech.technicianCallStatusId) }}
                            </p>


                        </div>
                    </div>

                    
                    
                </div>
            
            </template>
            <div v-else>
                <div class="loading-lightbox-section" v-if="loadingStoreCalls">
                    <font-awesome-icon class="loading-lightbox-icon" :icon="['fa','circle-notch']" size="lg" spin />
                </div>
                <!-- <button v-if="this.selectedStore" @click="addCall()" class="store-calls-add-call-btn no-calls"><span class="material-symbols-outlined">add_call</span> Add Call</button> -->
            </div>


        </div>


        <button @click="addCall()" class="store-calls-add-call-btn"><span class="material-symbols-outlined">add_call</span></button>


        <div class="allocate-tech-store-calls-customer-info-wrap" v-if="(calls && calls.length >= 1)">          
            <p>Address</p>
            <span class="bold">{{ calls[0].customerStoreAddress }}</span>
        </div>


    </div>
    <div v-else class="allocate-tech-store-calls-wrap">
        <div class="loading-lightbox-wrap" v-if="loadingStoreCalls">
            <font-awesome-icon class="loading-lightbox-icon" :icon="['fa','circle-notch']" size="lg" spin />
        </div>
        <!-- <button v-if="this.selectedStore" @click="addCall()" class="store-calls-add-call-btn no-calls"><span class="material-symbols-outlined">add_call</span> Add Call</button> -->
    </div>
    
</template>



<script>
import { mapGetters } from 'vuex'

export default {

    data() {
        return {
            branches: JSON.parse(localStorage.getItem('branches')),
            employees: JSON.parse(localStorage.getItem('employees')),
            call_statuses: JSON.parse(localStorage.getItem('call_statuses')),
            tech_statuses: JSON.parse(localStorage.getItem('call_tech_states')),
            call_types: JSON.parse(localStorage.getItem('call_types'))
        }
    },




    computed: {
        ...mapGetters({
            calls: ['AllocateTech/customerStoreCalls'],
            loadingStoreCalls: ['AllocateTech/loadingCustomerStoreCalls'],
            selectedStore: ['AllocateTech/customerStore']
        })
    },




    watch: {
        calls: {
            handler: function() {

            },
            deep: true,
            immediate: true
        }
    },





    mounted() {
        
    },




    methods: {




        addCall: function() {
            // console.log(this.selectedStore);
            
            this.$store.dispatch('AddCall/selectCustomerStore', this.selectedStore);
            this.$router.push('/add_call');
        },





        getCallTypeName: function(callTypeId) {
            return this.call_types.filter(callType => callType.id === callTypeId)[0].name;
        },

        getBranchName: function(branchId) {
            return this.branches.filter(branch => branch.id === branchId)[0].name;
        },

        getCallOperator: function(empCode) {
            return this.employees.filter(emp => emp.employeeCode === empCode)[0].displayName;
        },

        getCallStatusId: function(callStatusId) {
            return callStatusId ? this.call_statuses.filter(status => status.id === callStatusId)[0].name : '';
        },

        getTechStatus: function(techStatusId) {
            return this.tech_statuses.filter(status => status.id === techStatusId)[0].name || ''
        },

        getTechName: function(empCode) {
            return this.employees.filter(tech => tech.employeeCode === empCode)[0].displayName || empCode;
        },

        processCallDetails: function(callDetails) {

            if(!callDetails){ return }

            var returnDetails = '';
            var splits = callDetails.split('UPDATE:');

            if(splits.length >= 1)
            {
                splits.map((split, index) => index >= 1 ? returnDetails += '<p style="grid-columns: 1 / span 2;"><span style="color: var(--PendingLight); font-weight: 700">UPDATE:</span> '+ split +'</p>' : returnDetails += '<p style="margin-bottom: 10px;">'+ split +'</p>' );
            }

            return returnDetails;
        },






        loadCall: function(call) {
            this.$store.dispatch('AllocateTech/setCall', call);
            this.$emit('showingCall');
        },


    }

}

</script>



<style>

.allocate-tech-store-calls-wrap {
    text-align: left;
    transition: all 250ms ease;
    animation: fade-in-add-call 600ms ease-out;
    
    position: relative;
    
}






.store-calls-scroll-section {
    position: fixed;
    top: 190px;
    left: 0;
    right: 0;
    width: 100vw;
    /* height: 75vh; */

    background: var(--GunMetal);
    box-shadow: inset 0px -8px 6px -6px rgba(0,0,0,0.4);

    overflow-y: scroll;
    padding: 10px;
    font-size: 14px;

    display: flex;
    flex-direction: column;
    align-items: center;
}






.store-call-card {
    padding-left: 10px;
    padding-right: 10px;
    border-radius: 5px;
    margin-bottom: 20px;
    width: 100%;
    text-align: left;

    display: grid;
    grid-template-columns: 1fr 2fr;
    position: relative;
    background: var(--OffWhite);
    color: var(--TextBlack);
}






.store-call-card-header {
    height: 30px;
    background: var(--OpenCall);
    color: var(--TextBlack);
    grid-column: 1 / span 2;
    display: flex;
    align-items: center;
    
    padding: 0 10px;
    margin: 0 -10px;
    margin-bottom: 5px; 
    border-top-left-radius: 5px;
    border-top-right-radius: 5px;
    position: relative;
}



.store-call-card-header h4 {
    font-size: 16px;
}





.store-call-card-header.open {
    background: var(--OpenCall);
    color: var(--TextBlack);
}


.store-call-card-header.allocated {
    background: var(--AllocatedCall);
    color: var(--TextBlack);
}


.store-call-card-header.no-tech,
.store-call-card-header.allocated.no-tech {
    background: var(--WarningRed);
    color: white;
}


.store-call-card-header .no-tech-warning {
    color: white;
    position: absolute;
    left: 0;
    right: 0;
    margin: 0 auto;
    display: flex;
    justify-content: center;
}

.store-call-card-header .no-tech-warning-icon {
    color: var(--Spunk);
}





.store-calls-techs-grid-wrap {
    margin: 0 -10px;
    padding: 0 10px;
    margin-top: 10px;
    grid-column: 1 / span 2;
}


.store-calls-techs-grid {
    display: grid;
    grid-template-columns: 2fr 1fr;
    align-items: center;
    
    margin: 0 -10px;
    padding: 3px 10px;

    color: white;
    position: relative;
    border-bottom: 2px solid var(--Pending);
}



.store-calls-techs-grid::before {
    content: '';
    position: absolute;
    right: 0;
    width: 90px;
    height: 100%;
    background: var(--GunMetal);
    z-index: 1;
}


.store-calls-techs-grid:last-child {
    margin-right: -10px;
    padding-right: 10px;
    margin-left: -7px;
    padding-left: 7px;
    border-bottom: none;
}





.sc-tech-state-icon {
    font-size: 12px;
    margin-right: 5px;
}




.sc-tech-state-icon.pending {
    font-size: 14px;
    color: var(--PendingLight);
}
.store-calls-techs-grid.pending::before {
    background: var(--Pending);
}
.store-calls-techs-grid.pending {
    border-color: var(--Pending);
}



.sc-tech-state-icon.received {
    color: var(--ReceivedLight);
}
.store-calls-techs-grid.received::before {
    background: var(--Received);
}
.store-calls-techs-grid.received {
    border-color: var(--Received);
}



.sc-tech-state-icon.rerouted {
    color: var(--ReroutedLight);
}
.store-calls-techs-grid.rerouted::before {
    background: var(--Rerouted);
}
.store-calls-techs-grid.rerouted {
    border-color: var(--Rerouted);
}



.sc-tech-state-icon.en-route {
    color: var(--EnRouteLight);
}
.store-calls-techs-grid.en-route::before {
    background: var(--EnRoute);
}
.store-calls-techs-grid.en-route {
    border-color: var(--EnRoute);
}



.sc-tech-state-icon.on-site {
    color: var(--OnSiteLight);
}
.store-calls-techs-grid.on-site::before {
    background: var(--OnSite);
}
.store-calls-techs-grid.on-site {
    border-color: var(--OnSite);
}



.sc-tech-state-icon.left-site {
    color: var(--LeftSiteLight);
}
.store-calls-techs-grid.left-site::before {
    background: var(--LeftSite);
}
.store-calls-techs-grid.left-site {
    border-color: var(--LeftSite);
}



.sc-tech-state-icon.on-hold {
    color: var(--OnHoldLight);
}
.store-calls-techs-grid.on-hold::before {
    background: var(--OnHold);
}
.store-calls-techs-grid.on-hold {
    border-color: var(--OnHold);
}



.sc-tech-state-icon.completed {
    color: var(--CompletedLight);
}
.store-calls-techs-grid.completed::before {
    background: var(--Completed);
}
.store-calls-techs-grid.completed {
    border-color: var(--Completed);
}




.technician-name {
    color: var(--TextBlack);
}



.store-calls-call-status {
    position: absolute;
    top: 5px;
    right: 8px;
}





.store-calls-tech-state {
    border-radius: 3px;
    text-align: center;
    width: max-content;
    justify-self: flex-end;
    z-index: 2;
    display: flex;
    align-items: center;
}







.allocate-tech-store-calls-customer-info-wrap {
    position: fixed;
    bottom: 70px;
    left: 0;
    margin: 0 auto;
    text-align: left;
    padding: 10px;
    max-height: 150px;
    max-width: 88%;
    overflow-y: scroll;
}




.store-calls-add-call-btn {
    position: fixed;
    right: 7px;
    bottom: 121px;
    display: flex;
    padding: 10px;
}


.store-calls-add-call-btn.no-calls {
    left: 0;
    right: 0;
    top: 250px;
    bottom: unset;
    margin: 0 auto;
    width: max-content;
}

</style>