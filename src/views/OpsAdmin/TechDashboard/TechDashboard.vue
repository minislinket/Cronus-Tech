<template>
    <div id="BranchTechCalls" class="branch-technician-calls-wrap">

        

            <div class="filtered-techs-wrap" v-for="tech in filteredTechs" :key="tech.id" :class="{ 'hide' : tech.noCallsToShow }">

                <h3>{{ tech.displayName }} <span v-if="tech.displayName !== 'Open Calls' && tech.displayName !== 'Un-Allocated Calls' && tech.displayName !== 'Completed Calls'" class="small-text">({{ tech.employeeCode }})</span> <span>[{{ tech.filteredCalls.length }}]</span></h3>
                <p v-if="tech.displayName !== 'Open Calls' && tech.displayName !== 'Un-Allocated Calls' && tech.displayName !== 'Completed Calls'" style="text-align: left" class="small-text">Completed Calls for today: {{ tech.completedForToday }}</p>

                <h4 class="tech-call-counts-wrap" v-if="tech.displayName !== 'Open Calls' && tech.displayName !== 'Un-Allocated Calls' && tech.displayName !== 'Completed Calls'" style="display: flex;">

                    <div @click="filterTechStatus(tech, 1)" class="tcc pending" :class="{ inactive : tech.filterByStatus > 0 && tech.filterByStatus != 1 }"><span class="material-symbols-outlined tcc-icon pending">pending_actions</span> {{ tech.pendingCalls }}</div>
                    <div @click="filterTechStatus(tech, 2)" class="tcc received" :class="{ inactive : tech.filterByStatus > 0 && tech.filterByStatus != 2 }"><font-awesome-icon class="tcc-icon received" :icon="['fa', 'user-check']" size="lg" /> {{ tech.receivedCalls }}</div>
                    <div @click="filterTechStatus(tech, 3)" class="tcc en-route" :class="{ inactive : tech.filterByStatus > 0 && tech.filterByStatus != 3 }"><font-awesome-icon class="tcc-icon en-route" :icon="['fa', 'route']" size="lg" /> {{ tech.enRouteCalls }}</div>
                    <div @click="filterTechStatus(tech, 7)" class="tcc rerouted" :class="{ inactive : tech.filterByStatus > 0 && tech.filterByStatus != 7 }"><span class="material-symbols-outlined tcc-icon rerouted">alt_route</span> {{ tech.reroutedCalls }}</div>
                    <div @click="filterTechStatus(tech, 4)" class="tcc on-site" :class="{ inactive : tech.filterByStatus > 0 && tech.filterByStatus != 4 }"><font-awesome-icon class="tcc-icon on-site" :icon="['fa', 'map-marker-alt']" size="lg" /> {{ tech.onSiteCalls }}</div>
                    <div @click="filterTechStatus(tech, 5)" class="tcc returning" :class="{ inactive : tech.filterByStatus > 0 && tech.filterByStatus != 5 }"><font-awesome-icon class="tcc-icon returning" style="transform: scaleX(-1);" :icon="['fa', 'clock-rotate-left']" size="lg" /> {{ tech.returningCalls }}</div>
                    <div @click="filterTechStatus(tech, 6)" class="tcc on-hold" :class="{ inactive : tech.filterByStatus > 0 && tech.filterByStatus != 6 }"><font-awesome-icon class="tcc-icon on-hold" :icon="['fa', 'pause-circle']" size="lg" /> {{ tech.onHoldCalls }}</div>
                    <div @click="filterTechStatus(tech, 9)" class="tcc transferred" :class="{ inactive : tech.filterByStatus > 0 && tech.filterByStatus != 9 }"><font-awesome-icon class="tcc-icon transferred" :icon="['fa', 'shuffle']" size="lg" /> {{ tech.transferredCalls }}</div>

                </h4>

                <div class="filtered-tech-calls-scroll-section">
                    <template v-for="call in tech.filteredCalls" :key="call.id">
                        <div class="filtered-calls-cards-loop" v-if="call.techState !== 8 && tech.displayName !== 'Completed Calls' || call.techState == 8 && tech.displayName == 'Completed Calls'"
                        :class="
                        {
                            'open' : getTechState(tech, call).id == 0,
                            'un-allocated' : getTechState(tech, call).id == -1,
                            'pending' : getTechState(tech, call).id == 1,
                            'received' : getTechState(tech, call).id == 2,
                            'en-route' : getTechState(tech, call).id == 3,
                            'rerouted' : getTechState(tech, call).id == 7,
                            'on-site' : getTechState(tech, call).id == 4,
                            'returning' : getTechState(tech, call).id == 5,
                            'on-hold' : getTechState(tech, call).id == 6,
                            'completed' : getTechState(tech, call).id == 8,
                            'transferred' : getTechState(tech, call).id == 9
                        }">
  
                        
                            <button class="load-call-background-btn" @click="loadCall(call)"></button>

                            <div class="filtered-calls-card">

                                <p>Call ID</p>
                                <span class="bold">{{ call.id }}</span>
                                <p>Call Type</p>
                                <span class="bold">{{ getCallTypeName(call.callTypeId) }} <span class="smaller-text">({{ getCallSubTypeName(call.callSubTypeId) }})</span></span>
                                <p>Store</p>
                                <span class="bold">{{ call.customerStoreName }}</span>
                                <p>Branch#</p>
                                <span class="bold">{{ call.customerStoreBranchCode }}</span>

                                <p v-if="getTechState(tech, call).id !== 0 && getTechState(tech, call).id !== -1">Tech</p>
                                <p v-else>Logged</p>

                                <span v-if="getTechState(tech, call).id !== 0 && getTechState(tech, call).id !== -1 && getTechState(tech, call).id !== 8" class="bold tech-status-name-icon-wrap">
                                    <span v-if="getTechState(tech, call).id == 1" class="material-symbols-outlined tech-dashboard-tech-state-icon pending material" >pending_actions</span>
                                    <font-awesome-icon v-if="getTechState(tech, call).id == 2" class="tech-dashboard-tech-state-icon received" :icon="['fa', 'user-check']" size="lg" />
                                    <font-awesome-icon v-if="getTechState(tech, call).id == 3" class="tech-dashboard-tech-state-icon en-route" :icon="['fa', 'route']" size="lg" />
                                    <font-awesome-icon v-if="getTechState(tech, call).id == 4" class="tech-dashboard-tech-state-icon on-site" :icon="['fa', 'map-marker-alt']" size="lg" />
                                    <font-awesome-icon v-if="getTechState(tech, call).id == 5" class="tech-dashboard-tech-state-icon returning" style="transform: scaleX(-1);" :icon="['fa', 'clock-rotate-left']" size="lg" />
                                    <font-awesome-icon v-if="getTechState(tech, call).id == 6" class="tech-dashboard-tech-state-icon on-hold" :icon="['fa', 'pause-circle']" size="lg" />
                                    <font-awesome-icon v-if="getTechState(tech, call).id == 9" class="tech-dashboard-tech-state-icon transferred" :icon="['fa', 'shuffle']" size="lg" />
                                    <span v-if="getTechState(tech, call).id == 7" class="material-symbols-outlined tech-dashboard-tech-state-icon rerouted material" >alt_route</span>
                                    {{ getTechState(tech, call).name}}
                                    <font-awesome-icon v-if="call.storeProblem && getTechState(tech, call).id == 6" class="call-problem-icon store" :icon="['fa', 'store-alt']" size="lg" />
                                    <font-awesome-icon style="font-size: 14px" v-if="call.stockProblem && getTechState(tech, call).id == 6" class="call-problem-icon stock" :icon="['fa', 'dolly']" size="lg" />
                                    <font-awesome-icon v-if="call.orderProblem && getTechState(tech, call).id == 6" class="call-problem-icon order" :icon="['fa', 'file-circle-exclamation']" size="lg" />
                                </span>
                                <span v-else-if="getTechState(tech, call).id === 8">{{ call.mainTech }}</span>
                                <p v-else>{{ call.openTime }}</p>

                                <p v-if="call.latestTechUpdate">Updated</p>
                                <span v-if="call.latestTechUpdate">{{ call.latestTechUpdate }}</span>

                                <div class="call-comments-wrap" v-if="call.comments && call.comments.length >= 1" @click="viewCallComments(call)">
                                    <font-awesome-icon class="call-comments-icon" :icon="['fa', 'comments']" size="lg" />
                                    <span>{{ call.comments.length }}</span>
                                </div>
                                
                            </div>
                        </div>
                    </template>
                </div>

                <p class="warning" v-if="tech.filteredCalls.length <= 0 || tech.noCallsToShow">No Calls to Show</p>
            </div>

            
        
    </div>
