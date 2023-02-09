<template>
    <div class="technician-calls-wrap">

        <div class="loading-lightbox-wrap with-cancel" v-if="loading">
            <font-awesome-icon class="loading-lightbox-icon" :icon="['fa','circle-notch']" size="lg" spin />
            <button v-if="controller && controller.signal" class="cancel-search-btn" @click="cancelSearch()"><font-awesome-icon class="" :icon="['far','times-circle']" size="lg" /> Cancel Search</button>
        </div>



        <div class="technician-calls-selectors-wrap">

            <div class="techs-calls-select-branch-wrap">
                <h4 class="select-branch-heading">Select Branch</h4>
                <select v-model="selectedBranch" :disabled="userRole != 3">
                    <option v-for="branch in branches" :key="branch.id" :value="branch.id">{{ branch.name }} <span v-if="isUserBranch(branch.id)">(*)</span></option>
                </select>
            </div>


            <div class="refresh-tech-dashboard-wrap">
                <!-- <h4>Refresh/Load Calls</h4> -->
                <button class="tech-calls-refresh-calls-btn" @click="loadBranchCalls()"><font-awesome-icon class="load-branch-calls-icon" :icon="['fa','sync-alt']" size="lg" /></button>
            </div>


            <div class="search-filter-call-tech-stores-wrap" v-if="activeTechs && activeTechs.length >= 1">
                <h4>Search by Store</h4>
                <input type="text" v-model="storeSearchInput" @input="filterCallsByStore()" @click="storeSearchInput = '', filterCallsByStore()">
            </div>

            <div class="filter-operator-calls-wrap">
                <input type="checkbox" class="filter-operator-calls-checkbox" v-model="filterOperatorCalls" @change="filterByOperator()">
                <span class="smaller-text">Show operator calls only <span class="tiny-text">({{ user.employeeCode }})</span></span>
            </div>

        </div>

        

        <TechDashboard />
        <CallCommentsModal />

        <div class="tech-calls-btns-wrap">

            <div class="techs-calls-filter-tech-selector-wrap">
                <h4>Filter by Technician</h4>
                <select v-model="selectedTech" @change="filterCallsByTech()">
                    <option value="">--</option>
                    <option v-for="tech in activeTechs" :key="tech.employeeCode" :value="tech.employeeCode">{{ tech.displayName }} <span v-if="tech.employeeCode" class="small-text">({{ tech.employeeCode }})</span></option>
                </select>
            </div>

            
            <div class="filter-call-tech-state-wrap">
                <h4>Filter by Tech Status</h4>
                <select v-model="selectedTechStatusId" @change="filterTechStatus()">
                    <option value="">--</option>
                    <option v-for="status in tech_statuses" :key="status.id" :value="status.id">{{ status.name }}</option>
                </select>
            </div>

        </div>

    </div>
</template>



<script>
import { mapGetters } from 'vuex'
import TechDashboard from './TechDashboard.vue'
import CallCommentsModal from './CallCommentsModal.vue'

