self.__precacheManifest = [].concat(self.__precacheManifest || []);


workbox.setConfig({
	debug: true
});


workbox.precaching.precacheAndRoute(self.__precacheManifest, {});



// Register a workbox navigation route for Single Page Applications to always return index.html
// otherwise a url like cronus-tech/calls will fail when trying to load the cache (only index.html exists and handles navigation through JS).
workbox.routing.registerNavigationRoute(
	workbox.precaching.getCacheKeyForURL('/cronus-tech/index.html')
);







// SW Sync Store for Call update data
let callSyncStore = [];

// Listen for messages from the App
self.addEventListener('message', function (event) {
	// console.log('Message from app: ', event);



	// Call update event msgs show here
	if (event.data.type === 'updateCall') {
		var data = JSON.parse(event.data.data);
		var existingData = callSyncStore.filter(exData => exData.call.id.toString() === data.call.id.toString())[0];
		if(existingData)
		{
			existingData.nextStatusId = data.nextStatusId;
			// console.log('CallSyncStore data updated: ', callSyncStore);
			var syncId = 'updateCall_' + data.call.id;
			event.waitUntil(self.registration.sync.register(syncId));
			return 
		}
		callSyncStore.push(data);
		// console.log('Data added to callSyncStore: ', callSyncStore);
		var syncId = 'updateCall_' + data.call.id;
		event.waitUntil(self.registration.sync.register(syncId));
	}




	// Force new App data to load with user triggered event
	if(event.data.type === 'skipWaiting') { return skipWaiting() }





	
});




self.addEventListener('sync', function(event) {
	// console.log('Background sync event: ', event);
	if(event.tag.indexOf('updateCall_') !== -1)
	{
		var callId = event.tag.split('_')[1];
		var data = callSyncStore.filter(data => data.call.id.toString() === callId.toString())[0];
		event.waitUntil(updateCall(data)
		.then((resp) => {
			console.log('Call done updating, result: ', resp);

			// If the update succeeded remove the call from callSyncStore
			if(resp === true)
			{
				var index = callSyncStore.findIndex(exData => exData.call.id.toString() === data.call.id.toString());
				if(index)
				{
					callSyncStore.splice(index, 1);
				}
			}
			// Still deciding if we need to let the app know the call succeeded...
			// event.waitUntil(returnBackgroundSyncToApp(event, 'updateCall', 'Call ' + callSyncStore.call.id + ' Updated', '', {callSyncStore}));
		}));
	}


})




async function updateCall(data) {

	
	// console.log('Update call with: ', data);

	console.log('ServiceWorker Origin: ',self.location.origin);

	var queryBase = '';

	if(self.location.origin.indexOf('localhost') !== -1)
		queryBase = 'http://129.232.180.146/cronus/api/calls/';
	else
		queryBase = 'https://office.locksecure.co.za/cronus/api/calls/';

	

	return fetch(queryBase + data.call.id + '/techs?tech_status_id=' + data.nextStatusId + '&employee_code=' + data.user.employeeCode + '&call_id=' + data.call.id, {
		method: 'PUT',
		headers: {
			'Content-Type': 'application/json',
			'Authorization': 'Bearer: ' + data.signature
		} 
	})
	.then(function(resp) {
		if(resp.status === 200)
		{
			// console.log('Server seems to think we\'re good...');
			return true;
		}
		// console.log(resp);
	})
	.catch(function(err) {
		console.error('SW Fetch Error: ', err);
		console.error('SW Fetch error response: ', err.response);
	})
}








// async function fetchTechCalls(params, signature) {
// 	// console.log('At least this works...', params, signature);

// 	return fetch('https://office.locksecure.co.za/cronus/api/calls', {
// 		method: 'GET',
// 		params: params,
// 		headers: {
// 			'Content-Type': 'application/json',
// 			'Authorization': 'Bearer: ' + signature
// 		}
// 	})
// 	.then(function(resp) {
// 		if(resp.status === 200)
// 		{
// 			return resp.data;
// 		}
// 		else
// 		{
// 			return [];
// 		}
// 	})
// 	.catch(function(err) {
// 		console.error('SW Fetch Error: ', err);
// 		console.error('SW Fetch error response: ', err.response);
// 	})
	
