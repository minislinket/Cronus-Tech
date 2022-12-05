import LZString from "lz-string";
import { axiosOffice } from "../../../axios/axios";

// initial state
const state = () => ({
    activeCalls: [],
    incomingCalls: [],
    loading: false,
    showActiveCalls: true,
    callSyncTimeMin: 30
})





// getters
const getters = {
    activeCalls: (state) => {
        return state.activeCalls;
    },

    incomingCalls: (state) => {
        return state.incomingCalls;
    },

    allCalls: (state) => {
        var allCalls = state.activeCalls.concat(state.incomingCalls);
        return allCalls;
    },

    loading: (state) => {
        return state.loading;
    },

    showActiveCalls: (state) => {
        return state.showActiveCalls;
    },


    callSyncTimeMin: (state) => {
        return state.callSyncTimeMin;
    }
}





// actions
const actions = {

    

    async getTechnicianCalls({ commit, dispatch }) {
        
        commit('loading', true);
        commit('resetActiveCalls');
        commit('resetIncomingCalls');

        var calls = JSON.parse(localStorage.getItem('calls'));

        if(calls)
            await dispatch('processCalls', calls);
        else
            await dispatch('refreshTechnicianCalls');
    },





    async refreshTechnicianCalls({ dispatch, commit }, freshStart) {

        commit('loading', true);

        localStorage.removeItem('calls');
        commit('resetActiveCalls');
        commit('resetIncomingCalls');

        var user = JSON.parse(localStorage.getItem('user'));

        // Pending Calls
        var pendingParams = {technician_employee_code: user.employeeCode, call_status_id: 2, tech_call_status_id: 1};
        var getPendingCalls = dispatch('loadTechnicianCallsFromServer', pendingParams);

        // Received Calls
        var receivedParams = {technician_employee_code: user.employeeCode, call_status_id: 2, tech_call_status_id: 2};
        var getReceivedCalls = dispatch('loadTechnicianCallsFromServer', receivedParams);
        
        // En Route Calls
        var enRouteParams = {technician_employee_code: user.employeeCode, call_status_id: 2, tech_call_status_id: 3};
        var getEnRouteCalls = dispatch('loadTechnicianCallsFromServer', enRouteParams);
        
        // On Site Calls
        var onSiteParams = {technician_employee_code: user.employeeCode, call_status_id: 2, tech_call_status_id: 4};
        var getOnSiteCalls = dispatch('loadTechnicianCallsFromServer', onSiteParams);
        
        // On Hold Calls
        var onHoldParams = {technician_employee_code: user.employeeCode, call_status_id: 2, tech_call_status_id: 6};
        var getOnHoldCalls = dispatch('loadTechnicianCallsFromServer', onHoldParams);

        
        // Get all technician calls simultaneously
        var [pendingCalls, receivedCalls, enRouteCalls, onSiteCalls, onHoldCalls] = await Promise.all([getPendingCalls, getReceivedCalls, getEnRouteCalls, getOnSiteCalls, getOnHoldCalls]);


        if(pendingCalls.length >= 1) await dispatch('assignCustomerStore', pendingCalls); 
        if(receivedCalls.length >= 1) await dispatch('assignCustomerStore', receivedCalls); 
        if(enRouteCalls.length >= 1) await dispatch('assignCustomerStore', enRouteCalls); 
        if(onSiteCalls.length >= 1) await dispatch('assignCustomerStore', onSiteCalls); 
        if(onHoldCalls.length >= 1) await dispatch('assignCustomerStore', onHoldCalls); 


        // console.log('Pending Calls: ', pendingCalls);
        // console.log('Received Calls: ', receivedCalls);
        // console.log('En Route Calls: ', enRouteCalls);
        // console.log('On Site Calls: ', onSiteCalls);
        // console.log('On Hold Calls: ', onHoldCalls);


        var allCalls = pendingCalls.concat(receivedCalls, enRouteCalls, onSiteCalls, onHoldCalls);
        console.log('All Calls: ', allCalls);

        // If the user just logged in, check calls and set status 3 / 4 to on-hold(6)
        // if(freshStart === true) 
        // {
        //     allCalls = await dispatch('setTechStates', allCalls);
        // }


        await dispatch('processCalls', allCalls);

    },





    async setTechStates({ dispatch }, calls) {

        var tech_states = JSON.parse(localStorage.getItem('call_tech_states'));

        await Promise.all(calls.map(call => {

            if(call.techStateId === 3 || call.techStateId === 4)
            {
                call.techStateId = 6;
                call.techState = tech_states.filter(state => state.id === call.techStateId)[0];
                call.techStateName = call.techState.name;
                navigator.serviceWorker.getRegistration().then(reg => {
                    // console.log('We have a registration: ', reg);
                    var user = JSON.parse(localStorage.getItem('user'));
                    var signature = JSON.parse(localStorage.getItem('signature'));
                    var data = JSON.stringify({call: call, nextStatusId: call.techStateId, user, signature });
                    reg.active.postMessage({type: 'updateCall', data: data});
                })
            }

        }))

        return calls;

        // setTimeout(() => {
        //     console.log('Dispatching refresh tech calls from set tech state....');
        //     dispatch('refreshTechnicianCalls', false);
        // }, 150);
        

    },






    async loadTechnicianCallsFromServer({  }, params) {

        var tech_states = JSON.parse(localStorage.getItem('call_tech_states'));

        return axiosOffice.get('/calls', {
            params: params
        })
        .then(resp => {
            // console.log(resp);
            if(resp.status === 200)
            {
                var techState = tech_states.filter(state => state.id === params.tech_call_status_id)[0];
                resp.data.map(call => {
                    call.techState = techState;
                    if(call.techState)
                    {
                        call.techStateId = call.techState.id;
                        call.techStateName = call.techState.name;
                    }
                    else
                    {
                        call.techStateId = null;
                        call.techStateName = '--';
                    }
                })
                return resp.data;
            }
            else
                return [];
        })
        .catch(err => {
            console.error('Axios_Office Error: ', err);
            console.error('Axios_Office Error Response: ', err.response);
            return [];
        })

    },









    async assignCustomerStore({}, calls) {
        var customerStores = localStorage.getItem('customer_stores');
        var customerAccounts = JSON.parse(localStorage.getItem('customer_accounts'));
        customerStores ? customerStores = JSON.parse(LZString.decompress(customerStores)) : customerStores = [];

        await Promise.all(calls.map(call => {

            var store = customerStores.filter(str => str.id === call.customerStoreId)[0];
            if(store)
            {
                call.customerStore = store;
                call.customerStoreBranchCode = store.branchCode
                call.customerStoreName = store.name;

                var account = customerAccounts.filter(acc => acc.id === store.customerAccountId)[0];
                if(account)
                {
                    call.customerAccount = account;
                    call.customerAccountName = account.name;
                }
                else
                {
                    call.customerAccount = '';
                    call.customerAccountName = '';
                }
            }
            else
            {
                call.customerStore = '';
                call.customerStoreBranchCode = '';
                call.customerStoreName = '';
                call.customerAccount = '';
                call.customerAccountName = '';
            }


            

        }))
    },










    async processCalls({ commit, dispatch }, calls) {

        if(calls.length <= 0)
        {
            commit('loading', false);
            return
        }

        var hasCustomerStore = true;
        var customerStores = localStorage.getItem('customer_stores');
        var customerAccounts = JSON.parse(localStorage.getItem('customer_accounts'));
        var employees = JSON.parse(localStorage.getItem('employees'));

        calls.map(call => call.customerStore ? null : hasCustomerStore = false);

        if(!hasCustomerStore)
        {
            customerStores = localStorage.getItem('customer_stores');
            customerStores ? customerStores = JSON.parse(LZString.decompress(customerStores)) : customerStores = [];
        }



        await Promise.all(calls.map(async call => {

            if(!call.customerStore)
            {
                var store = customerStores.filter(str => str.id === call.customerStoreId)[0];
                if(store)
                {
                    call.customerStore = store;
                    call.customerStoreBranchCode = store.branchCode
                    call.customerStoreName = store.name;

                    var account = customerAccounts.filter(acc => acc.id === store.customerAccountId)[0];
                    if(account)
                    {
                        call.customerAccount = account;
                        call.customerAccountName = account.name;
                    }
                    else
                    {
                        call.customerAccount = '';
                        call.customerAccountName = '';
                    }
                }
                else
                {
                    call.customerStore = '';
                    call.customerStoreBranchCode = '';
                    call.customerStoreName = '';
                    call.customerAccount = '';
                    call.customerAccountName = '';
                }


                
            }


            if(!call.operator)
            {
                var operator = employees.filter(emp => emp.employeeCode === call.operatorEmployeeCode)[0];

                if(operator)
                {
                    call.operator = operator;
                    call.operatorName = operator.displayName;
                }
                else
                {
                    call.operator = '';
                    call.operatorName = '';
                }
            }
            
            var activeCalls = calls.filter(call => call.techStateId >= 2 && call.techStateId <= 4 || call.techStateId === 6);
            activeCalls.sort((a,b) => {
                return b.techStateId - a.techStateId;
            })
            var incomingCalls = calls.filter(call => call.techStateId === 1);
            incomingCalls.sort((a,b) => {
                return a.techStateId - b.techStateId;
            })
            // activeCalls.map(c => { c.techStateId = 5 })
            commit('setActiveCalls', activeCalls);
            commit('setIncomingCalls', incomingCalls);

            incomingCalls.length >= 1 ? dispatch('Calls/showActiveCalls', false, { root: true }) : dispatch('Calls/showActiveCalls', true, { root: true });
            // localStorage.setItem('calls', JSON.stringify(calls));
            dispatch('updateLocalStorage');
            commit('loading', false);
            return 

        }))
              

    },





    updateLocalStorage({ state }) {

        localStorage.removeItem('calls');
        var allCalls = state.activeCalls.concat(state.incomingCalls);
        localStorage.setItem('calls', JSON.stringify(allCalls));

    },





    showActiveCalls({ commit }, toggle) {
        commit('showActiveCalls', toggle);
    },




    toggleActiveCalls({ commit }) {
        commit('toggleActiveCalls');
    },




}





// mutations
const mutations = {

    setActiveCalls(state, calls) {
        state.activeCalls = calls;
    },

    resetActiveCalls(state) {
        state.activeCalls = [];
    },



    setIncomingCalls(state, calls) {
        state.incomingCalls = calls;
    },


    resetIncomingCalls(state) {
        state.incomingCalls = [];
    },




    showActiveCalls(state, toggle) {
        state.showActiveCalls = toggle;
    },



    toggleActiveCalls(state) {
        state.showActiveCalls = !state.showActiveCalls;
    },





    loading(state, toggle) {
        state.loading = toggle;
        // console.log('Are we loading calls? ', toggle);
    }

}





export default {
    namespaced: true,
    state,
    getters,
    actions,
    mutations
}