</template>



<script>
import { mapGetters } from 'vuex'



export default {

    data() {
        return {
            tech_call_states: JSON.parse(localStorage.getItem('call_tech_states')),
            call_types: JSON.parse(localStorage.getItem('call_types')),
            call_sub_types: JSON.parse(localStorage.getItem('call_sub_types'))
        }
    },



    computed: {
        ...mapGetters({
            filteredTechs: ['TechnicianCalls/filteredTechs'],
            activeTechs: ['TechnicianCalls/activeTechs']
        }),


    },



    watch: {
        
    },




    mounted() {
        setTimeout(() => {
            var scrollBlock = document.getElementById('BranchTechCalls');
            if(scrollBlock)
            {
                var viewPortHeight = window.innerHeight;
                scrollBlock.style.height = (viewPortHeight - 275) + 'px';
            }
        }, 50);
    },




    methods: {



        viewCallComments: function(call) {
            this.$store.dispatch('TechnicianCalls/callComments', call.comments);
            this.$store.dispatch('TechnicianCalls/callCommentsModalActive', true);
        },



        checkIsToday: function() {
            
        },



        loadCall: function(call) {
            this.$store.dispatch('TechnicianCalls/loading', true);
            this.$store.dispatch('AllocateTech/processCall', call);
            this.$router.push('/allocate_tech');
            this.$store.dispatch('TechnicianCalls/loading', false);
        },



        getTechState: function(tech, call) {
            // console.log('Call and tech', call, tech);
            if(tech.displayName === 'Open Calls') { return { id: 0, name: 'N/A' }}
            if(tech.displayName === 'Un-Allocated Calls') { return { id: -1, name: 'N/A' }}
            if(tech.displayName === 'Completed Calls') { return { id: 8, name: 'Completed' }}
            if(!call) { return { id: 99, name: 'N/A' } }
            var techState = '';
            // console.log(call);
            
            call.technicians.map(tek => {
                if(tek.technicianEmployeeCode === tech.employeeCode)
                {
                    techState = this.tech_call_states.filter(state => state.id === tek.technicianCallStatusId)[0];
                }
                // console.log('Tech status id: ', tek.technicianCallStatusId);
            })
            // console.log('Tech State: ', techState, call.id, tech);
            !techState ? techState = { id: 99, name: 'N/A' } : null;
            return techState;
            
        },




        getTechFromCall: function(tech, call) {
            call.technicians.filter(tek => tek.technicianEmployeeCode === tech.employeeCode)
        },




        getCallTypeName: function(callTypeId) {
            return this.call_types.filter(type => type.id === callTypeId)[0].name;
        },


        getCallSubTypeName: function(callSubTypeId) {
            return this.call_sub_types.filter(type => type.id === callSubTypeId)[0].name;
        },




        filterTechStatus: function(tech, statusId) {
            if(tech.filterByStatus === statusId)
            {
                tech.filteredCalls = tech.calls;
                tech.filterByStatus = 0;
            }
            else
            {
                tech.filteredCalls = tech.calls.filter(call => call.techState === statusId);
                tech.filterByStatus = statusId;
            }
            
        }

    }

}
</script>



