<template>
    <div class="calls-wrap">


        <button :disabled="!online" class="refresh-jobs-btn calls" @click="refreshJobs()" ><font-awesome-icon style="margin-right: 5px;" :icon="['fa', 'sync-alt']" size="lg" /> Refresh Jobs</button>


        <div class="toggle-selector-wrap calls">
            <h4>Show Jobs</h4>
            <div class="selection-toggle-switch" @click="toggleActiveCalls()"> 
                <div class="toggle-slider" :class="{ left : showActiveCalls, right : !showActiveCalls }"></div>
                <div class="span-wrap active">
                    <span :class="{ active : showActiveCalls }" class="active-calls num-of-calls-subscript">{{ numActiveCalls }}</span>
                    <span :class="{ active : showActiveCalls }"><font-awesome-icon class="selector-icon active-calls" :icon="['fa', 'clipboard-check']" size="lg" /> Active</span>
                </div>
                <div class="span-wrap pending" :class="{ 'nothing-pending' : showActiveCalls && pendingCalls.length <= 0 }">
                    <span :class="{ active : !showActiveCalls, bounce : pendingCalls.length >= 1 }" class="pending num-of-calls-subscript">{{ numPendingCalls }}</span>
                    <span :class="{ active : !showActiveCalls }"><span class="material-symbols-outlined selector-icon material pending-calls" >pending_actions</span> Pending</span>
                </div>
            </div>
        </div>



        <div class="active-calls-scroll-section" :class="{ 'custom-scroller' : showActiveCalls ? activeCalls.length >= 4 : pendingCalls.length >= 4 }">

            <div class="active-calls-scroll-section-inner-wrapper">

                <SectionLoading v-if="(loading || refreshing)" />

                <br>

                <div class="calls-search-wrap">
                    <input type="text" v-model="callSearchString" @input="filterCalls()" placeholder="Search Calls...">
                </div>
                
                <div class="call-cards-wrap">
                    <div class="active-calls-card" v-for="call in filteredCalls" :key="call.id" @click="loadCall(call)">
                        <!-- <p>Call ID:</p>
                        <span class="bold">{{ call.id }}</span> -->
                        <font-awesome-icon class="call-store-icon" :icon="['fa', 'store-alt']" size="lg" />
                        <span class="bold call-info" v-if="call.customerStoreName">{{ call.customerStoreName + ' (' + call.customerStoreBranchCode + ')' }}</span>
                        <span v-else></span>
                        <font-awesome-icon class="call-store-icon" :icon="['fa', 'toolbox']" size="lg" />
                        <span class="bold call-info">Client Call # {{ call.id }}</span>
                        <font-awesome-icon class="call-store-icon" :icon="['fa', 'info-circle']" size="lg" />
                        <span class="call-info call-detail bold">{{ call.callDetails.length <= 30 ? call.callDetails : call.callDetails.substring(0,30) + '...' }}</span>
                        <div class="tech-state-icon-wrap" :class="{ pending : call.techStateId === 1, received : call.techStateId === 2, 'en-route' : call.techStateId === 3, 'on-site' : call.techStateId === 4, 'returning' : call.techStateId === 5, 'on-hold' : call.techStateId === 6, 'rerouted' : call.techStateId == 7, 'completed' : call.techStateId == 8, 'transferred' : call.techStateId == 9 }">
                            <div>
                                <span v-if="call.techStateId === 1" class="material-symbols-outlined tech-state-icon pending material" >pending_actions</span>
                                <font-awesome-icon v-if="call.techStateId === 2" class="tech-state-icon received" :icon="['fa', 'user-check']" size="lg" />
                                <font-awesome-icon v-if="call.techStateId === 3" class="tech-state-icon en-route" :icon="['fa', 'route']" size="lg" />
                                <font-awesome-icon v-if="call.techStateId === 4" class="tech-state-icon on-site" :icon="['fa', 'map-marker-alt']" size="lg" />
                                <font-awesome-icon v-if="call.techStateId === 5" class="tech-state-icon returning" style="transform: scaleX(-1);" :icon="['fa', 'clock-rotate-left']" size="lg" />
                                <font-awesome-icon v-if="call.techStateId === 6" class="tech-state-icon on-hold" :icon="['fa', 'pause-circle']" size="lg" />
                                <font-awesome-icon v-if="call.techStateId === 8" class="tech-state-icon completed" :icon="['fa', 'clipboard-check']" size="lg" />
                                <font-awesome-icon v-if="call.techStateId === 9" class="tech-state-icon transferred" :icon="['fa', 'shuffle']" size="lg" />
                                <span v-if="call.techStateId === 7" class="material-symbols-outlined tech-state-icon rerouted material" >alt_route</span>
                                <span class="tech-state-name">{{ call.techStateName }}</span>
                            </div>

                        </div>
                    </div>
                    
                </div>

            </div>

        </div>

        <!-- KEEP COMPLETED CALLS FOR ONE DAY-->



        <!-- <div class="temp-button-wrap">
            <button @click="setTechAtOffice()">@Office</button>
        </div> -->


        
    </div>
