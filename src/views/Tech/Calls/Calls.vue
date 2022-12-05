<template>
    <div class="calls-wrap">

        <div class="toggle-selector-wrap calls">
            <h4>Show Jobs</h4>
            <div class="selection-toggle-switch" @click="$store.dispatch('Calls/toggleActiveCalls')"> 
                <div class="toggle-slider" :class="{ left : showActiveCalls, right : !showActiveCalls }"></div>
                <div class="span-wrap active">
                    <span :class="{ active : showActiveCalls }" class="active-calls num-of-calls-subscript">{{ numActiveCalls }}</span>
                    <span :class="{ active : showActiveCalls }"><font-awesome-icon class="selector-icon active-calls" :icon="['fa', 'clipboard-check']" size="lg" /> Active</span>
                </div>
                <div class="span-wrap pending" :class="{ 'nothing-pending' : showActiveCalls && incomingCalls.length <= 0 }">
                    <span :class="{ active : !showActiveCalls, bounce : incomingCalls.length >= 1 }" class="pending num-of-calls-subscript">{{ numPendingCalls }}</span>
                    <span :class="{ active : !showActiveCalls }"><span class="material-symbols-outlined selector-icon material pending-calls" >pending_actions</span> Pending</span>
                </div>
            </div>
        </div>



        <div class="active-calls-scroll-section" :class="{ 'custom-scroller' : showActiveCalls ? activeCalls.length >= 4 : incomingCalls.length >= 4 }">

            <SectionLoading v-if="loading" />

            <br>
            
            <div class="active-calls-card" v-for="call in showActiveCalls ? activeCalls : incomingCalls" :key="call.id" @click="loadCall(call)">
                <!-- <p>Call ID:</p>
                <span class="bold">{{ call.id }}</span> -->
                <font-awesome-icon v-if="call.customerStoreName" class="call-store-icon" :icon="['fa', 'store-alt']" size="lg" />
                <font-awesome-icon v-else class="call-store-icon" :icon="['fa', 'toolbox']" size="lg" />
                <span class="bold call-info">{{ call.customerStoreName ? call.customerStoreName : 'Client Call #' + call.id }}</span>
                <font-awesome-icon class="call-store-icon" :icon="['fa', 'info-circle']" size="lg" />
                <span class="call-info call-detail bold">{{ call.callDetails.length <= 30 ? call.callDetails : call.callDetails.substring(0,30) + '...' }}</span>
                <div class="tech-state-icon-wrap" :class="{ pending : call.techStateId === 1, received : call.techStateId === 2, 'en-route' : call.techStateId === 3, 'at-site' : call.techStateId === 4, 'left-site' : call.techStateId === 5, 'on-hold' : call.techStateId === 6 }">
                    <div>
                        <span v-if="call.techStateId === 1" class="material-symbols-outlined tech-state-icon pending material" >pending_actions</span>
                        <!-- <font-awesome-icon v-if="call.techStateId === 1" class="tech-state-icon pending" :icon="['fa', 'phone-alt']" size="lg" /> -->
                        <font-awesome-icon v-if="call.techStateId === 2" class="tech-state-icon received" :icon="['fa', 'user-check']" size="lg" />
                        <font-awesome-icon v-if="call.techStateId === 3" class="tech-state-icon en-route" :icon="['fa', 'route']" size="lg" />
                        <font-awesome-icon v-if="call.techStateId === 4" class="tech-state-icon at-site" :icon="['fa', 'map-marker-alt']" size="lg" />
                        <font-awesome-icon v-if="call.techStateId === 5" class="tech-state-icon left-site" :icon="['fa', 'road']" size="lg" />
                        <font-awesome-icon v-if="call.techStateId === 6" class="tech-state-icon on-hold" :icon="['fa', 'pause-circle']" size="lg" />
                        <span>{{ call.techStateName }}</span>
                    </div>

                </div>
                
            </div>
            
        </div>


        
    </div>
</template>




<script>
import SectionLoading from '../../../components/Loading/LoadingSection.vue'
import { mapGetters } from 'vuex'


