import router from "../../router";

// initial state
const state = () => ({
    userRoles: [
        {
            id: 1,
            name: 'Tech'
        },
        {
            id: 2,
            name: 'OpsAdminLocal'
        },
        {
            id: 3,
            name: 'OpsAdmin'
        }
    ],

    currentUserRole: 1,
    availableRoles: [1]
})





// getters
const getters = {

    userRoles: (state) => {
        return state.userRoles;
    },


    currentUserRole: (state) => {
        return state.currentUserRole;
    },

    availableRoles: (state) => {
        return state.availableRoles;
    }
}





// actions
const actions = {

    setUserRole({ commit, state }, userRoleId) {
        if(state.availableRoles.includes(userRoleId))
        {
            // console.log('Setting user type to: ', userRoleId);
            localStorage.setItem('user_type', userRoleId);
            commit('setUserRole', userRoleId);
        }
        else
        {
            // var toast = {
            //     shown: false,
            //     type: 'error', // ['info', 'warning', 'error', 'okay']
            //     heading: 'Role not Available', // (Optional)
            //     body: 'You do not have that Role', 
            //     time: 4000, // in milliseconds
            //     icon: '' // leave blank for default type icon
            // }


            // dispatch('Toast/toast', toast, {root: true})
            // console.log('No user role available to set...', state.availableRoles, userRoleId);
        }
    },



    setAvailableRoles({ commit, dispatch }, roles) {
        // console.log('Setting Available roles: ', roles)
        commit('setAvailableRoles', roles);
        dispatch('checkCurrentRole');
    },




    checkCurrentRole({ state, dispatch }) {
        var user_type = Number(localStorage.getItem('user_type')); 

        if(user_type)
        {
            // if(user_type == 2 && router.currentRoute.value.path == '/dashboard' || user_type == 3 && router.currentRoute.value.path == '/dashboard')
            // {
            //     router.push('/ops_dashboard');
            // }

            if(state.currentUserRole !== user_type)
            {
                dispatch('setUserRole', user_type);
            }
        }
        else
        {
            dispatch('setUserRole', 1);
        }
    }

}





// mutations
const mutations = {
    setUserRole(state, userRoleId) {
        state.currentUserRole = userRoleId;
    },



    setAvailableRoles(state, roles) {
        state.availableRoles = roles;
    }
}





export default {
    namespaced: true,
    state,
    getters,
    actions,
    mutations
}