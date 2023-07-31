/* eslint-disable no-console */

import { register } from 'register-service-worker'
// import store from './store'


if (process.env.NODE_ENV === 'production') {
	register(`${process.env.BASE_URL}firebase-messaging-sw.js`, {
		ready() {
			// console.log('checking for updates? ', store.getters['Control/checkingForUpdates']);
			// store.dispatch('Control/checkingForUpdates', true);
			console.log(
				'App is being served from cache by a service worker.\n' +
				'For more details, visit https://goo.gl/AFskqB'
			);
			// setTimeout(() => {
			// 	store.dispatch('Control/checkingForUpdates', false);
			// }, 1500);
		},
		updatefound() {
			
			console.log('New content is downloading.')
		},
		registered() {
			console.log('Service worker has been registered.');

			// setTimeout(() => {
			// 	store.dispatch('Control/checkingForUpdates', false);
			// 	localStorage.setItem('updating', false);
			// 	store.dispatch('Control/initUpdates');
			// }, 1500);

			
		},
		cached() {
			console.log('Content has been cached for offline use.')
		},
		
		updated() {
			// store.dispatch('Control/updateCompleted');
			// localStorage.setItem('updating', true);
			// store.dispatch('Control/initUpdates');
			console.log('New content is available; please refresh.')
		},
		offline() {
			console.log('No internet connection found. App is running in offline mode.')
		},
		error(error) {
			console.error('Error during service worker registration:', error)
		}
	})
}
