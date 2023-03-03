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
import ErrorLog from './Modules/ErrorLog'
import GeoLocation from './Modules/GeoLocation'

import RouteFCM from './Modules/RouteFCM'

// Login & Auth
import Login from '../components/Login/Login'



// Technician Stores

// Dashboard
import Dashboard from '../views/Tech/Dashboard/Dashboard'

// Calls
import Calls from '../views/Tech/Calls/Calls'
import Call from '../views/Tech/Call/Call'





// Ops Admin Stores

// Ops Dashboard (Recent Calls)
import RecentCalls from '../views/OpsAdmin/OpsDashboard/RecentCalls'


// Add Call
import AddCall from '../views/OpsAdmin/AddCall/AddCall'
import AllocateTech from '../views/OpsAdmin/AllocateTech/AllocateTech'


// Call Dashboards
import TechnicianCalls from '../views/OpsAdmin/TechDashboard/TechnicianCalls'
import OpenCalls from '../views/OpsAdmin/OpenCalls/OpenCalls'



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
    ErrorLog,
    GeoLocation,

    // Firebase Message App Routing
    RouteFCM,

    // Login && Auth
    Login,



    
    // Tech Stores

    // Dashboard
    Dashboard,

    // Calls
    Calls,
    Call,




    // Ops Admin Stores
    
    // Ops Dashboard (Recent Calls)
    RecentCalls,

    // Add Call
    AddCall,
    AllocateTech,

    // Techs & Calls
    TechnicianCalls,
    OpenCalls
  }
})
