<template>
    <div class="settings-wrap">

        <div class="loading-lightbox-wrap" v-if="loading">
            <font-awesome-icon class="loading-lightbox-icon" :icon="['fa','circle-notch']" size="lg" spin />
        </div>

        <button :disabled="!online" class="update-static-btn" @click="updateStaticResources()"><font-awesome-icon :icon="['fa', 'sync-alt']" size="lg" /> Sync Background Data</button>
        <button :disabled="!online" class="refresh-jobs-btn" @click="refreshJobs()" ><font-awesome-icon :icon="['fa', 'clipboard-check']" size="lg" /> Refresh Jobs</button>

        <br><br>

        <button :disabled="!online" v-if="canReAuthenticate" class="register-biometrics-btn" @click="registerBiometrics()" ><font-awesome-icon :icon="['fa', 'fingerprint']" size="lg" /> Register Biometrics</button>

        <button :disabled="!online" class="refresh-jobs-btn" @click="$router.push('/psw-reset')" ><font-awesome-icon :icon="['fa', 'key']" size="lg" /> Reset Password</button>

        <button v-if="user.employeeCode === 'VAN027'" @click="switchProfile()"><font-awesome-icon :icon="['fa', 'retweet']" size="lg" /> Switch to {{ userType === 1 ? 'Ops-Admin' : 'Tech' }}</button>

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
            userType: ['UserRole/currentUserRole']
        })
    },




    methods: {



        switchProfile: function() {
            var switchTo = this.userType === 1 ? 100 : 1;
            this.$store.dispatch('UserRole/setUserRole', switchTo);
            console.log('SWitching to: ', switchTo);
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


        refreshJobs: async function() {
            this.loading = true;
            await this.$store.dispatch('Calls/refreshTechnicianCalls');
            this.loading = false;
            this.$router.push('/calls');
        }

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

</style>