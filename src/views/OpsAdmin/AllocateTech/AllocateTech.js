import axios from "axios";
import LZString from "lz-string";
import { axiosOffice } from "../../../axios/axios";
import StaticResources from "../../../store/Modules/StaticResources";

// initial state
const state = () => ({
    call: '',
    loading: false,
    loadingCustomerStoreCalls: false,

    customerStore: '',
    customerStoreCalls: [],

    techListActive: false,
    techList: [],

    assignTechActive: false,
    showCall: false,


    viewCallEventsModal: false,
    callEvents: [],
    addCallDetailsModalActive: false,
    editCallTypesModal: false,


    callComments: '',
    callCommentsLoading: false,
    callCommentsModalActive: false
})





// getters
const getters = {
    call: (state) => {
        return state.call;
    },

    loading: (state) => {
        return state.loading;
    },

    loadingCustomerStoreCalls: (state) => {
        return state.loadingCustomerStoreCalls;
    },


    customerStore: (state) => {
        return state.customerStore;
    },


    customerStoreCalls: (state) => {
        return state.customerStoreCalls;
    },


    techListActive: (state) => {
        return state.techListActive;
    },


    techList: (state) => {
        return state.techList;
    },



    assignTechActive: (state) => {
        return state.assignTechActive;
    },



    showCall: (state) => {
        return state.showCall;
    },




    addCallDetailsModalActive: (state) => {
        return state.addCallDetailsModalActive;
    },

    viewCallEventsModal: (state) => {
        return state.viewCallEventsModal;
    },

    callEvents: (state) => {
        return state.callEvents;
    },


    editCallTypesModal: (state) => {
        return state.editCallTypesModal;
    },



    callComments: (state) => {
        return state.callComments;
    },


    callCommentsLoading: (state) => {
        return state.callCommentsLoading;
    },

    callCommentsModalActive: (state) => {
        return state.callCommentsModalActive;
    },

    
} 





