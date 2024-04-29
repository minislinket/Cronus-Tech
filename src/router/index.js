import { createRouter, createWebHistory } from 'vue-router'
import routes from './routes'
import store from '../store'

const router = createRouter({
	history: createWebHistory(process.env.BASE_URL),
	routes,
	base: '/'
})





// Check if user is authorized
router.beforeEach((to, from, next) => {
	// console.log('Coming from path: ', from);
	// console.log('Going to path: ', to);
	if (to.path !== '/' && to.path !== '/psw-reset' && !store.getters['Login/isAuth']) next({ path: '/' });
	else if (to.path === '/' && store.getters['Login/isAuth']) next({ path: '/dashboard' });
	else if(to.path === '/dashboard' && store.getters['UserRole/currentUserRole'] === 2) next({ path: '/ops_dashboard' })
	else next()
})


// Check if user is authorized
router.afterEach((to, from) => {

	// console.log('From: ', from, 'To: ', to);

	store.dispatch('Menu/resetTitle');

	if (to.meta && to.meta.title)
		store.dispatch('Menu/setTitle', { title: to.meta.title, icon: to.meta.icon ? to.meta.icon : [] })

	if (to.path !== '/' && to.path !== '/psw-reset') 
	{
		store.dispatch('Login/checkLogin')
		store.dispatch('QuickMenu/activateMenuItem')

	}


})

export default router
