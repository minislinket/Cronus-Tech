import LZString from "lz-string";
import { axiosOffice, axiosMySQL } from "../../axios/axios";
import router from "../../router";
import idb from "../../idb";

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
        },
        {
            url: '/company/branches',
            name: 'branches'
        },
        {
            url: '/inventory/item_categories',
            name: 'item_categories'
        },
        {
            url: '/inventory/items',
            name: 'inventory_items'
        },
        {
            url: '/document_types',
            name: 'document_types'
        }
        
    ],


    online: true,
    canReAuthenticate: false,



})





// getters
const getters = {
    online: (state) => {
        return state.online;
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





    async setOnline({ commit, dispatch }, toggle) {
        console.log('Changing online status to: ', toggle);
        

        if(toggle === true)
        {

            await dispatch('Calls/refreshTechnicianCalls', null, { root: true });

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

        commit('setOnline', toggle);
    },







    // Load all static resources including the user info
    async loadStaticResources({ dispatch, rootGetters }) {

        var userType = rootGetters['UserRole/currentUserRole']

        await dispatch('getUser');

        

        var getCustomerStores = dispatch('getCustomerStores');
        var getCustomerAccounts = dispatch('getCustomerAccounts');
        var setBaseResources = dispatch('setBaseResources');
        await Promise.all([getCustomerStores, getCustomerAccounts, setBaseResources]);
        // console.log('User Type: ', userType);
        userType === 1 ? dispatch('Calls/refreshTechnicianCalls', true, {root: true}) : null;

    },



    // Only load base static resources, leave user info intact
    async loadBaseStaticResources({ dispatch, rootGetters }) {

        var userType = rootGetters['UserRole/currentUserRole']
        
        dispatch('removeBaseResources');
        
        var getCustomerStores = dispatch('getCustomerStores');
        var getCustomerAccounts = dispatch('getCustomerAccounts');
        var setBaseResources = dispatch('setBaseResources');
        await Promise.all([getCustomerStores, getCustomerAccounts, setBaseResources]);
        
        userType === 1 ? dispatch('Calls/refreshTechnicianCalls', false, {root: true}) : null;

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





    async getUser({ dispatch }) {

        await axiosOffice.get('/company/employees/current')
            .then(resp => {
                console.log(resp);
                if(resp.status === 200 && resp.data)
                {
                    localStorage.setItem('user', JSON.stringify(resp.data));
                    dispatch('checkLastLocation', resp.data);
                }
            })
            .catch(err => {
                console.error('Axios_Office Error: ', err);
                console.error('Axios_Office Error Response: ', err.response);
            })

    },



    checkLastLocation({}, user) {

        // check if locationLastUpdate is greater than 2 days ago
        var lastLocationUpdate = new Date(user.locationLastUpdate);
        var now = new Date();
        var diff = now - lastLocationUpdate;
        var diffDays = diff / (1000 * 60 * 60 * 24);

        if(!user.lastLatitude || !user.lastLongitude || !user.locationLastUpdate || diffDays > 2)
        {
            var intentLink = document.createElement('a');
            intentLink.href = 'cronus://track?firebaseToken='+user.firebaseTokenMobile
            intentLink.click();
        }
        
    },





    async setBaseResources({ state, dispatch }) {

        await Promise.all(state.baseResources.map(async res => {

            var existingResource = localStorage.getItem(res.name);
            if(existingResource) { return }
            

            await axiosOffice.get(res.url)
            .then(async resp => {
                if(resp.status === 200 && resp.data)


                // if(res.name == 'branches')
                // {
                //     await dispatch('setBranchCoordinates', resp.data);
                // }


                if(res.name === 'inventory_items')
                {
                    resp.data.map(item => item['name'] = item.description);
                }

                if(res.name === 'document_types')
                {

                    resp.data.sort((a,b) => a.id - b.id );

                    resp.data.unshift
                    (
                        { id: 19, name: "Job Card", abbreviation: "JC" },
                    )

                    var docTypeDB = await idb.checkDatabaseExists('document_types', 1);
                    if(docTypeDB)
                    {
                        await Promise.all(resp.data.map(async docType => {
                            await idb.updateRecord('document_types', docType);
                        }));
                    }
                    else
                    {
                        await Promise.all(resp.data.map(async docType => {
                            await idb.addRecord('document_types', 1, [], docType);
                        }));
                    }

                   
                }


                localStorage.setItem(res.name, JSON.stringify(resp.data));


                if(res.name === 'employees')
                {
                    var techs = resp.data.filter(emp => emp.technician === true && emp.active === true);
                    localStorage.setItem('technicians', JSON.stringify(techs));
                }
                

                
            })
            .catch(err => {
                console.error('Axios Office Error: ', err);
                console.error('Axios Office Error Response: ', err.response);
            })

        }))
  

    },





    async setBranchCoordinates({}, branches) {

        await Promise.all(branches.map(branch => {

            switch(branch.id) {

                // Gauteng
                case 4: 
                    branch.longitude = '';
                    branch.latitude = '';
                    break
                // KZN
                case 5: 
                    branch.longitude = '';
                    branch.latitude = '';
                    break
                // Western Cape
                case 6: 
                    branch.longitude = '';
                    branch.latitude = '';
                    break
                // Eastern Cape
                case 7: 
                    branch.longitude = '';
                    branch.latitude = '';
                    break
                // Free State
                case 8: 
                    branch.longitude = '';
                    branch.latitude = '';
                    break
                // Limpopo
                case 9: 
                    branch.longitude = '';
                    branch.latitude = '';
                    break
                // National
                case 11: 
                    branch.longitude = '';
                    branch.latitude = '';
                    break

            }

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