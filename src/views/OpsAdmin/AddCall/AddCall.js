import { axiosOffice } from "../../../axios/axios";
import router from "../../../router";

// initial state
const state = () => ({

    loading: false,

    customerStore: '',
    customerAccount: '',
    previousCall: '',
    lastFiveStoreCalls: [],

    canSubmitCall: false,
    newCall: '',
    resetTextInput: false
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



    canSubmitCall: (state) => {
        return state.canSubmitCall;
    },


    resetTextInput: (state) => {
        return state.resetTextInput;
    }
}





// actions
const actions = {


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





    checkSubmitCall({ state, dispatch, commit }, call) {
        dispatch('loading', true);

        var openCall = state.lastFiveStoreCalls.filter(call => call.callStatusId === 1);
        if(state.lastFiveStoreCalls.length >= 1 && openCall)
        {
            
            var modal = {
                active: true, // true to show modal
                type: 'warning', // ['info', 'warning', 'error', 'okay']
                icon: ['fa', 'exclamation-triangle'], // Leave blank for no icon
                heading: 'Open Call',
                body: '<p>' + state.customerStore.name + ' already has an Open Call.<br></p><p>Are you sure you want to submit this call?',
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