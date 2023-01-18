<template>
    <div class="allocate-tech-wrap">

        <div class="loading-lightbox-wrap" v-if="loading || loadingStoreCalls && !showingCall">
            <font-awesome-icon class="loading-lightbox-icon" :icon="['fa','circle-notch']" size="lg" spin />
        </div>

        <div id="SelectSearchCall" class="select-search-call">
            <SearchSelect :searchArray="customerStores" :heading="storeSearch.heading" :displayText="storeSearch.displayText" @select="selectStore($event)" @backspace="resetStore()"/>

            <div class="input-heading-wrap">
                <h4>Load Call by ID</h4>
                <div class="load-call-input-wrap">
                    <input type="tel" placeholder="enter call id..." v-model="callId" @input="checkKeyInput($event)" @keypress.enter="loadCallById($event)">
                    <button @click="loadCallById()" class="material-btn load-call-btn"><span class="material-symbols-outlined">call</span>Load</button>
                </div>
            </div>
        </div>

        
        
        <AllocateTechCallInfo id="InfoBox" v-if="showCall"/>
        <StoreCallsList v-else @showingCall="$store.dispatch('AllocateTech/showCall', true)" />
        


        <div class="allocate-tech-btn-wrap" v-if="showCall">
            <button class="assign-tech-btn" @click="openAssignTechModal()"><font-awesome-icon class="allocate-tech-btn-icon assign-tech" :icon="['fa','user-plus']" size="lg" /> Add Tech</button>
            <button class="view-tech-list-btn" @click="loadTechList()"><font-awesome-icon class="allocate-tech-btn-icon tech-list" :icon="['fa','clipboard-list']" size="lg" /> Techs</button>
            <button class="view-store-calls-btn" @click="$store.dispatch('AllocateTech/showCall', false)"><font-awesome-icon class="allocate-tech-btn-icon store-calls" :icon="['fa','store-alt']" size="lg" /> Calls</button>
            <button class="show-call-events-btn" @click="$store.dispatch('AllocateTech/viewCallEventsModal', true)"><font-awesome-icon class="allocate-tech-btn-icon call-events" :icon="['fa','list']" size="lg" /> Events</button>
            <button class="edit-call-types-btn" :disabled="call.callStatusId === 3 || call.callStatusId === 4" @click="$store.dispatch('AllocateTech/editCallTypesModal', true)"><font-awesome-icon class="allocate-tech-btn-icon edit-call-types" :icon="['fa','edit']" size="lg" /> Edit Call Types</button>
            <button class="add-call-details-btn" :disabled="call.callStatusId === 3" @click="$store.dispatch('AllocateTech/addCallDetailsModalActive', true)"><span class="material-symbols-outlined allocate-tech-btn-icon material add-call-details">note_add</span> Add Details</button>
            <button class="cancel-call-btn" :disabled="call.callStatusId === 3 || call.callStatusId === 4" @click="confirmCancelCall()"><font-awesome-icon class="allocate-tech-btn-icon cancel-call" :icon="['fa','phone-slash']" size="lg" /> Cancel</button>
            
        </div>

        

        <TechListModal />
        <AssignTechModal />
        <AddCallDetails />
        <CallEvents />
        <EditCallTypes />
       
    </div>
</template>



<script>
const LZString = require('lz-string')
import { mapGetters } from 'vuex';

import SearchSelect from '../../../components/SearchSelect/SearchSelect.vue';
import AllocateTechCallInfo from './AllocateTechCallInfo.vue'
import StoreCallsList from './StoreCallsList.vue';
import TechListModal from './TechListModal.vue';
import AssignTechModal from './AssignTechModal.vue';
import CallEvents from './CallEvents.vue';
import AddCallDetails from './AddCallDetails.vue';
import EditCallTypes from './EditCallTypes.vue';