export default {


    components: {
    TechDashboard,CallCommentsModal
},



    data() {
        return {
            branches: JSON.parse(localStorage.getItem('branches')),
            user: JSON.parse(localStorage.getItem('user')),
            tech_statuses: JSON.parse(localStorage.getItem('call_tech_states')),
            selectedBranch: '',
            selectedTech: '',
            selectedTechStatusId: '',
            storeSearchInput: '',
            filterOperatorCalls: false
        }
    },



    computed: {
        ...mapGetters({
            loading: ['TechnicianCalls/loading'],
            activeTechs: ['TechnicianCalls/activeTechs'],
            stateBranch: ['TechnicianCalls/selectedBranch'],
            stateTech: ['TechnicianCalls/selectedTech'],
            filteredTechs: ['TechnicianCalls/filteredTechs'],
            userRole: ['UserRole/currentUserRole'],
            controller: ['TechnicianCalls/controller']
        })
    },




    watch: {
        stateBranch: {
            handler: function() {
                this.selectedTech = '';
                this.selectedTechStatusId = '';
                this.filterOperatorCalls = false;
                this.$store.dispatch('TechnicianCalls/setSelectedTech', this.selectedTech);
            },
            deep: true,
            immediate: true
        }
    },






    mounted() {

        this.$store.dispatch('TechnicianCalls/initController');

        this.branches.push({ id: 1, name: "Locksecure" });

        var preSelectedBranch = JSON.parse(localStorage.getItem('techCallsSelectedBranch'));

        this.filterOperatorCalls = false;
        this.selectedBranch =  preSelectedBranch ? preSelectedBranch : this.user.branchId; 
        this.selectedTech = this.stateTech ? this.stateTech : '';
        this.selectedTechStatusId = '';
        this.filterTechStatus();
    },




    methods: {

        cancelSearch: function() {
            this.$store.dispatch('TechnicianCalls/abortSearch');
        },


        filterByOperator: function() {
            this.$store.dispatch('TechnicianCalls/filterByOperator', this.filterOperatorCalls);
        },


        filterTechStatus: function() {
            this.$store.dispatch('TechnicianCalls/filterCallsByTechStatus', this.selectedTechStatusId);
        },


        filterCallsByStore: function() {
            this.$store.dispatch('TechnicianCalls/filterCallsByStore', this.storeSearchInput);
        },


        filterCallsByTech: function() {
            
            this.$store.dispatch('TechnicianCalls/setSelectedTech', this.selectedTech);
            this.$store.dispatch('TechnicianCalls/filterCallsByTech', this.selectedTech);
        },



        loadBranchCalls: function() {
            this.storeSearchInput = '';
            this.filterOperatorCalls = false
            this.$store.dispatch('TechnicianCalls/setSelectedBranch', this.selectedBranch);
            this.$store.dispatch('TechnicianCalls/getBranchCalls', this.selectedBranch);
        },



        isUserBranch: function(branchId) {
            if(branchId === this.user.branchId) { return true }
        },







        

    }

}
</script>



<style>




.search-filter-call-tech-stores-wrap {
    text-align: left;
}


.search-filter-call-tech-stores-wrap input {
    max-width: 85%;
}







.technician-calls-selectors-wrap {
    display: flex;
    align-items: flex-end;
    padding-top: 20px;
    position: relative;
}


.techs-calls-select-branch-wrap select {
    margin-right: 15px;
    width: 100px;
}


.technician-calls-selectors-wrap div:last-child {
    margin-right: 0;
}



.techs-calls-select-branch-wrap {
    margin-left: 10px;
}


.select-branch-heading {
    text-align: left;
}


.techs-calls-filter-tech-selector-wrap {
    text-align: left;
    width: 50%;
}


.techs-calls-filter-tech-selector-wrap select {
    width: 145px;
}


.tech-calls-btns-wrap {
    position: fixed;
    bottom: 97px;
    left : 0;
    right: 0;
    margin: 0 auto;
    width: 100%;
    padding: 0 10px;
    display: flex;
    align-items: flex-end;
    /* justify-content: space-between; */
    text-align: left;
    margin-top: 5px;
}



.tech-calls-btns-wrap .techs-calls-filter-tech-selector-wrap {
    height: 35px; 
}

.tech-calls-btns-wrap .filter-call-tech-state-wrap {
    height: 35px; 
    margin-right: 15px;
}

.tech-calls-btns-wrap .filter-call-tech-state-wrap {
    width: 50%;
}

.tech-calls-btns-wrap .filter-call-tech-state-wrap select {
    width: 152px;
}

.tech-calls-btns-wrap .filter-call-tech-state-wrap:last-child {
    margin-right: 0;
}


.tech-calls-refresh-calls-btn {
    display: flex;
    align-items: center;
    
    height: 35px;
}



.load-branch-calls-icon {
    
}





.filter-operator-calls-wrap {
    position: fixed;
    top: 44px;
    left: 10px;
    display: flex;
    align-items: center;
}


.filter-operator-calls-wrap span {
    margin-left: 5px;
}




.refresh-tech-dashboard-wrap {
    margin-right: 15px;
}
</style>