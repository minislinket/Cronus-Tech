// initial state
const state = () => ({
    updateAvailable: false
})





// getters
const getters = {
    updateAvailable: state => state.updateAvailable,
}





// actions
const actions = {
    updateAvailable({ commit }, toggle) {
        commit('updateAvailable', toggle);
    }
}





// mutations
const mutations = {
    updateAvailable(state, toggle) {
        state.updateAvailable = toggle;
    }
}





export default {
    namespaced: true,
    state,
    getters,
    actions,
    mutations
}