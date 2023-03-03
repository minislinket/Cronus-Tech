<template>
    <div class="ops-admin-dashboard-wrap">

        <div class="loading-lightbox-wrap" v-if="loading">
            <font-awesome-icon class="loading-lightbox-icon" :icon="['fa','circle-notch']" size="lg" spin />
        </div>



        <h2>Recent Calls <span>{{ getBranchName(user.branchId) }}</span></h2>


        <div id="RecentCalls" class="recent-calls-scroll-section">

            <div @click="loadCall(call)" class="recent-call-card" v-for="call in recentCalls" :key="call.id" >
            
                
                <div class="recent-call-card-header" :class="{ 'open' : call.callStatusId == 1, 'allocated' : call.callStatusId == 2, 'no-tech' : call.callStatusId == 2 && !call.technicians || call.callStatusId == 2 && call.technicians.length <= 0 }">
                    <h4>{{ call.id }}</h4>
                    <h4 v-if="call.callStatusId == 2 && !call.technicians || call.callStatusId == 2 && call.technicians.length <= 0" class="no-tech-warning"><font-awesome-icon class="no-tech-warning-icon" :icon="['fa','exclamation-triangle']" size="lg" />  No Tech!</h4>
                    <p class="recent-calls-call-status">{{ getCallStatusId(call.callStatusId) }}</p>
                </div>


                <p>Call Logged</p>
                <span class="bold">{{ call.openTime }}</span>
                <p>Operator</p>
                <span class="bold">{{ getCallOperator(call.operatorEmployeeCode) }} <span class="small-text">({{ call.operatorEmployeeCode }})</span></span>
                <p>Store</p>
                <span class="bold">{{ call.customerStoreName }}</span>
                <p>Branch Code</p>
                <span class="bold">{{ call.customerStoreBranchCode }}</span>
                <p>Account</p>
                <span class="bold">{{ call.customerAccountName }}</span>
                <p>Details</p>
                <span class="bold" v-html="processCallDetails(call.callDetails)"></span>

                <div class="recent-calls-techs-grid-wrap" v-if="call.technicians && call.technicians.length >= 1">
                    <h4>Technicians</h4>
                    <div class="recent-calls-techs-grid" v-for="tech in call.technicians" :key="tech.id"
                    :class="{ 
                            'pending' : tech.technicianCallStatusId == 1,
                            'received': tech.technicianCallStatusId == 2,
                            'en-route': tech.technicianCallStatusId == 3,
                            'rerouted': tech.technicianCallStatusId == 7,
                            'on-site': tech.technicianCallStatusId == 4,
                            'returning': tech.technicianCallStatusId == 5,
                            'on-hold': tech.technicianCallStatusId == 6,
                            'completed': tech.technicianCallStatusId == 8,
                            'transferred': tech.technicianCallStatusId == 9
                        }">


                        <p class="technician-name">{{ getTechName(tech.technicianEmployeeCode) }} <span class="smaller-text">({{ tech.technicianEmployeeCode }})</span></p>


                        <p class="recent-calls-tech-state">
                            <span v-if="tech.technicianCallStatusId === 1" class="material-symbols-outlined rc-tech-state-icon pending material" >pending_actions</span>
                            <font-awesome-icon v-if="tech.technicianCallStatusId === 2" class="rc-tech-state-icon received" :icon="['fa', 'user-check']" size="lg" />
                            <font-awesome-icon v-if="tech.technicianCallStatusId === 3" class="rc-tech-state-icon en-route" :icon="['fa', 'route']" size="lg" />
                            <span v-if="tech.technicianCallStatusId === 7" class="material-symbols-outlined rc-tech-state-icon rerouted">alt_route</span>
                            <font-awesome-icon v-if="tech.technicianCallStatusId === 4" class="rc-tech-state-icon on-site" :icon="['fa', 'map-marker-alt']" size="lg" />
                            <font-awesome-icon v-if="tech.technicianCallStatusId === 5" class="rc-tech-state-icon returning"  style="transform: scaleX(-1);" :icon="['fa', 'clock-rotate-left']" size="lg" />
                            <font-awesome-icon v-if="tech.technicianCallStatusId === 6" class="rc-tech-state-icon on-hold" :icon="['fa', 'pause-circle']" size="lg" />
                            <font-awesome-icon v-if="tech.technicianCallStatusId === 8" class="rc-tech-state-icon completed" :icon="['fa', 'clipboard-check']" size="lg" />
                            <font-awesome-icon v-if="tech.technicianCallStatusId === 9" class="rc-tech-state-icon transferred" :icon="['fa', 'shuffle']" size="lg" />
                            {{ getTechStatus(tech.technicianCallStatusId) }}
                        </p>


                    </div>
                </div>

                
                
            </div>

        </div>
        

        <button class="switch-user-type-btn" @click="switchProfile()"><font-awesome-icon :icon="['fa', 'retweet']" size="lg" /> Switch to Tech</button>


        <button class="refresh-recent-calls-btn"><font-awesome-icon @click="refreshRecentCalls()" class="refresh-recent-calls" :icon="['fa','sync-alt']" size="lg" /></button>

    </div>
