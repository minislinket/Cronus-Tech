<template>
    <div class="open-calls-dashboard-wrap">

        <div class="loading-lightbox-wrap with-cancel" v-if="loading">
            <font-awesome-icon class="loading-lightbox-icon" :icon="['fa','circle-notch']" size="lg" spin />
            <button v-if="controller && controller.signal" class="cancel-search-btn" @click="cancelSearch()"><font-awesome-icon class="" :icon="['far','times-circle']" size="lg" /> Cancel Search</button>
        </div>


        <div class="open-calls-selectors-wrap">

            <div class="open-calls-select-branch-wrap">
                <h4 class="select-branch-heading">Select Branch</h4>
                <select v-model="selectedBranch" :disabled="userRole != 3">
                    <option v-for="branch in branches" :key="branch.id" :value="branch.id">{{ branch.name }} <span v-if="isUserBranch(branch.id)">(*)</span></option>
                </select>
            </div>


            <div class="refresh-open-calls-dashboard-wrap">
                <button class="tech-calls-refresh-calls-btn" @click="loadBranchCalls()"><font-awesome-icon class="load-branch-calls-icon" :icon="['fa','sync-alt']" size="lg" /></button>
            </div>


            <div class="filter-calls-by-call-type-wrap" v-if="openCalls.length >= 1">
                <h4 class="select-branch-heading">Filter by Call Type</h4>
                <select v-model="selectedCallTypeId" @change="filterByCallType()">
                    <option value="">--</option>
                    <option v-for="type in callTypes" :key="type.id" :value="type.id">{{ type.name }}</option>
                </select>
            </div>


            <div class="filter-operator-calls-wrap" v-if="openCalls.length >= 1">
                
                <input type="checkbox" class="filter-operator-calls-checkbox" v-model="filterOperatorCalls" @change="filterByOperator()">
                <span class="smaller-text">Show operator calls only<span class="tiny-text"> ({{ user.employeeCode }})</span></span>
            </div>

        </div>

        <div id="OpenCalls" class="open-call-cards-scroll-section">
            <div class="open-call-card" v-for="call in filteredCalls" :key="call.id">
                <p class="bold" @click="loadCall(call)">{{ call.id }}</p>
                <p class="small-text" @click="loadStoreCalls(call)">{{ call.customerStoreName }}</p>
                <p class="small-text" @click="loadCall(call)">{{ call.openTime.split(' ')[0] }} ({{ getOpenForDays(call.openTime) }})</p>
            </div>
        </div>


    </div>
</template>



<script>
import { mapGetters } from 'vuex'
export default {

    data() {
        return {
            branches: JSON.parse(localStorage.getItem('branches')),
            callTypes: JSON.parse(localStorage.getItem('call_types')),
            filterOperatorCalls: false,
            user: JSON.parse(localStorage.getItem('user')),
            selectedBranch: '',
            selectedCallTypeId: ''
        }
    },




    computed: {
        ...mapGetters({
            loading : ['OpenCalls/loading'],
            openCalls: ['OpenCalls/openCalls'],
            filteredCalls: ['OpenCalls/filteredCalls'],
            stateBranch: ['OpenCalls/selectedBranch'],
            userRole: ['UserRole/currentUserRole'],
            controller: ['OpenCalls/controller']
        })
    },





    watch: {
        stateBranch: {
            handler: function() {
                
            },
            deep: true,
            immediate: true
        }
    },





    mounted() {

        this.$store.dispatch('OpenCalls/initController');
        
        this.branches.push({ id: 1, name: "Locksecure" });

        var preSelectedBranch = JSON.parse(localStorage.getItem('openCallsSelectedBranch'));
        console.log('Do we have a selected branch: ', preSelectedBranch, this.selectedBranch);
        this.selectedBranch = preSelectedBranch ? preSelectedBranch : this.user.branchId; 

        setTimeout(() => {
            var scrollBlock = document.getElementById('OpenCalls');
            if(scrollBlock)
            {
                var viewPortHeight = window.innerHeight;
                scrollBlock.style.height = (viewPortHeight - 200) + 'px';
            }
        }, 50);
    },




    methods: {

        cancelSearch: function() {
            this.$store.dispatch('OpenCalls/abortSearch');
        },



        loadCall: function(call) {
            this.$store.dispatch('AllocateTech/processCall', call);
            this.$router.push('/allocate_tech');
        },





        loadStoreCalls: function(call) {
            this.$store.dispatch('AllocateTech/setCall', '');
            this.$store.dispatch('AllocateTech/loadStoreCalls', call.customerStore);
            this.$store.dispatch('AllocateTech/showCall', false);
            this.$router.push('/allocate_tech');
           
            
        },





        filterByCallType: function() {
            this.$store.dispatch('OpenCalls/filterByCallType', this.selectedCallTypeId);
        },







        getOpenForDays: function(openTime) {
            var openDate = new Date(openTime);
            var today = new Date();

            // get total seconds between the times
            var delta = Math.abs(today - openDate) / 1000;

            // calculate (and subtract) whole days
            var days = Math.floor(delta / 86400);
            delta -= days * 86400;
            
            // calculate (and subtract) whole hours
            var hours = Math.floor(delta / 3600) % 24;
            delta -= hours * 3600;
            
            // calculate (and subtract) whole minutes
            var minutes = Math.floor(delta / 60) % 60;
            delta -= minutes * 60;
            

            hours = hours.toString();
            minutes = minutes.toString();
            hours = hours.length === 1 ? '0' + hours : hours;
            minutes = minutes.length === 1 ? '0' + minutes : minutes;

            return days/*  + ' ' + hours + ':' + minutes */;
        },

        filterByOperator: function() {
            this.$store.dispatch('OpenCalls/filterByOperator', this.filterOperatorCalls);
        },

        loadBranchCalls: function() {
            this.filterOperatorCalls = false
            this.selectedCallTypeId = '';
            this.$store.dispatch('OpenCalls/setSelectedBranch', this.selectedBranch);
            this.$store.dispatch('OpenCalls/getBranchCalls', this.selectedBranch);
        },

        isUserBranch: function(branchId) {
            if(branchId === this.user.branchId) { return true }
        },
    }

}
</script>



<style>









.open-call-cards-scroll-section {
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




.open-call-card {
    display: grid;
    grid-template-columns: 0.8fr 2fr 1.5fr;
    align-items: center;
    background: var(--ClosedCall);
    color: var(--OffWhite);
    border-radius: 3px;
    padding: 3px 0;
    text-align: left;
    margin-bottom: 10px;
}


.open-call-card p {
    margin: -3px 0;
    padding: 3px 0;
    padding-left: 5px;
    height: 100%;
    display: flex;
    align-items: center;
}

.open-call-card p:first-child {
    padding: 0 4px;
    text-align: center;
    color: var(--OpenCall);
}

.open-call-card p:last-child {
    border-right: none;
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





.open-calls-selectors-wrap {
    display: flex;
    align-items: flex-end;
    padding-top: 20px;
    position: relative;
}


.open-calls-selectors-wrap div:last-child {
    margin-right: 0;
}



.open-calls-select-branch-wrap select {
    margin-right: 15px;
    width: 100px;
}


.open-calls-select-branch-wrap {
    margin-left: 10px;
}




.refresh-open-calls-dashboard-wrap {
    margin-right: 15px;
}

</style>