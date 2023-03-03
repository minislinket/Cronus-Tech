<template>
    <div class="dashboard-wrap">

        <br>

        <h2>Job Breakdown</h2>

        

        <div class="job-dashboard-wrap">

            <div class="job-type pending">
                <div class="job-type-wrap">
                    <span class="material-symbols-outlined dash-job-icon pending material" >pending_actions</span>
                </div>

                <span class="dash-tech-status-name">Pending</span>

                <div class="job-amount-circle">
                    <span class="job-amount">{{ pendingCalls.length }}</span>
                </div>
            </div>


            <div class="job-type received">
                <div class="job-type-wrap">
                    <font-awesome-icon class="dash-job-icon received" :icon="['fa', 'user-check']" size="lg" />
                </div>

                <span class="dash-tech-status-name">Received</span>

                <div class="job-amount-circle">
                    <span class="job-amount">{{ received }}</span>
                </div>
            </div>


            <div class="job-type en-route">
                <div class="job-type-wrap">
                    <font-awesome-icon class="dash-job-icon en-route" :icon="['fa', 'route']" size="lg" />
                </div>

                <span class="dash-tech-status-name">En Route</span>

                <div class="job-amount-circle">
                    <span class="job-amount">{{ enRoute }}</span>
                </div>
            </div>


            <div class="job-type on-site">
                <div class="job-type-wrap">
                    <font-awesome-icon class="dash-job-icon on-site" :icon="['fa', 'map-marker-alt']" size="lg" />
                </div>

                <span class="dash-tech-status-name">On Site</span>

                <div class="job-amount-circle">
                    <span class="job-amount">{{ onSite }}</span>
                </div>
            </div>


            <div class="job-type returning">
                <div class="job-type-wrap">
                    <font-awesome-icon class="dash-job-icon returning" style="transform: scaleX(-1);" :icon="['fa', 'clock-rotate-left']" size="lg" />
                </div>

                <span class="dash-tech-status-name">Returning</span>

                <div class="job-amount-circle">
                    <span class="job-amount">{{ returning }}</span>
                </div>
            </div>


            <div class="job-type on-hold">
                <div class="job-type-wrap">
                    <font-awesome-icon class="dash-job-icon on-hold" :icon="['fa', 'pause-circle']" size="lg" />
                    
                </div>

                <span class="dash-tech-status-name">On Hold</span>

                <div class="job-amount-circle">
                    <span class="job-amount">{{ onHold }}</span>
                </div>
            </div>


            <div class="job-type rerouted">
                <div class="job-type-wrap">
                    <span class="material-symbols-outlined dash-job-icon rerouted material" >alt_route</span>
                </div>
                
                <span class="dash-tech-status-name">Rerouted</span>

                <div class="job-amount-circle">
                    <span class="job-amount">{{ rerouted }}</span>
                </div>
            </div>


            <div class="job-type transferred">
                <div class="job-type-wrap">
                    <font-awesome-icon class="dash-job-icon transferred" :icon="['fa', 'shuffle']" size="lg" />
                </div>

                <span class="dash-tech-status-name">Transferred</span>

                <div class="job-amount-circle">
                    <span class="job-amount">{{ transferred }}</span>
                </div>
            </div>


            <!-- <div class="job-type completed">
                <div class="job-type-wrap">
                    <font-awesome-icon class="dash-job-icon completed" :icon="['fa', 'clipboard-check']" size="lg" />
                </div>

                <span class="dash-tech-status-name">Completed</span>

                <div class="job-amount-circle">
                    <span class="job-amount">{{ completed }}</span>
                </div>
            </div> -->

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
            busyActiveCalls: [],
            received: 0,
            rerouted: 0,
            enRoute: 0,
            onSite: 0,
            returning: 0,
            transferred: 0,
            onHold: 0,
            completed: 0
        }
    },





    





    computed: {
        ...mapGetters({
            firebaseToken: ['Login/firebaseToken'],
            pendingCalls: ['Calls/pendingCalls'],
            activeCalls: ['Calls/activeCalls'],
            userType: ['UserRole/currentUserRole'],
            availableUserRoles: ['UserRole/availableRoles']
        }),
        received: function() {
            return this.activeCalls.filter(call => call.techStateId === 2).length || 0;
        },
        enRoute: function() {
            return this.activeCalls.filter(call => call.techStateId === 3).length || 0;
        },
        onSite: function() {
            return this.activeCalls.filter(call => call.techStateId === 4).length || 0;
        },
        transferred: function() {
            return this.activeCalls.filter(call => call.techStateId === 9).length || 0;
        },
        onHold: function() {
            return this.activeCalls.filter(call => call.techStateId === 6).length || 0;
        },
        rerouted: function() {
            return this.activeCalls.filter(call => call.techStateId === 7).length || 0;
        },
        returning: function() {
            return this.activeCalls.filter(call => call.techStateId === 5).length || 0;
        },
        completed: function() {
            return this.activeCalls.filter(call => call.techStateId === 8).length || 0;
        },
    },








    watch: {

        // activeCalls: {
        //     handler: function() {
        //         if(this.activeCalls.length >= 1)
        //             this.splitCalls();
        //     },
        //     deep: true

        // }

    },







    mounted() {



        // this.getGeoLocation();

        // if('Accelerometer' in window)
        // {
        //     console.log('Ineterace/browser supports accelerometer usage');
        // }

        // this.getAccelerometer();

        this.$store.dispatch('Menu/setTitle', { title: 'Home', icon: ['fa', 'home'] });

        
        if(this.activeCalls.length <= 0)
            this.$store.dispatch('Calls/refreshTechnicianCalls', false);


    },






    methods: {



        // getGeoLocation: function() {
        //     if(navigator.geolocation) 
        //     {
        //         navigator.geolocation.getCurrentPosition(this.showPosition);
                
        //     } 
        //     else 
        //     {
        //         console.log("Geo Location not supported by browser");
        //     }
        // },  


        // showPosition: function(position) {
        //     console.log(position);
        // },





        // getAccelerometer: function() {
        //     let accelerometer = null;
        //     try {
        //     accelerometer = new Accelerometer({ frequency: 10 });
        //     accelerometer.onerror = (event) => {
        //         // Handle runtime errors.
        //         if (event.error.name === 'NotAllowedError') {
        //         console.log('Permission to access sensor was denied.');
        //         } else if (event.error.name === 'NotReadableError') {
        //         console.log('Cannot connect to the sensor.');
        //         }
        //     };
        //     accelerometer.onreading = (e) => {
        //         console.log('x:', Math.round(e.currentTarget.x).toFixed(2), 'y:', Math.round(e.currentTarget.y).toFixed(2), 'z:' , Math.round(e.currentTarget.z).toFixed(2));
        //     };
        //     accelerometer.start();
        //     } catch (error) {
        //     // Handle construction errors.
        //     if (error.name === 'SecurityError') {
        //         console.log('Sensor construction was blocked by the Permissions Policy.');
        //     } else if (error.name === 'ReferenceError') {
        //         console.log('Sensor is not supported by the User Agent.');
        //     } else {
        //         throw error;
        //     }
        //     }
        // },




        switchProfile: function() {
            // console.log(this.availableUserRoles);

            this.$store.dispatch('GeoLocation/stopGeoLocationService');

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
            this.received = this.activeCalls.filter(call => call.techStateId === 2).length || 0;
            this.enRoute = this.activeCalls.filter(call => call.techStateId === 3).length || 0;
            this.onSite = this.activeCalls.filter(call => call.techStateId === 4).length || 0;
            this.returning = this.activeCalls.filter(call => call.techStateId === 5).length || 0;
            this.onHold = this.activeCalls.filter(call => call.techStateId === 6).length || 0;
            this.rerouted = this.activeCalls.filter(call => call.techStateId === 7).length || 0;
            this.completed = this.activeCalls.filter(call => call.techStateId === 8).length || 0;
            this.transferred = this.activeCalls.filter(call => call.techStateId === 9).length || 0;
            // this.onHoldCalls = this.activeCalls.filter(call => call.techStateId === 6);
            // this.busyActiveCalls = this.activeCalls.filter(call => {
            //     if(call.techStateId >= 2 && call.techStateId <= 4) { return call } 
            //     if(call.techStateId == 5) {return call } 
            //     if(call.techStateId == 7) { return call }
            // });
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
    margin-bottom: 20px;
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
    padding-bottom: 40px;
    box-shadow: inset 0 0 12px 0 rgb(0 0 0 / 10%);
    
}



.job-dashboard-wrap .job-type {
    display: grid;
    grid-template-columns: 0.7fr 2fr 1fr;
    align-items: center;
    justify-items: left;
    padding: 5px 0;
    width: 70%;
    border-bottom: 1px solid;
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
    /* border: 2px solid white;
    border-radius: 30%; */
    width: 25px;
    height: 25px;
    display: flex;
    align-items: center;
    justify-content: center;
    margin-right: 20px;
    font-size: 14px;
    justify-self: center;
}


.job-dashboard-wrap .job-type.pending  {
    border-color: var(--Pending);
}

.job-dashboard-wrap .job-type.received  {
    border-color: var(--Received);
}

.job-dashboard-wrap .job-type.en-route  {
    border-color: var(--EnRoute);
}

.job-dashboard-wrap .job-type.on-site  {
    border-color: var(--OnSite);
}

.job-dashboard-wrap .job-type.rerouted  {
    border-color: var(--Rerouted);
}

.job-dashboard-wrap .job-type.transferred  {
    border-color: var(--Transferred);
}

.job-dashboard-wrap .job-type.on-hold  {
    border-color: var(--OnHold);
}

.job-dashboard-wrap .job-type.completed  {
    border-color: var(--Completed);
}

.job-dashboard-wrap .job-type.returning  {
    border-color: var(--Returning);
}





.job-dashboard-wrap .dash-job-icon {
    /* margin-right: 10px; */
}



.job-dashboard-wrap .job-type.pending .dash-job-icon {
    color: var(--Pending);
}

.job-dashboard-wrap .job-type.received .dash-job-icon {
    color: var(--Received);
}

.job-dashboard-wrap .job-type.en-route .dash-job-icon {
    color: var(--EnRoute);
}

.job-dashboard-wrap .job-type.on-site .dash-job-icon {
    color: var(--OnSite);
}

.job-dashboard-wrap .job-type.rerouted .dash-job-icon {
    color: var(--Rerouted);
}

.job-dashboard-wrap .job-type.transferred .dash-job-icon {
    color: var(--Transferred);
}

.job-dashboard-wrap .job-type.on-hold .dash-job-icon {
    color: var(--OnHold);
}

.job-dashboard-wrap .job-type.completed .dash-job-icon {
    color: var(--Completed);
}

.job-dashboard-wrap .job-type.returning .dash-job-icon {
    color: var(--Returning);
}



.dash-tech-status-name {

}




</style>