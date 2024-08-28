import { axiosOffice } from "../../../axios/axios";
import router from "../../../router";
import { socket } from "../../../socket_io";

// initial state
const state = () => ({

    loading: false,

    customerStore: '',
    customerAccount: '',
    previousCall: '',
    openCalls: [],
    lastFiveStoreCalls: [],

    canSubmitCall: false,
    newCall: '',
    resetTextInput: false,

    callCombineModal: false,
    callsToCombine: []
})





// getters
const getters = {

    loading: (state) => {
        return state.loading;
    },


    customerStore: (state) => {
        return state.customerStore;
    },

    customerAccount: (state) => {
        return state.customerAccount;
    },


    previousCall: (state) => {
        return state.previousCall;
    },

    openCalls: (state) => {
        return state.openCalls;
    },

    canSubmitCall: (state) => {
        return state.canSubmitCall;
    },


    resetTextInput: (state) => {
        return state.resetTextInput;
    },



    callCombineModal: (state) => {
        return state.callCombineModal;
    },


    callsToCombine: (state) => {
        return state.callsToCombine;
    }
}





// actions
const actions = {


    cancelCombineCall({ dispatch, commit }) {
        dispatch('callCombineModal', false);
        commit('callsToCombine', []);
    },


    canSubmitCall({ commit }, toggle) {
        commit('canSubmitCall', toggle);
    },



    loading({ commit }, toggle) {
        commit('loading', toggle);
    },



    resetAddCall({ commit }) {
        commit('resetAddCall');
    },



    setNewCall({ commit }, call) {
        commit('setNewCall', call);
    },




    async selectCustomerStore({ dispatch, commit }, customerStore) {
        commit('resetAddCall');
        dispatch('loading', true);
        commit('selectCustomerStore', customerStore);
        dispatch('assignCustomerAccount');
        await dispatch('getPreviousCall');
        await dispatch('getStoreOpenCalls')
        dispatch('loading', false);
    },



    assignCustomerAccount({ commit, state }, customerAccountId) {
        var customer_accounts = JSON.parse(localStorage.getItem('customer_accounts'));
        var account = customer_accounts.filter(acc => acc.id === state.customerStore.customerAccountId)[0];

        if(account)
            commit('assignCustomerAccount', account);
    },


    async getPreviousCall({ commit, state }) {

        var params = {
            customer_store_id: state.customerStore.id,
            search_limit: 5
        }


        await axiosOffice.get('calls', {
            params: params
        })
        .then(resp => {
            console.log(resp);
            if(resp.status == 200 && resp.data.length >= 1) 
            {
                resp.data.sort((a,b) => {
                    return new Date(b.openTime) - new Date(a.openTime);
                })
                commit('lastFiveStoreCalls', resp.data && resp.data.length >= 1 ? resp.data : []);
                commit('previousCall', resp.data[0] ? resp.data[0] : '')
            }

        })
        .catch(err => {
            console.error('Axios Office Error: ', err);
            console.error('Axios Office Error Response: ', err.response);
            var toast = {
                shown: false,
                type: "warning",
                heading: "Could not load Calls",
                body: "Unable to load previous calls for: " + state.customerStore.name,
                time: 5000,
                icon: "" // leave blank for default type icon
            };
            dispatch("Toast/toast", toast, { root: true });
        })
    },





    async getStoreOpenCalls({ commit, state }) {
        var params = {
            customer_store_id: state.customerStore.id,
            call_status_id: 1
        }


        await axiosOffice.get('calls', {
            params: params
        })
        .then(resp => {
            console.log(resp);
            if(resp.status == 200 && resp.data.length >= 1) 
            {
                resp.data.sort((a,b) => {
                    return new Date(b.openTime) - new Date(a.openTime);
                })
                // commit('lastFiveStoreCalls', resp.data && resp.data.length >= 1 ? resp.data : []);
                commit('openCalls', resp.data)
            }

        })
        .catch(err => {
            console.error('Axios Office Error: ', err);
            console.error('Axios Office Error Response: ', err.response);
            var toast = {
                shown: false,
                type: "warning",
                heading: "Could not load Calls",
                body: "Unable to load open calls for: " + state.customerStore.name,
                time: 5000,
                icon: "" // leave blank for default type icon
            };
            dispatch("Toast/toast", toast, { root: true });
        })
    },




    combineCall({ dispatch, commit, state }, call) {
        dispatch('loading', true);
        dispatch('callCombineModal', false);

        var callTypes = JSON.parse(localStorage.getItem('call_types'));
        var callSubTypes = JSON.parse(localStorage.getItem('call_sub_types'));

        var callTypeName = callTypes.filter(type => type.id === state.newCall.callTypeId)[0].name;
        var callSubTypeName = callSubTypes.filter(type => type.id === state.newCall.callSubTypeId)[0].name;

        var callDetails =     'Caller: ' + state.newCall.callerName + ', Number: ' + state.newCall.contactNumber + '\n'
                            + 'Type: ' + callTypeName + ', Sub Type: ' + callSubTypeName + '\n'
                            + 'Detail: ' + state.newCall.callDetails;

        var call = {
            "id": call.id,
            "customerStoreId": call.customerStoreId,
            "openTime": call.openTime,
            "closeTime": call.closeTime,
            "callTypeId": call.callTypeId,
            "callSubTypeId": call.callSubTypeId,
            "callStatusId": call.callStatusId,
            "operatorEmployeeCode": call.operatorEmployeeCode,
            "managingBranchId": call.managingBranchId,
            "callDetails": callDetails,
            "callerName": call.callerName,
            "contactNumber": call.contactNumber,
            "orderNumber": call.orderNumber,
            "recallJobCardId": call.recallJobCardId,
            "siteReady": call.siteReady,
            "siteReadyDate": call.siteReadyDate
        }

        console.log('Combining call: ', call);

        axiosOffice.put('calls/' + call.id, call)
        .then(resp => {
            console.log(resp);
            if(resp.status == 200) 
            {
                var toast = {
                    shown: false,
                    type: "success",
                    heading: "Call Combined",
                    body: "Call combined successfully",
                    time: 5000,
                    icon: "" // leave blank for default type icon
                };
                dispatch("Toast/toast", toast, { root: true });

                var data = JSON.parse(JSON.stringify(resp.data));
                commit('resetTextInput');
                dispatch('resetAddCall');
                router.push('/allocate_tech');
                dispatch('AllocateTech/processCall', data, { root: true });
                
                
                
            }
        })
        .catch(err => {
            console.error('Axios Office Error: ', err);
            console.error('Axios Office Error Response: ', err.response);
            var toast = {
                shown: false,
                type: "error",
                heading: "Could not Combine Calls",
                body: "Unable to combine calls for: " + state.customerStore.name,
                time: 5000,
                icon: "" // leave blank for default type icon
            };
            dispatch("Toast/toast", toast, { root: true });
        })
    },




    callCombineModal({ commit }, toggle) {
        commit('callCombineModal', toggle);
    },



    callsToCombine({ commit }, calls) {
        commit('callsToCombine', calls);
    },





    checkSubmitCall({ state, dispatch, commit }, call) {
        dispatch('loading', true);

        console.log('submitting call: ', state.newCall)

        var openCall = state.lastFiveStoreCalls.filter(call => call.callStatusId === 1);
        if(state.lastFiveStoreCalls.length >= 1 && openCall)
        {
            
            var modal = {
                active: true, // true to show modal
                type: 'warning', // ['info', 'warning', 'error', 'okay']
                icon: ['fa', 'exclamation-triangle'], // Leave blank for no icon
                heading: 'Open Call',
                body: '<p>' + state.customerStore.name + ' already has Open Calls.<br></p><p>Would you like to combine your new Call with one of the Open Calls?',
                confirmAction: 'init',
                actionFrom: 'checkSubmitNewCall',
                resolveText: 'Yes',
                rejectText: 'No'
            }

            dispatch('loading', false);
            dispatch('Modal/modal', modal, { root: true });
        }
        else
        {
            dispatch('submitCall', call);
        }
    },  





    async submitCall({ state, dispatch, commit }, call) {

        dispatch('loading', true);

        var user = JSON.parse(localStorage.getItem('user'));
        
        console.log('Submitting a new call...');
        
        var json = {
            "customerStoreId": state.customerStore.id,
            "callTypeId": state.newCall.callTypeId,
            "callSubTypeId": state.newCall.callSubTypeId,
            "callStatusId": 1,
            "operatorEmployeeCode": user.operatorEmployeeCode,
            "managingBranchId": state.customerStore.managingBranchId,
            "callDetails": state.newCall.callDetails,
            "callerName": state.newCall.callerName,
            "contactNumber": state.newCall.contactNumber,
            "orderNumber": state.newCall.orderNumber,
            "siteReady": state.newCall.siteReady,
            "siteReadyDate": state.newCall.siteReadyDate
        }


        await axiosOffice.post('calls', json)
        .then(resp => {
            console.log(resp);

            if(resp.status === 200)
            {
                var toast = {
                    shown: false,
                    type: "okay",
                    heading: "Call Submitted Successfully",
                    body: '',
                    time: 2500,
                    icon: "" // leave blank for default type icon
                };
                dispatch("Toast/toast", toast, { root: true });

                var data = {
                    call: resp.data.id,
                    type: 'addNewCall'
                }
                console.log('Socket emitting desktopUpdate: ', data)
                socket.emit('desktopUpdate', data);

                resp.data['customerStore'] = state.customerStore;
                resp.data['customerAccount'] = state.customerAccount;
                var data = JSON.parse(JSON.stringify(resp.data));
                
                commit('resetTextInput');
                dispatch('resetAddCall');
                router.push('/allocate_tech');
                console.log('Passing data to Tech Allocation: ', data);
                dispatch('AllocateTech/processCall', data, { root: true });
            }
        })
        .catch(err => {
            console.error('Axios Office Error: ', err);
            console.error('Axios Office Error Response: ', err.response);
            var toast = {
                shown: false,
                type: "warning",
                heading: "Server Error",
                body: 'Could not log the call, please try again later',
                time: 4500,
                icon: "" // leave blank for default type icon
            };
            dispatch("Toast/toast", toast, { root: true });
        })

    }

}





