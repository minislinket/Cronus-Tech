<template>
    <div class="dashboard-wrap">

        <br>

        <h2>Job Breakdown</h2>

        

        <div class="job-dashboard-wrap">

            <div class="job-type pending">
                
                <div class="job-type-wrap">
                    <span class="material-symbols-outlined dash-job-icon pending material" >pending_actions</span>
                    Pending
                </div>

                <div class="job-amount-circle">
                    <span class="job-amount">{{ pendingCalls.length }}</span>
                </div>

            </div>



            <div class="job-type on-hold">

                <div class="job-type-wrap">
                    <font-awesome-icon class="dash-job-icon on-hold" :icon="['fa', 'pause-circle']" size="lg" />
                    On Hold
                </div>

                <div class="job-amount-circle">
                    <span class="job-amount">{{ onHoldCalls.length }}</span>
                </div>

            </div>



            <div class="job-type active">

                <div class="job-type-wrap">
                    <font-awesome-icon class="dash-job-icon active-calls" :icon="['fa', 'clipboard-check']" size="lg" />
                    Active
                </div>

                <div class="job-amount-circle">
                    <span class="job-amount">{{ busyActiveCalls.length }}</span>
                </div>

            </div>
        </div>




        <button class="switch-user-type-btn" v-if="availableUserRoles.includes(2)" @click="switchProfile()"><font-awesome-icon :icon="['fa', 'retweet']" size="lg" /> Switch to Ops-Admin</button>

        
        
    </div>
</template>

<script>
import { mapGetters } from 'vuex';


export default {

    data() {
        return {
            onHoldCalls: [],
            busyActiveCalls: []
        }
    },





    





    computed: {
        ...mapGetters({
            firebaseToken: ['Login/firebaseToken'],
            pendingCalls: ['Calls/pendingCalls'],
            activeCalls: ['Calls/activeCalls'],
            userType: ['UserRole/currentUserRole'],
            availableUserRoles: ['UserRole/availableRoles']
        })
    },








    watch: {

        activeCalls: {
            handler: function() {
                if(this.activeCalls.length >= 1)
                    this.splitCalls();
            },
            deep: true

        }

    },







    mounted() {

        this.$store.dispatch('Menu/setTitle', { title: 'Home', icon: ['fa', 'home'] });

        
        if(this.activeCalls.length <= 0)
            this.$store.dispatch('Calls/refreshTechnicianCalls', false);
        else
            this.splitCalls();

    },






    methods: {


        switchProfile: function() {
            // console.log(this.availableUserRoles);

            if(this.availableUserRoles.includes(3)) 
            {
                this.$store.dispatch('UserRole/setUserRole', 3);
                this.$router.push('/ops_dashboard');
                return
            }

            this.$store.dispatch('UserRole/setUserRole', 2);
            this.$router.push('/ops_dashboard');
            console.log('Switching to: OPS-ADMIN');
        },





        splitCalls: function() {
            this.onHoldCalls = this.activeCalls.filter(call => call.techStateId === 6);
            this.busyActiveCalls = this.activeCalls.filter(call => {
                if(call.techStateId >= 2 && call.techStateId <= 4) { return call } 
                if(call.techStateId == 5) {return call } 
                if(call.techStateId == 7) { return call }
            });
        },





        testModal: function(type) {

            var modal = {
                active: true, // true to show modal
                type: type, // ['info', 'warning', 'error', 'okay']
                icon: [], // Leave blank for no icon
                heading: type,
                body: ''
            }

            // this.$store.dispatch('Modal/modal', modal)
            
            
            switch(type) {
                case 'info':    
                    modal.heading = 'General Information';
                    modal.body = '<p>This modal displays general information to the user</p>';
                    modal.icon = ['fa', 'info-circle'];
                    break
                case 'warning':
                    modal.heading = 'Warning';
                    modal.body = 'Something is wrong, but it can be corrected';
                    modal.icon = ['fa', 'exclamation-triangle'];
                    break
                case 'okay':
                    modal.heading = 'All Good';
                    modal.body = 'Submission successful, Call accepted successfully, etc';
                    modal.icon = ['far', 'check-circle'];
                    break
                case 'error':
                    modal.heading = 'ERROR';
                    modal.body = 'Something went wrong and can\'t be fixed right now, developer intervention required or try again later...';
                    modal.icon = ['fa', 'exclamation-circle'];
                    break
            }


            this.$store.dispatch('Modal/modal', modal)
        },





        testToast: function(type) {

            var toast = {
                shown: false,
                type: type, // ['info', 'warning', 'error', 'okay']
                heading: '', // (Optional)
                body: '', 
                time: 3000, // in milliseconds
                icon: ['fa', 'info-circle']
            }
            

            switch(type) {
                case 'info':    
                    toast.heading = 'General Information';
                    toast.body = 'This toast displays general information to the user';
                    toast.icon = ['fa', 'info-circle'];
                    toast.time = 2000;
                    break
                case 'warning':
                    toast.heading = 'Warning';
                    toast.body = 'Something is wrong, but it can be corrected';
                    toast.icon = ['fa', 'exclamation-triangle'];
                    toast.time = 2500;
                    break
                case 'okay':
                    toast.heading = 'All Good';
                    toast.body = 'Submission successful, Call accepted successfully, etc';
                    toast.icon = ['far', 'check-circle'];
                    toast.time = 2000;
                    break
                case 'error':
                    toast.heading = 'ERROR';
                    toast.body = 'Something went wrong and can\'t be fixed right now, developer intervention required or try again later';
                    toast.icon = ['fa', 'exclamation-circle'];
                    toast.time = 2500;
                    break
                case 'nokay':
                    toast.heading = '';
                    toast.body = 'Call Accepted!';
                    toast.icon = ['far', 'check-circle'];
                    toast.type = 'okay';
                    toast.time = 2000;
                    break
            }


            this.$store.dispatch('Toast/toast', toast);
        },

    }

}
</script>

