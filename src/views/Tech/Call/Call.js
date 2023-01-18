import router from "../../../router";


// initial state
const state = () => ({
    call: '',
    loading: false,


    onHoldReasonModal: false,
    linkJobCardModal: false
})





// getters
const getters = {

    call: (state) => {
        return state.call;
    },

    loading: (state) => {
        return state.loading;
    },


    onHoldReasonModal: (state) => {
        return state.onHoldReasonModal;
    },


    linkJobCardModal: (state) => {
        return state.linkJobCardModal;
    }

    
    
}





// actions
const actions = {


    loading({ commit }, toggle) {
        commit('loading', toggle);
    },


    onHoldReasonModal({ commit }, toggle) {
        commit('onHoldReasonModal', toggle);
    },


    linkJobCardModal({ commit }, toggle) {
        commit('linkJobCardModal', toggle);
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
        if(nextStatusId === 8) 
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

    }

}





// mutations
const mutations = {


    loading(state, toggle) {
        state.loading = toggle;
    },


    onHoldReasonModal(state, toggle) {
        state.onHoldReasonModal = toggle;
    },


    linkJobCardModal(state, toggle) {
        state.linkJobCardModal = toggle;
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