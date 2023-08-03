import LZString from "lz-string";
import { axiosOffice } from "../../../axios/axios";

// initial state
const state = () => ({
    activeCalls: [],
    pendingCalls: [],
    loading: false,
    showActiveCalls: true,
    lastUpdated: ''
})





// getters
const getters = {
    activeCalls: (state) => {
        return state.activeCalls;
    },

    pendingCalls: (state) => {
        return state.pendingCalls;
    },

    allCalls: (state) => {
        var allCalls = state.activeCalls.concat(state.pendingCalls);
        return allCalls;
    },

    loading: (state) => {
        return state.loading;
    },

    showActiveCalls: (state) => {
        return state.showActiveCalls;
    },

}





// actions
const actions = {

    

    async getTechnicianCalls({ commit, dispatch }) {
        
        commit('resetActiveCalls');
        commit('resetPendingCalls');

        await dispatch('loadLocalStorageCalls');
        
    },





    async refreshTechnicianCalls({ state, dispatch, commit, rootGetters }, forceReload) {

        var now = new Date();
        var diff = Math.abs(state.lastUpdated - now);
        var seconds = diff / 1000;
        // console.log('We last updated ' + seconds + ' seconds ago');

        var online = rootGetters['StaticResources/online'];
        if(!online || state.loading || seconds < 30 && state.activeCalls.length >= 1 && !forceReload) { return }


        commit('loading', true);
        commit('setLastUpdated', new Date());

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

        // Rerouted Calls
        var reroutedParams = {technician_employee_code: user.employeeCode, call_status_id: 2, tech_call_status_id: 7};
        var getReroutedCalls = dispatch('loadTechnicianCallsFromServer', reroutedParams);
        
        // On Site Calls
        var onSiteParams = {technician_employee_code: user.employeeCode, call_status_id: 2, tech_call_status_id: 4};
        var getOnSiteCalls = dispatch('loadTechnicianCallsFromServer', onSiteParams);

        // Left Site Calls
        var returningParams = {technician_employee_code: user.employeeCode, call_status_id: 2, tech_call_status_id: 5};
        var getReturningCalls = dispatch('loadTechnicianCallsFromServer', returningParams);
        
        // On Hold Calls
        var onHoldParams = {technician_employee_code: user.employeeCode, call_status_id: 2, tech_call_status_id: 6};
        var getOnHoldCalls = dispatch('loadTechnicianCallsFromServer', onHoldParams);

        // Transferred Calls
        // var transferredParams = {technician_employee_code: user.employeeCode, call_status_id: 2, tech_call_status_id: 9};
        // var getTransferredCalls = dispatch('loadTechnicianCallsFromServer', transferredParams);

        // Completed Calls - for Telephone Support
        // var transferredParams = {technician_employee_code: user.employeeCode, call_status_id: 2, tech_call_status_id: 9};
        // var getTransferredCalls = dispatch('loadTechnicianCallsFromServer', transferredParams);

        
        // Get all technician calls simultaneously
        var [pendingCalls, receivedCalls, enRouteCalls, reroutedCalls, onSiteCalls, returningCalls, onHoldCalls/* , transferredCalls */] 
        = 
        await Promise.all([getPendingCalls, getReceivedCalls, getEnRouteCalls, getReroutedCalls, getOnSiteCalls, getReturningCalls, getOnHoldCalls/* , getTransferredCalls */]);

        // console.log('Pending Calls: ', pendingCalls);
        // console.log('Received Calls: ', receivedCalls);
        // console.log('En Route Calls: ', enRouteCalls);
        // console.log('On Site Calls: ', onSiteCalls);
        // console.log('On Hold Calls: ', onHoldCalls);


        var allCalls = pendingCalls.concat(receivedCalls, enRouteCalls, reroutedCalls, onSiteCalls, returningCalls, onHoldCalls/* , transferredCalls */);
        // console.log('All Calls: ', allCalls);

        var flag = false;
        allCalls.map(call => call === false ? flag = true : null);

        if(!flag)
        {
            await dispatch('compareLocalStorageWithServer', allCalls);
        }
        else
        {   
            var toast = {
				shown: false,
				type: 'warning', // ['info', 'warning', 'error', 'okay']
				heading: 'Server Error', // (Optional)
				body: 'Error while retrieving jobs from server, please try again later', 
				time: 5000, // in milliseconds
				icon: ['fa', 'fingerprint'] // leave blank for default toast type icon
			}

            dispatch('Toast/toast', toast, { root: true });
        }

    },












    async loadTechnicianCallsFromServer({  }, params) {

        var tech_states = JSON.parse(localStorage.getItem('call_tech_states'));

        return axiosOffice.get('/calls', {
            params: params
        })
        .then(async resp => {
            // console.log(resp);
            if(resp.status === 200)
            {
                var techState = tech_states.filter(state => state.id === params.tech_call_status_id)[0];
                resp.data.map(async call => {
                    call['jobCards'] = [];
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
            return false;
        })

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

        calls.map(call => {
            call.customerStore ? null : hasCustomerStore = false;

            if(call.customerStore && !call.customerStoreName || call.customerStore && !call.customerStoreBranchCode)
            {
                call.customerStoreBranchCode = call.customerStore.branchCode
                call.customerStoreName = call.customerStore.name;
            }
            if(call.customerAccount && !call.customerAccountName)
            {
                call.customerAccountName = call.customerAccount.name;
            }
            if(call.operator && !call.operatorName)
            {
                call.operatorName = call.operator.displayName;
            }
        });

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

        }))
              
        
        commit('loading', false);
        return

    },






    async getCallJobCards({}, call) {
        var user = JSON.parse(localStorage.getItem('user'));
        // console.log('Getting JC\'s for call: ', call.id)
        return axiosOffice.get('job_cards?allocatedEmployeeCode='+ user.employeeCode +'&customerCallId='+ call.id)
        .then(async resp => {
            // console.log('call JC resp: ', resp);
            if(resp.status === 200)
            {
                call.jobCards = resp.data;
                call['allJobCardsHaveCMIS'] = true;
                if(call.jobCards.length >= 1)
                {
                    await Promise.all(call.jobCards.map(jc => jc.cmisDocumentId ? null : call.allJobCardsHaveCMIS = false));
                }
                else
                {
                    call.allJobCardsHaveCMIS = false
                }
                
            }
        })
        .catch(err => {
            console.error('Axios_Office Error: ', err);
            console.error('Axios_Office Error Response: ', err.response);
            call.jobCards = [];
            call.allJobCardsHaveCMIS = false;
        })
    },







    async refreshCallJobCards({ dispatch }, call) {
        dispatch('Call/loading', true, { root: true });
        await dispatch('getCallJobCards', call);
        dispatch('updateLocalStorage', call);
        dispatch('Call/loading', false, { root: true });
    },






    updateLocalStorage({ dispatch }, call) {

        // console.log('Updating call in local storage: ', call);

        var localCalls = JSON.parse(localStorage.getItem('calls'));
        localStorage.removeItem('calls');
        localCalls.map(c => {
            if(c.id === call.id)
            {
                c.techState = call.techState;
                c.techStateId = call.techStateId;
                c.techStateName = call.techStateName;
                c.jobCards = call.jobCards;
                c.orderNumber = call.orderNumber;
                c.allJobCardsHaveCMIS = call.allJobCardsHaveCMIS;
            }
        });
        // console.log('Call Updated in localStorage...', localCalls);
        localStorage.setItem('calls', JSON.stringify(localCalls));
        dispatch('splitAndCommitActivePendingCalls', localCalls);

    },





    async compareLocalStorageWithServer({ dispatch }, serverCalls) {

        // if(serverCalls.length <= 0) { return }


        var localCalls = JSON.parse(localStorage.getItem('calls'));
        localStorage.removeItem('calls');

        var serverCallIds = [];
        var localCallIds = [];

        var newCalls = [];
        var existingCalls = [];

        // console.log('Local Calls before processing: ', JSON.parse(JSON.stringify(localCalls)));

        !localCalls ? localCalls = [] : null;

        // Grab the id's from both local and server calls and push each to it's own array
        await Promise.all(serverCalls.map(async serverCall => {
            if(serverCall.techStateId >= 4 && serverCall.techStateId <= 7 || serverCall.techStateId == 9)
            {
                await dispatch('getCallJobCards', serverCall);
            }
            serverCallIds.push(serverCall.id);
        }));
        // console.log('Server call ID\'s: ', serverCallIds);

        localCalls ? localCalls.map(localCall => localCallIds.push(localCall.id)) : null;
        // console.log('Local call ID\'s: ', localCallIds);

        
        if(serverCallIds.length >= 1)
        {
            serverCallIds.map(async callId => {
                if(localCallIds.length >= 1)
                {
                    if(localCallIds.includes(callId))
                        existingCalls.push(serverCalls.filter(serverCall => serverCall.id === callId)[0])
                    else
                        newCalls.push(serverCalls.filter(serverCall => serverCall.id === callId)[0]);
                }
                else
                {
                    localCalls = serverCalls;
                    await dispatch('processCalls', localCalls);
                }
                
            })
        }
        else
        {
            localCalls = [];
        }


        var removedCallIds = [];

        if(localCallIds.length >= 1)
        {
            localCallIds.map(localCallId => !serverCallIds.includes(localCallId) ? removedCallIds.push(localCallId) : null);
            // console.log('Remove call id\'s: ', removedCallIds);
            if(removedCallIds.length >= 1)
            {
                removedCallIds.map(callId => {
                    var index = localCalls.findIndex(call => call.id === callId);
                    // console.log('Found index for call: ', index);
                    if(typeof index === 'number')
                        localCalls.splice(index, 1);
                })
                
            }
        }





        // console.log('New Calls from server: ', newCalls);
        // console.log('Existing Calls from server: ', existingCalls);
        // console.log('Local Calls: ', JSON.parse(JSON.stringify(localCalls)));

        

        if(newCalls.length >= 1)
        {
            await dispatch('processCalls', newCalls);
            newCalls.map(newCall => {
                localCalls.push(newCall);
            })
            
        }


        

        if(existingCalls.length >= 1)
        {
            localCalls.map(localCall => {

                var serverCall = existingCalls.filter(call => call.id === localCall.id)[0];
                var ignoreKeys = 
                [
                    'customerAccount', 'customerAccountName', 'customerStore', 'customerStoreBranchCode ', 'customerStoreName', 
                    'operator', 'operatorName', 
                    'techState', 'techStateId', 'techStateName'
                ];

                if(serverCall)
                {
                    for(var [key, val] of Object.entries(localCall)) {
                        if(!ignoreKeys.includes(key))
                        {
                            // console.log('local call key: ',key, localCall[key]);
                            // console.log('Server call key: ',key, serverCall[key])
                            localCall[key] !== serverCall[key] ? localCall[key] = serverCall[key] : null;
                        }
                        if(key == 'techStateId')
                        {
                            if(serverCall[key] == 9 || serverCall[key] == 6)
                            {
                                localCall.techState = serverCall.techState;
                                localCall.techStateId = serverCall.techStateId;
                                localCall.techStateName = serverCall.techStateName;
                            }
                        }
                    }
                }


            })
        }



        // if(localCalls.length >= 1)
        // {
        //     localCalls.map(async call => {
                
        //     });
        // }

        // console.log('Local Calls after Server compare: ', JSON.parse(JSON.stringify(localCalls)));

        /* var flag = false;
        localCalls.length >= 1 ? localCalls.map(call => !call.customerStoreName ? flag = true : null) : null;
        if(flag == true) 
        { */
            await dispatch('processCalls', localCalls);
        /* } */


        // console.log('Local Calls after updates: ', JSON.parse(JSON.stringify(localCalls)));
        localStorage.setItem('calls', JSON.stringify(localCalls));
        dispatch('splitAndCommitActivePendingCalls', localCalls);

    },







    loadLocalStorageCalls({ dispatch }, calls) {

        var calls = JSON.parse(localStorage.getItem('calls'));

        if(calls)
        {
            dispatch('splitAndCommitActivePendingCalls', calls);
        }
    },






    splitAndCommitActivePendingCalls({ commit, dispatch }, calls) {

        var activeCalls = calls.filter(call => {
            // console.log(call.techStateId);
            return call.techStateId >= 2 && call.techStateId <= 5 || call.techStateId >= 6 && call.techStateId <= 7 || call.techStateId == 9;
        });
        activeCalls.sort((a,b) => {
            return b.id - a.id;
        })
        // console.log('Active calls: ', activeCalls);

        var pendingCalls = calls.filter(call => call.techStateId == 1);
        pendingCalls.sort((a,b) => {
            return a.id - b.id;
        })
        // console.log('Pending calls: ', pendingCalls);

        commit('setActiveCalls', activeCalls);
        commit('setPendingCalls', pendingCalls);

        pendingCalls.length >= 1 ? dispatch('Calls/showActiveCalls', false, { root: true }) : dispatch('Calls/showActiveCalls', true, { root: true });
        // console.log('--------calls done loading--------');
        commit('loading', false);
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




    setPendingCalls(state, calls) {
        state.pendingCalls = calls;
    },

    resetPendingCalls(state) {
        state.pendingCalls = [];
    },




    showActiveCalls(state, toggle) {
        state.showActiveCalls = toggle;
    },

    toggleActiveCalls(state) {
        state.showActiveCalls = !state.showActiveCalls;
    },


    setLastUpdated(state, date) {
        state.lastUpdated = date;
    },


    loading(state, toggle) {
        state.loading = toggle;
    }

}





export default {
    namespaced: true,
    state,
    getters,
    actions,
    mutations
}