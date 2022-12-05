<template>
    <div class="call-wrap">

        <div class="loading-lightbox-wrap" v-if="loading">
            <font-awesome-icon class="loading-lightbox-icon" :icon="['fa','circle-notch']" size="lg" spin />
        </div>
        
        <div class="call-info-wrap">

            <div class="call-info-wrapper call-details-wrap">
                <h4>Call Detail</h4>
                <p class="call-details" v-html="processCallDetails(call.callDetails)"></p>
            </div>
            
            <div class="call-info-wrapper">
                <h4>Address ({{ call.customerStore && call.customerStore.distance ? call.customerStore.distance : '' }} km <span class="small-text distance-x2">distance x2</span>)</h4>
                <p style="text-align: center;">{{ call.customerStoreAddress }}</p>

                <h4 style="margin-top: 15px;">Customer Account</h4>
                <p style="text-align: center;">{{ call.customerAccountName }}</p>
            </div>

            
            <div class="call-info-wrapper">
                <div class="call-info-grid">

                    <h4>Operator</h4>
                    <p>{{ call.operatorName }}</p>

                    <!-- <h4>Branch Code</h4>
                    <p>{{ call.customerStoreBranchCode }}</p> -->
                    
                    <h4 v-if="call.siteReady">Site Ready Date</h4>
                    <p v-if="call.siteReady">{{ call.siteReadyDate }}</p>

                    <h4>Caller Name</h4>
                    <p>{{ call.callerName }}</p>

                    <h4>Caller Phone</h4>
                    <p>{{ call.contactNumber }}</p>

                    <h4>Call Type</h4>
                    <p>{{ returnCallType(call.callTypeId) }}</p>

                    <h4>Call Sub Type</h4>
                    <p>{{ returnCallSubType(call.callSubTypeId) }}</p>

                </div>
            </div>

            <div class="current-tech-state-wrap" :class="{ pending : call.techStateId === 1, received : call.techStateId === 2, 'en-route' : call.techStateId === 3, 'at-site' : call.techStateId === 4, 'left-site' : call.techStateId === 5, 'on-hold' : call.techStateId === 6 }">
                <p class="call-info-store" :class="{ 'small-text' : call.customerStoreName && call.customerStoreName.length >= 26 }">{{ call.customerStoreName }} <span v-if="call.customerStoreName">({{ call.customerStoreBranchCode }})</span></p>
                <div class="job-status-wrap">
                    <p class="current-job-status-heading-text">Job Status</p>
                    <p class="call-current-tech-state" v-if="call.techStateId === 1"><span class="material-symbols-outlined call-current-tech-state-icon material" >pending_actions</span> Pending</p>
                    <p class="call-current-tech-state" v-else-if="call.techStateId === 2"><font-awesome-icon class="call-current-tech-state-icon" :icon="['fa', 'user-check']" size="lg" /> Received</p>
                    <p class="call-current-tech-state" v-else-if="call.techStateId === 3"><font-awesome-icon class="call-current-tech-state-icon" :icon="['fa', 'route']" size="lg" /> En-Route</p>
                    <p class="call-current-tech-state" v-else-if="call.techStateId === 4"><font-awesome-icon class="call-current-tech-state-icon" :icon="['fa', 'map-marker-alt']" size="lg" /> At-Site</p>
                    <p class="call-current-tech-state" v-else-if="call.techStateId === 6"><font-awesome-icon class="call-current-tech-state-icon" :icon="['fa', 'pause-circle']" size="lg" /> On-Hold</p>
                </div>
            </div>


        </div>

        
        
        
        <div class="call-button-wrap">
            <button v-if="call.techStateId === 1" @click="canUpdateCall(2)" class="update-call-btn received"><font-awesome-icon class="update-call-icon accept" :icon="['fa', 'user-check']" size="lg" /> Accept Call</button>
            <button v-if="call.techStateId === 2 || call.techStateId === 6" @click="canUpdateCall(3)" class="update-call-btn en-route"><font-awesome-icon class="update-call-icon en-route" :icon="['fa', 'route']" size="lg" /> En Route</button>
            <button v-if="call.techStateId === 3" @click="canUpdateCall(4)" class="update-call-btn at-site"><font-awesome-icon class="update-call-icon on-site" :icon="['fa', 'map-marker-alt']" size="lg" /> On Site</button>
            <button v-if="call.techStateId === 4" @click="canUpdateCall(6)" class="update-call-btn on-hold"><font-awesome-icon class="update-call-icon on-hold" :icon="['fa', 'pause-circle']" size="lg" /> On Hold</button>
            <button v-if="call.techStateId === 4 || call.techStateId === 6" @click="canUpdateCall(5)" class="update-call-btn left-site"><font-awesome-icon class="update-call-icon left-site" :icon="['fa', 'road']" size="lg" /> Left Site</button>
        </div>
    </div>