</template>




<script>
import SectionLoading from './LoadingSection.vue'
import { mapGetters } from 'vuex'


export default {



    components: {
        SectionLoading
    },



    data(){
        return {
            refreshing: false,
            callSearchString: '',
            filteredCalls: []
        }
    },




    computed: {
        ...mapGetters({
            activeCalls: ['Calls/activeCalls'],
            pendingCalls: ['Calls/pendingCalls'],
            allCalls: ['Calls/allCalls'],
            loading: ['Calls/loading'],
            showActiveCalls: ['Calls/showActiveCalls'],
            online: ['StaticResources/online']
        }),

        numActiveCalls: function() {
            return this.activeCalls.length;
        },
        numPendingCalls: function() {
            return this.pendingCalls.length;
        }
    },




    watch: {
        showActiveCalls: {
            handler: function() {
                if(this.showActiveCalls)
                {
                    this.$store.dispatch('Menu/setTitle', { title: 'Active Jobs', icon: ['fa', 'toolbox'] }) 
                    // this.filteredCalls = this.activeCalls;
                }
                else
                { 
                    this.$store.dispatch('Menu/setTitle', { title: 'Pending Jobs', icon: ['fa', 'toolbox'] });
                    // this.filteredCalls = this.pendingCalls;
                }
            },
            deep: true,
            immediate: true
        },    
        
        
        activeCalls: {
            handler: function() {
                if(this.showActiveCalls)
                this.filteredCalls = this.activeCalls;
                else
                    this.filteredCalls = this.pendingCalls;
            },
            deep: true
        },

        pendingCalls: {
            handler: function() {
                if(!this.showActiveCalls)
                    this.filteredCalls = this.pendingCalls;
                else
                    this.filteredCalls = this.activeCalls;
            },
            deep: true
        }
    },




    mounted() {
        setTimeout(() => {
            if(this.online)
                this.$store.dispatch('Calls/getTechnicianCalls');
        }, 150);

        this.showActiveCalls ? this.filteredCalls = this.activeCalls : this.filteredCalls = this.pendingCalls;
    },




    methods: {




        toggleActiveCalls: function() {
            this.$store.dispatch('Calls/toggleActiveCalls');
            if(this.showActiveCalls)
                this.filteredCalls = this.activeCalls;
            else
                this.filteredCalls = this.pendingCalls;
        },




        filterCalls: function() {

            // console.log(this.callSearchString, this.allCalls);

            this.filteredCalls = this.allCalls.filter(call => {
                // match the call id (which is a number) to the callSearchString (which is a string)
                if(call.id.toString().indexOf(this.callSearchString) != -1)
                {
                    // console.log('ID match, ', call.id)
                    return call;
                }
                if(call.customerStoreName.toLowerCase().indexOf(this.callSearchString.toLowerCase()) != -1)
                {
                    // console.log('Store Name match, ', call.customerStoreName);
                    return call;
                }
                if(call.customerStoreBranchCode.toLowerCase().indexOf(this.callSearchString.toLowerCase()) != -1)
                {
                    // console.log('Branch Code match, ', call.customerStoreBranchCode);
                    return call;
                }
            })

        },

        // setTechAtOffice: function() {
        //     this.$store.dispatch('GeoLocation/markTechAtOffice')
        // },


        loadCall: function(call) {
            this.$store.dispatch('Call/loadCall', call.id);
            this.$router.push('/call/' + call.id);
        },


        refreshJobs: async function() {
            this.refreshing = true;
            await this.$store.dispatch('Calls/refreshTechnicianCalls');
            this.refreshing = false;
            // this.$router.push('/calls');
        }
        

    }

}


