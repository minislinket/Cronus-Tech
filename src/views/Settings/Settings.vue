<template>
    <div class="settings-wrap">

        <div class="loading-lightbox-wrap" v-if="loading">
            <font-awesome-icon class="loading-lightbox-icon" :icon="['fa','circle-notch']" size="lg" spin />
        </div>


        <p class="app-version-float">v{{ version }}</p>


        <button :disabled="!online" class="update-static-btn" @click="updateStaticResources()"><font-awesome-icon :icon="['fa', 'sync-alt']" size="lg" /> Sync App Data</button>
        

        <br>

        <button><a class="a-link-for-intent" :href="trackingAppLocation">Install Tracking App</a></button>

        <button class="intent-btn">
            <a class="a-link-for-intent" :href="'cronus://track?firebaseToken='+firebaseToken"><font-awesome-icon :icon="['fa', 'street-view']" size="lg" /> Start Tracking </a>
        </button>

        <!-- <button :disabled="!online" v-if="canReAuthenticate" class="register-biometrics-btn" @click="registerBiometrics()" ><font-awesome-icon :icon="['fa', 'fingerprint']" size="lg" /> Register Biometrics</button> -->

        <button :disabled="!online" @click="$router.push('/psw-reset')" ><font-awesome-icon :icon="['fa', 'key']" size="lg" /> Reset Password</button>

        <button v-if="availableUserRoles.includes(2)" @click="switchProfile()"><font-awesome-icon :icon="['fa', 'retweet']" size="lg" /> Switch to {{ userType === 1 ? 'Ops-Admin' : 'Tech' }}</button>

        
        <button v-if="!updateAvailable" @click="checkForUpdates()" class="check-update-btn">
            
            <span class="material-symbols-outlined">update</span>
            Check for Updates
        </button>
        <button v-if="updateAvailable" @click="installUpdate()" class="install-update-btn">
            <span class="update-btn-icon-badge"></span>
            <span class="material-symbols-outlined">system_update</span> 
            Install Update
        </button>

        <button :disabled="!online" @click="checkRefreshJobData()" class="refresh-jobs-btn"><span class="material-symbols-outlined">cloud_sync</span> Refresh Job Data</button>

        <button :disabled="!online" class="update-static-btn warning" @click="resetApp()"><font-awesome-icon :icon="['fa', 'sync-alt']" size="lg" /> Reset App Data</button>

        <div class="app-permission-wrap">
            <!-- <h4>App Permissions</h4> -->
            <div class="app-permissions-settings-wrap">    
                <p><font-awesome-icon class="icon" :icon="['fa', 'bell']" size="lg" /> Notifications </p>
                <font-awesome-icon class="icon permission-active" v-if="notificationPermissions" :icon="['far', 'check-circle']" size="lg" />
                <font-awesome-icon class="icon permission-inactive" v-else :icon="['fa', 'times-circle']" size="lg" />
                <!-- <input type="checkbox" v-model="notificationPermissions" disabled> -->
                <p><font-awesome-icon class="icon" :icon="['fa', 'location-dot']" size="lg" /> Location </p>
                <font-awesome-icon class="icon permission-active" v-if="locationPermissions" :icon="['far', 'check-circle']" size="lg" />
                <font-awesome-icon class="icon permission-inactive" v-else :icon="['fa', 'times-circle']" size="lg" />
                <!-- <input type="checkbox" v-model="locationPermissions" disabled> -->
            </div>
        </div>

    </div>
</template>




<script>
import { mapGetters } from 'vuex'
import { axiosMySQL } from '../../axios/axios'

