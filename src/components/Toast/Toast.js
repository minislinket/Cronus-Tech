// initial state
const state = () => ({

    toastQueue: [],
    nextId: 0

})





// getters
const getters = {
    toastQueue: (state) => {
        return state.toastQueue;
    },
}





// actions
const actions = {

// Call this.$store.dispatch('Toast/toast', toast), from any Vue module)
// passing the object below as a parameter.

// var toast = {
//    shown: false,
//    type: 'info', // ['info', 'warning', 'error', 'okay']
//    heading: '', // (Optional)
//    body: '', 
//    time: 0, // in milliseconds
//    icon: '' // leave blank for default toast type icon
// }
// this.$store.dispatch('Toast/toast', toast) || store.dispatch('Toast/toast', toast, { root: true })



    // Set Toast data and show Toast
    // Reset state after toast.time(ms)
    toast({ commit }, toast) {
        commit('addToQueue', toast);
    },



}





// mutations
const mutations = {


    addToQueue(state, toast) {
        state.nextId++;
        toast.id = state.nextId;
        state.toastQueue.push(toast);
    },


}





export default {
    namespaced: true,
    state,
    getters,
    actions,
    mutations
}