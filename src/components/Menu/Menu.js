// initial state
const state = () => ({

    titleIcon: [],
    titleText: ''

})





// getters
const getters = {
    
    titleIcon: (state) => {
        return state.titleIcon;
    },

    titleText: (state) => {
        return state.titleText;
    }

}





// actions
const actions = {

    resetTitle({ commit }) {
        commit('resetTitle');
    },

    setTitle({ commit }, payload) {
        commit('setTitleText', payload.title);
        if(payload.icon && payload.icon.length >= 2)
            commit('setTitleIcon', payload.icon);
    }

}





// mutations
const mutations = {

    setTitleText(state, title) {
        state.titleText = title;
    },


    setTitleIcon(state, icon) {
        state.titleIcon = icon;
    },




    resetTitle(state) {
        state.titleIcon = [];
        state.titleText = '';
    }

}





export default {
    namespaced: true,
    state,
    getters,
    actions,
    mutations
}