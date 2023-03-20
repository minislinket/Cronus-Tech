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
			geoLocationInterval: ''
		}
	},



	computed: {
		...mapGetters({
			isAuth: ['Login/isAuth'],
			callSyncTimeMin: ['Calls/callSyncTimeMin'],
			modal: ['Modal/modal'],
			pendingCalls: ['Calls/pendingCalls'],
			online: ['StaticResources/online'],
			userType: ['UserRole/currentUserRole'],
			geoLocationUpdateTimeMinutes: ['GeoLocation/geoLocationUpdateTimeMinutes'],
			stopGeoLocationService: ['GeoLocation/stopGeoLocationService'],
			startGeoLocationService: ['GeoLocation/startGeoLocationService']
		})
	},




	watch: {
		



		isAuth: function() {
            
        },



		modal: {
            handler: function() {
                if(this.modal.confirmAction === true && this.modal.actionFrom.indexOf('refresh_app_sw') !== -1)
                    this.refreshServiceWorker();                
            },
            deep: true
        },


		online: {
			handler: function() {
				if(this.online === true)
					this.checkSWBackgroundSyncStore()
			},
			deep: true,
		},


		stopGeoLocationService: {
			handler: function() {
				// this.stopGeoLocationService == true ? this.stopGeoLocation() : null;
			},
			deep: true,
		},

		startGeoLocationService: {
			handler: function() {
				// this.startGeoLocationService == true ? this.startGeoLocation() : null;
			},
			deep: true,
		},
	},





	created() {

		navigator.serviceWorker.getRegistration().then(reg => { this.listenForWaitingServiceWorker(reg, this.promptUserToRefresh) }); /* , this.createUserCredential(reg) */
		navigator.serviceWorker.addEventListener('controllerchange', function() { window.location.reload() });

	},





	mounted() {

		this.checkCallSyncStoreBackup();


		// Check if Geo Location Service is available and start it up
		if(navigator.geolocation) 
            {
				console.log('Geo Location is available...');
                // this.startGeoLocation();
            } 
            else 
            {
                console.log('Geo Location not supported by browser');
				this.stopGeoLocation();
            }
		

		// var user_type = localStorage.getItem('user_type');
		// if(user_type)
		// {
		// 	this.$store.dispatch('UserRole/setUserRole', user_type);
		// }


		// console.log('🍱: ' , window.location);

		

		// window.addEventListener('error', (event) => {
		// 	console.log('⛔ GLOBAL error event: ', event  );
		// })



		window.addEventListener('focus', async () => {
			if(this.isAuth && this.online && this.userType === 1)
			{
				this.checkSWBackgroundSyncStore()
				// console.log(this.$router.currentRoute._value.path);
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
		

	},






	methods: {



		startGeoLocation: function() {

			console.log('Starting Geo Location Service...');

			// Incase an interval is already setup, clear it and start again
			if(this.geoLocationInterval)
			{
				clearInterval(this.geoLocationInterval);
			}

			// Get initial location
			this.$store.dispatch('GeoLocation/updateCurrentLocation');

			// Set an interval to get intermittent updates
			this.geoLocationInterval = setInterval(() => {
				this.$store.dispatch('GeoLocation/updateCurrentLocation');
			}, this.geoLocationUpdateTimeMinutes * 1000 * 60)
			
		},



		stopGeoLocation: function() {
			console.log('Stopping Geo Location Service...');
			clearInterval(this.geoLocationInterval);
		},






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







		checkCallSyncStoreBackup: function() {

			navigator.serviceWorker.getRegistration().then(reg => {

				// Check localStorage for a callSyncStore Backup and send it to the new SW if exists
				var callSyncStoreBackup = localStorage.getItem('callSyncStoreBackup');
				
				if(callSyncStoreBackup)
				{
					reg.active.postMessage({ type: 'restoreCallSyncStore', data: callSyncStoreBackup });
					localStorage.removeItem('callSyncStoreBackup');
				}
				
			})
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

			// Backup the current SW callSyncStore in localStorage as it will be wiped when new SW loads
			// Restore event triggers in Mounted Hook here in App
			console.log('Attempting to get SW callSyncStore...');
			
			reg.active.postMessage({ type: 'getCallSyncStore' });

		},





		refreshServiceWorker: function() {
			navigator.serviceWorker.getRegistration().then(reg => {
				reg.waiting.postMessage({type: 'skipWaiting'});
			})
		},




		checkSWBackgroundSyncStore: function() {
			navigator.serviceWorker.getRegistration().then(reg => {
				reg.active.postMessage({type: 'checkBackgroundSyncNetworkErrors'});
			})
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
100   	-   
200   	- 	toggle switches
300
400
500     - 	Component Modals
600
700		- 	Drop Downs
800     -   Menus
900     -   Lightbox
1000    -   
1500    -   Modal, Toast
1600	-	Lightbox over Modal/Toast
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
	--TransferredLight: rgb(198, 98, 255);
	--Transferred: rgb(129, 62, 167);
	--TransferredDark: rgb(52, 26, 62);
	--EnRouteLight: rgb(124, 255, 227);
	--EnRoute: rgb(38, 173, 150);
	--EnRouteDark: rgb(16, 74, 77);
	--ReroutedLight: rgb(255, 252, 62);
	--Rerouted: rgb(163, 154, 31);
	--ReroutedDark: rgb(77, 71, 9);
	--OnSiteLight: rgb(101, 211, 255);
	--OnSite: rgb(36, 121, 173);
	--OnSiteDark: rgb(14, 48, 71);
	--LeftSiteLight: rgb(75, 168, 255);
	--LeftSite: rgb(36, 86, 161);
	--LeftSiteDark: rgb(9, 32, 66);
	--ReturningLight: rgb(255, 186, 107);
	--Returning: rgb(214, 129, 0);
	--ReturningDark: rgb(82, 48, 9);
	--OnHoldLight: rgb(255, 40, 40);
	--OnHold: rgb(135, 30, 30);
	--OnHoldDark: rgb(70, 10, 10);
	--CompletedLight: rgb(85, 255, 127);
	--Completed: rgb(29, 117, 55);
	--CompletedDark: rgb(5, 56, 22);
	--ReceivedLight: rgb(187, 255, 61);
	--Received: rgb(142, 173, 32);
	--ReceivedDark: rgb(44, 53, 4);


	/* Cronus v2.1 Colors */
	--MainBlue: rgb(32, 73, 102);
	--AppBG: rgb(41, 124, 179);
	--MidBlue: rgb(38, 78, 110);
	--LightBlue: rgb(28, 110, 168);
	--LighterBlue: rgb(40, 140, 212);
	--XLightBlue: rgb(83, 183, 255);
	--DarkBlue: rgb(12, 64, 97);
	--AltBlue: rgb(0, 110, 255);
	--OpenCall: rgb(241, 186, 65);
	--AllocatedCall: rgb(0, 220, 255);
	--CancelledCall: rgb(200, 0, 0);
	--ClosedCall: rgb(58, 58, 58);
	--CompletedCall: rgb(23, 179, 23);
	--UnAllocatedCall: rgb(224, 115, 26);
	--CommentsLight: rgb(180, 115, 255);
	--Comments: rgb(105, 0, 224);
	--CommentsDark: rgb(62, 8, 122);


	/* Standard Usage Colors */
	--TextBlack: rgb(12, 13, 15);
	--OffWhite: rgb(240, 240, 240);
	--DarkGrey: rgb(50, 50, 50);
	--MidGrey: rgb(90, 90, 90);
	--LightGrey: rgb(210, 210, 210);
	--TextOnLightGrey: rgba(180, 180, 180, 0.8);
	--TransparentGrey: rgba(140,140,140,0.2);
	--TransparentBlack: rgba(5,5,5,0.1);
	--WarningRed: rgb(220,0,0);
	--WarningOrange: rgb(221, 137, 65);
	--OkayGreen: rgb(10, 160, 50);
	--BlockBorder: rgba(255,255,255,0.75);


	/* Color Changing Wheel */
	--One: rgb(103, 184, 209);
	--Two: rgb(100, 250, 212);
	--Three: rgb(136, 211, 255);
	--Four: rgb(100, 250, 212);
	--Five: rgb(95, 188, 250);
	--Six: rgb(100, 250, 212);

}




@keyframes rotate {
    from {
        transform: rotate(0deg);
    }
    to {
        transform: rotate(360deg);
    }
}


@keyframes color-change {
    0%{
        color: var(--One);
    }
    20%{
        color: var(--Two);
    }
    40%{
        color: var(--Three);
    }
    60%{
        color: var(--Four);
    }
    80%{
        color: var(--Five);
    }
    100%{
        color: var(--Six);
    }
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



input {
	padding-left: 10px;
}


input, select {
	height: 35px;
	border: none;
	border-radius: 3px;
	background: rgba(245, 245, 245, 0.95);
}

input:disabled, 
select:disabled {
	background: var(--LightGrey);
	color: var(--TextOnLightGrey);
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
	transition: all 250ms ease;
}



button:disabled {
	background: var(--LightGrey);
	color: var(--TextOnLightGrey);
	transition: all 250ms ease;
}




.material-btn {
	display: flex;
	align-items: center;
}


.material-btn span {
	margin-right: 5px;
}






.close-info-modal-btn {
	position: absolute;
	bottom: 15px;
	left: 0;
	right: 0;
	margin: 0 auto;
	width: max-content;
}








.heading-sort {
	display: flex;
	align-items: center;
}

.heading-sort-icon {
	margin-left: 5px;
	font-size: 12px;
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

.warning-orange {
	color: rgb(230, 111, 0);
}



.small-text {
	font-size: 12px;
}

.smaller-text {
	font-size: 10px;
}

.tiny-text {
	font-size: 8px;
}







.switch-user-type-btn {
	position: fixed;
	bottom: 80px;
	left: 0;
	right: 0;
	margin: 0 auto;
	width: max-content;
}




.loading-lightbox-section {
	position: absolute;
	top: 0;
	left: 0;
	height: 100%;
	width: 100%;
	display: flex;
	align-items: center;
	justify-content: center;
	background: rgba(0, 0, 0, 0.65);
}



.loading-lightbox-wrap {
	z-index: 900;

	position: fixed;
	top: 0;
	left: 0;
	height: calc(100vh - 60px);
	width: 100vw;
	background: rgba(0, 0, 0, 0.65);

	display: flex;
	align-items: center;
	justify-content: center;
	padding-bottom: 100px;
}



.loading-lightbox-wrap.on-top {
	z-index: 1600;
}


.loading-lightbox-wrap.with-cancel {
	flex-direction: column;
}


.loading-lightbox-icon {
	font-size: 70px;
	color: rgb(12, 172, 221);
	transition: color 400ms;
	animation: color-change 8000ms ease alternate-reverse infinite, rotate 2s linear infinite;
}


.loading-lightbox-wrap.with-cancel .loading-lightbox-icon {
	margin-bottom: 20px;
}



.loading-lightbox-wrap.with-cancel button {
	color: var(--WarningRed);
}








.app-blocking-lightbox,
.app-modal-lightbox {
	z-index: 900;
	position: fixed;
	top: -120vh;
	left: 0;
	height: 100vh;
	width: 100vw;
	background: rgba(0, 0, 0, 0);
	transition: background 250ms ease;
}

.app-blocking-lightbox {
	z-index: 1499;
}



.app-blocking-lightbox.active,
.app-modal-lightbox.active {
	top: 0;
	background: rgba(0, 0, 0, 0.65);
	transition: background 350ms ease;
}

.app-blocking-lightbox.active {

}





.app-modal-content {
	position: absolute;
	top: 0;
	bottom: 0;
	left: 0;
	right: 0;
	margin: auto;
	height: max-content;
	max-height: 60vh;
	width: 70vw;
	padding: 8px;
	border: 2px solid var(--BlockBorder);
	border-radius: 3px;
	background: var(--BlueAlt);
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

/* (Google) Material Icons - Outlined | Fill 1 | Weight 700 */
@font-face {
  font-family: 'Material Symbols Outlined';
  font-style: normal;
  src: url('./fonts/material-symbols.woff2') format('woff2');
}



.material-symbols-outlined {
  font-family: 'Material Symbols Outlined';
  font-weight: normal;
  font-style: normal;
  font-size: 24px;  /* Preferred icon size */
  display: inline-block;
  line-height: 1;
  text-transform: none;
  letter-spacing: normal;
  word-wrap: normal;
  white-space: nowrap;
  direction: ltr;
}



.material-symbols-outlined {
  font-variation-settings:
  'FILL' 1,
  'wght' 700,
  'GRAD' 0,
  'opsz' 48
}





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
