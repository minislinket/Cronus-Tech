import { createStore } from 'vuex'


// General App Components
import Modal from '../components/Modal/Modal'
import Toast from '../components/Toast/Toast'
import Loading from '../components/Loading/Loading'
import Menu from '../components/Menu/Menu'
import QuickMenu from '../components/QuickMenu/QuickMenu'
import StaticResources from './Modules/StaticResources'
import Settings from '../views/Settings/Settings'
import UserRole from './Modules/UserRole'

import RouteFCM from './Modules/RouteFCM'

// Login & Auth
import Login from '../components/Login/Login'

// Dashboard
import Dashboard from '../views/Tech/Dashboard/Dashboard'

// Calls
import Calls from '../views/Tech/Calls/Calls'
import Call from '../views/Tech/Call/Call'



export default createStore({
  modules: {
    // General App Components
    Modal,
    Toast,
    Loading,
    Menu,
    QuickMenu,
    StaticResources,
    Settings,
    UserRole,

    // Firebase Message App Routing
    RouteFCM,

    // Login && Auth
    Login,

    // Dashboard
    Dashboard,

    // Calls
    Calls,
    Call
  }
})
