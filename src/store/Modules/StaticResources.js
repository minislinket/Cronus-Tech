import LZString from "lz-string";
import { axiosOffice, axiosMySQL } from "../../axios/axios";
import router from "../../router";

// initial state
const state = () => ({
    baseResources: [
        {
            url: '/calls/call_types',
            name: 'call_types'
        },
        {
            url: '/calls/call_sub_types',
            name: 'call_sub_types'
        },
        {
            url: '/calls/call_statuses',
            name: 'call_statuses'
        },
        {
            url: '/calls/tech_states',
            name: 'call_tech_states'
        },
        {
            url: '/calls/call_types',
            name: 'call_types'
        },
        {
            url: '/company/employees',
            name: 'employees'
        }
    ],


    online: true,
    initBackgroundCallSync: false,
    canReAuthenticate: false
})





// getters
const getters = {
    online: (state) => {
        return state.online;
    },

    initBackgroundCallSync: (state) => {
        return state.initBackgroundCallSync;
    },


    canReAuthenticate: (state) => {
        return state.canReAuthenticate;
    },


}





// actions
const actions = {



    canReAuthenticate({ commit }, toggle) {
        commit('canReAuthenticate', toggle);
    },





    setOnline({ commit }, toggle) {
        console.log('Changing online status: ', toggle);
        commit('setOnline', toggle);

        if(toggle === true)
        {
            var backupLog = localStorage.getItem('backup_error_log');
            var flag = false;
            if(backupLog)
            {
                backupLog = JSON.parse(backupLog);
                backupLog.map(log => {
                    axiosMySQL.post('/errorLog/errorLog.php', log)
                    .then(resp => {
                        console.log('Error log response: ', resp);
                    })
                    .catch(err => {
                        flag = true;
                        console.error('Axios SQL error: ', err);
                        console.error('Axios SQL error response: ', err.response);
                    })
                })
                
            }

            if(!flag)
            {
                localStorage.removeItem('backup_error_log');
            }

        }
    },




    initBackgroundCallSync({ commit }, toggle) {
        commit('initBackgroundCallSync', toggle);
    },



    // Load all static resources including the user info
    async loadStaticResources({ dispatch }) {
        dispatch('getCustomerStores');
        dispatch('getCustomerAccounts');
        await dispatch('getUser');
        await dispatch('setBaseResources');
        dispatch('Calls/refreshTechnicianCalls', true, {root: true});
        // dispatch('initBackgroundCallSync', true);
    },



    // Only load base static resources, leave user info intact
    async loadBaseStaticResources({ dispatch }) {
        dispatch('removeBaseResources');
        
        var getCustomerStores = dispatch('getCustomerStores');
        var getCustomerAccounts = dispatch('getCustomerAccounts');
        var setBaseResources = dispatch('setBaseResources');
        await Promise.all([getCustomerStores, getCustomerAccounts, setBaseResources]);
        
        dispatch('Calls/refreshTechnicianCalls', false, {root: true});
        
        // dispatch('initBackgroundCallSync', true);
    },




    removeBaseResources({ state }) {
        localStorage.removeItem('customer_stores');
        localStorage.removeItem('customer_accounts');
        state.baseResources.map(res => {

            var existingResource = localStorage.getItem(res.name);
            if(existingResource)
                localStorage.removeItem(res.name);

        })
    },





    async getUser({  }) {

        await axiosOffice.get('/company/employees/current')
            .then(resp => {
                // console.log(resp);
                if(resp.status === 200 && resp.data)
                {
                    localStorage.setItem('user', JSON.stringify(resp.data));
                }
            })
            .catch(err => {
                console.error('Axios_Office Error: ', err);
                console.error('Axios_Office Error Response: ', err.response);
            })

    },





    async setBaseResources({ state, dispatch }) {

        await Promise.all(state.baseResources.map(async res => {

            var existingResource = localStorage.getItem(res.name);
            if(existingResource) { return }
            

            await axiosOffice.get(res.url)
            .then(async resp => {
                if(resp.status === 200 && resp.data)
                    localStorage.setItem(res.name, JSON.stringify(resp.data));
            })
            .catch(err => {
                
            })

        }))
  

    },





    async getCustomerStores({  }) {

        var customerStores = localStorage.getItem('customer_stores');

        if(customerStores) { return }
        

        await axiosOffice.get('customers/store')
        .then(resp => {
            if(resp.status === 200 && resp.data.length >= 1)
            {
                resp.data.map(store => store.code = store.branchCode);
                resp.data.sort((a,b) => {
                    if(a.name > b.name) return 1;
                    if(a.name < b.name) return -1;
                    return 0;
                })
                var compressed = LZString.compress(JSON.stringify(resp.data));
                localStorage.setItem('customer_stores', compressed);
            }
        })

    },





    async getCustomerAccounts({  }) {

        var customerAccounts = localStorage.getItem('customer_accounts');

        if(customerAccounts) { return  }
        

        await axiosOffice.get('customers/accounts')
        .then(resp => {
            if(resp.status === 200 && resp.data.length >= 1)
            { 
                resp.data.sort((a,b) => {
                    if(a.name > b.name) return 1;
                    if(a.name < b.name) return -1;
                    return 0;
                })
                localStorage.setItem('customer_accounts', JSON.stringify(resp.data));
            }
        })

    },




}





// mutations
const mutations = {

    setOnline(state, toggle) {
        state.online = toggle;
    },




    initBackgroundCallSync(state, toggle) {
        state.initBackgroundCallSync = toggle;
    },




    canReAuthenticate(state, toggle) {
        state.canReAuthenticate = toggle;
    }

}





export default {
    namespaced: true,
    state,
    getters,
    actions,
    mutations
}