</script>




<style>


.calls-wrap {

}





.active-calls-scroll-section {
    overflow-y: scroll;
    max-height: 60vh;
    min-height: 30vh;
    height: 60vh;
    width: 100%;
    background: rgba(0,0,40,0.2);
}


.active-calls-scroll-section-inner-wrapper {
    position: relative;
    padding: 10px;
    padding-top: 0;
    display: flex;
    align-items: center;
    flex-direction: column;
    box-shadow: inset 0 -6px 20px 0 rgb(0 0 0 / 40%);
}




.calls-search-wrap {
    position: fixed;
    top: 65px;
    left: 0;
    right: 0;
    margin: 0 auto;
    z-index: 200;
}


.calls-search-wrap input {
    width: 85vw;
    max-width: 400px;
    margin-right: 7px;
}




.call-cards-wrap {
    padding-top: 45px;
}





.active-calls-card {
    display: grid;
    grid-template-columns: 0.15fr 1fr;
    row-gap: 10px;
    text-align: left;
    align-items: center;
    align-content: center;
    justify-items: flex-start;
    font-size: 14px;
    justify-self: center;
    background: var(--GunMetal);
    background: linear-gradient(to left, rgba(0,0,0,0.35), rgba(0,0,0,0.5)70%);
    padding: 7px 10px;
    border-radius: 3px;
    width: 85vw;
    box-shadow: -3px 4px 8px 0 rgba(0,0,0,0.3);
    margin-bottom: 20px;
    animation: fade-in 200ms ease;
    position: relative;
    max-width: 400px;
    height: 110px;
    min-height: 110px;
}



.active-calls-card p,
.active-calls-card .call-info {
    text-align: left;
    padding-right: 25px;
}






.tech-state-icon-wrap {
    position: absolute;
    right: 0;
    top: 0;
    
    height: 100%;
    width: 30px;

    border-top-right-radius: 3px;
    border-bottom-right-radius: 3px;
    box-shadow: -3px 0 6px 0 rgba(0,0,0,0.15);
}




.tech-state-icon-wrap.pending {
    background: var(--Pending);
    color: var(--PendingLight);
}
/* .tech-state-icon-wrap.pending .tech-state-name {
    color: var(--PendingLight);
} */


.tech-state-icon-wrap.received {
    background: var(--Received);
    color: var(--ReceivedLight);
}
/* .tech-state-icon-wrap.received .tech-state-name {
    color: var(--ReceivedLight);
} */


.tech-state-icon-wrap.en-route {
    background: var(--EnRoute);
    color: var(--EnRouteLight);
}
/* .tech-state-icon-wrap.en-route .tech-state-name {
    color: var(--EnRouteLight);
} */


.tech-state-icon-wrap.rerouted {
    background: var(--Rerouted);
    color: var(--ReroutedLight);
}
/* .tech-state-icon-wrap.rerouted .tech-state-name {
    color: var(--ReroutedLight);
} */


.tech-state-icon-wrap.on-site {
    background: var(--OnSite);
    color: var(--OnSiteLight);
    
}
/* .tech-state-icon-wrap.on-site .tech-state-name {
    color: var(--OnSiteLight);
} */


.tech-state-icon-wrap.returning {
    background: var(--Returning);
    color: var(--ReturningLight);
}
/* .tech-state-icon-wrap.returning .tech-state-name {
    color: var(--ReturningLight);
} */


.tech-state-icon-wrap.on-hold {
    background: var(--OnHold);
    color: var(--OnHoldLight);
}
/* .tech-state-icon-wrap.on-hold .tech-state-name {
    color: var(--OnHoldLight);
} */


.tech-state-icon-wrap.completed {
    background: var(--Completed);
    color: var(--CompletedLight);
}
/* .tech-state-icon-wrap.completed .tech-state-name {
    color: var(--CompletedLight);
} */


.tech-state-icon-wrap.transferred {
    background: var(--Transferred);
    color: var(--TransferredLight);
}
/* .tech-state-icon-wrap.transferred .tech-state-name {
    color: var(--TransferredLight);
} */