// actions
const actions = {



    loading({ commit }, toggle) {
        commit('loading', toggle);
    },



    callCommentsLoading({ commit }, toggle) {
        commit('callCommentsLoading', toggle);
    },


    callCommentsModalActive({ commit }, toggle) {
        commit('callCommentsModalActive', toggle);
    },
    

    addCallDetailsModalActive({ commit }, toggle) {
        commit('addCallDetailsModalActive', toggle);
    },


    viewCallEventsModal({ commit, dispatch }, toggle) {
        commit('viewCallEventsModal', toggle);
        toggle === true ? dispatch('loadCallEvents') : null;
    },



    editCallTypesModal({ commit }, toggle) {
        commit('editCallTypesModal', toggle);
    },



    showCall({ commit }, toggle) {
        console.log('Committing showCall: ', toggle);
        commit('showCall', toggle);
    },





    techListActive({ commit, dispatch, state }, toggle) {
        commit('techListActive', toggle);
        if(toggle === true)
        {
            dispatch('loadCallTechs');
            if(state.assignTechActive === true)
            {
                dispatch('assignTechActive', false);
            }
        }
    },



    assignTechActive({ commit, state, dispatch }, toggle) {
        commit('assignTechActive', toggle);
        if(toggle === true && state.techListActive === true)
        {
            dispatch('techListActive', false);
        }
    },










    loadCallEvents({ state, commit, dispatch }) {

        dispatch('loading', true);

        axiosOffice.get('calls/'+ state.call.id +'/events')
        .then(resp => {
            if(resp.status == 200 && resp.data)
            {
                commit('callEvents', resp.data);
            }
            else
            {
                commit('callEvents', []);
            }

            dispatch('loading', false);
        })
        .catch(err => {
            console.error('Axios Office Error: ', err);
            console.error('Axios Office Error Response: ', err.response);
            dispatch('loading', false);
        })

    },












    setCall({ commit, state }, call) {
        if(state.call.id === call.id) { return }
        console.log('Call coming in: ', call);
        commit('setCall', call);
    },




    resetCall({ commit }) {
        commit('resetCall');
    },




    loadCallById({ commit, dispatch }, callId) {

        dispatch('resetCall');
        dispatch('loading', true);

        axiosOffice.get('calls/' + callId)
        .then(resp => {
            console.log(resp)
            if(resp.status === 200 && resp.data)
            {
                dispatch('processCall', resp.data);
            }
        })
        .catch(err => {
            console.error('Axios Office Error: ', err)
            console.error('Axios Office Error Response: ', err.response);
            dispatch('loading', false);
            var toast = {
                shown: false,
                type: "warning",
                heading: "Server Error",
                body: 'Could not load Call ' + callId,
                time: 3000,
                icon: "" // leave blank for default type icon
            };
            dispatch("Toast/toast", toast, { root: true });
        })

    },




    async processCall({ state, dispatch, commit }, call) {

        if(state.call.id === call.id) { return }

        var customer_stores = JSON.parse(LZString.decompress(localStorage.getItem('customer_stores')));
        var customer_accounts = JSON.parse(localStorage.getItem('customer_accounts'));
        var employees = JSON.parse(localStorage.getItem('employees'));

        var store = customer_stores.filter(str => str.id === call.customerStoreId)[0];
        var operator = employees.filter(emp => emp.employeeCode === call.operatorEmployeeCode)[0];
        call.operator = operator ? operator : '';
        call.operatorName = operator ? operator.displayName : '';
        if(store)
        {
            var account = customer_accounts.filter(acc => acc.id === store.customerAccountId)[0];
            
            call.customerStore = store;
            call.customerStoreName = store.name;
            call.customerStoreCode = store.branchCode;
            call.customerStoreAddress = store.address;
            call.customerAccount = account ? account : '';
            call.customerAccountName = account ? account.name : '';
        }

        var callComments = await dispatch('getCallComments', call.id);
        callComments.sort((a,b) => {
            return new Date(b.time) - new Date(a.time);
        })
        call.comments = callComments;
        
        commit('callComments', callComments);
        dispatch('setCall', call);
        dispatch('loading', false);
        dispatch('loadStoreCalls', store);
    },





    async getCallComments({ dispatch }, callId) {
        dispatch('callCommentsLoading', true);
        return axiosOffice.get('calls/comments?call_id='+callId)
        .then(resp => {

            dispatch('callCommentsLoading', false);
            if(resp.status == 200)
                return resp.data
            else
                return [];
            
        })
        .catch(err => {
            console.error('Axios Office Error: ', err)
            console.error('Axios Office Error Response: ', err.response);
            dispatch('callCommentsLoading', false);
            return []
        })
    },






    loadingCustomerStoreCalls({ commit }, toggle) {
        commit('loadingCustomerStoreCalls', toggle);
    },





    async loadStoreCalls({ commit, dispatch, state }, store) {

        if(store !== 'reload')
        {
            if(state.customerStore.id == store.id) { return }
        }
        else
        {
            store = state.customerStore;
        }

        dispatch('loadingCustomerStoreCalls', true);
        commit('customerStoreCalls', []);
        commit('customerStore', store);

        // Get Open and Allocated Calls for the selected Customer Store
        var getOpenCalls = dispatch('getStoreCalls', { call_status_id: 1, customer_store_id: store.id });
        var getAllocatedCalls = dispatch('getStoreCalls', { call_status_id: 2, customer_store_id: store.id });
        var [openCalls, allocatedCalls] = await Promise.all([getOpenCalls, getAllocatedCalls]);

        // Combine Customer Store Calls and add Store information
        var allStoreCalls = openCalls.concat(allocatedCalls);

        await dispatch('getCallTechnicians', allStoreCalls);


        if(allStoreCalls.length <= 0)
        {
            var toast = {
                shown: false,
                type: "info",
                heading: "No Calls",
                body: 'No Open or Allocated Calls found for ' + store.name,
                time: 4500,
                icon: "" // leave blank for default type icon
            };
            dispatch("Toast/toast", toast, { root: true });
            commit('customerStoreCalls', []);
            dispatch('loadingCustomerStoreCalls', false);
            return
        }


        allStoreCalls.map(call => {
            call.customerStore = store;
            call.customerStoreName = store.name;
            call.customerStoreCode = store.branchCode;
            call.customerStoreAddress = store.address;
        })

        // Add the Operator and Customer Account to each call
        await dispatch('processStoreCalls', allStoreCalls)

        
        console.log('Open Calls: ', openCalls)
        console.log('Allocated Calls: ', allocatedCalls)
        console.log('All Store Calls: ', allStoreCalls)

        commit('customerStoreCalls', allStoreCalls);

        dispatch('loadingCustomerStoreCalls', false);

    },








    async getStoreCalls({ dispatch }, params) {

        return axiosOffice.get('calls', {
            params: params
        })
        .then(resp => {

            if(resp.status === 200)
            {
                if(resp.data.length >= 1)
                {
                    return resp.data;
                }
                else
                {
                    return [];
                }
            }
        })
        .catch(err => {
            console.error('Axios Office Error: ', err)
            console.error('Axios Office Error Response: ', err.response);

            var toast = {
                shown: false,
                type: "warning",
                heading: "Server Error",
                body: 'Error loading Customer Store Calls',
                time: 3500,
                icon: "" // leave blank for default type icon
            };
            dispatch("Toast/toast", toast, { root: true });

            return [];
            
        })

    },








    async getCallTechnicians({}, calls) {

        if(calls.length >= 1)
        {
            await Promise.all(calls.map(async call => {

                return axiosOffice.get('calls/techs', {
                    params: {
                        call_id: call.id
                    }
                })
                .then(resp => {
                    if(resp.status === 200)
                    {
                        call['technicians'] = resp.data;
                    }
                })
                .catch(err => {
                    console.error('Axios Office Error: ', err);
                    console.error('Axios Office Error Response: ', err.response);
                })

            }))

            return calls;
        }
        else
        {
            return [];
        }
    },









    async processStoreCalls({ dispatch }, calls) {

        var customer_accounts = JSON.parse(localStorage.getItem('customer_accounts'));
        var employees = JSON.parse(localStorage.getItem('employees'));


        await Promise.all(calls.map(async call => {

            var callComments = await dispatch('getCallComments', call.id);
            callComments.sort((a,b) => {
                return new Date(b.time) - new Date(a.time);
            })
            call.comments = callComments;

            // Assign Operator
            var operator = employees.filter(emp => emp.employeeCode === call.operatorEmployeeCode)[0];
            call.operator = operator ? operator : '';
            call.operatorName = operator ? operator.displayName : '';

            // Assign Customer Account
            var account = customer_accounts.filter(acc => acc.id === call.customerStore.customerAccountId)[0];
            call.customerAccount = account ? account : '';
            call.customerAccountName = account ? account.name : '';

        }))


        calls.sort((a,b) => {
            return new Date(a.openTime) - new Date(b.openTime);
        })


    },









    async loadCallTechs({ dispatch, commit, state }) {

        commit('techList', []);
        dispatch('loading', true);

        await axiosOffice.get('calls/techs', {
            params: {
                call_id: state.call.id,
            }
        })
        .then(resp => {
            if(resp.status === 200)
            {
                if(resp.data && resp.data.length >= 1)
                {
                    commit('techList', resp.data);
                }
                else
                {
                    commit('techList', []);
                }
            }

            dispatch('loading', false);
        })
        .catch(err => {
            console.error('Axios Office Error: ', err)
            console.error('Axios Office Error Response: ', err.response);
            dispatch('loading', false);
            var toast = {
                shown: false,
                type: "warning",
                heading: "Server Error",
                body: 'Could not load Call Technicians',
                time: 3500,
                icon: "" // leave blank for default type icon
            };
            dispatch("Toast/toast", toast, { root: true });
        })
    },








    removeTech({ state, dispatch, commit }, employeeCode) {

        console.log('Remove this tech: ', employeeCode);
        

        dispatch('loading', true);

        axiosOffice.delete('calls/'+ state.call.id + '/techs?employee_code=' + employeeCode)
        .then(resp => {
            if(resp.status === 200)
            {
                dispatch('loadCallTechs');
                var toast = {
                    shown: false,
                    type: "okay",
                    heading: "Tech Removed from Call " + state.call.id,
                    body: '',
                    time: 3000,
                    icon: "" // leave blank for default type icon
                };
                dispatch("Toast/toast", toast, { root: true });
                dispatch('loadStoreCalls', state.customerStore);
            }
            dispatch('loading', false);
        })
        .catch(err => {
            console.error('Axios Office Error: ', err)
            console.error('Axios Office Error Response: ', err.response);
            dispatch('loading', false);
            var toast = {
                shown: false,
                type: "warning",
                heading: "Server Error",
                body: 'Could not remove Tech from Call',
                time: 4000,
                icon: "" // leave blank for default type icon
            };
            dispatch("Toast/toast", toast, { root: true });
        })
    },









    async allocateTechToCall({ state, dispatch, commit }, tech) {

        console.log('Loading call techs...');
        await dispatch('loadCallTechs');
        console.log('State call tech list: ', state.techList);

        if(state.techList.length >= 1)
        {
            var flag = false;
            state.techList.map(tek => tek.technicianEmployeeCode === tech.employeeCode ? flag = true : null);
            if(flag) 
            {
                var toast = {
                    shown: false,
                    type: "warning",
                    heading: "Technician Already on Call",
                    body: tech.displayName + ' has been already been allocated to call ' + state.call.id,
                    time: 4500,
                    icon: "" // leave blank for default type icon
                };
                dispatch("Toast/toast", toast, { root: true });
                return 
            }
        }

        dispatch('loading', true);

        axiosOffice.post('calls/' + state.call.id + '/techs?employee_code=' + tech.employeeCode)
        .then(resp => {
            if(resp.status === 200)
            {
                var toast = {
                    shown: false,
                    type: "okay",
                    heading: "Technician Allocated",
                    body: tech.displayName + ' has been allocated to call ' + state.call.id,
                    time: 4000,
                    icon: "" // leave blank for default type icon
                };
                dispatch("Toast/toast", toast, { root: true });
                dispatch('loadStoreCalls', state.customerStore);
                dispatch('assignTechActive', false);
            }
            dispatch('loading', false);
        })
        .catch(err => {
            console.error('Axios Office Error: ', err);
            console.error('Axios Office Error Response: ', err.response);
            var toast = {
                shown: false,
                type: "warning",
                heading: "Server Error",
                body: 'Error during technician allocation, please try again later',
                time: 4000,
                icon: "" // leave blank for default type icon
            };
            dispatch("Toast/toast", toast, { root: true });
            dispatch('loading', false);
        })

    },







    cancelCall({ state, commit, dispatch }) {

        dispatch('loading', true);

        axiosOffice.put('/calls/'+ state.call.id +'/status?call_status_id=3')
        .then(resp => {
            if(resp.status === 200)
            {
                state.call.callStatusId = 3;
                var toast = {
                    shown: false,
                    type: "okay",
                    heading: "Call Cancelled",
                    body: 'Call '+ state.call.id +' has been cancelled.',
                    time: 4000,
                    icon: "" // leave blank for default type icon
                };
                dispatch("Toast/toast", toast, { root: true });
                dispatch('loadStoreCalls', 'reload');
            }
            dispatch('loading', false);
        })
        .catch(err => {
            console.error('Axios Office Error: ', err);
            console.error('Axios Office Error Response: ', err.response);
            var toast = {
                shown: false,
                type: "warning",
                heading: "Server Error",
                body: 'Error cancelling call, please try again later',
                time: 4000,
                icon: "" // leave blank for default type icon
            };
            dispatch("Toast/toast", toast, { root: true });
            dispatch('loading', false);
        })

    },








    AddCallDetails({ state, dispatch }, callDetails) {
        dispatch('loading', true);

        var call = 
        {
            "id": state.call.id,
            "customerStoreId": state.call.customerStoreId,
            "callTypeId": state.call.callTypeId,
            "callSubTypeId": state.call.callSubTypeId,
            "callStatusId": state.call.callStatusId,
            "managingBranchId": state.call.managingBranchId,
            "callDetails": callDetails,
            "callerName": state.call.callerName,
            "contactNumber": state.call.contactNumber,
            "orderNumber": state.call.orderNumber,
            "siteReady": state.call.siteReady,
            "siteReadyDate": state.call.siteReadyDate
        }


        axiosOffice.put('calls/'+ state.call.id, call)
        .then(resp => {
            if(resp.status == 200)
            {
                var toast = {
                    shown: false,
                    type: "okay",
                    heading: "Call Details Added",
                    body: '',
                    time: 2500,
                    icon: "" // leave blank for default type icon
                };
                dispatch("Toast/toast", toast, { root: true });
                dispatch('viewCallEventsModal', false);
                dispatch('loadCallById', state.call.id);
                
            }
            dispatch('loading', false);
        })
        .catch(err => {
            console.error('Axios Office Error: ', err);
            console.error('Axios Office Error Response: ', err.response);
            var toast = {
                shown: false,
                type: "warning",
                heading: "Server Error",
                body: 'Error adding call details, please try again later',
                time: 4000,
                icon: "" // leave blank for default type icon
            };
            dispatch("Toast/toast", toast, { root: true });
            dispatch('loading', false);
        })

    },








    updateCallTypes({ state, dispatch, commit }, callTypes) {
        
        dispatch('loading', true);

        var callTypeId = callTypes.callTypeId;
        var callSubTypeId = callTypes.callSubTypeId;
        var call = 
        {
            "id": state.call.id,
            "customerStoreId": state.call.customerStoreId,
            "callTypeId": callTypeId,
            "callSubTypeId": callSubTypeId,
            "callStatusId": state.call.callStatusId,
            "managingBranchId": state.call.managingBranchId,
            "callerName": state.call.callerName,
            "contactNumber": state.call.contactNumber,
            "orderNumber": state.call.orderNumber,
            "siteReady": state.call.siteReady,
            "siteReadyDate": state.call.siteReadyDate
        }


        axiosOffice.put('calls/'+ state.call.id, call)
        .then(resp => {
            if(resp.status == 200)
            {
                var toast = {
                    shown: false,
                    type: "okay",
                    heading: "Call Types Updated",
                    body: '',
                    time: 2500,
                    icon: "" // leave blank for default type icon
                };
                dispatch("Toast/toast", toast, { root: true });
                dispatch('editCallTypesModal', false);
                dispatch('loadCallById', state.call.id);
                
            }
            dispatch('loading', false);
        })
        .catch(err => {
            console.error('Axios Office Error: ', err);
            console.error('Axios Office Error Response: ', err.response);
            var toast = {
                shown: false,
                type: "warning",
                heading: "Server Error",
                body: 'Error updating Call Types, please try again later',
                time: 4000,
                icon: "" // leave blank for default type icon
            };
            dispatch("Toast/toast", toast, { root: true });
            dispatch('loading', false);
        })

    }
 


}





