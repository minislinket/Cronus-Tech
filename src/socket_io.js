import { reactive } from "vue";
import { io } from "socket.io-client";
import store from './store'

export const socketState = reactive({
  connected: false,
  updateClients: [],
  fooEvents: [],
  barEvents: []
});

// "undefined" means the URL will be computed from the `window.location` object
const URL = window.location.href.indexOf('localhost') == -1 ? undefined : "http://localhost:3000/";

export const socket = io(URL, { transports: ["websocket", 'polling', 'flashsocket'] });



socket.on("connect", () => {
	console.log('Socket connected: ', socket.connected); // true
    var isAuth = store.getters['Login/isAuth'];
    var uuid = localStorage.getItem('socketUUID');
    // console.log('Lets see if isAuth is defined: ', isAuth);
    if(isAuth !== undefined && uuid !== undefined)
    {
        socket.emit('user_login_status', localStorage.getItem('socketUUID'), isAuth);
    }
});
  
socket.on("disconnect", () => {
	console.log('Socket connected: ',socket.connected); // false
});


socket.on('sendClientUUID', (uuid, replyToServer) => {
	// console.log('data received, uuid: ', uuid);

    var storedUUID = localStorage.getItem('socketUUID');
    if(storedUUID == null)
    {
        localStorage.setItem('socketUUID', uuid);
    }


	var msgToken = localStorage.getItem('msgToken');
    var user = localStorage.getItem('user');
    var clientInfo = {
        type: 'cronus-tech-app',
        msgToken,
        employeeCode: user ? JSON.parse(user).employeeCode : null,
        uuid: storedUUID
    }
    if(msgToken == null)
    {
        awaitMsgToken(replyToServer);
        return
    }
	replyToServer(clientInfo);
    var isAuth = store.getters['Login/isAuth'];
    socket.emit('user_login_status', localStorage.getItem('socketUUID'), isAuth);
})


// socket.on('update', data => {
//     console.log('data received: update', data);
//     if(data.priority && data.priority == 'urgent')
//     {
//         // localStorage.setItem('updating', true);
//         // store.dispatch('Control/init');
//         store.dispatch('Control/checkingForUpdates', true);
//         window.location.reload();
//     }
//     else if(data.priority && data.priority == 'high')
//     {

//     }
// })



socket.on('control', (data) => {
    console.log('Message from control: ', data);
    switch(data.type) {
        case 'update':

            

            if(data.priority == 'high')
            {
                localStorage.setItem('canUpdate', true);
                // see if there is a waiting service worker already
                navigator.serviceWorker.getRegistration().then(reg => {
                    if (!reg || !reg.waiting) {
                        // no service worker waiting, so just refresh
                        localStorage.setItem('checkingForUpdates', true);
                        store.dispatch('Control/checkingForUpdates', 'SocketIO - update high priority');
                        reg.update().then(res => {
                            // console.log('Result from calling update on sw: ', res)
                            // console.log('Our current sw: ', reg)
                            if(!reg.waiting && !reg.installing)
                            {
                                localStorage.setItem('checkingForUpdates', false);
                                store.dispatch('Control/checkingForUpdates', 'SocketIO - reg !waiting && !installing');
                                localStorage.setItem('canUpdate', false);
                            }
                        });
                        return;
                    }
                    else if(reg.waiting)
                    {
                        // Mark that we are not checking for updates, there is one available (reg.waiting)
                        localStorage.setItem('checkingForUpdates', false);
                        store.dispatch('Control/checkingForUpdates', 'SocketIO - reg waiting');

                        // Mark that we are installing the new update
                        localStorage.setItem('updating', true);
			            store.dispatch('Control/initUpdates');

                        // Show an update message after update is complete
                        localStorage.setItem('showUpdateMessage', true);
                        
                        // Stop the app from auto updating
                        localStorage.setItem('canUpdate', false);
                        
                        // Skip waiting on the sw and install the latest version
                        reg.waiting.postMessage({type: 'skipWaiting'});
                        // window.location.reload();
                    }
                })
            }
            else
            {
                localStorage.setItem('possibleUpdateAvailable', true);
                navigator.serviceWorker.getRegistration().then(reg => {
                    reg.update().then(res => {
                        if(reg.waiting)
                        {
                            store.dispatch('Settings/updateAvailable', true);
                        }
                    })
                })                
            }
            

            break

        case 'logout': 
            console.log('Logging out...');
            store.dispatch('Control/loggingOut', true);
            setTimeout(() => {
                store.dispatch('Control/loggingOut', false);
                store.dispatch('Login/logout');
            }, 4000);
            break

        case 'reset':
            console.log('Resetting app...');
            store.dispatch('Control/resettingApp', true);
            setTimeout(() => {
                store.dispatch('Login/resetApp');
                store.dispatch('Control/resettingApp', false); 
                window.location.reload();   
            }, 4100);
            
            break
        case 'sync':
            console.log('Syncing Job Data...');
            store.dispatch('Control/syncingJobData', true);
            setTimeout(() => {
                localStorage.removeItem('calls');
                store.dispatch('Control/syncingJobData', false);
                store.dispatch('Calls/refreshTechnicianCalls');
            }, 3000);
            
            break
        case 'enable':
            console.log('Enabling app...');
            break
        case 'disable':
            console.log('Disabling app...');
            break
    }
})



function awaitMsgToken(replyToServer) {
    setTimeout(() => {
        var user = localStorage.getItem('user');
        var msgToken = localStorage.getItem('msgToken');
        var clientInfo = {
            type: 'cronus-tech-app',
            msgToken,
            employeeCode: user ? JSON.parse(user).employeeCode : null,
            uuid: localStorage.getItem('socketUUID')
        }
        if(msgToken == null)
        {
            awaitMsgToken(replyToServer);
            return
        }
        replyToServer(clientInfo);
        var isAuth = store.getters['Login/isAuth'];
        socket.emit('user_login_status', localStorage.getItem('socketUUID'), isAuth);
    }, 3000);
}



export default socket;