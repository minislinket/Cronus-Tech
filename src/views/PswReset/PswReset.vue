<template>

    <div class="psw-reset-wrap">

        <div class="loading-lightbox-wrap" v-if="loading">
            <font-awesome-icon class="loading-lightbox-icon" :icon="['fa','circle-notch']" size="lg" spin />
        </div>
        
        <h4>Username</h4>
        <input type="text" v-model="user.username" @input="user.username = user.username.toUpperCase()">

        <h4>Branch</h4>
        <select v-model="user.branch">
            <option v-for="branch in branches" :key="branch" :value="branch">{{ branch }}</option>
        </select>


        <h4>ID Number</h4>
        <input type="text" v-model="user.idNumber">


    
        <h4>New Password</h4>
        <div class="new-password-wrap">
            <div class="pwd-input-wrap">
                <input id="usr-psw" type="password" v-model="user.newPassword">
                <div class="passw-icon-wrap">
                    <font-awesome-icon v-if="!showPassword" @click="showPassword = true" class="show-hide-passw-icon" :icon="['fa', 'eye']" size="lg" />
                    <font-awesome-icon v-if="showPassword" @click="showPassword = false" class="show-hide-passw-icon" :icon="['fa', 'eye-slash']" size="lg" />
                </div>
            </div>
        </div>


        <button @click="setNewPassword()"><font-awesome-icon :icon="['fa', 'user-lock']" size="lg" /> Reset Password</button>


        <button v-if="!isAuth" class="back-to-login-btn" @click="$router.push('/')"><font-awesome-icon :icon="['fa', 'angle-left']" size="lg" /> Back to Login</button>
    </div>

</template>




<script>
import { mapGetters } from 'vuex';

const crypto = require('crypto');
import { axiosOffice } from '../../axios/axios';


export default {

    data() {
        return {
            loading: false,
            showPassword: false,

            user: {
                username: '',
                branch: '',
                idNumber: '',
                newPassword: '',
                date: '',
                hash: ''
            },


            branches: ['Eastern Cape', 'Gauteng', 'KZN', 'Limpopo', 'National', 'Free State', 'Western Cape']
        }
    },




    computed: {
        ...mapGetters({
            isAuth: ['Login/isAuth']
        })
    },




    watch: {
        showPassword: function() {
            var input = document.getElementById('usr-psw');
            if(this.showPassword)   
                input.type = 'text';
            else
                input.type = 'password';
        },
    },



    mounted() {

    },




    methods: {
        makeHash: function(string) {
            const hash = crypto.createHash('sha256').update(string).digest('base64');
            return hash;
        },
        
        




        canResetPassword: function() {

            // console.log('Checking if we can reset the user\'s password...');

            var flag = true;
            var toast = {
                shown: false,
                type: "warning",
                heading: "",
                body: "Please enter a valid Username",
                time: 2000,
                icon: "" // leave blank for default type icon
            };

            

            if(this.user.username.length <= 3)
            {
                toast.heading = 'Please enter your Username';
                toast.body = '';
                this.$store.dispatch('Toast/toast', toast, {root: true});
                flag = false;
                return flag;
            }


            if(!this.user.branch)
            {
                toast.heading = 'Please select a branch';
                toast.body = '';
                this.$store.dispatch('Toast/toast', toast, {root: true});
                flag = false;
                return flag;
            }


            if(this.user.idNumber.length !== 13)
            {
                toast.heading = 'Please enter a valid ID Number';
                toast.body = '';
                this.$store.dispatch('Toast/toast', toast, {root: true});
                flag = false;
                return flag;
            }


            if(this.user.newPassword.length <= 5)
            {
                toast.heading = 'Please make your password 6 characters or longer.';
                toast.body = '';
                toast.time = 3000;
                this.$store.dispatch('Toast/toast', toast, {root: true});
                flag = false;
                return flag;
            }

            return flag;
        },






        setNewPassword: async function() {

            if(!this.canResetPassword()) { return }

            this.loading = true;

            const string = this.user.username.replace(/\s/g, '') + this.user.branch.replace(/\s/g, '') + this.user.idNumber.toString().replace(/\s/g, '') + new Date().toISOString().split('T')[0];
            const hash = this.makeHash(string);
            const passHash = this.makeHash(this.user.newPassword);
            // console.log('Applying hash from JS: ', hash);


            const body = {
                username: this.user.username,
                newPassword: passHash,
                resetHash: hash
            }


            axiosOffice.post('authentication/login/reset', body)
            .then(resp => {
                // console.log(resp)
                if(resp.status === 200)
                {
                    var toast = {
                        shown: false,
                        type: "okay",
                        heading: "Password set successfully",
                        body: "",
                        time: 2000,
                        icon: "" // leave blank for default type icon
                    };
        
                    this.$store.dispatch('Toast/toast', toast, {root: true});
                    this.isAuth ? this.$router.push('/settings') : this.$router.push('/');
                }
                this.loading = false;
            })
            .catch(err => {
                console.error('Axios Office error: ', err);
                console.error('Axios Office error response: ', err.response);
                this.loading = false;

                if(err.response && err.response.data && err.response.data.message && err.response.data.message.indexOf('Information supplied does not match our records. Please contact an admin or try again.') !== -1)
                {
                    var modal = {
                        active: true,
                        warning: true,
                        heading: 'No Match Found',
                        body:   '<p>Our records do match the information you supplied, please try again or contact an administrator.</p>',
                        action: {
                            active: false,
                            negative: 'No',
                            affirmative: 'Yes',
                            confirmed: 'reset'
                        },
                        button: 'Okay',
                        dataAssoc: '',
                        data: ''
                    }

                    this.$store.dispatch('Modal/showModal', modal, {root: true});
                    return
                }

                var toast = {
                    active: true,
                    heading: 'Server Error',
                    body: 'Could not set user password',
                    time: 4000,
                    error: true
                }
    
                this.$store.dispatch('Toast/showToast', toast, {root: true});
            })

            
        }
    }

}

</script>




<style>



.psw-reset-wrap {
    margin-top: 80px;
}



.psw-reset-wrap input {
    width: 50vw;
    margin-bottom: 10px;
    text-align: center;
}


.psw-reset-wrap select {
    padding: 10px;
    margin-bottom: 10px;
}



.new-password-wrap {
    display: flex;
    justify-content: center;
    margin-bottom: 65px;
}

.new-password-wrap h4 {
    margin-top: 0;
}




.new-password-wrap .pwd-input-wrap {
    position: relative;
    display: flex;
    align-items: center;
    width: max-content;
}



.new-password-wrap .passw-icon-wrap {
    height: 35px;
    position: absolute;
    top: 16%;
    right: 10px;
    
}


.new-password-wrap .show-hide-passw-icon {
    
    color: var(--DarkGrey);
}





.back-to-login-btn {
    position: fixed;
    bottom: 30px;
    left: 0;
    right: 0;
    margin: 0 auto;
    width: max-content;
}

</style>