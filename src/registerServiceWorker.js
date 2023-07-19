/* eslint-disable no-console */

import { register } from 'register-service-worker'
import store from './store'

const SW_NAME_VERSION = 'firebase-messaging-sw.js';


if (process.env.NODE_ENV === 'production') {
	register(`${process.env.BASE_URL}${SW_NAME_VERSION}`, {
		ready() {
			console.log(
				'App is being served from cache by a service worker.\n' +
				'For more details, visit https://goo.gl/AFskqB'
			);
		},
		updatefound() {
			console.log('New content is downloading.')
		},
		registered() {
			console.log('Service worker has been registered.');
			
			setTimeout(() => {
				localStorage.setItem('updating', false);
				store.dispatch('Control/initUpdates');
			}, 1500);
				
		},
		cached() {
			console.log('Content has been cached for offline use.')
		},
		updated() {		
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
