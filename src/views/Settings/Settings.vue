<template>
    <div class="settings-wrap">

        <div class="loading-lightbox-wrap" v-if="loading">
            <font-awesome-icon class="loading-lightbox-icon" :icon="['fa','circle-notch']" size="lg" spin />
        </div>

        <button :disabled="!online" class="update-static-btn" @click="updateStaticResources()"><font-awesome-icon :icon="['fa', 'sync-alt']" size="lg" /> Sync App Data</button>
        

        <br><br>

        <!-- <button :disabled="!online" v-if="canReAuthenticate" class="register-biometrics-btn" @click="registerBiometrics()" ><font-awesome-icon :icon="['fa', 'fingerprint']" size="lg" /> Register Biometrics</button> -->

        <button :disabled="!online" @click="$router.push('/psw-reset')" ><font-awesome-icon :icon="['fa', 'key']" size="lg" /> Reset Password</button>

        <button v-if="availableUserRoles.includes(2)" @click="switchProfile()"><font-awesome-icon :icon="['fa', 'retweet']" size="lg" /> Switch to {{ userType === 1 ? 'Ops-Admin' : 'Tech' }}</button>

        <button :disabled="!online" @click="checkRefreshJobData()" class="refresh-jobs-btn"><span class="material-symbols-outlined">cloud_sync</span> Refresh Job Data</button>

        <button :disabled="!online" class="update-static-btn warning" @click="resetApp()"><font-awesome-icon :icon="['fa', 'sync-alt']" size="lg" /> Reset App Data</button>

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

            loading: false
        }
    },



    computed: {
        ...mapGetters({
            canReAuthenticate: ['StaticResources/canReAuthenticate'],
            online: ['StaticResources/online'],
            userType: ['UserRole/currentUserRole'],
            availableUserRoles: ['UserRole/availableRoles'],
            modal: ['Modal/modal']
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
    },




    methods: {


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

            console.log('Asking to reset...')


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

            console.log('Registering Device for Biometrics with user: ', user.employeeCode, ', user ID:', userId ,' and challenge: ', challenge);
            

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
    padding-top: 80px;
    display: flex;
    flex-direction: column;
    align-items: center;
}


.settings-wrap button {
    margin: 10px 0;
    width: max-content;
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

</style>