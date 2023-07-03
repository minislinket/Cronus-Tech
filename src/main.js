import { createApp } from 'vue'
import App from './App.vue'
import './registerServiceWorker'
import router from './router'
import store from './store'
import './fontAwesome'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import './FCMNotifications'
// import './socket_io'




const eventSource = new EventSource("http://localhost:3000/connect_sse");

eventSource.onerror = function (event) {
	eventSource.close();
}

eventSource.onmessage = function (event) {
    console.log('Caught SSE: ', event);

	if(event.data.indexOf('tempId: ') !== -1)
	{
		console.log('Init SSE msg with temp ID: ', event.data.split('tempId: ')[1]);
		replyWithMsgToken(event.data.split('tempId: ')[1]);
	}



	if(event.data == 'update')
	{
		window.location.reload();
		// messageApp('checkForUpdates', '', '', '');
	}

	if(event.data == 'heartbeat')
	{
		// messageApp('heartbeat', '', '', '');
        console.log('do doof');
	}


    
}



import axios from 'axios';


function replyWithMsgToken(tempId) {
	setTimeout(() => {
		var clientId = localStorage.getItem('msgToken');
		if(clientId == null)
		{
			replyWithMsgToken(tempId);
			return
		}
		console.log('Sending msgToken: ', {clientId: clientId});
		axios.post('http://localhost:3000/registerSSEClient', {clientId, tempId})
		.then(resp => {
			console.log(resp);
		})
		.catch(err => {
			console.log(err);
		})
	}, 5000);
}




createApp(App)
.use(store)
.use(router)
.component('font-awesome-icon', FontAwesomeIcon)
.mount('#app')
