<template>
    <div class="tech-list-modal-wrap" v-if="active">


        <h3>Transfer Tech <span class="small-text">(tap on a tech to select them, then tap on "Transfer Tech(s)" to select a new technician)</span></h3>

        
        <div class="tech-list-technician-wrap" v-for="tech in techList" :key="tech.id" @click="updateTransferTechs(tech)">
            <div class="tech-list-grid">
                <p>Tech:</p>
                <span class="bold tech-name">{{ getTechName(tech.technicianEmployeeCode) }} <span class="small-text">({{ tech.technicianEmployeeCode }})</span></span>
                <p>Status: </p>
                <div class="tech-list-tech-status-wrap" 
                :class="{ 
                    'pending' : tech.technicianCallStatusId === 1,
                    'received' : tech.technicianCallStatusId === 2,
                    'en-route' : tech.technicianCallStatusId === 3,
                    'on-site' : tech.technicianCallStatusId === 4,
                    'returning' : tech.technicianCallStatusId === 5,
                    'on-hold' : tech.technicianCallStatusId === 6,
                    'completed' : tech.technicianCallStatusId === 8,
                    'rerouted' : tech.technicianCallStatusId === 7,
                    'transferred' : tech.technicianCallStatusId === 9
                }
                ">
                    <span v-if="tech.technicianCallStatusId === 1" class="material-symbols-outlined tl-tech-state-icon pending material" >pending_actions</span>
                    <font-awesome-icon v-if="tech.technicianCallStatusId === 2" class="tl-tech-state-icon received" :icon="['fa', 'user-check']" size="lg" />
                    <font-awesome-icon v-if="tech.technicianCallStatusId === 3" class="tl-tech-state-icon en-route" :icon="['fa', 'route']" size="lg" />
                    <span v-if="tech.technicianCallStatusId === 7" class="material-symbols-outlined tl-tech-state-icon rerouted material" >alt_route</span>
                    <font-awesome-icon v-if="tech.technicianCallStatusId === 4" class="tl-tech-state-icon on-site" :icon="['fa', 'map-marker-alt']" size="lg" />
                    <font-awesome-icon v-if="tech.technicianCallStatusId === 5" class="tl-tech-state-icon returning" style="transform: scaleX(-1);" :icon="['fa', 'clock-rotate-left']" size="lg" />
                    <font-awesome-icon v-if="tech.technicianCallStatusId === 6" class="tl-tech-state-icon on-hold" :icon="['fa', 'pause-circle']" size="lg" />
                    <font-awesome-icon v-if="tech.technicianCallStatusId === 8" class="tl-tech-state-icon completed" :icon="['fa', 'clipboard-check']" size="lg" />
                    <font-awesome-icon v-if="tech.technicianCallStatusId === 9" class="rc-tech-state-icon transferred" :icon="['fa', 'shuffle']" size="lg" />
                    <span class="bold">{{ getTechState(tech.technicianCallStatusId) }}</span>
                </div>
                
            </div>
            <input v-if="tech.technicianCallStatusId != 9" type="checkbox" class="transfer-technician-checkbox" :checked="techInTransferList(tech)">
        </div>
        
        <div class="transfer-techs-btn-wrap">
            <button class="transfer-techs-btn" :disabled="transferTechs.length <= 0" :class="{ disabled : transferTechs.length >= 1 }" @click="chooseNewTech()">Transfer Tech(s)</button>
            <button class="close-transfer-tech-modal-btn" @click="$store.dispatch('AllocateTech/transferTechActive', false)">Close</button>
        </div>

    </div>
</template>




