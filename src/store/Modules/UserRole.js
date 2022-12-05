// initial state
const state = () => ({
    userRoles: [
        {
            id: 1,
            name: 'Tech'
        },
        {
            id: 2,
            name: 'OpsAdmin'
        }
    ],

    currentUserRole: 1
})





// getters
const getters = {
    currentUserRole: (state) => {
        return state.currentUserRole;
    }
}





// actions
const actions = {

    setUserRole({ commit }, cronusUserRole) {
        if(cronusUserRole === 100)
            commit('setUserRole', 2);
        else    
            commit('setUserRole', 1)
    }

}





// mutations
const mutations = {
    setUserRole(state, userRoleId) {
        state.currentUserRole = userRoleId;
    }
}





export default {
    namespaced: true,
    state,
    getters,
    actions,
    mutations
}