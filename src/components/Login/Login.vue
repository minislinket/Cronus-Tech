<template>
    <div class="login-wrap">

        <div class="loading-lightbox-wrap" v-if="loading">
            <font-awesome-icon class="loading-lightbox-icon" :icon="['fa','circle-notch']" size="lg" spin />
        </div>


        <div class="login-heading-wrap">
            <div class="heading-logo-wrap">
                <img :src="logo" alt="cronus-tech-login-logo" class="cronus-tech-login-logo" />
                <h1>Cronus Tech</h1>
            </div>
            <h2>Login</h2>
        </div>


        <div class="login-input-wrap" :class="{ disabled : online === false }">


            <input type="text" :disabled="!firebaseToken || online === false" v-model="username" placeholder="Username" @input="username = username.toUpperCase()">

            <div class="psw-wrap">
                <input id="usr-psw" :disabled="!firebaseToken || online === false" style="margin-bottom: 20px;" type="password" v-model="password" placeholder="Password" @keypress.enter="loginUser()">
                <div class="psw-icon-wrap" v-if="online">
                    <font-awesome-icon v-if="!showPassword" @click="showPassword = true" class="show-hide-psw-icon" :icon="['fa', 'eye']" size="lg" />
                    <font-awesome-icon v-if="showPassword" @click="showPassword = false" class="show-hide-psw-icon" :icon="['fa', 'eye-slash']" size="lg" />
                </div>
            </div>

            <div class="login-btn-wrap">
                <button class="login-btn" :disabled="!firebaseToken || online === false" :class="{ disabled : !firebaseToken || online === false }" @click="loginUser()">Login</button>
                <font-awesome-icon v-if="loadingFirebaseToken" class="login-loading-icon" :icon="['fa', 'circle-notch']" size="lg" spin />
            </div>

        </div>



        <div class="offline-warning-wrap" v-if="!online">
            <h4 class="warning"><font-awesome-icon :icon="['fa', 'exclamation-triangle']" size="lg" /> <span>You are offline</span></h4>
            <p>You cannot login until you have an internet connection, please try again later.</p>
        </div>


        <font-awesome-icon v-if="!loading" @click="resetPassword()" class="reset-psw-icon" :icon="['fa', 'question-circle']" size="lg" />

    </div>
</template>



<script>
import { mapGetters } from 'vuex';
const crypto  = require('crypto');


export default {

    data() {
        return {
            logo: require("../../assets/logo.png"),
            username: "",
            password: "",
            showPassword: false
        };
    },


    computed: {
        ...mapGetters({
            online: ['StaticResources/online'],
            firebaseToken: ["Login/firebaseToken"],
            loadingFirebaseToken: ["Login/loadingFirebaseToken"],
            loading: ['Login/loading']
        })
    },


    watch: {
        showPassword: function () {
            var input = document.getElementById("usr-psw");
            if (this.showPassword)
                input.type = "text";
            else
                input.type = "password";
        },
    },




    mounted() {
        
    },




    methods: {


        canLoginUser: function () {
            if (this.username.length < 4) {
                var toast = {
                    shown: false,
                    type: "warning",
                    heading: "",
                    body: "Please enter a valid Username",
                    time: 2000,
                    icon: "" // leave blank for default type icon
                };
                this.$store.dispatch("Toast/toast", toast);
                return false;
            }
            if (this.password.length < 2) {
                var toast = {
                    shown: false,
                    type: "warning",
                    heading: "",
                    body: "Please enter a valid Password",
                    time: 2000,
                    icon: "" // leave blank for default type icon
                };
                this.$store.dispatch("Toast/toast", toast);
                return false;
            }
            return true;
        },


        loginUser: function () {
            if (!this.canLoginUser()) {
                return;
            }
            var payload = {
                user: this.username,
                pass: this.password
            };
            this.$store.dispatch("Login/loginUser", payload);
        },



        resetPassword: function() {
            console.log('Resetting user password, redirecting now...');
            this.$router.push('/psw-reset');
        }
    },
    
}
</script>



<style>

.fb-token{
    word-break: break-all;
}




.login-wrap {
    position: relative;
}


.login-wrap input {
    text-align: center;
}






.heading-logo-wrap {
    margin-top: -25px;
}



.cronus-tech-login-logo {
    width: 100px;
}



.login-heading-wrap {
    margin-bottom: 20px;
}


.login-heading-wrap h1 {
    margin-bottom: 15px;
    color: var(--Spunk);
}


.login-heading-wrap h2 {

}




.login-input-wrap {
    display: flex;
    flex-direction: column;
    align-items: center;
}


.login-input-wrap input {
    width: 70vw;
    margin-bottom: 10px;
    outline: none;
} 



.login-input-wrap.disabled input {
    pointer-events: none;
    background: rgb(120,120,120);
}







.psw-wrap {
    position: relative;
    display: flex;
    align-items: center;
}


.psw-wrap input {

}




.psw-icon-wrap {
    
    height: 35px;
    position: absolute;
    top: 46%;
    transform: translateY(-50%);
    right: 10px;
    
}



.psw-wrap .show-hide-psw-icon {
    
    color: var(--GunMetal);
}







.login-btn-wrap {
    /* display: flex;
    align-items: center; */
    position: relative;
}



.login-btn {
    
}

.login-btn.disabled {
    background: rgb(120,120,120);
    color: rgb(105,105,105);
}



.login-loading-icon {
    position: absolute;
    top: 0;
    bottom: 0;
    right: -30px;
    margin: auto 0;
}







.offline-warning-wrap {
    padding: 0 30px;
    margin-top: 20px;
}


.offline-warning-wrap h4 {
    display: flex;
    align-items: center;
    justify-content: center;
    flex-direction: column;
    font-size: 18px;
    margin-bottom: 5px;
}

.offline-warning-wrap h4 span {
    font-size: 20px;
}








.reset-psw-icon {
    position: fixed;;
    bottom: 20px;
    right: 20px;
    font-size: 24px;
}

</style>