// }







// Listen for Push Notification Clicks and send them to the App with postMessage()
self.addEventListener('notificationclick', function (event) {

	const notification = event.notification;
	console.log('Notification: ', notification);

	// FCM Message - Catch FCM Message Clicks, open/focus the App and pass data with postMessage() 
	if (notification.data.FCM_MSG) {

		const title = notification.title;
		const body = notification.body;
		const data = notification.data && notification.data.FCM_MSG && notification.data.FCM_MSG.data ? notification.data.FCM_MSG.data : notification.data.data;

		event.waitUntil(getClientAndPostMessage(event, 'FCM', notification, title, body, data));
	}

	// App Message - Catch Foreground messages from the App and display them
	if (notification.data.type === 'FCM') {

		// console.log('Foreground msg passed to sw: ', notification);
		// console.log('And just in case, here\'s the event too: ', event);
		var title = notification.title ? notification.title : 'Assign Message Title';
		var body = notification.body ? notification.body : 'Assign Message Body';
		var data = notification.data && notification.data.data ? notification.data.data : '';

		event.waitUntil(getClientAndPostMessage(event, 'FCM', notification, title, body, data));
	}


});



function returnBackgroundSyncToApp(event, type, title, body, data) {
	// Get the browser windowClient
	event.waitUntil(clients.claim());
	event.waitUntil(clients.matchAll({
		type: "window",
		includeUncontrolled: true
	})
	.then(function (clientList) {

		let client = null;

		for (var i = 0; i < clientList.length; i++) {
			var item = clientList[i];
			if (item.url) {
				client = item;
				break;
			}
		}


		if (client && 'navigate' in client) 
		{
			client.postMessage({
				type,
				title,
				body,
				data
			});

		}
	}))
}



function getClientAndPostMessage(event, type, notification, title, body, data) {
	// Get the browser windowClient
	event.waitUntil(clients.claim());
	event.waitUntil(clients.matchAll({
		type: "window",
		includeUncontrolled: true
	})
	.then(function (clientList) {

		let client = null;

		for (var i = 0; i < clientList.length; i++) {
			var item = clientList[i];
			if (item.url) {
				client = item;
				break;
			}
		}


		// If the user window/app is already open, but in the background or minimized
		if (client && 'navigate' in client) 
		{
			notification ? notification.close() : null;
			client.postMessage({
				type,
				title,
				body,
				data
			});
			client.focus();
		}

		// If the client's window/app is closed
		else 
		{
			notification ? notification.close() : null;
			clients.openWindow('/cronus-tech').then((client) => {
				if(client) 
				{
					client.postMessage({
						type,
						title,
						body,
						data
					});
				}
			})
		}



	}))
}





importScripts('https://www.gstatic.com/firebasejs/8.10.0/firebase-app.js');
importScripts('https://www.gstatic.com/firebasejs/8.10.0/firebase-messaging.js');

firebase.initializeApp({
	apiKey: "AIzaSyDHWX85q8abA_JWstCMF-dh6KBXh6qWzJA",
	authDomain: "cronus-9b5c7.firebaseapp.com",
	projectId: "cronus-9b5c7",
	storageBucket: "cronus-9b5c7.appspot.com",
	messagingSenderId: "389452364454",
	appId: "1:389452364454:web:141cb993218b2b06e39267",
	measurementId: "G-PCP78HSTH5"
});


// Retrieve an instance of Firebase Messaging so that it can handle background messages.
const messaging = firebase.messaging()

messaging.setBackgroundMessageHandler(function (payload) {
	console.log('[firebase-messaging-sw.js] Received background message ', payload);
	// Customize notification here
	const msgTitle = 'Cronus Tech Notification';
	const msgOptions = {
		body: 'You have a new notification from Cronus Tech...',
		icon: './img/icons/android-chrome-maskable-192x192.png',
		vibrate: [200, 100, 200, 100, 200, 100, 200],
		tag: 'Notification-example',
		data: {
			payload,
			url: '/'
		}
	}

	return self.registration.showNotification(notificationTitle, notificationOptions);
});