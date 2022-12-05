// initial state
const state = () => ({
    customerStore: '',
    customerAccount: '',

})





// getters
const getters = {
    
}





// actions
const actions = {



    resetAddCall({ commit }) {
        commit('resetAddCall');
    },




    selectCustomerStore({ dispatch, commit }, customerStore) {
        commit('selectCustomerStore', customerStore);
        dispatch('assignCustomerAccount', customerStore.customerAccountId);
    },



    assignCustomerAccount({ commit }, customerAccountId) {
        var customer_accounts = JSON.parse(localStorage(getItem('customer_accounts')));
        var account = customer_accounts.filter(acc => acc.id === customerAccountId)[0];
        
        if(account)
            commit('assignCustomerAccount', account);
    }

}





// mutations
const mutations = {

    selectCustomerStore(state, store) {
        state.customerStore = store;
    },


    assignCustomerAccount(state, account) {
        state.customerAccount = account;
    },










    resetAddCall(state) {
        state.customerStore = '';
        state.customerAccount = '';
    }

}





export default {
    namespaced: true,
    state,
    getters,
    actions,
    mutations
}