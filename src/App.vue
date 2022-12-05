<template>


	<Toast />
	<Modal />

	<Loading />

	<Menu :online="online" v-if="isAuth" />
	<QuickMenu v-if="isAuth" />

	<router-view class="page-fader" />

	<template v-if="!isPortrait && isMobile">
		<Landscape />
	</template>


</template>




<script>

import Menu from './components/Menu/Menu.vue'
import QuickMenu from './components/QuickMenu/QuickMenu.vue'
import Loading from './components/Loading/Loading.vue'
import Login from './components/Login/Login.vue'
import Toast from './components/Toast/Toast.vue'
import Modal from './components/Modal/Modal.vue'
import Landscape from './components/Landscape/Landscape.vue'
import { mapGetters } from 'vuex'


export default {


	components: {
		Menu, Login, Toast, Modal, QuickMenu, Loading, Landscape
	},


	data() {
		return {
			isMobile: false,
			isPortrait: false,
			backgroundSyncInterval: ''
		}
	},



	computed: {
		...mapGetters({
			isAuth: ['Login/isAuth'],
			callSyncTimeMin: ['Calls/callSyncTimeMin'],
            initBackgroundCallSync: ['StaticResources/initBackgroundCallSync'],
			modal: ['Modal/modal'],
			pendingCalls: ['Calls/incomingCalls'],
			online: ['StaticResources/online'],
			userType: ['UserRole/currentUserRole']
		})
	},




	watch: {
		initBackgroundCallSync: function() {
			// if(this.initBackgroundCallSync)
				// this.initBackgroundSync();
                
        },



		isAuth: function() {
            if(!this.isAuth)
                this.clearBackgroundSync();
        },



		modal: {
            handler: function() {
                if(this.modal.confirmAction === true && this.modal.actionFrom.indexOf('refresh_app_sw') !== -1)
                    this.refreshServiceWorker();                
            },
            deep: true
        }
	},





	created() {

		navigator.serviceWorker.getRegistration().then(reg => { this.listenForWaitingServiceWorker(reg, this.promptUserToRefresh), this.createUserCredential(reg) });
		navigator.serviceWorker.addEventListener('controllerchange', function() { window.location.reload() });

		

	},





	mounted() {


		// console.log('🍱: ' , window.location);

		

		// window.addEventListener('error', (event) => {
		// 	console.log('⛔ GLOBAL error event: ', event  );
		// })



		window.addEventListener('focus', async () => {
			if(this.isAuth && this.online && this.userType === 1)
			{
				console.log(this.$router.currentRoute._value.path);
				if(this.$router.currentRoute._value.path.indexOf('/call/') === -1)
				{
					await this.$store.dispatch('Calls/refreshTechnicianCalls');
					if(this.pendingCalls.length >= 1)
					{
						this.$store.dispatch('Calls/showActiveCalls', false);
					}
				}
			}
		})



		window.innerWidth <= 912 ? this.isMobile = true : this.isMobile = false;
		window.innerWidth > window.innerHeight + 100 ? this.isPortrait = false : this.isPortrait = true

		window.addEventListener('resize', () => {
			window.innerWidth <= 912 ? this.isMobile = true : this.isMobile = false;
			window.innerWidth > window.innerHeight + 100 ? this.isPortrait = false : this.isPortrait = true
		});


		// console.log('Mobile? ', this.isMobile, '  - is Portrait? ', this.isPortrait);


		// Check user is logged in on refresh/page load
		this.$store.dispatch('Login/checkLogin');


		setTimeout(() => {
			// Set initial state if false (true already set in vuex)
			if(!window.navigator.onLine)
				this.$store.dispatch('StaticResources/setOnline', false);
		}, 150);

		setTimeout(() => {
			// Check if we have a connection
			window.addEventListener('online', () => {
				this.$store.dispatch('StaticResources/setOnline', true);
			});
			window.addEventListener('offline', () => {
				this.$store.dispatch('StaticResources/setOnline', false);
			});
		}, 150);
		

		// Check if backgroundSyncInterval is running when user refreshes and is still logged in -> if not, turn it on
		// if(!this.backgroundSyncInterval && this.isAuth)
		// 	this.$store.dispatch('StaticResources/initBackgroundCallSync', true);

	},






	methods: {


		createUserCredential: async function(reg) {

			if(!this.isAuth) { return }

			var toast = {
				shown: false,
				type: 'warning', // ['info', 'warning', 'error', 'okay']
				heading: 'Re-Authentication not available', // (Optional)
				body: 'This device does not support biometrics', 
				time: 4500, // in milliseconds
				icon: ['fa', 'fingerprint'] // leave blank for default toast type icon
			}

			if (!window.PublicKeyCredential) 
			{
				this.$store.dispatch('StaticResources/canReAuthenticate', false);
				// this.$store.dispatch('Toast/toast', toast);
			}
			else
			{
				this.$store.dispatch('StaticResources/canReAuthenticate', true);
				console.log(window.PublicKeyCredential);
				toast.type = 'okay';
				toast.heading = 'Re-Authentication available on device';
				toast.body = 'If available, register biometrics under menu->settings';
				toast.time = 6000;
				// this.$store.dispatch('Toast/toast', toast);
			}



			
		},




		listenForWaitingServiceWorker: function (reg, callback) {

			function awaitStateChange() {
				reg.installing.addEventListener('statechange', function() {
					if (this.state === 'installed') callback(reg);
				});
			}

			if (!reg) return;
			if (reg.waiting) return callback(reg);
			if (reg.installing) awaitStateChange();
			reg.addEventListener('updatefound', awaitStateChange);

		},





		promptUserToRefresh: function(reg) {

			var modal = 
			{
				active: true, // true to show modal
				type: 'info', // ['info', 'warning', 'error', 'okay']
				icon: [], // Leave blank for no icon
				heading: 'App Update Available',
				body: 'There is updated software available for your App. Please update as soon as possible.',

				// Optional add on for when user needs to confirm or deny an action
				confirmAction: 'init',
				actionFrom: 'refresh_app_sw',
				resolveText: 'Update',
				rejectText: 'Cancel'
				
			}
			this.$store.dispatch('Modal/modal', modal);

		},





		refreshServiceWorker: function() {
			navigator.serviceWorker.getRegistration().then(reg => {
				reg.waiting.postMessage({type: 'skipWaiting'});
			})
		},









		initBackgroundSync: function() {
            // console.log('Background Sync Program running...');
            // if(!this.backgroundSyncInterval)
            // {
			// 	// Check login is still within a valid use time
            //     var time_stamp = JSON.parse(localStorage.getItem('time_stamp'));
            //     var loginTime = new Date(time_stamp);
            //     var now = new Date();
            //     var dif = (now.getTime() - loginTime.getTime()) / 1000;
            //     dif /= (60 * 60);

				
            //     if(dif <= 13)
            //     {
            //         // console.log('Registering background sync Interval...');
            //         this.backgroundSyncInterval = setInterval(() => {
			// 			this.checkBackgroundSyncHours();
            //             this.$store.dispatch('Calls/refreshTechnicianCalls', false);
            //         }, this.callSyncTimeMin * 60 * 1000);
            //     }
            // }
        },





		checkBackgroundSyncHours: function() {
			// console.log('Checking background sync time of day...');
			var now = new Date();
			var hour = now.getHours();

			if(hour <= 5 || hour >= 21)
			{
				// console.log('Cancelling background sync because of time of day...')
				this.clearBackgroundSync();
			}
		},




        clearBackgroundSync: function() {
            // console.log('No longer running Background Sync...');
            // clearInterval(this.backgroundSyncInterval);
            // this.backgroundSyncInterval = '';
            // this.$store.dispatch('StaticResources/initBackgroundCallSync', false);
        }
		

	},






	beforeDestroy() {
        window.removeEventListener('online');
        window.removeEventListener('offline');
		window.removeEventListener('error');
		window.removeEventListener('focus');
    }


}
</script>




