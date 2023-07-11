import { reactive } from "vue";
import { io } from "socket.io-client";
import store from './store'

export const state = reactive({
  connected: false,
  updateClients: [],
  fooEvents: [],
  barEvents: []
});

// "undefined" means the URL will be computed from the `window.location` object
const URL = window.location.href.indexOf('localhost') == -1 ? undefined : "http://localhost:3000";

export const socket = io(URL, { transports: ["websocket", 'polling', 'flashsocket'] });



socket.on("connect", () => {
	console.log('Socket connected: ', socket.connected); // true
    var isAuth = store.getters['Login/isAuth'];
    var uuid = localStorage.getItem('socketUUID');
    // console.log('Lets see if isAuth is defined: ', isAuth);
    if(isAuth !== undefined && uuid !== undefined)
    {
        // console.log('Great, it is, lets emit it on the socket...');
        socket.emit('user_login_status', uuid, isAuth);
        socket.emit('app_version', localStorage.getItem('socketUUID'), process.env.PACKAGE_VERSION);
    }
});
  
socket.on("disconnect", () => {
	console.log('Socket connected: ',socket.connected); // false
});


socket.on('askForClientId', (uuid, replyToServer) => {
	// console.log('data received, uuid: ', uuid);

    var storedUUID = localStorage.getItem('socketUUID');
    if(storedUUID == null)
    {
        localStorage.setItem('socketUUID', uuid);
    }


	var clientId = localStorage.getItem('msgToken');
    var user = localStorage.getItem('user');
    var clientInfo = {
        clientId,
        employeeCode: user ? JSON.parse(user).employeeCode : null,
        uuid: storedUUID
    }
    if(clientId == null)
    {
        awaitClientId(replyToServer);
        return
    }
	replyToServer(clientInfo);
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

            
            localStorage.setItem('canUpdate', true);
            // see if there is a waiting service worker already
            navigator.serviceWorker.getRegistration().then(reg => {
                if (!reg || !reg.waiting) {
                    // no service worker waiting, so just refresh
                    store.dispatch('Control/checkingForUpdates', true);
                    window.location.reload();
                    return;
                }
                else if(reg.waiting)
                {
                    // store.dispatch('Control/checkingForUpdates', false);
                    localStorage.setItem('showUpdateMessage', true);
                    localStorage.setItem('canUpdate', false);
                    reg.waiting.postMessage({type: 'skipWaiting'});
                    window.location.reload();
                }
                
            
            })

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



function awaitClientId(replyToServer) {
    setTimeout(() => {
        var user = localStorage.getItem('user');
        var clientId = localStorage.getItem('msgToken');
        var clientInfo = {
            clientId,
            employeeCode: user ? JSON.parse(user).employeeCode : null,
            uuid: localStorage.getItem('socketUUID')
        }
        if(clientId == null)
        {
            awaitClientId(replyToServer);
            return
        }
        replyToServer(clientInfo);
    }, 3000);
}



export default socket;