// mutations
const mutations = {

    loading(state, toggle) {
        state.loading = toggle;
    },


    callComments(state, comments) {
        state.callComments = comments;
    },


    callCommentsLoading(state, toggle) {
        state.callCommentsLoading = toggle;
    },


    callCommentsModalActive(state, toggle) {
        state.callCommentsModalActive = toggle;
    },


    addCallDetailsModalActive(state, toggle) {
        state.addCallDetailsModalActive = toggle;
    },


    viewCallEventsModal(state, toggle) {
        state.viewCallEventsModal = toggle;
    },



    editCallTypesModal(state, toggle) {
        state.editCallTypesModal = toggle;
    },



    callEvents(state, events) {
        state.callEvents = events;
    },



    showCall(state, toggle) {
        state.showCall = toggle;
    },


    


    loadingCustomerStoreCalls(state, toggle) {
        state.loadingCustomerStoreCalls = toggle;
    },


    techListActive(state, toggle) {
        state.techListActive = toggle;
    },



    techList(state, techs) {
        state.techList = techs;
    },



    assignTechActive(state, toggle) {
        state.assignTechActive = toggle;
    },


    

    setCall(state, call) {
        state.call = call;
    },



    customerStore(state, store) {
        state.customerStore = store;
    },


    customerStoreCalls(state, calls) {
        state.customerStoreCalls = calls;
    },







    resetCall(state) {
        state.customerStore = '';
        state.customerStoreCalls = [];
        state.call = '';

        state.techListActive = false;
        state.techList = [];

        state.assignTechActive = false;
        state.showCall = false;

        state.viewCallEventsModal = false;
        state.callEvents = [];
        state.addCallDetailsModalActive = false;

        state.callComments = '';
        state.callCommentsLoading = false;
        state.callCommentsModalActive = false;
    }
}





export default {
    namespaced: true,
    state,
    getters,
    actions,
    mutations
}