// initial state
const state = () => ({
    loading: false
})


// getters
const getters = {
    loading: (state) => {
        return state.loading;
    }
}


// actions
const actions = {
    setLoading({ commit }, toggle) {
        commit('setLoading', toggle);
    }
}


// mutations
const mutations = {
    setLoading(state, toggle) {
        // console.log('Are we loading something? ', toggle);
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