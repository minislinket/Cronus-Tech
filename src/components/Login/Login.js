import { axiosMySQL, axiosOffice, axiosSSE } from '../../axios/axios'
import router from '../../router/index'
// import { socket } from '../../socket_io'
const crypto = require('crypto');

// initial state
const state = () => ({
    isAuth: false,
    signature: '',
    loadingFirebaseToken: false,
    firebaseToken: '',
    loading: false
})





// getters
const getters = {

    isAuth: (state) => {
        return state.isAuth;
    },


    signature: (state) => {
        return state.signature;
    },


    loadingFirebaseToken: (state) => {
        return state.loadingFirebaseToken;
    },


    firebaseToken: (state) => {
        return state.firebaseToken;
    },


    loading: (state) => {
        return state.loading;
    }

}





// actions
const actions = {


    loadingFirebaseToken({ commit }, toggle) {
        commit('loadingFirebaseToken', toggle);
    },


    firebaseToken({ commit }, token) {
        commit('firebaseToken', token);
    },


    loading({ commit }, toggle) {
        commit('loading', toggle);
    },


    checkLogin({ commit, dispatch, rootGetters }) {

        // console.log('Checking login...');

        const signature = JSON.parse(localStorage.getItem('signature'));
        const time_stamp = JSON.parse(localStorage.getItem('time_stamp'));

        if(signature && time_stamp) {

            var data = JSON.parse(Buffer.from(signature.split('.')[1], 'base64').toString());

            // Set available user roles in store
            var roles = data['cronus-roles'];
            if(roles && roles.length >= 1)
            {
                if(roles.includes(100) && !roles.includes(101))
                {
                    dispatch('UserRole/setAvailableRoles', [1, 2], { root: true });
                }
                else
                {
                    dispatch('UserRole/checkCurrentRole', null, { root: true });
                }


                if(roles.includes(101))
                {
                    dispatch('UserRole/setAvailableRoles', [1, 2, 3], { root: true });
                }
                else
                {
                    dispatch('UserRole/checkCurrentRole', null, { root: true });
                }
            }

            


            var now = new Date();
            var time = new Date(time_stamp); 
            var last_login = new Date(time.setHours(time.getHours()-14)); 
            var dif = (now.getTime() - last_login.getTime()) / 1000;
            dif /= (60 * 60);

            // console.log('Now: ', now, 'dif: ', dif, 'last login: ', last_login);

            if(dif >= 14 && dif <= 168) {

                dispatch('logout')

            } 
            
            else if(dif > 168)
            {
                dispatch('resetApp');
            } 
            
            else if(dif < 14) 
            {

                commit('isAuth', true);
                commit('signature', signature);
                axiosOffice.defaults.headers.common['Authorization'] = 'Bearer: ' + signature.toString();    

            }

            // console.log('User is still signed in...');
            
        } else if(!signature || !time_stamp) {

            // console.log('No signature or time_stamp found, logging user out...');
            dispatch('logout')

        }
    },  




    async loginUser({ commit, dispatch, state, rootGetters }, payload) {



        if(!window.navigator.onLine)
        {
            var modal = {
                active: true,
                heading: 'No Internet!',
                body:   '<p>There seems to be a problem with your internet connectivity.</p>'+
                        '<p>Please check your connection and try again.</p>',
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

            dispatch('Modal/showModal', modal, {root: true})

            return
        }





        dispatch('loading', true);

        // Destroy local copy of technician's calls/jobs so they have to be reloaded on every login
        // This ensures that the server remains the source of truth in case any app/server communications failed
        localStorage.removeItem('calls');

        

        var lastLink = JSON.parse(localStorage.getItem('last_link'));
        var external = false;

        if(lastLink)
        {
            external = true;
        }

        const hash = crypto.createHash('sha256').update(payload.pass).digest('base64');
        

        const json = {
            "username": payload.user,
            "password": hash,
            "firebaseTokenMobile": state.firebaseToken ? state.firebaseToken.toString() : ''
        }

        axiosOffice.post('authentication/login', json)
            .then(async resp => {
                // console.log(resp.data)

                if(resp.status === 200) {                   

                    // await dispatch('StaticResources/loadUserStaticPage', payload.user, { root: true });
                    var data = JSON.parse(Buffer.from(resp.data.signature.split('.')[1], 'base64').toString());
                    var time = new Date((data.exp * 1000));



                    var roles = data['cronus-roles'];
                    var employeeCode = data['sub'];
                    // console.log(roles);
                    if(roles && roles.length >= 1)
                    {
                        if(roles.includes(100) && !roles.includes(101))
                        {
                            // console.log('Roles only include 100')
                            dispatch('UserRole/setAvailableRoles', [1, 2], { root: true });
                        }
                        else
                        {
                            dispatch('UserRole/checkCurrentRole', null, { root: true });
                        }


                        if(roles.includes(101))
                        {
                            // console.log('Yay we have role 101')
                            dispatch('UserRole/setAvailableRoles', [1, 2, 3], { root: true });
                        }
                        else
                        {
                            dispatch('UserRole/checkCurrentRole', null, { root: true });
                        }
                    }

                    

                    
                    


                    localStorage.setItem('signature', JSON.stringify(resp.data.signature));
                    localStorage.setItem('time_stamp', JSON.stringify(time));

                    commit('signature', resp.data.signature);
                    axiosOffice.defaults.headers.common['Authorization'] = 'Bearer: ' + resp.data.signature.toString();



                    // dispatch('setUserDevice', employeeCode);

                    

                    // console.log('Started loading static resources...')
                    await dispatch('StaticResources/loadStaticResources', null, {root: true});
                    // console.log('Done loading static resources...')

                    commit('isAuth', true);
                    dispatch('loading', false);

                    var toast = {
                        shown: false,
                        type: 'okay', // ['info', 'warning', 'error', 'okay']
                        heading: 'Welcome', // (Optional)
                        body: 'Login successful', 
                        time: 2000, // in milliseconds
                        icon: '' // leave blank for default type icon
                    }
        
        
                    dispatch('Toast/toast', toast, {root: true})
                    
                    // console.log('Redirecting to Dashboard');
                    router.push('/dashboard');

                }

            })
            .catch(err => {
                console.error('axiosOffice error: ', err);
                console.error('axiosOffice error response: ',err.response);
                // console.log(err.i);

                commit('isAuth', false);
                dispatch('loading', false);

                if(err.response && err.response.data && err.response.data.message && err.response.data.message.indexOf('Incorrect username or password') !== -1)
                {
                    var toast = {
                        shown: false,
                        type: 'warning', // ['info', 'warning', 'error', 'okay']
                        heading: 'Username or Password Incorrect', // (Optional)
                        body: 'Please check them carefully', 
                        time: 3500, // in milliseconds
                        icon: '' // leave blank for default type icon
                    }
        
        
                    dispatch('Toast/toast', toast, {root: true})
                }
                else 
                {

                    var toast = {
                        shown: false,
                        type: 'error', // ['info', 'warning', 'error', 'okay']
                        heading: 'Server Error', // (Optional)
                        body: 'Cannot login at this time, please try again later', 
                        time: 2000, // in milliseconds
                        icon: '' // leave blank for default type icon
                    }
        
        
                    dispatch('Toast/toast', toast, {root: true})
                }
            })
    },






    setUserDevice({ state }, employeeCode) {

        var token = state.firebaseToken;
        // console.log('Got the token, registering device now...', token);

        var device = {
            firebaseToken: token,
            userAgent: navigator.userAgent,
            employeeCode,
            socketUUID: localStorage.getItem('socketUUID')
        }

        // console.log(device);

        // axiosSSE.post('updateSSEClientCode', {clientId: localStorage.getItem('msgToken'), employeeCode})
		// .then(resp => {
		// 	console.log(resp);
		// })
		// .catch(err => {
		// 	console.log(err);
		// })
        

        socket.emit('add_user_employee_code', {clientId: localStorage.getItem('msgToken'), employeeCode});

        axiosMySQL.post('user/device.php', device)
        .then(resp => {
            console.log(resp);
        })
        .catch(err => {
            console.error('Axios MySQL Error: ', err);
            console.error('Axios MySQL Error Response: ', err.response);
        })
    },





    logout({ commit, dispatch }) {

        var clearThese = ['signature', 'user', 'time_stamp', 'calls', 'employees', 'user_type', 'msgToken'];
        clearThese.map(item => {
            localStorage.removeItem(item);
        });
        commit('isAuth', false);
        router.push('/')

    },




    resetApp({ commit }) {
        var msgToken = localStorage.getItem('msgToken');
        // var socketUUID = localStorage.getItem('socketUUID');
        localStorage.clear();
        localStorage.setItem('msgToken', msgToken);
        // localStorage.setItem('socketUUID', socketUUID);
        commit('isAuth', false);
        router.push('/');

    }

}





// mutations
const mutations = {

    loading(state, toggle) {
        state.loading = toggle;    
    },


    isAuth(state, toggle) {
        state.isAuth = toggle;
    },


    signature(state, signature) {
        state.signature = signature;
    },


    loadingFirebaseToken(state, toggle) {
        state.loadingFirebaseToken = toggle;
    },


    firebaseToken(state, token) {
        state.firebaseToken = token;
    }

}





export default {
    namespaced: true,
    state,
    getters,
    actions,
    mutations
}