export default {

    components: {
        SearchSelect,
        AllocateTechCallInfo,
        StoreCallsList,
        TechListModal,
        AssignTechModal,
        CallEvents,
        AddCallDetails,
        EditCallTypes
    },


    data() {
        return {

            searchResults: [],

            customerStores: [],

            storeSearch: {
                heading: 'Search by Store',
                displayText: '',
                placeHolder: ''
            },


            callId: '',

            viewPortHeight: 0,
            storeSearchHeight: 0,
            availableBoxHeight: 0
        }
    },





    computed: {
        ...mapGetters({
            showCall: ['AllocateTech/showCall'],
            call: ['AllocateTech/call'],
            loading: ['AllocateTech/loading'],
            loadingStoreCalls: ['AllocateTech/loadingCustomerStoreCalls'],
            customerStoreCalls: ['AllocateTech/customerStoreCalls'],
            selectedStore: ['AllocateTech/customerStore'],
            modal: ['Modal/modal']
        })
    },




    watch: {
        call: {
            handler: function() {
                
                if(this.call !== '')
                {
                    this.callId = this.call.id
                    // this.storeSearch.displayText = this.call.customerStore.name + ' (' + this.call.customerStore.branchCode + ')';
                    this.$store.dispatch('AllocateTech/showCall', true);
                }

            },
            deep: true,
            immediate: true
        },



        customerStores: function() {
            if(this.customerStores.length <= 0)
            {
                setTimeout(() => {
                    this.customerStores = JSON.parse(LZString.decompress(localStorage.getItem('customer_stores')));
                }, 250);
            }
        },



        customerStoreCalls: {
            handler: function() {
                this.setInfoBoxHeight();
            },
            deep: true,
        },


        showCall: {
            handler: function() {
                this.setInfoBoxHeight();
            },
            deep: true,
        },


        selectedStore: {
            handler: function() {
                console.log('Setting display text: ', this.selectedStore.name);
                this.storeSearch.displayText = this.selectedStore && this.selectedStore.name ? this.selectedStore.name + ' ('+this.selectedStore.branchCode+')' : '';
            },
            deep: true,
            immediate: true
        },



        modal: {
            handler: function() {
                if(this.modal.confirmAction === true && this.modal.actionFrom.indexOf('cancelCall_'+this.call.id) !== -1)
                {
                    this.$store.dispatch('AllocateTech/cancelCall');
                }
                
            },
            deep: true,
        }
    },




    mounted() {

        this.setInfoBoxHeight();

        if(this.customerStores.length <= 0)
        {
            setTimeout(() => {
                this.customerStores = JSON.parse(LZString.decompress(localStorage.getItem('customer_stores')));
            }, 250);   

            
        }

    },







    methods: {





        confirmCancelCall: function() {

            var modal = {
                active: true, // true to show modal
                type: 'warning', // ['info', 'warning', 'error', 'okay']
                icon: ['fa', 'exclamation-triangle'], // Leave blank for no icon
                heading: 'Cancel Call?',
                body: '<p>This will cancel Call '+ this.call.id +'.</p><p>Do you want to continue?</p>',
                confirmAction: 'init',
                actionFrom: 'cancelCall_'+this.call.id,
                resolveText: 'Yes',
                rejectText: 'No'
            }

            this.$store.dispatch('Modal/modal', modal);

        },






        setInfoBoxHeight: function() {
            
            setTimeout(() => {
                var infoBox = document.getElementById('InfoBox');
                // console.log('Got the element: ', infoBox);
                if(infoBox)
                {
                    var viewPortHeight = window.innerHeight;
                    // console.log('Viewport height is: ', viewPortHeight);
                    infoBox.style.height = (viewPortHeight - 365) + 'px';
                    // console.log('Set infoBox height to: ', infoBox.style.height);
                }
            }, 70);
        },





        loadTechList: function() {
            this.$store.dispatch('AllocateTech/techListActive', true);
        },



        openAssignTechModal: function() {
            this.$store.dispatch('AllocateTech/assignTechActive', true);
        },




        selectStore: function(store) {

            if(!store) { 
                this.storeSearch.displayText = '';
                this.$store.dispatch('AllocateTech/resetCall');
                return 
            }

            if(store.bubbles) { return }

            this.$store.dispatch('AllocateTech/loadStoreCalls', store);
            this.storeSearch.displayText = store.name + ' (' + store.branchCode + ')';
            this.$store.dispatch('AllocateTech/showCall', false);
        },


        resetStore: function() {
            this.storeSearch.displayText = this.storeSearch.displayText.includes('(') ? this.storeSearch.displayText.split('(')[0].trim() : this.storeSearch.displayText;
            this.callId = '';
            this.$store.dispatch('AllocateTech/resetCall');
        },




        loadCallById: function(e) {
            if(e && e.target)
            {
                e.target.blur();
            }
            this.call.id !== this.callId ? this.$store.dispatch('AllocateTech/loadCallById', this.callId) : this.$store.dispatch('AllocateTech/showCall', true);
        },




        checkKeyInput: function(event) {
            if(event && event.inputType === 'deleteContentBackward')
            {
                this.storeSearch.displayText = '';
                this.$store.dispatch('AllocateTech/resetCall');
            }
        },



        



    }

}
</script>



<style>


.allocate-tech-wrap {
    padding-top: 10px;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
}




.select-search-call {
    margin-bottom: 15px;
}




.input-heading-wrap {
    text-align: left;
}


.load-call-input-wrap {
    display: flex;
    align-items: center;
}





.load-call-btn {
    padding: 6px 12px;
    margin-left: 10px;
}





.allocate-tech-info-box {
    width: 100vw;    
    overflow-y: scroll;
    margin-bottom: 50px;
}









.allocate-tech-btn-wrap {
    display: flex;
    align-items: center;
    justify-content: center;
    flex-wrap: wrap;
    row-gap: 15px;
    width: 100%;
    position: fixed;
    bottom: 82.5px;
    left: 0;
    right: 0;
    margin: 0 auto;
    padding: 0 3px;
}


.allocate-tech-btn-wrap button {
    margin: 0 5px;
    display: flex;
    align-items: center;
    padding: 5px 8px;
    font-size: 13px;
}



/* .assign-tech-btn
.view-tech-list-btn
.view-store-calls-btn
.show-call-events-btn
.add-call-details-btn
.cancel-call-btn */



.allocate-tech-btn-icon {
    margin: 0;
    font-size: 12px;
    margin-right: 5px;
}


.allocate-tech-btn-icon.material {
    font-size: 16px;
}


.allocate-tech-btn-icon.assign-tech {
    color: var(--OkayGreen);
}

.allocate-tech-btn-icon.tech-list {
    font-size: 14px;
    color: var(--BlueAlt);
}

.allocate-tech-btn-icon.store-calls {
    color: var(--EnRoute);
}

.allocate-tech-btn-icon.call-events {
    color: var(--PendingLight);
}

.allocate-tech-btn-icon.add-call-details {
    color: var(--EnRouteDark);
}

.allocate-tech-btn-icon.cancel-call {
    color: var(--WarningRed);
}

.allocate-tech-btn-icon.edit-call-types {
    color: var(--OnHoldLight);
}
</style>