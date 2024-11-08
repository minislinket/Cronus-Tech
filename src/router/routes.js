
// General Application Routes
import Login from '../components/Login/Login.vue'
import PageNotFound from '../components/PageNotFound/PageNotFound.vue'
import Settings from '../views/Settings/Settings.vue'
import PasswordReset from '../views/PswReset/PswReset.vue'


// Technician Specific Application Routes
import Dashboard from '../views/Tech/Dashboard/Dashboard.vue'
import Calls from '../views/Tech/Calls/Calls.vue'
import Call from '../views/Tech/Call/Call.vue'
import ViewUploads from '../views/Tech/Call/ViewUploads.vue'
import Stock from '../views/Tech/Stock/Stock.vue'


// Technician Operation Manager Application Routes
import OpsDashboard from '../views/OpsAdmin/OpsDashboard/OpsDashboard.vue'
import AddCall from '../views/OpsAdmin/AddCall/AddCall.vue'
import AllocateTech from '../views/OpsAdmin/AllocateTech/AllocateTech.vue'
import TechnicianCalls from '../views/OpsAdmin/TechDashboard/TechnicianCalls.vue'
import OpenCalls from '../views/OpsAdmin/OpenCalls/OpenCalls.vue'



const routes = [

	// General App Navigation
	{
		path: '/',
		name: 'Login',
		component: Login
	},
	{
		path: '/settings',
		name: 'Settings',
		component: Settings,
		meta: {
			title: 'Settings',
			icon: ['fa', 'cog']
		}
	},
	{
		path: '/psw-reset',
		name: 'Password Reset',
		component: PasswordReset
	},





	// Technician Navigation
	{
		path: '/dashboard',
		name: 'Dashboard',
		component: Dashboard,
		meta: {
			title: 'Home',
			icon: ['fa', 'home']
		}
	},
	{
		path: '/calls',
		name: 'Calls',
		component: Calls,
		meta: {
			title: 'Active Jobs',
			icon: ['fa', 'toolbox']
		}
	},
	{
		path: '/call/:callId',
		name: 'Call',
		component: Call,
		meta: {
			title: 'Client Call #',
			icon: ['fa', 'tools']
		}
	},
	{
		path: '/uploads/:callId',
		name: 'Uploads',
		component: ViewUploads,
		meta: {
			title: 'Uploads on Call #',
			icon: ['fa', 'folder-closed']
		}
	},
	{
		path: '/stock',
		name: 'Stock',
		component: Stock,
		meta: {
			title: 'Stock Levels',
			icon: ['fa', 'box-archive']
		}
	},
	// {
	// 	path: '/idb_test',
	// 	name: 'IDB Test',
	// 	component: () => import('../views/IDBTest/IDBTest.vue'),
	// 	meta: {
	// 		title: 'IDB Test',
	// 		icon: ['fa', 'database']
	// 	}
	// },
	




	// Ops Admin Navigation
	{
		path: '/ops_dashboard',
		name: 'Operations Dashboard',
		component: OpsDashboard,
	
	},
	{
		path: '/add_call',
		name: 'Add Call',
		component: AddCall,
		meta: {
			title: 'Add Call',
			icon: 'add_call'
		}
	},
	{
		path: '/allocate_tech',
		name: 'Allocate Tech',
		component: AllocateTech,
		meta: {
			title: 'Allocate Tech',
			icon: ['fa', 'user-plus']
		}
	},
	{
		path: '/technician_calls',
		name: 'Tech Dashboard',
		component: TechnicianCalls,
		meta: {
			title: 'Tech Dashboard',
			icon: 'contact_phone'
		}
	},
	{
		path: '/open_calls',
		name: 'Open Calls Dashboard',
		component: OpenCalls,
		meta: {
			title: 'Open Calls Dashboard',
			icon: 'phone_callback'
		}
	},
	







	// Page does not exist - Catch All Navigation for links that don't exist
	{
		path: '/:pathMatch(.*)',
		component: PageNotFound,
		meta: {
			title: 'Page Not Found...'
		}
	}
];


export default routes;