<template>
    <div class="app-modal-lightbox" :class="{ active : active }">
        <div class="assign-tech-modal-wrap" v-if="active">

            <h3>Transfer Call to Tech</h3>
            
            <select v-model="branch">
                <option v-for="branch in branches" :key="branch.id" :value="branch">{{ branch.name }}</option>
            </select>

            

            <select class="assign-tech-tech-selection" v-model="tech" :disabled="!branch">
                <option v-for="tech in branchTechs" :key="tech.id" :value="tech">{{ tech.employeeCode }} - {{ tech.displayName }}</option>
            </select>

            

            <button class="allocate-tech-btn" @click="transferCallToTech()" :disabled="!branch || !tech">Transfer to Tech</button>


            <button class="close-info-modal-btn" @click="$store.dispatch('AllocateTech/chooseTransferTechActive', false)">Close</button>

        </div>
    </div>
</template>



<script>
import { mapGetters } from 'vuex'
export default {

    props: ['transferTechs'],

    data() {
        return {
            branches: JSON.parse(localStorage.getItem('branches')),
            branchTechs: [],
            technicians: JSON.parse(localStorage.getItem('technicians')),


            branch: '',
            tech: ''
        }
    },



    computed: {
        ...mapGetters({
            active: ['AllocateTech/chooseTransferTechActive'],
            call: ['AllocateTech/call'],
            modal: ['Modal/modal'],
        })
    },



    watch: {


        modal: {
            handler: function() {
                if(this.modal.confirmAction === true && this.modal.actionFrom === 'Tech_Transfer_Back_To_Pending')
                    this.$store.dispatch('AllocateTech/techTransferBackToPending', this.modal.actionData);
                    // this.$store.dispatch('AllocateTech/placeTechsOnTransferred', this.modal.actionData);
            },
            deep: true
        },


        active: {
            handler: function() {
                if(this.active)
                {
                    this.branch = '';
                    this.tech = '';
                    this.branchTechs = [];
                }
                if(this.call)
                {
                    this.branch = this.branches.filter(branch => branch.id === this.call.managingBranchId)[0];
                }
            },
            deep: true
        },



        branch: {
            handler: function() {
                if('Selected Branch: ', this.branch)
                {
                    this.branchTechs = this.branches.filter(branch => branch.id === this.branch.id)[0].techs
                }
                else
                {
                    this.branchTechs = [];
                }
            },
            deep: true
        }
    },



    mounted() {
        this.branches.map(branch => {
            branch.techs = this.technicians.filter(tech => tech.branchId === branch.id);
        })
    },



    methods: {

        transferCallToTech: function() {
            this.$store.dispatch('AllocateTech/transferCallToTech', { newTech: this.tech });
        }

    }

}
</script>



<style>


.assign-tech-modal-wrap {
    position: fixed;
    height: max-content;
    max-height: 75vh;
    width: 80vw;
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




.assign-tech-modal-wrap h3 {
    margin-bottom: 20px;
    color: var(--BlueMid);
}



.assign-tech-modal-wrap select {
    margin-bottom: 15px;
}







.allocate-tech-btn {
    margin-bottom : 50px;
}




.assign-tech-tech-selection {

}



.assign-tech-tech-selection option {

}


.assign-tech-tech-selection option span {

}

</style>