<style>
/*
z-index table:

under 100: standard app level components as assigned by html (usually no more than 10-20 levels) from parent to child (child is always higher than parent)
100   -   
200   - toggle switches
300
400
500     
600
700
800     -   Menus
900     -   Lightbox
1000    -   
1500    -   Modal, Toast
1800    -   Back to Portrait Orientation Warning

*/



:root {

	/* App Colors */
	--BlueDark: #0081AF;
	--BlueMid: #00ABE7;
	--BlueLight: #2DC7FF;
	--GunMetal: #2a3037;
	--Spunk: #FF9F1C;
	--BlueAlt: rgb(29, 97, 143);

	--PendingLight: rgb(255, 139, 30);
	--Pending: rgb(196, 99, 9);
	--PendingDark: rgb(94, 41, 17);
	--ReceivedLight: rgb(25, 255, 25);
	--Received: rgb(16, 141, 16);
	--ReceivedDark: rgb(11, 83, 11);
	--EnRouteLight: rgb(44, 255, 227);
	--EnRoute: rgb(25, 141, 126);
	--EnRouteDark: rgb(15, 85, 76);
	--AtSiteLight: rgb(101, 219, 255);
	--AtSite: rgb(36, 121, 173);
	--AtSiteDark: rgb(20, 68, 99);
	--LeftSiteLight: rgb(180, 180, 180);
	--LeftSite: rgb(70, 70, 70);
	--LeftSiteDark: rgb(20, 20, 20);
	--OnHoldLight: rgb(255, 103, 65);
	--OnHold: rgb(146, 57, 41);
	--OnHoldDark: rgb(71, 33, 24);


	/* Cronus v2.1 Blues */
	--MainBlue: rgb(32, 73, 102);
	--AppBG: rgb(41, 124, 179);
	--MidBlue: rgb(38, 78, 110);
	--LightBlue: rgb(28, 110, 168);
	--LighterBlue: rgb(40, 140, 212);
	--XLightBlue: rgb(83, 183, 255);
	--DarkBlue: rgb(12, 64, 97);
	--AltBlue: rgb(0, 110, 255);


	/* Standard Usage Colors */
	--OffWhite: rgb(240, 240, 240);
	--DarkGrey: rgb(50, 50, 50);
	--MidGrey: rgb(90, 90, 90);
	--LightGrey: rgb(210, 210, 210);

}


