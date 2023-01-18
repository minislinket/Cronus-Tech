import LZString from "lz-string";
import { axiosOffice } from "../../../axios/axios";

// initial state
const state = () => ({

    loading: false,
    recentCalls: []

})





// getters
const getters = {
    loading: (state) => {
        return state.loading;
    },


    recentCalls: (state) => {
        return state.recentCalls;
    }
}





// actions
const actions = {


    loading({ commit }, toggle) {
        commit('loading', toggle);
    },


    async getRecentCalls({ dispatch, commit }, user) {

        dispatch('loading', true);

        var customer_stores = JSON.parse(LZString.decompress(localStorage.getItem('customer_stores')));
        var customer_accounts = JSON.parse(localStorage.getItem('customer_accounts'));

        var getOpenCalls = dispatch('getCallsFromServer', { branch_id: user.branchId, call_status_id: 1, search_limit: 20 });
        var getAllocatedCalls = dispatch('getCallsFromServer', { branch_id: user.branchId, call_status_id: 2, search_limit: 20 });
        var [openCalls, allocatedCalls] = await Promise.all([getOpenCalls, getAllocatedCalls]);
        var allCalls = openCalls.concat(allocatedCalls);

        await dispatch('getCallTechnicians', allCalls);

        console.log('Recent Calls: ', allCalls);
        allCalls.sort((a,b) => {
            return new Date(b.openTime) - new Date(a.openTime);
        })

        allCalls.map(call => {

            call['customerStore'] = '';
            call['customerStoreName'] = '';
            call['customerStoreBranchCode'] = '';
            call['customerAccount'] = '';
            call['customerAccountName'] = '';


            var store = customer_stores.filter(store => store.id === call.customerStoreId)[0];

            if(store)
            {
                call.customerStore = store;
                call.customerStoreName = store.name;
                call.customerStoreBranchCode = store.branchCode;

                var account = customer_accounts.filter(acc => acc.id === store.customerAccountId)[0];

                if(account)
                {
                    call.customerAccount = account;
                    call.customerAccountName = account.name;
                }
            }
        })

        commit('recentCalls', allCalls);

        dispatch('loading', false);

    },




    async getCallsFromServer({ }, params) {
        return axiosOffice.get('calls', {
            params: params
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




    async getCallTechnicians({ }, calls) {
        if(calls.length >= 1)
        {
            await Promise.all(calls.map(async call => {

                call['technicianEmployeeCodes'] = [];


                await axiosOffice.get('calls/techs', {
                    params: {
                        call_id: call.id
                    }
                })
                .then(async resp => {
                    if(resp.status === 200)
                        call['technicians'] = resp.data;
                 
                })
                .catch(err => {
                    console.error('Axios Office Error: ', err);
                    console.error('Axios Office Error Response: ', err.response);
                })
            }))
        }
        else
        {
            return [];
        }
    }


}





// mutations
const mutations = {


    loading(state, toggle) {
        state.loading = toggle;
    },



    recentCalls(state, calls) {
        state.recentCalls = calls;
    },



}





export default {
    namespaced: true,
    state,
    getters,
    actions,
    mutations
}