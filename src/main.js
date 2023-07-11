import { createApp } from 'vue'
import App from './App.vue'
import './registerServiceWorker'
import router from './router'
import store from './store'
import './fontAwesome'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import './FCMNotifications'
import './socket_io'





// if ('serviceWorker' in navigator) {
// 	window.addEventListener('load', async function () {
// 		const registration = await navigator.serviceWorker.register('/service-worker.js');
// 		if (registration.waiting && registration.active) {
// 			// The page has been loaded when there's already a waiting and active SW.
// 			// This would happen if skipWaiting() isn't being called, and there are
// 			// still old tabs open.
// 			console.log('Please close all tabs to get updates.');
// 		} else {
// 			// updatefound is also fired for the very first install. ¯\_(ツ)_/¯
// 			registration.addEventListener('updatefound', () => {
// 				registration.installing.addEventListener('statechange', () => {
// 					if (event.target.state === 'installed') {
// 						if (registration.active) {
// 							// If there's already an active SW, and skipWaiting() is not
// 							// called in the SW, then the user needs to close all their
// 							// tabs before they'll get updates.
// 							console.log('Please close all tabs to get updates.');
// 						} else {
// 							// Otherwise, this newly installed SW will soon become the
// 							// active SW. Rather than explicitly wait for that to happen,
// 							// just show the initial "content is cached" message.
// 							console.log('Content is cached for the first time!');
// 						}
// 					}
// 				});
// 			});
// 		}
// 	});
// }




// const eventSource = new EventSource("http://localhost:3000/connect_sse");

// eventSource.onerror = function (event) {
// 	eventSource.close();
// }

// eventSource.onmessage = function (event) {
//     console.log('Caught SSE: ', event);

// 	if(event.data.indexOf('clientId: ') !== -1)
// 	{
// 		console.log('Init SSE msg with temp ID: ', event.data.split('clientId: ')[1]);
// 		replyWithMsgToken(event.data.split('clientId: ')[1]);
// 	}

// 	if(event.data == 'update')
// 	{
// 		window.location.reload();
// 		// messageApp('checkForUpdates', '', '', '');
// 	}
    
// }



// import axios from 'axios';


// function replyWithMsgToken(clientId) {
// 	setTimeout(() => {
// 		var msgToken = localStorage.getItem('msgToken');
// 		if(msgToken == null)
// 		{
// 			replyWithMsgToken(clientId);
// 			return
// 		}
// 		console.log('Sending msgToken: ', msgToken);
// 		axios.post('http://localhost:3000/registerSSEClient', {msgToken, clientId})
// 		.then(resp => {
// 			console.log(resp);
// 			if(resp.status == 200)
// 			{
// 				sendEmployeeCodeIfExists(msgToken);
// 			}
// 		})
// 		.catch(err => {
// 			console.log(err);
// 		})
// 	}, 5000);
// }




// function sendEmployeeCodeIfExists(msgToken) {
// 	var user = localStorage.getItem('user');
// 	if(user == null) { return }
// 	var employeeCode = JSON.parse(user).employeeCode;
// 	axios.post('http://localhost:3000/updateSSEClientCode', {msgToken, employeeCode})
// 	.then(response => {
// 		console.log(response);
// 	})
// 	.catch(err => {
// 		console.log(err);
// 	})
// }




createApp(App)
.use(store)
.use(router)
.component('font-awesome-icon', FontAwesomeIcon)
.mount('#app')
