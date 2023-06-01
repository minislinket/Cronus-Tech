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
        {
            id: 2,
            icon: ['fa', 'file-arrow-up'],
            url: '/documents',
            text: 'Doc Uploads',
            active: false
        },
        {
            id: 3,
            icon: ['fa', 'box-archive'],
            url: '/stock',
            text: 'Stock',
            active: false
        },
        /* {
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
            active: false,
            iconFontSize: '26px'
        },
        {
            id: 1,
            icon: 'add_call',
            url: '/add_call',
            text: 'Log Call',
            active: false,
            iconFontSize: '30px'
        },
        {
            id: 1,
            icon: ['fa', 'user-plus'],
            url: '/allocate_tech',
            text: 'Allocate Tech',
            active: false,
            iconFontSize: '26px'
        },
        {
            id: 2,
            icon: 'contact_phone',
            url: '/technician_calls',
            text: 'Tech Dash',
            active: false,
            iconFontSize: '32px'
        },
        {
            id: 2,
            icon: 'phone_callback',
            url: '/open_calls',
            text: 'Open Calls',
            active: false,
            iconFontSize: '30px'
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
        state.opsMenuItems.map(item => { item.url === router.currentRoute.value.path ? item.active = true : item.active = false });
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