// initial state
const state = () => ({
    modal: {
        active: false,
        type: '', // ['info', 'warning', 'error', 'okay']
        icon: [],
        heading: '',
        body: ''
    }
})





// getters
const getters = {
    modal: (state) => {
        return state.modal;
    }
}





// actions
const actions = {


// Call this.$store.dispatch('Modal/modal', modal), from any Vue module)
// passing the object below as a parameter.

// var modal = {
//     active: true, // true to show modal
//     type: '', // ['info', 'warning', 'error', 'okay']
//     icon: [], // Leave blank for no icon
//     heading: '',
//     body: '',

//     Optional add on for when user needs to confirm or deny an action
//     confirmAction: 'init',
//     actionFrom: 'Call_canUpdateCall',
//     actionData: '',
//     resolveText: 'Okay',
//     rejectText: 'Cancel'
//     
// }
// this.$store.dispatch('Modal/modal', modal) || store.dispatch('Modal/modal', modal, { root: true })


    modal({ commit }, modal) {
        commit('modal', modal);
    },




    closeModal({ commit }) {
        commit('closeModal');
    },



    modalResolve({ commit }) {
        commit('modalResolve');
    },


    modalReject({ commit }) {
        commit('modalReject');
    }

}





// mutations
const mutations = {
    modal(state, modal) {
        state.modal = modal;
    },


    closeModal(state) {
        state.modal.active = false;
    },




    modalResolve(state) {
        console.log('Modal resolved... ');
        state.modal.confirmAction = true;
        state.modal.active = false;
        setTimeout(() => {
            state.modal.confirmAction = 'init';
        }, 1500);
    },


    modalReject(state) {
        console.log('Modal rejected... ');
        state.modal.confirmAction = false;
        state.modal.active = false;
        setTimeout(() => {
            state.modal.confirmAction = 'init';
        }, 1500);
    }
}





export default {
    namespaced: true,
    state,
    getters,
    actions,
    mutations
}