import router from '../../router/index'

// initial state
const state = () => ({
    menuItems: 
    [
        {
            id: 0,
            icon: ['fa', 'home'],
            url: '/dashboard',
            text: 'Home',
            active: false
        },
        {
            id: 1,
            icon: ['fa', 'toolbox'],
            url: '/calls',
            text: 'Jobs',
            active: false
        },
        /* {
            id: 2,
            icon: ['fa', 'user-circle'],
            url: '/',
            text: 'Sample',
            active: false
        },
        {
            id: 4,
            icon: ['fa', 'exclamation-triangle'],
            url: '/',
            text: 'Sample',
            active: false
        } */
        
    ],

    opsMenuItems: 
    [
        {
            id: 0,
            icon: ['fa', 'home'],
            url: '/ops_dashboard',
            text: 'Home',
            active: false
        },
        {
            id: 1,
            icon: 'add_call',
            url: '/add_call',
            text: 'Log Call',
            active: false
        },
        {
            id: 2,
            icon: 'contact_phone',
            url: '/technician_calls',
            text: 'Tech\'s & Calls',
            active: false
        }
    ]
})





// getters
const getters = {
    menuItems: (state) => {
        return state.menuItems;
    },
    opsMenuItems: (state) => {
        return state.opsMenuItems;
    }
}





// actions
const actions = {

    activateMenuItem({ state }) {
        state.menuItems.map(item => { item.url === router.currentRoute.value.path ? item.active = true : item.active = false });        
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