export default {



    components: {
        SectionLoading
    },



    data(){
        return {
            
        }
    },




    computed: {
        ...mapGetters({
            activeCalls: ['Calls/activeCalls'],
            incomingCalls: ['Calls/incomingCalls'],
            loading: ['Calls/loading'],
            showActiveCalls: ['Calls/showActiveCalls'],
            online: ['StaticResources/online']
        }),

        numActiveCalls: function() {
            return this.activeCalls.length;
        },
        numPendingCalls: function() {
            return this.incomingCalls.length;
        }
    },




    watch: {
        showActiveCalls: {
            handler: function() {
                if(this.showActiveCalls)
                {
                    this.$store.dispatch('Menu/setTitle', { title: 'Active Jobs', icon: ['fa', 'toolbox'] }) 
                }
                else
                { 
                    this.$store.dispatch('Menu/setTitle', { title: 'Pending Jobs', icon: ['fa', 'toolbox'] });
                    // this.$store.dispatch('Calls/getTechnicianCalls', true);
                }
            },
            deep: true,
            immediate: true
        },        
    },




    mounted() {
        setTimeout(() => {
            if(this.online)
                this.$store.dispatch('Calls/getTechnicianCalls');
        }, 150);
    },




    methods: {

        loadCall: function(call) {
            this.$store.dispatch('Call/loadCall', call.id);
            this.$router.push('/call/' + call.id);
        },



        

    }

}


</script>




<style>


.calls-wrap {

}





.active-calls-scroll-section {
    display: flex;
    align-items: center;
    flex-direction: column;

    position: relative;

    overflow-y: scroll;
    max-height: 60vh;
    min-height: 30vh;
    height: 60vh;
    width: 100%;
    padding: 10px;
    padding-top: 0px;
    box-shadow: inset 0 -6px 20px 0 rgb(0 0 0 / 40%);
    background: rgba(0,0,40,0.2);
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
    width: 80vw;
    box-shadow: -3px 4px 8px 0 rgba(0,0,0,0.3);
    margin-bottom: 20px;
    animation: fade-in 200ms ease;
    position: relative;
    height: 90px;
    min-height: 90px;
    max-width: 400px;
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
    color: var(--PendingDark);
}

.tech-state-icon-wrap.received {
    background: var(--Received);
    color: var(--ReceivedDark);
}

.tech-state-icon-wrap.en-route {
    background: var(--EnRoute);
    color: var(--EnRouteDark);
}

.tech-state-icon-wrap.at-site {
    background: var(--AtSite);
    color: var(--AtSiteDark);
    
}

.tech-state-icon-wrap.left-site {
    background: var(--LeftSite);
    color: var(--LeftSiteDark);
}

.tech-state-icon-wrap.on-hold {
    background: var(--OnHold);
    color: var(--OnHoldDark);
}






.tech-state-icon-wrap div {
    font-size: 12px;
    transform: rotate(-90deg);
    transform-origin: 15px 15px;
    position: absolute;
    bottom: 0;
    left: 0;
    bottom: 0;
    width: 90px;
    height: 30px;

    display: flex;
    align-items: center;
    justify-content: center;
}



.tech-state-icon {
    font-size: 14px;
    margin-right: 5px;
}



.tech-state-icon.pending {
    font-size: 20px;
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

.tech-state-icon.at-site {
    
}

.tech-state-icon.left-site {
    
}







.toggle-selector-wrap.calls {
    bottom: 120px;
    left: 0;
    right: 0;
    margin: 0 auto;
    width: 80%;
}


.toggle-selector-wrap.calls h4 {
    margin-bottom: 5px;
}






/* .span-wrap.pending {
    padding-right: 27px;
} */


/* .span-wrap.active {
    padding-left: 20px;
} */


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
        transform: translateY(-8px);
    }
    30% {
        transform: translateY(0);
    }
    45% {
        transform: translateY(-6px);
    }
    60% {
        transform: translateY(0);
    }
    75% {
        transform: translateY(-3px);
    }
    90% {
        transform: translateY(0);
    }
    100% {
        transform: translateY(0);
    }
}



.selection-toggle-switch .num-of-calls-subscript.pending.bounce {
    animation: bounce 1300ms ease;
    background: rgb(173, 17, 17);
    color: white;
    font-weight: 700;
}





</style>