</template>



<script>

import { mapGetters } from 'vuex'
export default {

    data() {
        return {
            call_types: '',
            call_sub_types: '',
            serviceWorker: null
        }
    },




    computed: {
        ...mapGetters({
            call: ['Call/call'],
            loading: ['Call/loading'],
            activeCalls: ['Calls/activeCalls'],
            modal: ['Modal/modal']
        })
    },





    watch: {
        '$route.params.callId': {
            handler: function() {

                if(this.$route.params.callId)
                {
                    this.$store.dispatch('Menu/setTitle', { title: 'Client Call #' + this.$route.params.callId, icon: ['fa', 'toolbox'] });
                }
                else
                {
                    // console.log('Rerouting to calls because route param did not contain a call id... ');
                    // console.log(this.$router)
                    setTimeout(() => {
                        this.$router.currentRoute 
                        && this.$router.currentRoute.path
                        && this.$router.currentRoute.path.indexOf('call') !== -1 
                        ? this.$router.push('/calls') 
                        : null;
                    }, 150);
                    
                }

            },
            deep:true,
            immediate: true
        },

        call: {
            handler: function() {
                if(this.call && this.call.techStateId === 5)
                {
                    this.$router.push('/calls');
                }
            },
            deep: true,
            immediate: true
        },



        modal: {
            handler: function() {
                if(this.modal.confirmAction === true && this.modal.actionFrom.indexOf('_canUpdateCall_'+this.call.id) !== -1)
                {
                    var holdCallId = this.modal.actionFrom.split('_')[1];
                    var holdCall = this.activeCalls.filter(call => call.id.toString() === holdCallId.toString())[0];
                    this.updateCall(6, holdCall);
                    this.checkForSameStoreCalls(6, holdCall);

                    console.log('Call placed on hold: ', holdCall);


                    var nextStatusId = this.call.techStateId === 6 ? 3 : this.call.techStateId + 1;
                    this.updateCall(nextStatusId, this.call);
                    this.checkForSameStoreCalls(nextStatusId, this.call);
                    console.log('Call updated: ', this.call);
                    
                }
                
            },
            deep: true
        }
    },

    






    mounted() {

        this.call_types = JSON.parse(localStorage.getItem('call_types'));
        this.call_sub_types = JSON.parse(localStorage.getItem('call_sub_types'));

        this.$route.params.callId ? this.$store.dispatch('Call/loadCall', this.$route.params.callId) : null;
    },





    methods: {

        updateCall: async function(nextStatusId, call) {

                if('serviceWorker' in navigator)
                {

                    navigator.serviceWorker.getRegistration().then(reg => {
                        // console.log('We have a registration: ', reg);
                        var user = JSON.parse(localStorage.getItem('user'));
                        var signature = JSON.parse(localStorage.getItem('signature'));
                        var data = JSON.stringify({call: call, nextStatusId, user, signature });
                        reg.active.postMessage({type: 'updateCall', data: data});
                    })
                    .catch(err => {
                        console.log(err);
                        console.log('Service worker registration not found, uhm....');
                        // do something if the service worker is not found...
                        // Probably log out the user, refresh the app and have them log in again (notify first)
                    })

                }

            var payload = { nextStatusId, call }
            this.$store.dispatch('Call/updateCall', payload);
        },






        canUpdateCall: function(nextStatusId) {


            if(nextStatusId <= 2 )
            {
                this.updateCall(nextStatusId, this.call);
                return
            }
            


            var flag = false;
                
            this.activeCalls.map(call => {

                if(call.id !== this.call.id && call.customerStoreId !== this.call.customerStoreId)
                {
                    if(call.techStateId >= 3 && call.techStateId !== 6)
                    {
                        flag = true;
                        var modal = {
                            active: true, // true to show modal
                            type: 'warning', // ['info', 'warning', 'error', 'okay']
                            icon: ['fa', 'exclamation-triangle'], // Leave blank for no icon
                            heading: 'Put Current Job on Hold?',
                            body: '<p>Your Current Job will be placed on hold if you continue.</p>',
                            confirmAction: 'init',
                            actionFrom: 'holdCall_'+call.id+'_canUpdateCall_'+this.call.id,
                            resolveText: 'Okay',
                            rejectText: 'Cancel'
                        }

                        this.$store.dispatch('Modal/modal', modal);
                        
                    }
                }
            })

            if(!flag)
            {
                this.updateCall(nextStatusId, this.call);
                this.checkForSameStoreCalls(nextStatusId, this.call);
            }

            

        },







        checkForSameStoreCalls: function(nextStatusId, currentCall) {
            this.activeCalls.map(call => {
                if(call.id !== currentCall.id && call.customerStoreId === currentCall.customerStoreId)
                {
                    this.updateCall(nextStatusId, call);
                }
            });
        },







        returnCallType: function(callTypeId) {
            !this.call_types ? this.call_types = JSON.parse(localStorage.getItem('call_types')) : null;
            var callType, callTypeName = '';

            callType = this.call_types.filter(type => type.id === callTypeId)[0];
            callType ? callTypeName = callType.name : null;

            return callTypeName;
        },





        returnCallSubType: function(callSubTypeId) {
            !this.call_sub_types ? this.call_sub_types = JSON.parse(localStorage.getItem('call_sub_types')) : null;
            var callSubType, callSubTypeName = '';

            callSubType = this.call_sub_types.filter(type => type.id === callSubTypeId)[0];
            callSubType ? callSubTypeName = callSubType.name : null;

            return callSubTypeName;
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
        }

    }

}
</script>