// mutations
const mutations = {


    canSubmitCall(state, toggle) {
        state.canSubmitCall = toggle;
    },


    loading(state, toggle) {
        state.loading = toggle;
    },


    selectCustomerStore(state, store) {
        state.customerStore = store;
    },


    assignCustomerAccount(state, account) {
        state.customerAccount = account;
    },



    callCombineModal(state, toggle) {
        state.callCombineModal = toggle;
    },


    callsToCombine(state, calls) {
        state.callsToCombine = calls;
    },



    openCalls(state, calls) {
        state.openCalls = calls;
    },

    previousCall(state, call) {
        state.previousCall = call;
    },



    lastFiveStoreCalls(state, calls) {
        state.lastFiveStoreCalls = calls;
    },




    setNewCall(state, call) {
        state.newCall = call;
    },


    resetTextInput(state) {
        state.resetTextInput = true;
        setTimeout(() => {
            state.resetTextInput = false;
        }, 800);
    },


    resetAddCall(state) {
        state.loading = false;
        state.customerStore = '';
        state.customerAccount = '';
        state.previousCall = '';
        state.lastFiveStoreCalls = [];
        state.canSubmitCall = false;
        state.newCall = {
            callTypeId: '',
            callSubTypeId: '',
            callDetails: '',
            callerName: '',
            contactNumber: '',
            orderNumber: '',
            siteReady: false,
            siteReadyDate: ''
        }
    }

}





export default {
    namespaced: true,
    state,
    getters,
    actions,
    mutations
}