<style>



.dashboard-wrap {

}



.dashboard-wrap h2 {
    margin-bottom: 50px;
}





.test-toast-btn-wrap {
    display: flex;
    flex-direction: column;
    align-items: center;
}



.test-toast-btn-wrap button {
    margin: 5px 5px;
    color: black;
    width: 50%;
}








.job-dashboard-wrap {
    display: flex;
    align-items: center;
    flex-direction: column;
    background: var(--GunMetal);
    padding: 30px 0;
    box-shadow: inset 0 0 12px 0 rgb(0 0 0 / 10%);
}



.job-dashboard-wrap .job-type {
    display: grid;
    grid-template-columns: 1fr 1fr;
    align-items: center;
    justify-items: center;
    margin-bottom: 35px;
    width: 70%;
}


.job-dashboard-wrap .job-type:last-child {
    margin-bottom: 0;
}



.job-dashboard-wrap .job-type-wrap {
    display: flex;
    align-items: center;
    margin-left: 10px;
}



.job-dashboard-wrap .job-amount-circle {
    border: 2px solid white;
    border-radius: 30%;
    width: 35px;
    height: 35px;
    display: flex;
    align-items: center;
    justify-content: center;
    margin-right: 20px;
}


.job-dashboard-wrap .job-type.pending .job-amount-circle {
    border-color: var(--Pending);
}

.job-dashboard-wrap .job-type.on-hold .job-amount-circle {
    border-color: var(--OnHold);
}

.job-dashboard-wrap .job-type.active .job-amount-circle {
    border-color: var(--Received);
}









.job-dashboard-wrap .dash-job-icon {
    margin-right: 10px;
}


.job-dashboard-wrap .job-type.pending .dash-job-icon {
    color: var(--Pending);
}

.job-dashboard-wrap .job-type.on-hold .dash-job-icon {
    color: var(--OnHold);
}

.job-dashboard-wrap .job-type.active .dash-job-icon {
    color: var(--Received);
}

</style>