/* Orientation Rule */
/* @media screen and (min-width: 320px) and (max-width: 767px) and (orientation: landscape) {
  html {
    transform: rotate(-90deg);
    transform-origin: left top;
    width: 100vh;
    overflow-x: hidden;
    position: absolute;
    top: 100%;
    left: 0;
    height: 100vw;
  }
} */




* {
	margin: 0;
	padding: 0;
	box-sizing: border-box;
	font-family: 'Nunito', sans-serif;
	scroll-behavior: smooth;
	outline: none;
	-webkit-tap-highlight-color: transparent;
}




body {
	background: var(--BlueDark);
	text-align: center;
	color: white;
	margin-top: 50px;
	padding-bottom: 100px;
}



input, select {
	height: 35px;
	border: none;
	border-radius: 3px;
	background: rgba(255, 255, 255, 0.95);
}





button {
	padding: 8px 16px;
	border: none;
	border-radius: 3px;
	box-shadow: -4px 3px 8px 0 rgba(0, 0, 0, 0.2);
	background: var(--OffWhite);
	color: var(--BlueMid);
	font-weight: bold;
	font-size: 16px;
}



button:disabled {
	background: var(--LightGrey);
	color: rgba(180, 180, 180, 0.8);
}





@keyframes fade-in {
	0% {
		opacity: 0;
	}

	40% {
		opacity: 0;
	}

	100% {
		opacity: 1;
	}
}



.page-fader {
	animation: fade-in 200ms ease;
}






.bold {
	font-weight: 700;
}



.warning {
	color: rgb(230,0,0);
}



.small-text {
	font-size: 12px;
}








.loading-lightbox-wrap {
	z-index: 900;

	position: fixed;
	top: 0;
	left: 0;
	height: calc(100vh - 65px);
	width: 100vw;
	background: rgba(0, 0, 0, 0.65);

	display: flex;
	align-items: center;
	justify-content: center;
	padding-bottom: 100px;
}


.loading-lightbox-icon {
	font-size: 70px;
	color: rgb(12, 172, 221);
	transition: color 400ms;
}







.app-blocking-lightbox {
	z-index: 900;
	position: fixed;
	top: -120vh;
	left: 0;
	height: 100vh;
	width: 100vw;
	background: rgba(0, 0, 0, 0);
	transition: background 250ms ease;
}



.app-blocking-lightbox.active {
	top: 0;
	background: rgba(0, 0, 0, 0.65);
	transition: background 350ms ease;
}








.section-loading {
	position: absolute;
	width: 100%;
	min-height: 100%;
	background: rgba(0, 0, 0, 0.6);
}



.section-loading-icon {
	position: absolute;
	top: 0;
	bottom: 0;
	left: 0;
	right: 0;
	margin: auto;

	font-size: 50px;
	color: var(--BlueLight)
}















.toggle-selector-wrap {
	position: absolute;
	cursor: pointer;
}



.selection-toggle-switch {
	display: flex;
	align-items: center;
	/* justify-content: space-between; */
	border: 1px solid var(--BlueMid);
	border-radius: 3px;
	height: 35px;
	background: rgba(0, 0, 0, 0.075);
	color: #2d94cf;
	position: relative;
}




.selection-toggle-switch .span-wrap {
	display: flex;
	align-items: center;
	justify-content: center;
	width: 100%;

}


.selection-toggle-switch span {
	width: max-content;
	height: 100%;
	display: flex;
	align-items: center;
	justify-content: space-around;
	transition: color 250ms ease;
	z-index: 201;
}