<script>
import { mapGetters } from 'vuex'
export default {

    data() {
        return {
            tech_states: JSON.parse(localStorage.getItem('call_tech_states')),
            employees: JSON.parse(localStorage.getItem('employees')),
            transferTechs: [],
        }
    },




    computed: {
        ...mapGetters({
            techList: ['AllocateTech/techList'],
            stateTransferTechs: ['AllocateTech/transferTechs'],
            active: ['AllocateTech/transferTechActive'],
            modal: ['Modal/modal'],
            call: ['AllocateTech/call']
        })
    },




    watch: {

        modal: {
            handler: function() {
                if(this.modal.confirmAction === true && this.modal.actionFrom === 'Remove_Tech')
                    this.$store.dispatch('AllocateTech/removeTech', this.modal.actionData);
            },
            deep: true
        },


        stateTransferTechs: {
            handler: function() {
                if(this.stateTransferTechs.length <= 0)
                {
                    this.transferTechs = [];
                }
            },
            deep: true
        },


        // techList: {
        //     handler: function() {
        //         if(this.techList.length <= 0)
        //         {
        //             this.$store.dispatch('AllocateTech/techListActive', false);
        //         }
        //     },
        //     deep: true
        // }
        
    },




    mounted() {

    },





    methods: {

        techInTransferList: function(tech) {
            return this.transferTechs.includes(tech);
        },

        updateTransferTechs: function(tech) {
            if(this.transferTechs.includes(tech))
                this.transferTechs = this.transferTechs.filter(t => t !== tech);
            else
                tech.technicianCallStatusId != 9 ? this.transferTechs.push(tech) : null;

            console.log('Transfer Techs: ', this.transferTechs);
            this.$store.dispatch('AllocateTech/transferTechs', this.transferTechs);
        },


        chooseNewTech: function() {
            if(this.transferTechs <= 0) { return }
            console.log('Transfer Techs: ', this.transferTechs);
            this.$store.dispatch('AllocateTech/chooseTransferTechActive', true);

            // this.$store.dispatch('AllocateTech/transferTechs', { tech: this.transferToTech, techs: this.transferTechs });
        },





        removeTech: function(employeeCode) {
            console.log('Need to remove: ', employeeCode);
            var modal = {
                active: true, // true to show modal
                type: 'warning', // ['info', 'warning', 'error', 'okay']
                icon: ['fa', 'user-minus'], // Leave blank for no icon
                heading: 'Remove Technician',
                body:   '<p>You are about to remove </p><p class="bold">'+ this.getTechName(employeeCode) + '</p><p> from Call </p><p class="bold">' + this.call.id +'.</p><br>'
                        +'<p>Would you like to continue?</p>',

                // Optional add on for when user needs to confirm or deny an action
                confirmAction: 'init',
                actionFrom: 'Remove_Tech',
                actionData: employeeCode,
                resolveText: 'Yes',
                rejectText: 'No'
            }
            this.$store.dispatch('Modal/modal', modal);
        },  






        getTechName: function(employeeCode) {
            return this.employees.filter(emp => emp.employeeCode === employeeCode)[0].displayName;
        },


        getTechState: function(techStateId) {
            return this.tech_states.filter(state => state.id === techStateId)[0].name;
        }

    }

}
</script>

<style>

.tech-list-modal-wrap {
    position: fixed;
    height: max-content;
    max-height: 75vh;
    width: 95vw;
    top: 0;
    bottom: 0;
    left: 0;
    right: 0;
    margin: auto;
    border: 2px solid var(--BlockBorder);
    border-radius: 3px;

    padding: 10px;
    padding-bottom: 55px;
    background: var(--GunMetal);
    overflow-y: scroll;
    z-index: 500;
}




.tech-list-modal-wrap h3 {
    margin-bottom: 20px;
    color: var(--BlueMid);
    display: flex;
    flex-direction: column;
}





.tech-list-grid {
    display: grid;
    grid-template-columns: 1.2fr 3fr;
    text-align: left;
    max-width: 90%;
    position: relative;
}


.tech-list-grid .tech-name {
    margin-bottom: 5px;
}


.tech-list-technician-wrap {
    border: 1px solid var(--OffWhite);
    margin-bottom: 15px;
    padding: 5px;
    width: 100%;
    display: flex;
    align-items: center;
    
}


.transfer-technician-checkbox {
    position: absolute;
    right: 20px;
    width: 18px;
    height: 18px;
}






.tech-list-tech-status-wrap {
    display: flex;
    align-items: center;
}

.tech-list-tech-status-wrap.pending {
    color: var(--Pending);
}

.tech-list-tech-status-wrap.received {
    color: var(--ReceivedLight);
}

.tech-list-tech-status-wrap.en-route {
    color: var(--EnRouteLight);
}

.tech-list-tech-status-wrap.on-site {
    color: var(--OnSiteLight);
}

.tech-list-tech-status-wrap.returning {
    color: var(--ReturningLight);
}

.tech-list-tech-status-wrap.on-hold {
    color: var(--OnHoldLight);
}




.tl-tech-state-icon {
    margin-right: 5px;
    font-size: 14px;
}

.tl-tech-state-icon.pending {
    font-size: 16px;
}




.transfer-techs-btn-wrap {
    display: flex;
    justify-content: space-evenly;
    
    position: absolute;
    bottom: 15px;
	left: 0;
	right: 0;
	margin: 0 auto;
    width: 100%;
}


.transfer-techs-btn {
    color: var(--OkayGreen);
}

.close-transfer-tech-modal-btn {
    color: var(--WarningOrange);
}

</style>