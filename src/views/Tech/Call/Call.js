import router from "../../../router";


// initial state
const state = () => ({
    call: '',
    loading: false,


    commentModal: false,
    commentingOnCalls: [],
    commentNextStatusId: '',


    linkJobCardModal: false,
    linkOrderNumberModal: false,
    returnDateModal: false
})





// getters
const getters = {

    call: (state) => {
        return state.call;
    },

    loading: (state) => {
        return state.loading;
    },



    commentModal: (state) => {
        return state.commentModal;
    },

    commentingOnCalls: (state) => {
        return state.commentingOnCalls;
    },

    commentNextStatusId: (state) => {
        return state.commentNextStatusId;
    },



    linkJobCardModal: (state) => {
        return state.linkJobCardModal;
    },

    
    linkOrderNumberModal: (state) => {
        return state.linkOrderNumberModal;
    },

    returnDateModal: (state) => {
        return state.returnDateModal;
    },
    
    
}





// actions
const actions = {


    loading({ commit }, toggle) {
        commit('loading', toggle);
    },


    commentModal({ commit }, toggle) {
        commit('commentModal', toggle);
    },

    commentingOnCalls({ commit }, call) {
        commit('commentingOnCalls', call);
    },

    commentNextStatusId({ commit }, nextStatusId) {
        commit('commentNextStatusId', nextStatusId);
    },
    


    linkJobCardModal({ commit }, toggle) {
        commit('linkJobCardModal', toggle);
    },

    
    linkOrderNumberModal({ commit }, toggle) {
        commit('linkOrderNumberModal', toggle);
    },

    returnDateModal({ commit }, toggle) {
        commit('returnDateModal', toggle);
    },
    
    



    async loadCall({ commit, dispatch }, callId) {

        commit('resetCallState');
        dispatch('loading', true);

        
        var call = await dispatch('getCallFromCalls', callId);
        if(!call)
        {
            await dispatch('Calls/getTechnicianCalls', null, { root: true });
            call = await dispatch('getCallFromCalls', callId);               
            if(!call)
            {
                await dispatch('Calls/refreshTechnicianCalls', null, { root :true });
                call = await dispatch('getCallFromCalls', callId);
            }
        }

        // console.log(call);
        

        if(call)
            commit('call', call);
        else
        {
            // Error finding call, report to user...
        }
            
        
        dispatch('loading', false);
    },









    async getCallFromCalls({ rootGetters }, callId) {
        var calls = rootGetters['Calls/allCalls'];
        // console.log(calls);
        var call = '';
        call = calls.filter(call => call.id.toString() === callId.toString())[0];
        // console.log(call);
        return call;
    },










    // Update Technician status on a call/job
    updateCall({ state, dispatch, rootGetters }, payload) {

        dispatch('loading', true);

        var nextStatusId = payload.nextStatusId;
        var editCall = payload.call;

        var techStates = JSON.parse(localStorage.getItem('call_tech_states'));     
        var techState = techStates.filter(state => state.id === nextStatusId)[0];
        var calls = rootGetters['Calls/allCalls'];
        var call = '';
        calls.map(c => {
            if(c.id === editCall.id)
            {
                call = JSON.parse(JSON.stringify(c));
            }
        });

        call.techState = techState;
        call.techStateId = techState.id;
        call.techStateName = techState.name;

        dispatch('Calls/updateLocalStorage', call, { root: true });

        dispatch('loading', false);

        // If the Tech is done, take them to their other calls/jobs for a new selection
        if(nextStatusId === 8 || nextStatusId === 5 || nextStatusId === 6) 
        {
            router.push('/calls');
        }

        
        
    },







    linkJobCards({ state, dispatch, rootGetters }, jobCardArray) {

        dispatch('loading', true);

        var allCalls = rootGetters['Calls/allCalls'];

        var editCall = '';
        allCalls.map(c => {
            if(c.id === state.call.id)
            {
                editCall = JSON.parse(JSON.stringify(c));
            }
        });

        editCall.jobCards = jobCardArray;
        dispatch('Calls/updateLocalStorage', editCall, { root: true });

        dispatch('loading', false);

    },








    linkOrderNumber({ state, dispatch, rootGetters }, orderNumber) {
        dispatch('loading', true);

        var allCalls = rootGetters['Calls/allCalls'];

        var editCall = '';
        allCalls.map(c => {
            if(c.id === state.call.id)
            {
                editCall = JSON.parse(JSON.stringify(c));
            }
        });

        editCall.orderNumber = orderNumber;
        dispatch('Calls/updateLocalStorage', editCall, { root: true });

        dispatch('loading', false);
    }

}





// mutations
const mutations = {


    loading(state, toggle) {
        state.loading = toggle;
    },


    commentModal(state, toggle) {
        state.commentModal = toggle;
    },

    commentingOnCalls(state, calls) {
        state.commentingOnCalls = calls;
    },

    commentNextStatusId(state, nextStatusId) {
        state.commentNextStatusId = nextStatusId;
    },
    

    linkJobCardModal(state, toggle) {
        state.linkJobCardModal = toggle;
    },


    linkOrderNumberModal(state, toggle) {
        state.linkOrderNumberModal = toggle;
    },

    returnDateModal(state, toggle) {
        state.returnDateModal = toggle;
    },
    
    


    

    call(state, call) {
        call.customerStoreAddress = call.customerStore ? call.customerStore.address : '';
        state.call = call;
    },



    resetCallState(state) {
        state.call = '';
        state.loading = false;
    }

}





export default {
    namespaced: true,
    state,
    getters,
    actions,
    mutations
}