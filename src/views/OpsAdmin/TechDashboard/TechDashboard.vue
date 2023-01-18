<template>
    <div id="BranchTechCalls" class="branch-technician-calls-wrap">

        

            <div class="filtered-techs-wrap" v-for="tech in filteredTechs" :key="tech.id" :class="{ 'hide' : tech.noCallsToShow }">

                <h3>{{ tech.displayName }} <span v-if="tech.displayName !== 'Open Calls'" class="small-text">({{ tech.employeeCode }})</span> <span>[{{ tech.filteredCalls.length }}]</span></h3>
                <p style="text-align: left" class="small-text">Completed Calls for today: {{ tech.completedForToday }}</p>

                <h4 class="tech-call-counts-wrap" v-if="tech.displayName !== 'Open Calls'" style="display: flex;">

                    <div @click="filterTechStatus(tech, 1)" class="tcc pending" :class="{ inactive : tech.filterByStatus > 0 && tech.filterByStatus != 1 }"><span class="material-symbols-outlined tcc-icon pending">pending_actions</span> {{ tech.pendingCalls }}</div>
                    <div @click="filterTechStatus(tech, 2)" class="tcc received" :class="{ inactive : tech.filterByStatus > 0 && tech.filterByStatus != 2 }"><font-awesome-icon class="tcc-icon received" :icon="['fa', 'user-check']" size="lg" /> {{ tech.receivedCalls }}</div>
                    <div @click="filterTechStatus(tech, 3)" class="tcc en-route" :class="{ inactive : tech.filterByStatus > 0 && tech.filterByStatus != 3 }"><font-awesome-icon class="tcc-icon en-route" :icon="['fa', 'route']" size="lg" /> {{ tech.enRouteCalls }}</div>
                    <div @click="filterTechStatus(tech, 7)" class="tcc rerouted" :class="{ inactive : tech.filterByStatus > 0 && tech.filterByStatus != 7 }"><span class="material-symbols-outlined tcc-icon rerouted">alt_route</span> {{ tech.reroutedCalls }}</div>
                    <div @click="filterTechStatus(tech, 4)" class="tcc on-site" :class="{ inactive : tech.filterByStatus > 0 && tech.filterByStatus != 4 }"><font-awesome-icon class="tcc-icon on-site" :icon="['fa', 'map-marker-alt']" size="lg" /> {{ tech.onSiteCalls }}</div>
                    <div @click="filterTechStatus(tech, 5)" class="tcc left-site" :class="{ inactive : tech.filterByStatus > 0 && tech.filterByStatus != 5 }"><font-awesome-icon class="tcc-icon left-site" :icon="['fa', 'road']" size="lg" /> {{ tech.leftSiteCalls }}</div>
                    <div @click="filterTechStatus(tech, 6)" class="tcc on-hold" :class="{ inactive : tech.filterByStatus > 0 && tech.filterByStatus != 6 }"><font-awesome-icon class="tcc-icon on-hold" :icon="['fa', 'pause-circle']" size="lg" /> {{ tech.onHoldCalls }}</div>
                    <div @click="filterTechStatus(tech, 8)" class="tcc completed" :class="{ inactive : tech.filterByStatus > 0 && tech.filterByStatus != 8 }"><font-awesome-icon class="tcc-icon completed" :icon="['fa', 'clipboard-check']" size="lg" /> {{ tech.completedCalls }}</div>

                </h4>

                <div class="filtered-tech-calls-scroll-section">
                    <div class="filtered-calls-cards-loop" @click="loadCall(call)" v-for="call in tech.filteredCalls" :key="call.id" 
                    :class="
                    {
                        'open' : getTechState(tech, call).id == 0,
                        'pending' : getTechState(tech, call).id == 1,
                        'received' : getTechState(tech, call).id == 2,
                        'en-route' : getTechState(tech, call).id == 3,
                        'rerouted' : getTechState(tech, call).id == 7,
                        'on-site' : getTechState(tech, call).id == 4,
                        'left-site' : getTechState(tech, call).id == 5,
                        'on-hold' : getTechState(tech, call).id == 6,
                        'completed' : getTechState(tech, call).id == 8
                    }">

                        <div class="filtered-calls-card">

                            <p>Call ID</p>
                            <span class="bold">{{ call.id }}</span>
                            <p>Store</p>
                            <span class="bold">{{ call.customerStoreName }}</span>
                            <p>Branch#</p>
                            <span class="bold">{{ call.customerStoreBranchCode }}</span>
                            <p v-if="getTechState(tech, call).id !== 0">Tech</p>
                            <span class="bold">{{ getTechState(tech, call).id === 0 ? '' : getTechState(tech, call).name }}</span>
                            <p v-if="call.latestTechUpdate">Updated</p>
                            <span v-if="call.latestTechUpdate">{{ call.latestTechUpdate }}</span>
                            
                        </div>
                    </div>
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
            var techState = '';
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

.tcc.left-site {
    color: var(--LeftSite);
}

.tcc.on-hold {
    color: var(--OnHold);
}

.tcc.completed {
    color: var(--Completed);
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






.filtered-calls-cards-loop {
    text-align: left;
    min-width: 300px;
    max-width: 360px;
    border-radius: 5px;
    margin-right: 10px;
    padding: 10px;
    height: max-content;
}



.filtered-calls-card {
    display: grid;
    grid-template-columns: 1fr 2.5fr;
    width: 100%;
    
}

.filtered-calls-cards-loop.open {
    background: var(--OpenCall);
    color: var(--TextBlack);
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

.filtered-calls-cards-loop.left-site {
    background: var(--LeftSite);
}

.filtered-calls-cards-loop.on-hold {
    background: var(--OnHold);
}

.filtered-calls-cards-loop.completed {
    background: var(--Completed);
}

</style>