.selection-toggle-switch span.active {
	color: white;
	transition: color 250ms ease;
}


.selection-toggle-switch .selector-icon {
	margin-right: 5px;
	margin-bottom: 1px;
	font-size: 22px;
	transition: color 120ms ease;
}


.selection-toggle-switch .selector-icon.material {
	margin-right: 5px;
	margin-bottom: 1px;
	font-size: 25px;
}




.toggle-slider {
	position: absolute;
	width: 50%;
	left: 0;
	height: 35px;

	transition: left 250ms ease;
	background: var(--BlueMid);
	z-index: 200;
}

.toggle-slider.left {
	left: 0;
	transition: left 250ms ease;
}

.toggle-slider.right {
	left: 50%;
	transition: left 250ms ease;
}















.custom-scroller::-webkit-scrollbar {
	width: 7px;
}

.custom-scroller::-webkit-scrollbar-track {
	background: rgba(97, 97, 97, 0.95);
}

.custom-scroller::-webkit-scrollbar-thumb {
	background: rgba(46, 168, 255, 0.562);
}

.custom-scroller::-webkit-scrollbar-thumb:hover {
	background: #555;
}































/* Font Face Rules */


/* nunito-200 - latin */
@font-face {
	font-family: 'Nunito';
	font-style: normal;
	font-weight: 200;
	src: url('./fonts/nunito-v16-latin-200.eot');
	/* IE9 Compat Modes */
	src: local(''),
		url('./fonts/nunito-v16-latin-200.eot?#iefix') format('embedded-opentype'),
		/* IE6-IE8 */
		url('./fonts/nunito-v16-latin-200.woff2') format('woff2'),
		/* Super Modern Browsers */
		url('./fonts/nunito-v16-latin-200.woff') format('woff'),
		/* Modern Browsers */
		url('./fonts/nunito-v16-latin-200.ttf') format('truetype'),
		/* Safari, Android, iOS */
		url('./fonts/nunito-v16-latin-200.svg#Nunito') format('svg');
	/* Legacy iOS */
}


/* nunito-regular - latin */
@font-face {
	font-family: 'Nunito';
	font-style: normal;
	font-weight: 400;
	src: url('./fonts/nunito-v16-latin-regular.eot');
	/* IE9 Compat Modes */
	src: local(''),
		url('./fonts/nunito-v16-latin-regular.eot?#iefix') format('embedded-opentype'),
		/* IE6-IE8 */
		url('./fonts/nunito-v16-latin-regular.woff2') format('woff2'),
		/* Super Modern Browsers */
		url('./fonts/nunito-v16-latin-regular.woff') format('woff'),
		/* Modern Browsers */
		url('./fonts/nunito-v16-latin-regular.ttf') format('truetype'),
		/* Safari, Android, iOS */
		url('./fonts/nunito-v16-latin-regular.svg#Nunito') format('svg');
	/* Legacy iOS */
}


/* nunito-700 - latin */
@font-face {
	font-family: 'Nunito';
	font-style: normal;
	font-weight: 700;
	src: url('./fonts/nunito-v16-latin-700.eot');
	/* IE9 Compat Modes */
	src: local(''),
		url('./fonts/nunito-v16-latin-700.eot?#iefix') format('embedded-opentype'),
		/* IE6-IE8 */
		url('./fonts/nunito-v16-latin-700.woff2') format('woff2'),
		/* Super Modern Browsers */
		url('./fonts/nunito-v16-latin-700.woff') format('woff'),
		/* Modern Browsers */
		url('./fonts/nunito-v16-latin-700.ttf') format('truetype'),
		/* Safari, Android, iOS */
		url('./fonts/nunito-v16-latin-700.svg#Nunito') format('svg');
	/* Legacy iOS */
}


/* nunito-900 - latin */
@font-face {
	font-family: 'Nunito';
	font-style: normal;
	font-weight: 900;
	src: url('./fonts/nunito-v16-latin-900.eot');
	/* IE9 Compat Modes */
	src: local(''),
		url('./fonts/nunito-v16-latin-900.eot?#iefix') format('embedded-opentype'),
		/* IE6-IE8 */
		url('./fonts/nunito-v16-latin-900.woff2') format('woff2'),
		/* Super Modern Browsers */
		url('./fonts/nunito-v16-latin-900.woff') format('woff'),
		/* Modern Browsers */
		url('./fonts/nunito-v16-latin-900.ttf') format('truetype'),
		/* Safari, Android, iOS */
		url('./fonts/nunito-v16-latin-900.svg#Nunito') format('svg');
	/* Legacy iOS */
}
</style>
