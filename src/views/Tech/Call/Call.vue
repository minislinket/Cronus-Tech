<template>
    <div class="call-wrap">

        <div class="loading-lightbox-wrap" v-if="loading">
            <font-awesome-icon class="loading-lightbox-icon" :icon="['fa','circle-notch']" size="lg" spin />
        </div>
        
        <div class="call-info-wrap">

            <div class="link-jc-no-order-num-wrap">
                <div class="link-job-card-wrap" v-if="call.techStateId >= 4 && call.techStateId != 7">
                    <button :class="{ 'no-jc' : call.jobCards.length <= 0, 'linked' : call.jobCards.length >= 1 }" @click="openLinkJobCard()"><font-awesome-icon class="link-job-card-icon" :icon="['fa','link']" size="lg" /> </button>
                    <span>Link Job Card</span>
                </div>
                <p @click="openLinkOrderNumber()" v-if="!call.orderNumber && call.techStateId > 3 && call.techStateId < 7"><font-awesome-icon :icon="['fa','exclamation-triangle']" size="lg" /> Order Number</p>
            </div>

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

            
            <div class="call-info-wrapper last">
                <div class="call-info-grid">

                    <h4>Opened On</h4>
                    <p>{{ call.openTime }}</p>

                    <h4>Operator</h4>
                    <p>{{ call.operatorName }}</p>

                    <h4>Managing Branch</h4>
                    <p>{{ returnManagingBranch(call.managingBranchId) }}</p>
                    
                    <h4 v-if="call.siteReady">Site Ready Date</h4>
                    <p v-if="call.siteReady">{{ call.siteReadyDate }}</p>

                    <h4>Caller Name</h4>
                    <p>{{ call.callerName }}</p>

                    <h4>Caller Phone</h4>
                    <p>{{ call.contactNumber }}</p>

                    <h4>Job Type</h4>
                    <p>{{ returnCallType(call.callTypeId) }}</p>

                    <h4>Job Sub Type</h4>
                    <p>{{ returnCallSubType(call.callSubTypeId) }}</p>

                    <h4>Order Number</h4>
                    <p>{{ call.orderNumber }}</p>

                </div>
            </div>

            <div class="current-tech-state-wrap" :class="{ pending : call.techStateId === 1, received : call.techStateId === 2, 'en-route' : call.techStateId === 3, 'on-site' : call.techStateId === 4, 'left-site' : call.techStateId === 5, 'on-hold' : call.techStateId === 6, 'rerouted' : call.techStateId == 7 }">
                <p class="call-info-store" :class="{ 'small-text' : call.customerStoreName && call.customerStoreName.length >= 18 }">{{ call.customerStoreName }} <span v-if="call.customerStoreName">({{ call.customerStoreBranchCode }})</span></p>
                <div class="job-status-wrap">
                    <h6 class="current-job-status-heading-text">Job Status</h6>
                    <div class="job-icon-wrap">
                        

                        <!-- Pending -->
                        <div class="call-current-tech-state pending" :class="{ 'inactive'  : call.techStateId !== 1 }">
                            <span style="padding-top: 2px;" class="material-symbols-outlined call-current-tech-state-icon material" >pending_actions</span>
                        </div>
                        <span class="material-symbols-outlined material-arrow-right">chevron_right</span>

                        <!-- Received -->
                        <div class="call-current-tech-state received" :class="{ 'inactive'  : call.techStateId !== 2 }">
                            <font-awesome-icon class="call-current-tech-state-icon" :icon="['fa', 'user-check']" size="lg" />
                        </div>
                        <span class="material-symbols-outlined material-arrow-right">chevron_right</span>


                        <!-- En-Route / Rerouted -->
                        <div class="call-current-tech-state" :class="{ 'inactive'  : call.techStateId !== 3 && call.techStateId !== 7, 'en-route' : call.techStateId == 3, 'rerouted' : call.techStateId == 7 }">
                            <span class="material-symbols-outlined call-current-tech-state-icon material rerouted" >alt_route</span>
                            <font-awesome-icon class="call-current-tech-state-icon en-route" :icon="['fa', 'route']" size="lg" />
                        </div>
                        <span class="material-symbols-outlined material-arrow-right">chevron_right</span>

                        <!-- On-Site / Left-Site -->
                        <div class="call-current-tech-state" :class="{ 'inactive'  : call.techStateId !== 4 && call.techStateId !== 5, 'on-site' : call.techStateId == 4, 'left-site' : call.techStateId == 5 }">
                            <font-awesome-icon class="call-current-tech-state-icon floating left-site" :icon="['fa', 'road']" size="lg" />
                            <font-awesome-icon class="call-current-tech-state-icon on-site" :icon="['fa', 'map-marker-alt']" size="lg" />
                        </div>

                        <!-- On-Hold / Completed -->
                        <div class="call-current-tech-state completed" :class="{ 'inactive'  : call.techStateId !== 8 && call.techStateId !== 6, 'on-hold' : call.techStateId == 6, 'completed' : call.techStateId == 8 }">
                            <font-awesome-icon class="call-current-tech-state-icon floating on-hold" :icon="['fa', 'pause-circle']" size="lg" />
                            <font-awesome-icon class="call-current-tech-state-icon completed" :icon="['fa', 'clipboard-check']" size="lg" />
                        </div>
                    </div>
                </div>
            </div>
            

        </div>

    
        <CommentModal @submitComment="submitComment($event)" />
        <LinkJobCardModal @linkJobCards="linkJobCards($event)" />
        <LinkOrderNumberModal @linkOrderNumber="linkOrderNumber($event)" />
        
        <div class="call-button-wrap" :class="{ 'lower-margin' : call.callTypeId === 1 && call.techStateId === 4 }">
            <button :disabled="!canUpdateStatus" v-if="call.techStateId === 1" @click="canUpdateCall(2)" class="update-call-btn received"><font-awesome-icon class="update-call-icon accept" :icon="['fa', 'user-check']" size="lg" :class="{ disabled : !canUpdateStatus }" /> Accept Call</button>
            <button :disabled="!canUpdateStatus" v-if="call.techStateId === 2 || call.techStateId >= 5 && call.techStateId <= 7" @click="canUpdateCall(3)" class="update-call-btn en-route"><font-awesome-icon class="update-call-icon en-route" :icon="['fa', 'route']" size="lg" :class="{ disabled : !canUpdateStatus }" /> En Route</button>
            <button :disabled="!canUpdateStatus" v-if="call.techStateId === 3" @click="canUpdateCall(4)" class="update-call-btn on-site"><font-awesome-icon class="update-call-icon on-site" :icon="['fa', 'map-marker-alt']" size="lg" :class="{ disabled : !canUpdateStatus }" /> On Site</button>
            <button :disabled="!canUpdateStatus" v-if="call.techStateId === 4" @click="openCommentsModal(6, call)" class="update-call-btn on-hold"><font-awesome-icon class="update-call-icon on-hold" :icon="['fa', 'pause-circle']" size="lg" :class="{ disabled : !canUpdateStatus }" /> On Hold</button>
            <button :disabled="!call.jobCards || call.jobCards && call.jobCards.length <= 0" v-if="call.techStateId === 4 && call.callTypeId === 1" @click="canUpdateCall(5)" class="update-call-btn left-site"><font-awesome-icon class="update-call-icon left-site" :icon="['fa', 'road']" size="lg" :class="{ disabled : !call.jobCards || call.jobCards && call.jobCards.length <= 0 }" /> Left Site</button>
            <button :disabled="!call.jobCards || call.jobCards && call.jobCards.length <= 0 || !call.orderNumber" v-if="call.techStateId === 4 || call.techStateId === 6 || call.techStateId === 5" @click="canUpdateCall(8)" class="update-call-btn completed"><font-awesome-icon class="update-call-icon completed" :icon="['fa', 'clipboard-check']" size="lg" :class="{ disabled : !call.jobCards || call.jobCards && call.jobCards.length <= 0 || !call.orderNumber }" /> Complete</button>
        </div>
    </div>