<style>

.branch-technician-calls-wrap {
    position: fixed;
    top: 140px;
    left: 0;
    right: 0;
    width: 100vw;
    height: 75vh;

    background: var(--GunMetal);
    box-shadow: inset 0 -4px 12px 0 rgba(0,0,0,0.4);

    overflow-y: scroll;
    padding: 10px;
    font-size: 14px;
}










.filtered-techs-wrap {
    border-bottom: 2px solid white;
    padding-bottom: 10px;
    margin-bottom: 20px;
}

.filtered-techs-wrap.hide {
    display: none;
}

.filtered-techs-wrap h3 {
    margin: 0 -10px;
    padding: 0 10px;
    margin-bottom: 2px;
    text-align: left;
}












.tech-call-counts-wrap {
    display: flex;
    margin-bottom: 10px;
}


.tech-call-counts-wrap div {
    border-radius: 2px;
    height: 30px;
    display: flex;
    align-items: center;
    justify-content: center;
    width: 50px;
    margin-right: 3px;
    background: black;
}

.tech-call-counts-wrap div:last-child {
    margin-right: 0;
}











.tcc-icon {
    margin-right: 5px;
    font-size: 14px;
}


.tcc.pending {
    display: flex;
    align-items: center;
    color: var(--Pending);
}
.tcc-icon.pending {
    font-size: 16px;
}

