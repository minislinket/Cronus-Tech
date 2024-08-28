import LZString from "lz-string";
import { axiosOffice } from "../../../axios/axios";

// initial state
const state = () => ({
    controller: '',
    loading: false,
    openCalls: [],
    filteredCalls: [],
    selectedBranch: '',
})





// getters
const getters = {
    loading: (state) => {
        return state.loading;
    },

    
    openCalls: (state) => {
        return state.openCalls;
    },

    filteredCalls: (state) => {
        return state.filteredCalls;
    },


    selectedBranch: (state) => {
        return state.selectedBranch;
    },


    controller: (state) => {
        return state.controller;
    }
}





// actions
const actions = {

    initController({ commit }) {
        console.log('Initializing abort controller...');
        commit('initController');
    },



    loading({ commit }, toggle) {
        commit('loading', toggle);
    },



    setSelectedBranch({ commit }, branch) {
        commit('setSelectedBranch', branch);
        localStorage.setItem('openCallsSelectedBranch', JSON.stringify(branch));
    },







    filterByOperator({ state }, filterOperator) {
        var user = JSON.parse(localStorage.getItem('user'));

        if(filterOperator)
            state.filteredCalls = state.openCalls.filter(call => call.operatorEmployeeCode === user.employeeCode);
        else
            state.filteredCalls = state.openCalls;
    }, 






    filterByCallType({ state }, callTypeId) {
        callTypeId ? state.filteredCalls = state.openCalls.filter(call => call.callTypeId === callTypeId) : state.filteredCalls = state.openCalls;
    },


    searchCalls({ state, dispatch }, search) {
        dispatch('loading', true);
        var filteredCalls = state.openCalls.filter(call => call.customerStoreName.toLowerCase().includes(search.toLowerCase()));
        state.filteredCalls = filteredCalls;
        dispatch('loading', false);
    },
    



    async getBranchCalls({ commit, dispatch }, selectedBranchId) {
        
        dispatch('resetOpenCalls');
        dispatch('loading', true);
        dispatch('setSelectedBranch', selectedBranchId);

        var user = JSON.parse(localStorage.getItem('user'));
        var branchId = selectedBranchId ? selectedBranchId : user.branchId;
        var customer_stores = JSON.parse(LZString.decompress(localStorage.getItem('customer_stores')));

        var params = {
            branch_id: branchId, 
            call_status_id: 1
        }

        // Select all of Locksecure's Open Calls
        if(params.branch_id === 1) { delete params.branch_id}

        var openCalls = await dispatch('getCallsFromServer', params);

        openCalls.map(call => {
            call['showDetail'] = false;
            var store = customer_stores.filter(store =>  store.id === call.customerStoreId)[0];
            if(store)
            {
                call.customerStore = store;
                call.customerStoreName = store.name;
                call.customerStoreBranchCode = store.branchCode;
            }
            else
            {
                call.customerStore = '';
                call.customerStoreName = '';
                call.customerStoreBranchCode = '';
            }
        })
        
        openCalls.sort((a, b) => {
            return new Date(a.openTime) - new Date(b.openTime);
        });

        console.log('Committing Open Calls: ', openCalls);
        commit('openCalls', openCalls);
        commit('filteredCalls', JSON.parse(JSON.stringify(openCalls)));
        dispatch('loading', false);

    },





    async getCallsFromServer({ state }, params) {
        const signal = state.controller ? state.controller.signal : '';
        return axiosOffice.get('calls', {
            params: params,
            signal
        })
        .then(resp => {
            // console.log(resp);
            if(resp.status == 200)
                return resp.data;
            else
                return [];
        })
        .catch(err => {
            console.error('Axios Office Error: ', err);
            console.error('Axios Office Error Response: ', err.response);
            return [];
        })
    },





    abortSearch({ state, dispatch }) {
        state.controller.abort();
        dispatch('loading', false);
        dispatch('resetOpenCalls');
        dispatch('initController');
    },




    resetOpenCalls({ commit }) {
        commit('resetOpenCalls')
    }

}





// mutations
const mutations = {

    initController(state) {
        state.controller = new AbortController();
        console.log('Abort controller active? ', state.controller);
    },




    loading(state, toggle) {
        state.loading = toggle;
    },



    openCalls(state, calls) {
        state.openCalls = calls;
    },

    filteredCalls(state, calls) {
        state.filteredCalls = calls;
    },




    setSelectedBranch(state, branch) {
        state.selectedBranch = branch;
    },









    resetOpenCalls(state) {
        state.selectedBranch = '';
        state.loading = false;
        state.openCalls = [];
        state.filteredCalls = [];
    }
}





export default {
    namespaced: true,
    state,
    getters,
    actions,
    mutations
}