</template>




<script>
import { mapGetters } from 'vuex';

export default {

    data() {
        return {
            user: JSON.parse(localStorage.getItem('user')),
            branches: JSON.parse(localStorage.getItem('branches')),
            employees: JSON.parse(localStorage.getItem('employees')),
            call_statuses: JSON.parse(localStorage.getItem('call_statuses')),
            tech_statuses: JSON.parse(localStorage.getItem('call_tech_states')),
        }
    },




    computed: {
        ...mapGetters({
            loading: ['RecentCalls/loading'],
            userType: ['UserRole/currentUserRole'],
            availableUserRoles: ['UserRole/availableRoles'],
            recentCalls: ['RecentCalls/recentCalls']
        })
    },




    mounted() {
        this.$store.dispatch('Menu/setTitle', { title: 'Home', icon: ['fa', 'home'] });

        setTimeout(() => {
            var recentCalls = document.getElementById('RecentCalls');
            if(recentCalls)
            {
                var viewPortHeight = window.innerHeight;
                recentCalls.style.height = (viewPortHeight - 260) + 'px';
            }
        }, 50);
    },




    methods: {


        loadCall: function(call) {
            this.$store.dispatch('AllocateTech/processCall', call);
            this.$router.push('/allocate_tech');
        },



        refreshRecentCalls: function() {
            this.$store.dispatch('RecentCalls/getRecentCalls', this.user);
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




        switchProfile: function() {
            this.$store.dispatch('GeoLocation/startGeoLocationService');
            this.$store.dispatch('UserRole/setUserRole', 1);
            this.$router.push('/dashboard');
            // console.log('Switching to: TECH');
        },



        

    }

}

</script>




<style>


.ops-admin-dashboard-wrap {
    
}



.ops-admin-dashboard-wrap h2 {
    display: flex;
    flex-direction: column;
    padding-top: 5px;
}

.ops-admin-dashboard-wrap h2 span {

}









.recent-calls-scroll-section {
    position: fixed;
    top: 125px;
    left: 0;
    right: 0;
    width: 100vw;
    height: 75vh;

    background: var(--GunMetal);
    box-shadow: inset 0px -8px 6px -6px rgba(0,0,0,0.4);

    overflow-y: scroll;
    padding: 10px;
    font-size: 14px;

    display: flex;
    flex-direction: column;
    align-items: center;
}






.recent-call-card {
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






.recent-call-card-header {
    height: 30px;
    background: var(--OpenCall);
    color: var(--TextBlack);
    grid-column: 1 / span 2;
    display: flex;
    align-items: center;
    justify-content: space-between;
    
    padding: 0 10px;
    margin: 0 -10px;
    margin-bottom: 5px; 
    border-top-left-radius: 5px;
    border-top-right-radius: 5px;
    
}



.recent-call-card-header h4 {
    font-size: 16px;
}





.recent-call-card-header.open {
    background: var(--OpenCall);
    color: var(--TextBlack);
}


.recent-call-card-header.allocated {
    background: var(--AllocatedCall);
    color: var(--TextBlack);
}


.recent-call-card-header.no-tech,
.recent-call-card-header.allocated.no-tech {
    background: var(--WarningRed);
    color: white;
}


.recent-call-card-header .no-tech-warning {
    color: white;
    position: absolute;
    left: 0;
    right: 0;
    margin: 0 auto;
    display: flex;
    justify-content: center;
}

.recent-call-card-header .no-tech-warning-icon {
    color: var(--Spunk);
}



.recent-calls-techs-grid-wrap {
    margin: 0 -10px;
    padding: 0 10px;
    margin-top: 10px;
    grid-column: 1 / span 2;
}


.recent-calls-techs-grid {
    display: grid;
    grid-template-columns: 2fr 1fr;
    align-items: center;
    
    margin: 0 -10px;
    padding: 3px 10px;

    color: white;
    position: relative;
    border-bottom: 2px solid var(--Pending);
}



.recent-calls-techs-grid::before {
    content: '';
    position: absolute;
    right: 0;
    width: 120px;
    height: 100%;
    background: var(--GunMetal);
    z-index: 1;
}


.recent-calls-techs-grid:last-child {
    margin-right: -10px;
    padding-right: 10px;
    margin-left: -7px;
    padding-left: 7px;
    border-bottom: none;
}










.rc-tech-state-icon {
    font-size: 12px;
    margin-right: 5px;
}




.rc-tech-state-icon.pending {
    font-size: 14px;
    color: var(--PendingLight);
}
.recent-calls-techs-grid.pending::before {
    background: var(--Pending);
}
.recent-calls-techs-grid.pending {
    border-color: var(--Pending);
}



.rc-tech-state-icon.received {
    color: var(--ReceivedLight);
}
.recent-calls-techs-grid.received::before {
    background: var(--Received);
}
.recent-calls-techs-grid.received {
    border-color: var(--Received);
}



.rc-tech-state-icon.en-route {
    color: var(--EnRouteLight);
}
.recent-calls-techs-grid.en-route::before {
    background: var(--EnRoute);
}
.recent-calls-techs-grid.en-route {
    border-color: var(--EnRoute);
}



.rc-tech-state-icon.rerouted {
    color: var(--ReroutedLight);
}
.recent-calls-techs-grid.rerouted::before {
    background: var(--Rerouted);
}
.recent-calls-techs-grid.rerouted {
    border-color: var(--Rerouted);
}



.rc-tech-state-icon.on-site {
    color: var(--OnSiteLight);
}
.recent-calls-techs-grid.on-site::before {
    background: var(--OnSite);
}
.recent-calls-techs-grid.on-site {
    border-color: var(--OnSite);
}



.rc-tech-state-icon.returning {
    color: var(--ReturningLight);
}
.recent-calls-techs-grid.returning::before {
    background: var(--Returning);
}
.recent-calls-techs-grid.returning {
    border-color: var(--Returning);
}



.rc-tech-state-icon.on-hold {
    color: var(--OnHoldLight);
}
.recent-calls-techs-grid.on-hold::before {
    background: var(--OnHold);
}
.recent-calls-techs-grid.on-hold {
    border-color: var(--OnHold);
}



.rc-tech-state-icon.completed {
    color: var(--CompletedLight);
}
.recent-calls-techs-grid.completed::before {
    background: var(--Completed);
}
.recent-calls-techs-grid.completed {
    border-color: var(--Completed);
}



.rc-tech-state-icon.transferred {
    color: var(--TransferredLight);
}
.recent-calls-techs-grid.transferred::before {
    background: var(--Transferred);
}
.recent-calls-techs-grid.transferred {
    border-color: var(--Transferred);
}




.technician-name {
    color: var(--TextBlack);
}



.recent-calls-call-status {
    position: absolute;
    top: 5px;
    right: 8px;
}





.recent-calls-tech-state {
    border-radius: 3px;
    text-align: center;
    width: max-content;
    justify-self: center;
    z-index: 2;
    display: flex;
    align-items: center;
}







.refresh-recent-calls-btn {
    position: fixed;
    top: 68px;
    right: 20px;
    font-size: 16px;
}


.refresh-recent-calls {
    
}

</style>