.tcc.received {
    color: var(--Received);
}

.tcc.en-route {
    color: var(--EnRoute);
}

.tcc.rerouted {
    color: var(--Rerouted);
}

.tcc.on-site {
    color: var(--OnSite);
}

.tcc.returning {
    color: var(--Returning);
}

.tcc.on-hold {
    color: var(--OnHold);
}

.tcc.completed {
    color: var(--Completed);
}

.tcc.transferred {
    color: var(--Transferred);
}



.tcc {
    transition: all 250ms ease-out;
}


.tcc.inactive {
    background: var(--MidGrey);
    color: var(--DarkGrey);
    transition: all 250ms ease-out;
}









.filtered-tech-calls-scroll-section {
    overflow-x: scroll;
    display: flex;
}





.load-call-background-btn {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    z-index: 10;
    background: transparent;
}




.filtered-calls-cards-loop {
    text-align: left;
    min-width: 300px;
    max-width: 360px;
    border-radius: 5px;
    margin-right: 10px;
    padding: 10px;
    height: max-content;
    position: relative;
}



.filtered-calls-card {
    display: grid;
    grid-template-columns: 1fr 2.5fr;
    width: 100%;
    position: relative;
}

.filtered-calls-cards-loop.open {
    background: var(--OpenCall);
    color: var(--TextBlack);
}

.filtered-calls-cards-loop.un-allocated {
    background: var(--UnAllocatedCall);
    color: var(--OffWhite);
}

.filtered-calls-cards-loop.pending {
    background: var(--Pending);
}

.filtered-calls-cards-loop.received {
    background: var(--Received);
}

.filtered-calls-cards-loop.en-route {
    background: var(--EnRoute);
}

.filtered-calls-cards-loop.rerouted {
    background: var(--Rerouted);
}

.filtered-calls-cards-loop.on-site {
    background: var(--OnSite);
}

.filtered-calls-cards-loop.returning {
    background: var(--Returning);
}

.filtered-calls-cards-loop.on-hold {
    background: var(--OnHold);
}

.filtered-calls-cards-loop.completed {
    background: var(--Completed);
}

.filtered-calls-cards-loop.transferred {
    background: var(--Transferred);
}





.call-comments-wrap {
    position: absolute;
    bottom: 0;
    right: 0;
    z-index: 11;
}

.call-comments-wrap span {
    position: absolute;
    top: -4px;
    right: 2px;
    font-size: 8px;
}

.call-comments-icon {
    color: var(--CommentsDark);
}






.tech-status-name-icon-wrap {
    display: flex;
    align-items: center;
}



.tech-dashboard-tech-state-icon {
    font-size: 12px;
    margin-right: 5px;
}




.tech-dashboard-tech-state-icon.pending {
    color: var(--PendingLight);
}

.tech-dashboard-tech-state-icon.received {
    color: var(--ReceivedLight);
}

.tech-dashboard-tech-state-icon.en-route {
    color: var(--EnRouteLight);
}

.tech-dashboard-tech-state-icon.on-site {
    color: var(--OnSiteLight);
}

.tech-dashboard-tech-state-icon.returning {
    color: var(--ReturningLight);
}

.tech-dashboard-tech-state-icon.rerouted {
    color: var(--ReroutedLight);
}

.tech-dashboard-tech-state-icon.on-hold {
    color: var(--OnHoldLight);
}

.tech-dashboard-tech-state-icon.transferred {
    color: var(--TransferredLight);
}








.call-problem-icon {
    font-size: 12px;
    color: var(--Returning);
    margin: 0 3px;
}

</style>