<style>


.call-wrap {
    position: relative;
}



.call-button-wrap {
    position: fixed;
    bottom: 90px;
    left: 0;
    right: 0;
    margin: 0 auto;
    width: 100%;
    display: flex;
    justify-content: center;
    z-index: 100;
}




.call-button-wrap button {
    margin: 0 25px;
}




.update-call-btn {
    background: var(--GunMetal);
}

.update-call-btn.received {
    color: var(--ReceivedLight);
}

.update-call-btn.en-route {
    color: var(--EnRouteLight);
}

.update-call-btn.at-site {
    color: var(--AtSiteLight);
}

.update-call-btn.left-site {
    color: var(--LeftSiteLight);
}

.update-call-icon.left-site {
    color: rgb(240,240,240);
}

.update-call-btn.on-hold {
    color: var(--OnHoldLight);
}

.update-call-icon.on-hold {
    color: var(--OnHold);
}









.call-info-wrap {
    text-align: left;
    position: relative;
    padding: 0 15px;
    padding-top: 80px;
    
}





.call-info-wrapper {
    padding: 10px 7px;
    border: 2px solid rgba(255,255,255,0.4);
    border-radius: 3px;
    margin-bottom: 25px;
    background: var(--BlueAlt);
}


.call-info-wrapper.call-details-wrap {
    padding: 4px 7px;
}


.call-info-wrapper h4 {
    margin-bottom: 5px;
    font-size: 15px;
    text-align: center;
}


.call-info-wrapper p {
    /* margin-bottom: 10px; */
    font-size: 15px;
}



.call-info-wrapper .call-details {
    /* margin-bottom: 30px; */
}

.call-info-wrapper .call-details p {
    margin-bottom: 0;
    background: var(--DarkGrey);
}






.call-info-wrapper.call-details-wrap p p {
    /* border: 1px solid rgba(255,255,255,0.75); */
    box-shadow: -1px 2px 5px 0 rgba(0,0,0,0.3);
    padding: 4px 7px;
    margin-bottom: 10px;
    /* border-bottom: 1px solid rgba(0,0,0,0.15); */
}






.call-current-tech-state {
    display: flex;
    align-items: center;
    text-align: right;
    font-size: 18px;
    width: max-content;
}







.job-status-wrap {
    display: flex;
    align-items: flex-end;
    flex-direction: column;
}



.call-current-tech-state-icon,
.call-current-tech-state-icon.material {
    margin-right: 4px;
}




.current-job-status-heading-text {
    color: white; 
    font-size: 10px; 
    margin-bottom: 5px;
    text-align: right;
}



.current-tech-state-wrap .call-info-store {
    font-weight: 700;
    font-size: 20px;
    padding-right: 100px;
    padding-left: 5px;
    color: white;
}


.current-tech-state-wrap .call-info-store.small-text {
    font-size: 15px;
}



.current-tech-state-wrap p {
    margin-bottom: 0;
}

.current-tech-state-wrap {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 65px;
    font-size: 12px;
    padding: 8px 10px;
    border-bottom-left-radius: 3px;
    box-shadow: -2px 2px 6px 0 rgba(0,0,0,0.15);
    display: flex;
    justify-content: space-between;
    align-items: center;
    /* z-index: 800; */
}


.current-tech-state-wrap.pending {
    background: var(--Pending);
    color: var(--PendingDark);
}

.current-tech-state-wrap.received {
    background: var(--Received);
    color: var(--ReceivedDark);
}

.current-tech-state-wrap.en-route {
    background: var(--EnRouteDark);
    color: var(--EnRouteLight);
}

.current-tech-state-wrap.at-site {
    background: var(--AtSiteDark);
    color: var(--AtSiteLight);
}

.current-tech-state-wrap.on-hold {
    background: var(--OnHoldDark);
    color: var(--OnHold);
}









.call-info-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    justify-items: flex-start;
}


.call-info-grid h4 {
    text-decoration: none;
}


.call-info-grid p {
    margin-bottom: 0;
}







.distance-x2 {
    color: rgba(255,255,255,0.75);
;}


</style>