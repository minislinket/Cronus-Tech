import { axiosOffice } from "../../../axios/axios";
import router from "../../../router";


// initial state
const state = () => ({
    call: '',
    loading: false,

    addNewCallModal: false,

    commentModal: false,
    commentingOnCalls: [],
    commentNextStatusId: '',
    generalCommentModal: false,

    linkJobCardModal: false,
    linkOrderNumberModal: false,
    returnDateModal: false,
    uploadDocModal: false,
    
    viewCallCommentsModalActive: false,
    callComments: [],
    loadingCallComments: false
})





// getters
const getters = {

    call: (state) => {
        return state.call;
    },

    loading: (state) => {
        return state.loading;
    },



    addNewCallModal: (state) => state.addNewCallModal,



    commentModal: (state) => {
        return state.commentModal;
    },

    commentingOnCalls: (state) => {
        return state.commentingOnCalls;
    },

    commentNextStatusId: (state) => {
        return state.commentNextStatusId;
    },


    generalCommentModal: (state) => {
        return state.generalCommentModal;
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


    uploadDocModal: (state) => {
        return state.uploadDocModal;
    },


    
    viewCallCommentsModalActive: (state) => {
        return state.viewCallCommentsModalActive;
    },

    callComments: (state) => {
        return state.callComments;
    },

    loadingCallComments: (state) => {
        return state.loadingCallComments;
    },
    
    
}





// actions
const actions = {


    loading({ commit }, toggle) {
        commit('loading', toggle);
    },


    addNewCallModal({ commit }, toggle) {
        commit('addNewCallModal', toggle);
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



    generalCommentModal({ commit }, toggle) {
        commit('generalCommentModal', toggle);
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


    viewCallCommentsModalActive({ commit, dispatch }, toggle) {
        if(toggle === true)
        {
            dispatch('loadCallComments');
        }
        commit('viewCallCommentsModalActive', toggle);
    },

    callComments({ commit }, comments) {
        commit('callComments', comments);
    },

    loadingCallComments({ commit }, toggle) {
        commit('loadingCallComments', toggle);
    },


    uploadDocModal({ commit }, toggle) {
        commit('uploadDocModal', toggle);
    },





    loadCallComments({ state, commit, dispatch }) {
        dispatch('loadingCallComments', true);

        axiosOffice.get('calls/comments?call_id=' + state.call.id)
        .then(resp => {
            if(resp.status === 200)
            {
                commit('callComments', resp.data);
            }
            dispatch('loadingCallComments', false);
        })
        .catch(err => {
            console.error('Axios Office Error: ', err);
            console.error('Axios Office Error Response: ', err.response);
            dispatch('loadingCallComments', false);
        })
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
            dispatch('Calls/sortCalls', null, { root: true });
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
        editCall.allJobCardsHaveCMIS = false;
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
    },







    uploadDocuments({ dispatch }, payload) {
        dispatch('loading', true);

        var query = '';

        if(payload.fileTypeId == 19)
        {
            query = 'job_cards/'+payload.jobCardId+'/upload';
        }
        else
        {
            query = 'customers/store/' + payload.call.customerStoreId + '/upload?customer_call_id=' + payload.call.id  + '&document_type_id=' + payload.fileTypeId;
        }


        axiosOffice.post(query, payload.formData, {
            headers: {
                "Content-Type": "multipart/form-data",
                'Accept': 'multipart/form-data'
            }
        })
        .then(resp => {
            console.log(resp);
            if(resp.status == 200)
            {
                var toast = {
                    shown: false,
                    type: 'okay', // ['info', 'warning', 'error', 'okay']
                    heading: 'Files uploaded successfully', // (Optional)
                    body: '', 
                    time: 3500, // in milliseconds
                    icon: '' // leave blank for default type icon
                }

                dispatch('Toast/toast', toast, {root: true});
                dispatch('uploadDocModal', false);
                dispatch('loading', false);
                // payload.call.allJobCardsHaveCMIS = true;
                dispatch('Calls/updateLocalStorage', payload.call, { root: true });
            }
        })
        .catch(err => {
            console.error('Axios Office Error: ', err);
            console.error('Axios Office Error Response: ', err.response);


            if(err.response && err.response.data && err.response.data.message && err.response.data.message.indexOf('Job card must be linked to a call first') !== -1)
            {
                var toast = {
                    shown: false,
                    type: 'warning', // ['info', 'warning', 'error', 'okay']
                    heading: 'Link Job Card', // (Optional)
                    body: 'Please link your Job Card to a Job/Call first', 
                    time: 5000, // in milliseconds
                    icon: '' // leave blank for default type icon
                }
    
                dispatch('Toast/toast', toast, {root: true});
                dispatch('loading', false);
                return
            }



            var modal = {
                active: true, // true to show modal
                type: 'error', // ['info', 'warning', 'error', 'okay']
                icon: [], // Leave blank for no icon
                heading: 'Error during upload',
                body:   '<p>Please make sure you have stable internet, then try the upload again</p>'
                        +'<p>If that still isn\'t working and you are busy uploading photos, please try uploading less at a time.</p>'
                        +'<br><p>Please note that the server could also be experiencing problems.</p>',
                
                
            }
            dispatch('Modal/modal', modal, { root: true });


            // var toast = {
            //     shown: false,
            //     type: 'error', // ['info', 'warning', 'error', 'okay']
            //     heading: 'Error during upload', // (Optional)
            //     body: 'Please make sure you have stable internet, then try again', 
            //     time: 5000, // in milliseconds
            //     icon: '' // leave blank for default type icon
            // }

            // dispatch('Toast/toast', toast, {root: true});
            dispatch('loading', false);
        })


        
    },




}





// mutations
const mutations = {


    loading(state, toggle) {
        state.loading = toggle;
    },


    addNewCallModal(state, toggle) {
        state.addNewCallModal = toggle;
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


    generalCommentModal(state, toggle) {
        state.generalCommentModal = toggle;
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
    
    uploadDocModal(state, toggle) {
        state.uploadDocModal = toggle;
    },




    viewCallCommentsModalActive(state, toggle) {
        state.viewCallCommentsModalActive = toggle;
    },

    callComments(state, comments) {
        state.callComments = comments;
    },

    loadingCallComments(state, toggle) {
        state.loadingCallComments = toggle;
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