export default {

    data() {
        return {
            pKey: {},
            user: JSON.parse(localStorage.getItem('user')),
            firebaseToken: localStorage.getItem('msgToken'),
            loading: false,
            version: localStorage.getItem('version'),
            notificationPermissions: false,
            locationPermissions: false,
            swReg: '',
            // updateAvailable: false,
            trackingAppLocation: window.location.href.indexOf('localhost') !== -1 ? 'http://localhost:8087/cronus-track.apk' : 'https://dev.locksecure.co.za/cronus-tech/cronus-track.apk'
        }
    },



    computed: {
        ...mapGetters({
            canReAuthenticate: ['StaticResources/canReAuthenticate'],
            online: ['StaticResources/online'],
            userType: ['UserRole/currentUserRole'],
            availableUserRoles: ['UserRole/availableRoles'],
            modal: ['Modal/modal'],
            updateAvailable: ['Settings/updateAvailable']
        })
    },




    watch: {
        modal: {
            handler: function() {
                if(this.modal.confirmAction === true && this.modal.actionFrom.indexOf('reset_app') !== -1)
                    this.$store.dispatch('Login/resetApp'); 
                    
                    
                if(this.modal.confirmAction === true && this.modal.actionFrom.indexOf('refresh_job_data') !== -1)
                    this.resetJobData(); 

            },
            deep: true
        },


        swReg: {
            handler: function() {

            },
            deep: true
        }
    },




    mounted() {

        navigator.serviceWorker.getRegistration().then(reg => {
            this.swReg = reg;
            reg.addEventListener('updatefound', () => {
                this.swReg = reg;
            })
        })

        this.$store.dispatch('Menu/setTitle', { title: 'Settings', icon: ['fa', 'cog'] });

        navigator.permissions.query({ name: 'geolocation' })
		.then(res => {
			// console.log(res);
            if(res.state === 'granted')
            {
                this.locationPermissions = true;
            }
            else
            {
                this.locationPermissions = false;
            }
		})
        .catch(err => this.locationPermissions = false)

        navigator.permissions.query({ name: 'notifications' })
		.then(res => {
			// console.log(res);
            if(res.state === 'granted')
            {
                this.notificationPermissions = true;
            }
            else
            {
                this.notificationPermissions = false;
            }
		})
        .catch(err => this.notificationPermissions = false)
    },




    methods: {




        checkForUpdates: function() {

            localStorage.setItem('checkingForUpdates', true);
            this.$store.dispatch('Control/checkingForUpdates', 'Settings - checkForUpdates');

            localStorage.setItem('canUpdate', false);

            // navigator.serviceWorker.getRegistration().then(sw => {
                this.swReg.update().then(res => {
                    localStorage.setItem('checkingForUpdates', false);
                    this.$store.dispatch('Control/checkingForUpdates', 'Settings - sw.update()');
                }).catch(err => {
                    localStorage.setItem('checkingForUpdates', false);
                    this.$store.dispatch('Control/checkingForUpdates', 'Settings - sw.update().error');
                    this.$store.dispatch('Settings/updateAvailable', false);
                });
            // })
        },



        installUpdate: function() {
            localStorage.setItem('updating', true);
			this.$store.dispatch('Control/initUpdates');
            localStorage.setItem('showUpdateMessage', true);
            localStorage.setItem('canUpdate', false);
            if(this.swReg && this.swReg.waiting)
            {
                this.swReg.waiting.postMessage({type: 'skipWaiting'});
            }
            else if(this.swReg && this.swReg.installing)
            {
                this.swReg.installing.postMessage({type: 'skipWaiting'});
            }
            else 
            {
                navigator.serviceWorker.getRegistration().then(reg => {
                    if(reg && reg.waiting)
                    {
                        reg.waiting.postMessage({type: 'skipWaiting'});
                    }
                    else if(reg && reg.installing)
                    {
                        reg.installing.postMessage({type: 'skipWaiting'});
                    }
                })
            }
        },





        checkRefreshJobData: function() {
            var modal = 
			{
				active: true, // true to show modal
				type: 'warning', // ['info', 'warning', 'error', 'okay']
				icon: [], // Leave blank for no icon
				heading: 'Job Data Refresh',
				body: '<p>All your Job Data on your mobile device will be cleared an reloaded from the server.</p>'
                        +'<br><p>Only use this function if asked by Admin to do so.</p>'
                        +'<br><br><p>Are you sure you want to continue?</p>',

				// Optional add on for when user needs to confirm or deny an action
				confirmAction: 'init',
				actionFrom: 'refresh_job_data',
				resolveText: 'Refresh',
				rejectText: 'Cancel'
				
			}
			this.$store.dispatch('Modal/modal', modal);
        },



        resetJobData: function() {
            localStorage.removeItem('calls');
            this.$store.dispatch('Calls/refreshTechnicianCalls');
        },




        resetApp: function() {
            
            var modal = 
			{
				active: true, // true to show modal
				type: 'warning', // ['info', 'warning', 'error', 'okay']
				icon: [], // Leave blank for no icon
				heading: 'App Reset',
				body: 'This will clear all stored application data and log you out, are you sure you want to continue?',

				// Optional add on for when user needs to confirm or deny an action
				confirmAction: 'init',
				actionFrom: 'reset_app',
				resolveText: 'Reset',
				rejectText: 'Cancel'
				
			}
			this.$store.dispatch('Modal/modal', modal);

            // console.log('Asking to reset...')


        },





        switchProfile: function() {
            if(this.availableUserRoles.includes(3)) 
            {
                var switchTo = this.userType === 1 ? 3 : 1;
                this.$store.dispatch('UserRole/setUserRole', switchTo);
                return
            }
            var switchTo = this.userType === 1 ? 2 : 1;
            this.$store.dispatch('UserRole/setUserRole', switchTo);
            // console.log('SWitching to: ', switchTo);
        },




        registerBiometrics: async function() {

            var this2 = this;
            var user = JSON.parse(localStorage.getItem('user'));
            var challenge = await this.getChallenge();
            var userId = Uint8Array.from((user.employeeCode+user.branchId), c => c.charCodeAt(0));

            // console.log('Registering Device for Biometrics with user: ', user.employeeCode, ', user ID:', userId ,' and challenge: ', challenge);
            

            this2.pKey = {
                // The challenge produced by the server
                challenge: Uint8Array.from(Buffer.from(challenge, 'base64')),

                // Relying Party:
                rp: {
                    name: "Locksecure",
                    id: 'locksecure.co.za'
                },

                user: {
                    id: userId,
                    name: user.employeeCode,
                    displayName: user.displayName,
                },

                // Works for Android Devices
                pubKeyCredParams: [
                    {
                        type: "public-key",
                        alg: -7 // "ES256" as registered in the IANA COSE Algorithms registry
                    },

                ],

                authenticatorSelection: {
                    userVerification: "required", // Try to use UV if possible. This is also the default.
                    authenticatorAttachment: 'platform' // Use biometrics (aka screen-lock) for re-authentication
                },

                timeout: 360000,  // 6 minutes
            };


            var publicKey = this2.pKey;



            // The following call will cause the authenticator to display UI.
            navigator.credentials.create({ publicKey })
            .then(function (newCredentialInfo) {
                // Send new credential info to server for verification and registration.
                console.log(newCredentialInfo);
                this2.decodeAndStoreCredential(newCredentialInfo)
            }).catch(function (err) {
                console.error('Credential reg failed: ', err);
                // No acceptable authenticator or user refused consent. Handle appropriately.
            });
        },  








        decodeAndStoreCredential: function(cred) {
            
            let response = cred.response;
            console.log('Credential Response: ', response);

            let clientExtensionResults = cred.getClientExtensionResults();
            console.log('Client Extension result: ', clientExtensionResults);

            let JSONText = Buffer.from(response.clientDataJSON, 'utf-8');
            JSONText = new TextDecoder().decode(JSONText);
            var clientData = JSON.parse(JSONText);
            console.log('JSON Text: ', clientData);

            if(clientData.type === 'webauthn.create')
            {
                console.log('Correct type!');
            }


        },









        getChallenge: async function() {

            return axiosMySQL.get('biometrics/challenge.php')
			.then(resp => {
				return resp.data;
			})
			.catch(err => {
				console.error('Axios SQL error: ', err);
				console.error('Axios SQL error response: ', err.response);
                return false;
			})

        },





        updateStaticResources: async function() {
            this.loading = true;
            await this.$store.dispatch('StaticResources/loadBaseStaticResources');
            this.loading = false;
            this.$router.push('/dashboard');
        },


        

    }

}