.tech-state-icon-wrap div {
    font-size: 12px;
    transform: rotate(-90deg);
    transform-origin: 15px 15px;
    position: absolute;
    bottom: 0;
    left: 0;
    bottom: 0;
    width: 110px;
    height: 30px;

    display: flex;
    align-items: center;
    justify-content: center;
}


.tech-state-icon-wrap .tech-state-name {
    color: var(--BlockBorder);
}


.tech-state-icon {
    font-size: 14px;
    margin-right: 5px;
}



.tech-state-icon.pending,
.tech-state-icon.rerouted {
    font-size: 16px;
    margin-right: 2px;
    margin-left: -3px;
    /* transform: rotate(90deg); */
}



.tech-state-icon-wrap.received div {
    /* padding-right: 36px; */
}

.tech-state-icon.received {
    
}


.tech-state-icon-wrap.en-route div {
    /* padding-right: 30px; */
}

.tech-state-icon.en-route {
    
}

.tech-state-icon.on-site {
    
}

.tech-state-icon.returning {
    
}





.refresh-jobs-btn.calls {
    position: absolute;
    bottom: 180px;
    left: 0;
    right: 0;
    margin: 0 auto;
    width: max-content;
    color: var(--BlueMid);
}






.toggle-selector-wrap.calls {
    bottom: 100px;
    left: 0;
    right: 0;
    margin: 0 auto;
    width: 80%;
}


.toggle-selector-wrap.calls h4 {
    margin-bottom: 5px;
}




.selection-toggle-switch .span-wrap.active {
    padding-left: 10px;
}


.selection-toggle-switch .span-wrap.pending {
    padding-right: 10px;
}



.selection-toggle-switch .span-wrap {
    position: relative;
}


.selection-toggle-switch .span-wrap .num-of-calls-subscript {
    position: absolute;
    
    /* top: -6px; */
    /* color: white; */
    width: 15px;
    height: 35px;
    font-size: 12px;
    transition: color background 250ms ease;
}



.selection-toggle-switch .num-of-calls-subscript.active-calls {
    left: -1px;
    color: var(--GunMetal);
    border-top-left-radius: 3px;
    border-bottom-left-radius: 3px;
    background: rgba(255,255,255,0.8);
    
}


.selection-toggle-switch .num-of-calls-subscript.active.active-calls,
.selection-toggle-switch .num-of-calls-subscript.active.pending {
    color: var(--GunMetal);
    background: rgba(255,255,255,0.8);
    transition: color background 250ms ease;
}



.selection-toggle-switch .num-of-calls-subscript.pending {
    right:  -1px;
    color: var(--Pending);
    border-top-right-radius: 3px;
    border-bottom-right-radius: 3px;
    background: rgba(255,255,255,0.8);
}



.selection-toggle-switch .span-wrap.nothing-pending .num-of-calls-subscript.pending {
    color: var(--GunMetal);
}






@keyframes bounce {
    0% {
        transform: translateY(0);
    }
    15% {
        transform: translateY(-40px);
    }
    16% {
        transform: translateY(-40px) rotate(45deg);
    }
    18% {
        transform: translateY(-40px) rotate(90deg);
    }
    20% {
        transform: translateY(-40px) rotate(135deg);
    }
    22% {
        transform: translateY(-40px) rotate(180deg);
    }
    24% {
        transform: translateY(-40px) rotate(225deg);
    }
    26% {
        transform: translateY(-30px) rotate(270deg);
    }
    28% {
        transform: translateY(-20px) rotate(305deg);
    }
    30% {
        transform: translateY(-10px) rotate(360deg);
    }
    35% {
        transform: translateY(0) rotate(360deg);
    }
    45% {
        transform: translateY(-6px) rotate(360deg);
    }
    60% {
        transform: translateY(0) rotate(360deg);
    }
    75% {
        transform: translateY(-3px) rotate(360deg);
    }
    90% {
        transform: translateY(0) rotate(360deg);
    }
    100% {
        transform: translateY(0) rotate(360deg);
    }
}



.selection-toggle-switch .num-of-calls-subscript.pending.bounce {
    animation: bounce 1300ms ease;
    background: rgb(173, 17, 17);
    color: white;
    font-weight: 700;
    transform-origin: center;
}





</style>