</template>



<script>

import CommentModal from './CommentModal.vue';
import LinkJobCardModal from './LinkJobCardModal.vue';
import LinkOrderNumberModal from './LinkOrderNumberModal.vue';

import { mapGetters } from 'vuex'

export default {


    components: {
         CommentModal, LinkJobCardModal, LinkOrderNumberModal
    },



    data() {
        return {
            call_types: JSON.parse(localStorage.getItem('call_types')),
            call_sub_types: JSON.parse(localStorage.getItem('call_sub_types')),
            branches: JSON.parse(localStorage.getItem('branches')),
            serviceWorker: null,
            user: JSON.parse(localStorage.getItem('user')),
            canUpdateStatus: true
        }
    },




    computed: {
        ...mapGetters({
            call: ['Call/call'],
            loading: ['Call/loading'],
            activeCalls: ['Calls/activeCalls'],
            allCalls: ['Calls/allCalls'],
            modal: ['Modal/modal'],
            online: ['StaticResources/online'],
            commentNextStatusId: ['Call/commentNextStatusId']
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
                if(this.call && this.call.techStateId === 8)
                {
                    this.$router.push('/calls');
                }
            },
            deep: true,
            immediate: true
        },





        allCalls: {
            handler: function() {
                if(this.call)
                    this.$store.dispatch('Call/loadCall', this.call.id);
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

                    // console.log('Call placed on hold: ', holdCall);


                    var nextStatusId = this.call.techStateId === 6 ? 3 : this.call.techStateId + 1;  
                    this.updateCall(nextStatusId, this.call);
                    // this.checkForSameStoreCalls(nextStatusId, this.call);
                    // console.log('Call updated: ', this.call);
                    
                }
                
            },
            deep: true
        }
    },

    






    mounted() {
        this.$route.params.callId ? this.$store.dispatch('Call/loadCall', this.$route.params.callId) : null;
    },





    methods: {





        openLinkJobCard: function() {
            this.$store.dispatch('Call/linkJobCardModal', true);
        },





        openLinkOrderNumber: function() {
            this.$store.dispatch('Call/linkOrderNumberModal', true);
        },


        


        linkOrderNumber: async function(orderNumber) {

            var user = JSON.parse(localStorage.getItem('user'));
            var signature = JSON.parse(localStorage.getItem('signature'));

            this.call.orderNumber = orderNumber;

            var data =
            {
                call: this.call,
                orderNumber,
                signature,
                user
            }

            await this.sendToServiceWorker(data, 'linkOrderNumber');

            // Update the call on the users device
            this.$store.dispatch('Call/linkOrderNumber', orderNumber);

        },







        addCallComment: async function(comment) {

            console.log('Call comment: ', comment);
            var user = JSON.parse(localStorage.getItem('user'));
            var signature = JSON.parse(localStorage.getItem('signature'));

            var commentData = {
                "employeeCode": user.employeeCode,
                "customerCallId": this.commentingOnCall.id,
                "comment": comment,
                "resolved": false
            }

            var data =
            {
                call: this.commentingOnCall,
                comment: commentData,
                signature,
                user
            }

            console.log(data);
            

            await this.sendToServiceWorker(data, 'addCallComment');
            var nextStatusId = JSON.parse(JSON.stringify(this.commentNextStatusId));
            var call = JSON.parse(JSON.stringify(this.commentingOnCall));

            // Update the call on the users device
            this.updateCall(nextStatusId, call);
            this.$store.dispatch('Call/commentNextStatusId', '');
            this.$store.dispatch('Call/commentingOnCall', '');
            
        },






        linkJobCards: async function(jobCardArray) {

            // console.log('Please link these JC\'s: ', jobCardArray);
            var user = JSON.parse(localStorage.getItem('user'));
            var signature = JSON.parse(localStorage.getItem('signature'));

            var data =
            {
                call: this.call,
                jobCards: jobCardArray,
                signature,
                user
            }

            await this.sendToServiceWorker(data, 'linkJobCard');

            // Update the call on the users device
            this.$store.dispatch('Call/linkJobCards', jobCardArray);

        },









        updateCall: async function(nextStatusId, call) {

            var user = JSON.parse(localStorage.getItem('user'));
            var signature = JSON.parse(localStorage.getItem('signature'));

            // Build the time_stamp
            var now = new Date();
            var date = now.getFullYear().toString() +'-'+ (now.getMonth() + 1).toString() +'-'+ now.getDate().toString();
            var time = (now.getHours() <= 9 ? '0' + now.getHours().toString() : now.getHours().toString()) +':'+ (now.getMinutes() <= 9 ? '0' + now.getMinutes().toString() : now.getMinutes().toString()) +':'+ (now.getSeconds() <= 9 ? '0' + now.getSeconds().toString() : now.getSeconds().toString()) +'.'+ now.getMilliseconds().toString() +'+02';
            var time_stamp = date + ' ' + time;
            // console.log('Build a time_stamp: ', time_stamp);

            // Data to be sent
            var data = {call: call, nextStatusId, user, signature, time_stamp };

            await this.sendToServiceWorker(data, 'updateCall');

            // Update the call on the users device
            var payload = { nextStatusId, call }
            this.$store.dispatch('Call/updateCall', payload);

        },






        sendToServiceWorker: async function(data, type) {

            if('serviceWorker' in navigator)
            {
                return navigator.serviceWorker.getRegistration()
                .then(async reg => {

                    // Post the data to the SW
                    data = JSON.stringify(data);
                    reg.active.postMessage({type, data});
                })
                .catch(err => {
                    console.log(err);
                    this.$store.dispatch('ErrorLog/logError', err);
                })
            }
            else
            {
                // No SW found, log error
                var err = {
                    user,
                    data: 'No SW found when updating call ' + call.id
                }
                console.log('SW not in navigator...')

                this.$store.dispatch('ErrorLog/logError', err);
            }
        },





        openCommentsModal: function(nextStatusId, call) {
            this.$store.dispatch('Call/commentingOnCall', call);
            this.$store.dispatch('Call/commentNextStatusId', nextStatusId);
            this.$store.dispatch('Call/commentModal', true);
        },





        submitComment: function(data) {
            var reason = data.reason;
            var stockList = data.stockList;

            // console.log('Tech says: ', reason || stockList);

            var comment = '';

            if(!reason)
            {
                if(stockList && stockList.length >= 1)
                {
                    comment = 'Stock Required:<br>'
                    stockList.map((item, index) => {
                        comment += 
                        item.description + ' ('+ item.code +') Qty: ' + item.quantity + (index === stockList.length - 1 ? '' : '<br>');
                    })
                }
                else
                {
                    comment = '';
                }
                
            }
            else
            {
                comment = reason.toString();
            }

            // console.log('Comment is: ', comment);

            this.addCallComment(comment);
        },








        canUpdateCall: function(nextStatusId) {


            if(nextStatusId <= 2)
            {
                this.updateCall(nextStatusId, this.call);
                return
            }            


            this.updateCall(nextStatusId, this.call);

            this.activeCalls.map(call => {

                if(call.id !== this.call.id && call.customerStoreId !== this.call.customerStoreId)
                {

                    // Rerouted (activated while "En-Route" (3))
                    // auto-activated status (no prompt)
                    if(call.techStateId == 3)
                    {
                        this.openCommentsModal(7, call);
                    }

                    // Left-Site (activated while "On-Site" (4))
                    // auto-activated status (no prompt)
                    if(call.techStateId == 4)
                    {
                        this.openCommentsModal(5, call);
                    }

                }
            })

        },







        checkForSameStoreCalls: function(nextStatusId, currentCall) {
            this.activeCalls.map(call => {
                if(call.id !== currentCall.id && call.customerStoreId === currentCall.customerStoreId)
                {
                    nextStatusId !== call.techStateId ? this.updateCall(nextStatusId, call) : null;
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




        returnManagingBranch: function(branchId) {
            var branch = this.branches.filter(branch => branch.id === branchId)[0];
            var branchName = '';
            branch ? branchName = branch.name : null;
            return branchName; 
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

.call-button-wrap.lower-margin button {
    margin: 0 5px;
}



.call-button-wrap.lower-margin .update-call-btn {
    font-size: 14px;
    flex-wrap: wrap;
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

.update-call-btn.on-site {
    color: var(--OnSiteLight);
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

.update-call-btn.completed {
    color: var(--CompletedLight);
}

.update-call-icon.completed {
    color: var(--CompletedLight);
}

.update-call-icon.on-hold.disabled,
.update-call-icon.left-site.disabled,
.update-call-icon.on-site.disabled,
.update-call-icon.en-route.disabled,
.update-call-icon.received.disabled,
.update-call-icon.pending.disabled,
.update-call-icon.completed.disabled 
{
    color: var(--TextOnLightGrey);
}

.update-call-btn:disabled {
    color: var(--TextOnLightGrey);
}







.call-info-wrap {
    text-align: left;
    position: relative;
    padding: 0 15px;
    padding-top: 80px;
    
}





.call-info-wrapper {
    padding: 10px 7px;
    border: 2px solid var(--BlockBorder);
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


.call-info-wrapper.last {
    margin-bottom: 50px;
}






.call-current-tech-state {
    display: flex;
    align-items: center;
    text-align: right;
    font-size: 14px;
    width: max-content;
    position: relative;
}


.call-current-tech-state.inactive {
    color: var(--TransparentGrey);
}


.current-tech-state-wrap.pending .call-current-tech-state.inactive,
.current-tech-state-wrap.received .call-current-tech-state.inactive,
.current-tech-state-wrap.rerouted .call-current-tech-state.inactive
{
    color: var(--TransparentBlack);
}





.call-current-tech-state.en-route {
    /* background: var(--); */
}




.call-current-tech-state.completed {
    margin-left: 13px;
}







.current-tech-state-wrap.en-route .call-current-tech-state.en-route .call-current-tech-state-icon.rerouted {
    color: var(--TransparentGrey);
}

.current-tech-state-wrap.rerouted .call-current-tech-state.rerouted .call-current-tech-state-icon.en-route {
    color: var(--TransparentBlack);
}




.current-tech-state-wrap.on-site .call-current-tech-state.on-site .call-current-tech-state-icon.left-site {
    color: var(--TransparentGrey);
}

.current-tech-state-wrap.left-site .call-current-tech-state.left-site .call-current-tech-state-icon.on-site {
    color: var(--TransparentGrey);
}




.current-tech-state-wrap.on-hold .call-current-tech-state.on-hold .call-current-tech-state-icon.completed {
    color: var(--TransparentGrey);
}

.current-tech-state-wrap.completed .call-current-tech-state.completed .call-current-tech-state-icon.on-hold {
    color: var(--TransparentGrey);
}







.job-status-wrap {

}



.job-icon-wrap {
    display: flex;
    align-items: center;
    font-size: 12px;
    transition: color 800ms ease-out;
    margin-top: 8px;
}



.call-current-tech-state-icon,
.call-current-tech-state-icon.material {
    /* margin-right: 4px; */
}

.call-current-tech-state-icon.material {
    font-size: 21px;
}


.call-current-tech-state-icon.material.rerouted {
    position: absolute;
    top: -26px;
}


.call-current-tech-state-icon.floating {
    position: absolute;
    top: -25px;
    font-size: 22px;
    margin-left: -3px;
    height: 100%;
}








.current-job-status-heading-text {
    color: white; 
    font-size: 10px; 
    margin-bottom: 3px;
    text-align: left;
}



.current-tech-state-wrap .call-info-store {
    font-weight: 700;
    font-size: 20px;
    padding-right: 30px;
    padding-left: 5px;
    color: white;
}


.current-tech-state-wrap .call-info-store.small-text {
    font-size: 13px;
}



.current-tech-state-wrap p {
    margin-bottom: 0;
}

.current-tech-state-wrap {
    position: fixed;
    top: 50px;
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
    transition: background 300ms ease-in;
}


.current-tech-state-wrap.pending {
    background: var(--Pending);
    color: var(--PendingDark);
}

.current-tech-state-wrap.received {
    background: var(--Received);
    color: var(--ReceivedDark);
}

.current-tech-state-wrap.rerouted {
    background: var(--Rerouted);
    color: var(--ReroutedDark);
}

.current-tech-state-wrap.en-route {
    background: var(--EnRouteDark);
    color: var(--EnRouteLight);
}

.current-tech-state-wrap.on-site {
    background: var(--OnSiteDark);
    color: var(--OnSiteLight);
}

.current-tech-state-wrap.left-site {
    background: var(--LeftSiteDark);
    color: var(--LeftSite);
}

.current-tech-state-wrap.on-hold {
    background: var(--OnHoldDark);
    color: var(--OnHold);
}

.current-tech-state-wrap.completed {
    background: var(--CompletedDark);
    color: var(--Completed);
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
}




.material-arrow-right {
    font-size: 10px;
    color: rgba(255,255,255,0.5);
    margin: 0 2px;
}









.link-jc-no-order-num-wrap {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 10px;
}

.link-jc-no-order-num-wrap p {
    color: var(--WarningOrange);
    font-size: 12px;
    font-weight: 700;
}



.link-job-card-wrap {
    
}



.link-job-card-wrap button {
    padding: 5px 4px;
    margin-right: 10px;
    color: var(--TextBlack);
}

.link-job-card-wrap button.no-jc {
    background: var(--WarningOrange);
}

.link-job-card-wrap button.linked {
    background: var(--ReceivedLight);
}


.link-job-card-icon {

}


</style>