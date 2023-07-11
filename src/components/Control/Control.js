import { socket } from '../../socket_io'

// initial state
const state = () => ({
    updating: false,
    checkingForUpdates: false,
    resettingApp: false,
    syncingJobData: false
})





// getters
const getters = {
    updating: (state) => {
        return state.updating
    },

    checkingForUpdates: (state) => {
        return state.checkingForUpdates;
    },

    resettingApp: (state) => {
        return state.resettingApp;
    },

    syncingJobData: (state) => {
        return state.syncingJobData;
    }
}





// actions
const actions = {

    initUpdates({ commit, dispatch }) {
        var updating = localStorage.getItem('updating');
        // console.log('LocalStorage updating: ', updating);
        if(updating == null || updating == undefined) { 
            localStorage.setItem('updating', false);
            commit('updating', false);
            socket.emit('updating', false);    
            return 
        }
        updating = updating == 'true' ? true : false;
        // console.log('Setting updating to: ', updating);

        commit('updating', updating);
        dispatch('updateCompleted');
        socket.emit('updating', localStorage.getItem('socketUUID'), updating);
    },



    updateCompleted({ commit, dispatch }) {
        var showUpdateMessage = JSON.parse(localStorage.getItem('showUpdateMessage'));

        console.log('showing update message: ', showUpdateMessage);

        if(showUpdateMessage)
        {
            var toast = {
                shown: false,
                type: 'okay', // ['info', 'warning', 'error', 'okay']
                heading: 'App updated to version ' + process.env.PACKAGE_VERSION, // (Optional)
                body: '', 
                time: 3500, // in milliseconds
                icon: '' // leave blank for default type icon
            }

            dispatch('Toast/toast', toast, {root: true});
            localStorage.setItem('showUpdateMessage', false);
        }
    },



    checkingForUpdates({ commit }, toggle) {
        console.log('🧷🧷🧷 - Checking For Updates: ', toggle);  
        commit('checkingForUpdates', toggle);
        socket.emit('checking_for_updates', localStorage.getItem('socketUUID'), toggle);
    },








    resettingApp({ commit }, toggle) {
        commit('resettingApp', toggle);
    },

    syncingJobData({ commit }, toggle) {
        commit('syncingJobData', toggle);
    }

}





// mutations
const mutations = {

    updating(state, updating) {
        console.log('⚠⚠⚠ - updating: ', updating);
        state.updating = updating;
    },

    checkingForUpdates(state, toggle) {
        state.checkingForUpdates = toggle;
    },

    resettingApp(state, toggle) {
        state.resettingApp = toggle;
    },

    syncingJobData(state, toggle) {
        state.syncingJobData = toggle;
    }
}





export default {
    namespaced: true,
    state,
    getters,
    actions,
    mutations
}