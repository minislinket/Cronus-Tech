import { axiosOffice } from "../../../axios/axios";

// initial state
const state = () => ({
    loading: false,
    stock: []
})





// getters
const getters = {
    loading: (state) => {
        return state.loading;
    },


    stock: (state) => {
        return state.stock;
    }
}





// actions
const actions = {



    loading({ commit }, toggle) {
        commit('loading', toggle);
    },





    loadTechnicianStock({ dispatch, commit }) {

        dispatch('loading', true);

        var user = JSON.parse(localStorage.getItem('user'));
        var inventory_items = JSON.parse(localStorage.getItem('inventory_items'));

        axiosOffice.get('inventory/inventory_stores/items?inventory_store_id='+user.inventoryStoreId)
        .then(resp => {
            console.log(resp);
            if(resp.status == 200 && resp.data)
            {
                resp.data.map(inventoryItem => {

                    var itemDetail = inventory_items.filter(item => item.id === inventoryItem.inventoryItemId)[0];
                    if(itemDetail)
                    {
                        inventoryItem['name'] = itemDetail.description;
                    }

                })


                resp.data.sort((a,b) => {
                    return a.inventoryItemId - b.inventoryItemId;
                })

                commit('stock', resp.data);
                dispatch('loading', false);
            }
        })
        .catch(err => {
            console.error('Axios Office Error: ', err);
            console.error('Axios Office Error Response: ', err.response);
            dispatch('loading', false);
        })

    }

}





// mutations
const mutations = {

    loading(state, toggle) {
        state.loading = toggle;
    },


    stock(state, stock) {
        state.stock = stock;
    },

}





export default {
    namespaced: true,
    state,
    getters,
    actions,
    mutations
}