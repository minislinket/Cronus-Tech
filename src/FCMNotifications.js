import store from './store'
import router from './router'
import firebase from "firebase/app";
import "firebase/firebase-messaging";
import RouteFCM from './store/Modules/RouteFCM';






async function catchAndRouteMessage(title, body, data) {
	// console.log('Title: ', title);
	// console.log('Body: ', body);
	// console.log('Data: ', data);

	// Do not redirect "Call Update:" notifications...
	if(title && title.indexOf('Call Update:') !== -1) { return }



	store.dispatch('Loading/setLoading', true);
	console.log('Routing app based on message event: ', event.data);

	var routePayload = {
		title,
		body,
		data
	}
	var route = await store.dispatch('RouteFCM/getRoute', routePayload);
	console.log('We think we want to go to: ', route);
	if(route) 
	{
		// console.log(router.currentRoute._value.path, route);
		if(route === router.currentRoute._value.path)
		{
			store.dispatch('Calls/refreshTechnicianCalls');
			store.dispatch('Loading/setLoading', false);
			return
		}
		router.push(route);
	}
	store.dispatch('Loading/setLoading', false);
}




if (process.env.NODE_ENV === 'production') {


	store.dispatch('Login/loadingFirebaseToken', true);

	/*   if ('storage' in navigator && 'estimate' in navigator.storage) { 
	  navigator.storage.estimate() 
		.then(function(estimate){ 
			console.log(`Using ${estimate.usage} out of ${estimate.quota} bytes.`); 
		}); 
	} */






	Notification.requestPermission()
		.then((permission) => {
			if (permission === 'granted') {
				// console.log('Notification permission granted.');
				// getFCMToken();
			}
		})
		.catch((err) => {
			console.log(err);
		})



	// Listen for messages from the Service Worker
	if('serviceWorker' in navigator)
	{
		navigator.serviceWorker.addEventListener('message', async event => {
			// console.log('Message Received from sw: ', event);


			// Intercept Push Notification Clicks and redirect user to desired page
			if (event.data && event.data.type && event.data.type === 'FCM') 
			{
				await catchAndRouteMessage(event.data.title, event.data.body, event.data.data);
			}



			// Intercept PostMessages from the SW
			// if (event.data && event.data.type && event.data.type === 'updateCall') {
				

			// 	console.log('Call has been updated', event.data);
			// 	store.dispatch('Call/updateCall', event.data.data.syncStore.nextStatusId);
			// 	return
			// }



			// Listen for Foreground Push Notifications and show them using the Service Worker
			messaging.onMessage(async function (payload) {

				// console.log('Msg received while window was in foreground: ', payload);


				var title = payload && payload.notification && payload.notification.title ? payload.notification.title : 'Cronus Tech';
				var body = payload && payload.notification && payload.notification.body ? payload.notification.body : 'You have a notification from Cronus Tech';
				var data = payload.data ? payload.data : '';
				var queryBase = '';
				


				if(window.location.hostname === 'localhost')
					queryBase = 'http://127.0.0.1:8087/';
				else
					queryBase = 'https://dev.locksecure.co.za/cronus-tech/'

					

				const msgTitle = title;
				const msgOptions = {
					body: body,
					icon: queryBase + 'img/icons/android-chrome-maskable-192x192.png', // Test Server
					vibrate: [200, 100, 200, 100, 200, 100, 200],
					data: {
						type: 'FCM',
						title,
						body,
						data: payload.data
					}
				}


				await catchAndRouteMessage(title, body, data);


				// Show the Notification using the Service Worker
				navigator.serviceWorker.ready
				.then(function (serviceWorker) {
					serviceWorker.showNotification(msgTitle, msgOptions);
				})
			})
		})
	}








	// TODO: Replace the following with your app's Firebase project configuration
	// See: https://firebase.google.com/docs/web/learn-more#config-object
	const firebaseConfig = {
		apiKey: "AIzaSyDHWX85q8abA_JWstCMF-dh6KBXh6qWzJA",
		authDomain: "cronus-9b5c7.firebaseapp.com",
		projectId: "cronus-9b5c7",
		storageBucket: "cronus-9b5c7.appspot.com",
		messagingSenderId: "389452364454",
		appId: "1:389452364454:web:141cb993218b2b06e39267",
		measurementId: "G-PCP78HSTH5"
	};

	// Initialize Firebase
	firebase.initializeApp(firebaseConfig);


	// Initialize Firebase Cloud Messaging and get a reference to the service
	const messaging = firebase.messaging();

	var toast = {
		shown: false,
		type: 'warning', // ['info', 'warning', 'error', 'okay']
		heading: 'Messaging Registration Error', // (Optional)
		body: 'Please refresh the app.',
		time: 3500, // in milliseconds
		icon: '' // leave blank for default type icon
	}


	navigator.serviceWorker.ready
		.then(function (serviceWorker) {


			
			messaging.getToken({ vapidKey: 'BOHgZUNY-YqD6PiRcMNpxU_K1xhBzOhs6hkd_-tCoWKxCefyEM0iLwJG3RAoogFludrC0dt19VJguyPDRAd10ls', serviceWorkerRegistration: serviceWorker })
			.then((currentToken) => {
				if (currentToken) {
					// console.log('client token', currentToken)
					store.dispatch('Login/firebaseToken', currentToken);
					localStorage.setItem('msgToken', currentToken);
				} else {
					store.dispatch('Toast/toast', toast);
					console.log('No registration token available. Request permission to generate one.');
					localStorage.removeItem('msgToken', currentToken);
				}
				store.dispatch('Login/loadingFirebaseToken', false);
			}).catch((err) => {
				store.dispatch('Toast/toast', toast);
				console.log('An error occurred while retrieving token. ', err);
				store.dispatch('Login/loadingFirebaseToken', false);
				localStorage.removeItem('msgToken', currentToken);
			})







		})

}

