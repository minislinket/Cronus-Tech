import { axiosMySQL } from "../../axios/axios";

// initial state
const state = () => ({

})





// getters
const getters = {
    
}





// actions
const actions = {

    logError({ rootGetters }, err) {

        var online = rootGetters['StaticResources/online'];

        if(!err.user)
        {
            var user = JSON.parse(localStorage.getItem('user'));
            user ? err.user = user : err.user = 'Not found';
        }

        if(!online) { 
            dispatch('ErrorLog/backupLogInLocal', err);
            return
        }

        axiosMySQL.post('/errorLog/errorLog.php', err)
        .catch(err => {
            console.error('Error posting to error log, haha doesn\'t that suck...', err);
        })

    },




    backupLogInLocal({  }, err) {

        var backupLog = localStorage.getItem('backup_error_log');

        backupLog ? backupLog = JSON.parse(backupLog) : backupLog = [];
        backupLog.push(err);
        localStorage.setItem('backup_error_log', JSON.stringify(backupLog));

    }

}





// mutations
const mutations = {

}





export default {
    namespaced: true,
    state,
    getters,
    actions,
    mutations
}