</script>




<style>


.settings-wrap {
    padding-top: 50px;
    display: flex;
    flex-direction: column;
    align-items: center;
    position: relative;
    padding-bottom: 150px;
}


.settings-wrap button {
    margin: 10px 0;
    width: max-content;
}



.app-version-float {
    position: fixed;
    top: 60px;
    right: 10px;
}



.install-update-btn, 
.check-update-btn {
    display: flex;
    align-items: center;
}


.install-update-btn {
    position: relative;
}

.update-btn-icon-badge {
    position: absolute;
    top: 10px;
    left: -11px;
    width: 18px;
    height: 18px;
    border-radius: 50%;
    background: rgb(255, 122, 14);
}


.refresh-jobs-btn {
    display: flex;
    align-items: center;
    color: var(--WarningOrange);
}


.refresh-jobs-btn span {
    font-size: 26px;
    margin-right: 5px;
}










.app-permission-wrap {
    position: fixed;
    bottom: 60px;
    width: 100vw;
    padding: 5px 10px;
    background: var(--BlueAlt);
    height: 100px;
    display: flex;
    align-items: center;
}



.app-permission-wrap h4 {
    margin-bottom: 10px;
    margin-top: 15px;
    font-size: 22px;
}



.app-permissions-settings-wrap {
    padding-top: 5px;
    display: grid;
    grid-template-columns: 1fr 0.5fr;
    row-gap: 5px;
    justify-items: center;
    width: 100%;
    padding-bottom: 5px;
    padding-left: 20px;
}




.app-permissions-settings-wrap p {
    display: flex;
    align-items: center;
    justify-self: flex-start;
    margin-bottom: 3px;
}


.app-permissions-settings-wrap .icon {
    margin-right: 8px;
}



.app-permissions-settings-wrap .icon.permission-active {
    color: var(--OkayGreen);
}

.app-permissions-settings-wrap .icon.permission-inactive {
    color: var(--WarningOrange);
}





.intent-btn {

}

.a-link-for-intent {
    text-decoration: none;
    color: var(--BlueMid);
}

</style>