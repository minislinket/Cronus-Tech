self.__precacheManifest = [].concat(self.__precacheManifest || []);


workbox.setConfig({
	debug: true
});


workbox.precaching.precacheAndRoute(self.__precacheManifest, {});



// Register a workbox navigation route for Single Page Applications to always return index.html
// otherwise a url like cronus-tech/calls will fail when trying to load the cache (only index.html exists and handles navigation through JS).
workbox.routing.registerNavigationRoute(
	workbox.precaching.getCacheKeyForURL('/cronus-tech/index.html')
);













// self.addEventListener('sync', async function(event) {
// 	console.log('Background sync event: ', event);
// 	if(event.tag == 'uploadDocuments')
// 	{
// 		console.log('Going to start background uploading now...');
// 		event.waitUntil(prepareDocUploads());
// 	}
// });






// SW Sync Store for Call update data
let callSyncStore = [];
let callJobCardLinkStore = [];
let callCommentStore = [];
let CallOrderNumberStore = [];
let backgroundSyncActive = false;

// Listen for messages from the App
self.addEventListener('message', function (event) {
	// console.log('Message from app: ', event);



	if(event.data.type === 'uploadDocuments')
	{
		// console.log('Going to start background uploading now...');
		/* event.waitUntil( */prepareDocUploads()/* ); */
	}




	// Check background sync happened
	if(event.data.type === 'checkBackgroundSyncNetworkErrors')
	{

		if(callSyncStore.length >= 1)
		{
			// console.log('Checking callSyncStore for call updates...');
			callSyncStore.map(callData => {
				event.waitUntil(updateCall(callData.call.id));
			})
		}

		if(callJobCardLinkStore.length >= 1)
		{
			// console.log('Checking callJobCardLinkStore for job card links...');
			callJobCardLinkStore.map(jobCardData => {
				event.waitUntil(linkJobCard(jobCardData.call.id));
			})
		}

		if(callCommentStore.length >= 1)
		{
			// console.log('Checking callJobCardLinkStore for job card links...');
			callCommentStore.map(commentData => {
				event.waitUntil(addCallComment(commentData.call.id));
			})
		}
	}









	if(event.data.type === 'linkOrderNumber')
	{
		var data = JSON.parse(event.data.data);
		var existingData = '';

		CallOrderNumberStore.map(exData => {
			if(exData.call.id.toString() === data.call.id.toString())
			{
				existingData = exData;
			}
		});


		if(existingData)
		{

			existingData.orderNumbers.push({orderNumber: data.orderNumber, sending: false, sent: false});
			
			// console.log('SW CallOrderNumberStore comment updated: ', CallOrderNumberStore);

			event.waitUntil(linkOrderNumber(data.call.id));

			
		}
		else
		{
			// If no existing data is in the callSyncStore, add this data.
			data['orderNumbers'] = [];
			data.orderNumbers.push({orderNumber: data.orderNumber, sending: false, sent: false});
			

			delete data.orderNumber;
			data.call.allDocumentsHaveCMIS ? delete data.call.allDocumentsHaveCMIS : null;
			data.call.allJobCardDocumentLinksSent ? delete data.call.allJobCardDocumentLinksSent : null;
			data.call.callDetails ? delete data.call.callDetails : null;
			data.call.customerAccount ? delete data.call.customerAccount : null;
			data.call.customerAccountName ? delete data.call.customerAccountName : null;
			data.call.customerStore ? delete data.call.customerStore : null;
			data.call.customerStoreName ? delete data.call.customerStoreName : null;
			data.call.customerStoreBranchCode ? delete data.call.customerStoreBranchCode : null;
			data.call.customerStoreAddress ? delete data.call.customerStoreAddress : null;
			data.call.jobCards ? delete data.call.jobCards : null;
			data.call.operator ? delete data.call.operator : null;
			data.call.operatorName ? delete data.call.operatorName : null;
			data.call.techState ? delete data.call.techState : null;
			data.call.techStateId ? delete data.call.techStateId : null;
			data.call.techStateName ? delete data.call.techStateName : null;

			CallOrderNumberStore.push(data);
			// console.log('SW CallOrderNumberStore comment added: ', CallOrderNumberStore);
			

			event.waitUntil(linkOrderNumber(data.call.id));
			
			// var syncId = 'updateCall_' + data.call.id;
			// event.waitUntil(self.registration.sync.register(syncId));
		}
	}






	if(event.data.type === 'addCallComment')
	{
		var data = JSON.parse(event.data.data);
		var existingData = '';

		callCommentStore.map(exData => {
			if(exData.call.id.toString() === data.call.id.toString())
			{
				existingData = exData;
			}
		});


		if(existingData)
		{

			existingData.callComments.push({comment: data.comment, sending: false, sent: false});
			
			// console.log('SW callCommentStore comment updated: ', callCommentStore);

			event.waitUntil(addCallComment(data.call.id));

			
		}
		else
		{
			// If no existing data is in the callSyncStore, add this data.
			data['callComments'] = [];
			data.callComments.push({comment: data.comment, sending: false, sent: false});
			

			delete data.comments;
			callCommentStore.push(data);
			// console.log('SW callCommentStore comment added: ', callCommentStore);
			

			event.waitUntil(addCallComment(data.call.id));
			
			// var syncId = 'updateCall_' + data.call.id;
			// event.waitUntil(self.registration.sync.register(syncId));
		}
	}










	if(event.data.type === 'linkJobCard')
	{
		var data = JSON.parse(event.data.data);
		var existingData = '';

		callJobCardLinkStore.map(exData => {
			if(exData.call.id.toString() === data.call.id.toString())
			{
				existingData = exData;
			}
		});


		if(existingData)
		{
			data.jobCards.map(jobCard => {
				existingData.jobCardLinks.push({jobCard, sending: false, sent: false});
			})
			
			// console.log('SW callJobCardLinkStore JC Link updated: ', callJobCardLinkStore);

			event.waitUntil(linkJobCard(data.call.id));
			
		}
		else
		{
			// If no existing data is in the callSyncStore, add this data.
			data['jobCardLinks'] = [];
			data.jobCards.map(jobCard => {
				data.jobCardLinks.push({jobCard, sending: false, sent: false});
			})
			

			delete data.jobCards;
			callJobCardLinkStore.push(data);
			// console.log('SW callJobCardLinkStore JC Link added: ', callJobCardLinkStore);
			
			

			event.waitUntil(linkJobCard(data.call.id));
			
			// var syncId = 'updateCall_' + data.call.id;
			// event.waitUntil(self.registration.sync.register(syncId));
		}
	}







	// Call update event msgs show here
	if (event.data.type === 'updateCall') 
	{
		var data = JSON.parse(event.data.data);
		var existingData = '';
		var flag = false;
		// console.log('update Call---Background Syncing? ', backgroundSyncActive);
		
		// Check if the call already exists in the Sync Store
		callSyncStore.map(exData => {
			if(exData.call.id.toString() === data.call.id.toString())
			{
				existingData = exData;
			}
		});




		var updates = 
		{
			nextStatusId: data.nextStatusId, 
			timeStamp: data.time_stamp,
			sending: false,
			sent: false
		}




		if(existingData)
		{
			if(existingData.statusUpdates.length >= 1)
			{
				existingData.statusUpdates.map(exUpdate => {
					
					if(exUpdate.nextStatusId == data.nextStatusId)
					{
						var exDate = new Date(exUpdate.timeStamp);
						var newDate = new Date(data.time_stamp);

						var exDay = exDate.getDate();
						var newDay = newDate.getDate();
						// console.log('Day: ', exDay, newDay);

						var exHour = exDate.getHours();
						var newHour = newDate.getHours();
						// console.log('Hour: ', exHour, newHour);

						var exMinute = exDate.getMinutes();
						var newMinute = newDate.getMinutes();
						// console.log('Minute: ', exMinute, newMinute);

						var exSecond = exDate.getSeconds();
						var newSecond = newDate.getSeconds();
						// console.log('Second: ', exSecond, newSecond);

						if(exDay == newDay && exHour == newHour && exMinute == newMinute && exSecond == newSecond)
						{
							flag = true;
							// console.log('Popping out: ', data);
						}
					}
					

				})
			}



			if(!flag)
			{
				existingData.statusUpdates.push(updates);
				// console.log('SW callSyncStore Call updated: ', callSyncStore);
				
				event.waitUntil(updateCall(data.call.id));
			}

			
		}
		else
		{
			// If no existing data is in the callSyncStore, add this data.
			data['statusUpdates'] = [{nextStatusId: data.nextStatusId, timeStamp: data.time_stamp, sending: false, sent: false}];

			delete data.nextStatusId;
			delete data.time_stamp;
			callSyncStore.push(data);
			// console.log('SW callSyncStore Call added: ', callSyncStore);
			
			event.waitUntil(updateCall(data.call.id));

		}
	}







	// Force new App data to load with user triggered event
	if(event.data.type === 'skipWaiting') { return skipWaiting() }






	// Save the callSyncStore in localStorage in case of App Update
	if(event.data.type === 'getCallSyncStore') { 
		if(callSyncStore.length >= 1)
		{
			// console.log('Sending callSyncStore to App: ', callSyncStore);
			messageToApp(event, 'callSyncStoreBackup', 'callSyncStoreBackup', '', callSyncStore)
		}
	}

	
	// Restore the callSyncStore from localStorage in case of App Update
	if(event.data.type === 'restoreCallSyncStore')
	{
		var callSyncStoreBackup = JSON.parse(event.data.data);
		if(callSyncStoreBackup && callSyncStoreBackup.length >= 1)
		{
			callSyncStore = callSyncStoreBackup;
		}
	}

	
});




const DB_NAME = 'DocUploads';
const DB_VERSION = 1;
let DB;

const idb = {


	async getDb() {
		return new Promise((resolve, reject) => {

			if(DB) { return resolve(DB); }
			// console.log('OPENING DB', DB_NAME, ' - ', DB_VERSION);
			let request = indexedDB.open(DB_NAME, DB_VERSION);
			
			request.onerror = e => {
				console.error('Error opening db', e);
				reject('Error');
			};
	
			request.onsuccess = e => {
				DB = e.target.result;
				resolve(DB);
			};
			
			request.onupgradeneeded = e => {
				// console.log('onupgradeneeded');
				let db = e.target.result;
				db.createObjectStore("document_uploads", { autoIncrement: true, keyPath:'id' });
			};
		});
	},



	async deleteDocument(document) {

		var SQLBase = '';
		if(self.location.origin.indexOf('localhost') !== -1)
		{ SQLBase = 'http://localhost/cronus-tech/src/api/' }
		else
		{ SQLBase = 'https://dev.locksecure.co.za/tech-api/' }



		let db = await this.getDb();

		return new Promise(resolve => {

            // console.log('Deleting document from IDB: ', documentId);

			let trans = db.transaction(['document_uploads'],'readwrite');
			let store = trans.objectStore('document_uploads');

			if(document.upload_data_synced == false)
			{
				fetch(SQLBase + 'docUploads/docUploads.php', {
					body: JSON.stringify(document),
					method: 'POST',
					headers: {
						'Content-Type': 'application/json',
					}
				})
				.then(resp => {
					if(resp.status == 200)
					{
						document.upload_data_synced = true;
					}
				})
				.catch(function(err) {
					document.upload_data_synced = false;
					// console.error('SW SQL Fetch Error: ', err);
					// console.error('SW SQL Fetch error response: ', err.response);
				})
			}

			var delRequest = store.delete(document.id);
            delRequest.onsuccess = function(event) {
                resolve();
				idb.getDb();
            }
		});	
	},



	async getDocuments() {

		let db = await this.getDb();

		return new Promise(resolve => {

			let trans = db.transaction(['document_uploads'],'readonly');
			trans.oncomplete = () => {
				resolve(documents);
			};
			
			let store = trans.objectStore('document_uploads');
			let documents = [];
			
			store.openCursor().onsuccess = e => {
				let cursor = e.target.result;
				if (cursor) {
					documents.push(cursor.value)
					cursor.continue();
				}
			};

		});
	},




	async saveDocument(document) {
		let db = await this.getDb();

		return new Promise(resolve => {

			let trans = db.transaction(['document_uploads'],'readwrite');
            let objectStore = trans.objectStore('document_uploads');

			var addRequest = objectStore.add(document);
			addRequest.onerror = e => {
				console.error('Error opening db', e);
			};
			addRequest.onsuccess = function(event) {
				document.id = event.target.result;
				resolve(document);
				idb.getDb();
			};
		});
	},



	async updateDocument(document) {

		var SQLBase = '';
		if(self.location.origin.indexOf('localhost') !== -1)
		{ SQLBase = 'http://localhost/cronus-tech/src/api/' }
		else
		{ SQLBase = 'https://dev.locksecure.co.za/tech-api/' }

		let db = await this.getDb();

		return new Promise(resolve => {

			let trans = db.transaction(['document_uploads'],'readwrite');
            let objectStore = trans.objectStore('document_uploads');
			var getRequest = objectStore.get(document.id);

			getRequest.onerror = e => {
				console.error('Error opening db', e);
			};

			getRequest.onsuccess = function(event) {

				var storedDocument = event.target.result;
				if(storedDocument) 
				{

					if(document.upload_data_synced == false)
					{
						fetch(SQLBase + 'docUploads/docUploads.php', {
							body: JSON.stringify(document),
							method: 'POST',
							headers: {
								'Content-Type': 'application/json',
							}
						})
						.then(resp => {
							if(resp.status == 200)
							{
								document.upload_data_synced = true;
							}
						})
						.catch(function(err) {
							document.upload_data_synced = false;
							// console.error('SW SQL Fetch Error: ', err);
							// console.error('SW SQL Fetch error response: ', err.response);
						})
					}


					// Update the stored document with the latest data
					Object.assign(storedDocument, document);
					var putRequest = objectStore.put(storedDocument);


					putRequest.onerror = e => {
						console.error('Error opening db', e);
					};


					putRequest.onsuccess = function(event) {

						
						messageApp('refreshDocuments', '', '', '')
						resolve(storedDocument);
						idb.getDb();
					};
				} 
			};
		});
	
	},



    // Get the user's signature from IDB
    async getUserSignature() {

        let request = indexedDB.open('SignatureDB', 1);

        return new Promise(resolve => {
			request.onerror = e => {
				console.error('Error opening db', e);
			};

			request.onsuccess = e => {
				var db = e.target.result;
				let trans = db.transaction(['signature'],'readwrite');
				let objectStore = trans.objectStore('signature');

				var getRequest = objectStore.get(1);
				getRequest.onsuccess = function(event) {

					var storedSignature = event.target.result;
					resolve(storedSignature.signature);
					
				};

			};
		});
        
    },

}






function messageApp(type, title, body, data) {
	self.clients.matchAll().then(clients => {
		clients.forEach(client => {
		  client.postMessage({ type, title, body, data });
		});
	});
}





async function prepareDocUploads() {

	var documentsForUpload = await idb.getDocuments();
	var signature = await idb.getUserSignature();


	var SQLBase = '';
	if(self.location.origin.indexOf('localhost') !== -1)
	{ SQLBase = 'http://localhost/cronus-tech/src/api/' }
	else
	{ SQLBase = 'https://dev.locksecure.co.za/tech-api/' }


	await Promise.all(documentsForUpload.map(async document => {

		// Check if the document's upload_data_synced is still false, if so, try to sync it again
		if(document.upload_data_synced == false){
		
			fetch(SQLBase + 'docUploads/docUploads.php', {
				body: JSON.stringify(document),
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				}
			})
			.then(resp => {
				if(resp.status == 200)
				{

					document.upload_data_synced = true;


					if(document.status == 'archived')
					{
						idb.deleteDocument(document);
						return
					}

					
					idb.updateDocument(document);
				}
			})
			.catch(function(err) {
				document.upload_data_synced = false;
				// console.error('SW SQL Fetch Error: ', err);
				// console.error('SW SQL Fetch error response: ', err.response);
			})

		}


		// Check if the document has been uploaded already and how old it is
		// If it is older than 3 days, delete it from IDB and mark it as archived in SQL
		if(document.upload_completed)
		{
			var today = new Date();
			var uploadDate = new Date(document.upload_completed);
			var timeDiff = Math.abs(today.getTime() - uploadDate.getTime());
			var diffDays = Math.floor(timeDiff / (1000 * 3600 * 24));

			// console.log('The document was uploaded ' + diffDays + ' days ago');
			// console.log('Let\'s check our whole if: ', document.status == 'complete' && Number(diffDays) >= 3);

			if(document.status == 'complete' && Number(diffDays) >= 7)
			{
				document.status = 'archived';
				document.upload_data_synced = false;
				idb.deleteDocument(document);
			}
		}
		else
		{ 
			// Catch documents where the upload might have been cancelled due to a refresh or something similar
			// get the difference in hours between now and document.upload_started
			// var today = new Date();
			// var uploadDate = new Date(document.upload_started);
			// var timeDiff = Math.abs(today.getTime() - uploadDate.getTime());
			// var diffHours = Math.floor(timeDiff / (1000 * 3600));

			// // If the document hasn't changed status in the last 3 hours, set it to pending upload so it can try uploading again
			// // worst case, a document version will be created replacing the old one
			// if(document.status == 'uploading' && diffHours >= 3)
			// {
			// 	document.status = 'pending upload';
			// 	document.upload_data_synced = false;
			// 	idb.updateDocument(document);
			// }
		}

		var query = '';
	
		if(document.type === 19)
			{ 
				query = 'job_cards/'+document.job_card_id+'/upload'; 
				if(!document.job_card_linked) { return } // If the job card is not linked to a customer call yet, don't upload the document
			}
		else
			{ query = 'customers/store/' + document.customer_store_id + '/upload?customer_call_id=' + document.call_id  + '&document_type_id=' + document.type; } 

		
		if(document.status != 'complete' && document.status != 'uploading' && document.file) 
		{	
			// console.log('Sending document for upload: ', document.name);
			var resp = await doDocumentUpload(query, document, signature)
			// console.log('Document upload response: ', resp);
			return resp;
		}
		

	}));

}







async function doDocumentUpload(query, document, signature) {

	var queryBase = '';

	if(self.location.origin.indexOf('localhost') !== -1)
	{ queryBase = 'http://129.232.180.146/cronus/api/' }
	else
	{ queryBase = 'https://office.locksecure.co.za/cronus/api/' }


	var formData = new FormData();
	formData.append('file', document.file);

	// Update IDDB document 
	document.status = 'uploading';
	document.upload_started = new Date().toISOString();
	document.upload_attempts++;
	document.upload_error = '';
	document.upload_data_synced = false;
	idb.updateDocument(document);


	return fetch(queryBase + query, {
		method: 'POST', 
		body: formData,
		headers: {
			/* "Content-Type": "multipart/form-data", */ // <- The browser sets this for you because it needs to set the boundary for the multipart request
			'Accept': 'multipart/form-data',
			'Authorization': 'Bearer: '+ signature
		},
		
	})
	.then(async resp => {
		// console.log('Upload complete: ', resp);
		if(resp.status == 200)
		{
			document.status = 'complete';
			document.upload_completed = new Date().toISOString();
			document.file = '';
			document.upload_data_synced = false;
			idb.updateDocument(document);
			return true;
		}
		else
		{
			document.status = 'pending upload';
			document.upload_error = JSON.stringify(resp);
			document.upload_data_synced = false;
			idb.updateDocument(document);
			return false;
		}
		
	})
	.catch(async err => {
		console.error('Upload error: ', err);
		console.error('Upload error response: ', err.response);
		document.status = 'pending upload';
		document.upload_error = JSON.stringify(err);
		document.upload_data_synced = false;
		idb.updateDocument(document);

		return false;
	})

}







// })
async function linkOrderNumber(callId) {
	var orderNumberData = CallOrderNumberStore.filter(exData => exData.call.id.toString() === callId.toString())[0];
	// console.log('Link Order Number: ', orderNumberData);



	var flag = false;

	await Promise.all(orderNumberData.orderNumbers.map(async orderNumber => {

		// console.log('Processing call Order Number: ', orderNumber);

		if(!orderNumber.sending) 
		{ 

			orderNumber.sending = true;

			var method = 'PUT';
			var query = 'calls/' + orderNumberData.call.id;
			var body = orderNumberData.call;
			var signature = orderNumberData.signature;
			
			var SQLData = 
			{
				call: orderNumberData.call, 
				orderNumber: orderNumber.orderNumber, 
				user: orderNumberData.user,
			}
			var SQLQuery = 'techUpdates/callOrderNumber.php';

			flag = await doFetch(method, query, body, signature, orderNumber, SQLData, SQLQuery);
		}

	}))
	
	
	if(!flag) 
	{
		orderNumberData.orderNumbers = orderNumberData.orderNumbers.filter(comment => comment.sent != true); 
		
		if(orderNumberData.orderNumbers.length <= 0)
		{
			callCommentStore = callCommentStore.filter(exData => exData.call.id.toString() !== orderNumberData.call.id.toString());
		}
	}
	// console.log('Comments Store filtered after data sent: ', callCommentStore);
}














async function addCallComment(callId) {
	var commentData = callCommentStore.filter(exData => exData.call.id.toString() === callId.toString())[0];
	// console.log('Add call comment: ', commentData);



	var flag = false;

	await Promise.all(commentData.callComments.map(async comment => {

		// console.log('Processing call comment: ', comment);

		if(!comment.sending) 
		{ 

			comment.sending = true;

			var method = 'POST';
			var query = 'calls/comments';
			var body = comment.comment;
			var signature = commentData.signature;
			
			var SQLData = 
			{
				call: commentData.call, 
				comment: comment.comment, 
				user: commentData.user,
			}
			var SQLQuery = 'techUpdates/callComment.php';

			flag = await doFetch(method, query, body, signature, comment, SQLData, SQLQuery);
		}

	}))
	
	
	if(!flag) 
	{
		commentData.callComments = commentData.callComments.filter(comment => comment.sent != true); 
		
		if(commentData.callComments.length <= 0)
		{
			callCommentStore = callCommentStore.filter(exData => exData.call.id.toString() !== commentData.call.id.toString());
		}
	}
	// console.log('Comments Store filtered after data sent: ', callCommentStore);
}









async function linkJobCard(callId) {


	var jcData = callJobCardLinkStore.filter(exData => exData.call.id.toString() === callId.toString())[0];
	// console.log('Link JC to call with: ', jcData);



	var flag = false;

	await Promise.all(jcData.jobCardLinks.map(async update => {

		// console.log('Processing job card link: ', update);

		if(!update.sending) 
		{ 

			update.sending = true;

			var method = 'PUT';
			var query = 'job_cards/' + update.jobCard.id + '/call_link';
			var body = update.jobCard;
			var signature = jcData.signature;
			
			var SQLData = 
			{
				call: jcData.call, 
				jobCardId: update.jobCard.id, 
				user: jcData.user,
			}
			var SQLQuery = 'techUpdates/linkJobCard.php';

			flag = await doFetch(method, query, body, signature, update, SQLData, SQLQuery);
		}

	}))
	
	
	if(!flag) 
	{
		jcData.jobCardLinks = jcData.jobCardLinks.filter(jcLink => jcLink.sent != true); 
		
		if(jcData.jobCardLinks.length <= 0)
		{
			callJobCardLinkStore = callJobCardLinkStore.filter(exData => exData.call.id.toString() !== jcData.call.id.toString());
		}
	}
	// console.log('JC_Call Store filtered after data sent: ', callJobCardLinkStore);

}











async function updateCall(callId) {

	var callData = callSyncStore.filter(exData => exData.call.id.toString() === callId.toString())[0];
	// console.log('Update call with: ', callData);
	

	var flag = false;

	await Promise.all(callData.statusUpdates.map(async update => {

		if(!update.sending) 
		{ 

			update.sending = true;

			var method = 'PUT';
			var query = 'calls/' + callData.call.id + '/techs?tech_status_id=' + update.nextStatusId + '&employee_code=' + callData.user.employeeCode + '&call_id=' + callData.call.id + '&event_time=' + update.timeStamp;
			var body = null;
			var signature = callData.signature;
			var data = update;
			var SQLData = 
			{
				call: callData.call, 
				nextStatusId: update.nextStatusId, 
				user: callData.user, 
				signature: callData.signature, 
				time_stamp: update.timeStamp
			}
			var SQLQuery = 'techUpdates/postUpdate.php';


			flag = await doFetch(method, query, body, signature, data, SQLData, SQLQuery);
			
		}

	}))
	
	
	if(!flag) 
	{
		callData.statusUpdates = callData.statusUpdates.filter(ud => ud.sent != true); 
		
		if(callData.statusUpdates.length <= 0)
		{
			callSyncStore = callSyncStore.filter(exData => exData.call.id.toString() !== callData.call.id.toString());
		}
	}
	// console.log('Sync Store filtered after data send to update: ', callSyncStore);

	// backgroundSyncActive = false;
 
}








async function doFetch(method, query, body, signature, sendData, SQLData, SQLQuery) {

	var flag = false;
	
	var queryBase = '';
	var SQLBase = '';

	if(self.location.origin.indexOf('localhost') !== -1)
	{
		queryBase = 'http://129.232.180.146/cronus/api/';
		SQLBase = 'http://localhost/cronus-tech/src/api/';
	}
	else
	{
		queryBase = 'https://office.locksecure.co.za/cronus/api/';
		SQLBase = 'https://dev.locksecure.co.za/tech-api/';
	}

	


	return fetch(queryBase + query, {
		method,
		headers: {
			'Content-Type': 'application/json',
			'Authorization': 'Bearer: ' + signature
		},
		body: body ? JSON.stringify(body) : '' 
	})
	.then(async resp => {

		// resp.json().then(data => console.log(data));
		console.log(resp.status + ' - ' + JSON.stringify(sendData));

		if(resp.status != 200)
		{
			flag = true;
			sendData.sending = false;
			sendData.sent = false;
			return flag;
		}
		else
		{

			// //Save a log of all tech call updates
			// await fetch(SQLBase + SQLQuery, {
			// 	body: JSON.stringify(SQLData),
			// 	method: 'POST',
			// 	headers: {
			// 		'Content-Type': 'application/json',
			// 	}
			// })
			// .catch(function(err) {
			// 	console.error('SW SQL Fetch Error: ', err);
			// 	console.error('SW SQL Fetch error response: ', err.response);
			// })

			

			sendData.sending = false;
			sendData.sent = true;

			if(SQLQuery === 'techUpdates/linkJobCard.php')
			{
				var documents = await idb.getDocuments();
				console.log('Documents: ', documents)
				var jobCardDocument = documents.filter(doc => Number(doc.job_card_id) === Number(sendData.jobCard.id))[0];
				if(jobCardDocument)
				{
					console.log('Job Card Document: ', jobCardDocument);
					jobCardDocument.job_card_linked = true;
					await idb.updateDocument(jobCardDocument);
				}
			}

			return flag;
		}

		

	})
	.catch(function(err) {
		console.error('SW Fetch Error: ', err);
		console.error('SW Fetch error response: ', err.response);
		flag = true;
		sendData.sending = false;
		sendData.sent = false;
		return flag;
	})

}






// Listen for Push Notification Clicks and send them to the App with postMessage()
self.addEventListener('notificationclick', function (event) {

	const notification = event.notification;
	// console.log('Notification: ', notification);

	// FCM Message - Catch FCM Message Clicks, open/focus the App and pass data with postMessage() 
	if (notification.data.FCM_MSG) {

		const title = notification.title;
		const body = notification.body;
		const data = notification.data && notification.data.FCM_MSG && notification.data.FCM_MSG.data ? notification.data.FCM_MSG.data : notification.data.data;

		event.waitUntil(getClientAndPostMessage(event, 'FCM', notification, title, body, data));
	}

	// App Message - Catch Foreground messages from the App and display them
	if (notification.data.type === 'FCM') {

		// console.log('Foreground msg passed to sw: ', notification);
		// console.log('And just in case, here\'s the event too: ', event);
		var title = notification.title ? notification.title : 'Assign Message Title';
		var body = notification.body ? notification.body : 'Assign Message Body';
		var data = notification.data && notification.data.data ? notification.data.data : '';

		event.waitUntil(getClientAndPostMessage(event, 'FCM', notification, title, body, data));
	}


});



function messageToApp(event, type, title, body, data) {
	// Get the browser windowClient
	event.waitUntil(clients.claim());
	event.waitUntil(clients.matchAll({
		type: "window",
		includeUncontrolled: true
	})
	.then(function (clientList) {

		let client = null;

		for (var i = 0; i < clientList.length; i++) {
			var item = clientList[i];
			if (item.url) {
				client = item;
				break;
			}
		}


		if (client && 'navigate' in client) 
		{
			client.postMessage({
				type,
				title,
				body,
				data
			});

		}
	}))
}





function triggerGeoLocation(type) {
	// Get the browser windowClient
	clients.claim();
	clients.matchAll({
		type: "window",
		includeUncontrolled: true
	})
	.then(function (clientList) {

		let client = null;

		for (var i = 0; i < clientList.length; i++) {
			var item = clientList[i];
			if (item.url) {
				client = item;
				break;
			}
		}


		// If the user window/app is already open, but in the background or minimized
		if (client && 'navigate' in client) 
		{
			client.postMessage({
				type,
			});
			// client.focus();
		}

		// If the client's window/app is closed
		else 
		{
			clients.openWindow('/cronus-tech').then((client) => {
				if(client) 
				{
					client.postMessage({
						type,
					});
				}
			})
		}



	})
}






function getClientAndPostMessage(event, type, notification, title, body, data) {
	// Get the browser windowClient
	event.waitUntil(clients.claim());
	event.waitUntil(clients.matchAll({
		type: "window",
		includeUncontrolled: true
	})
	.then(function (clientList) {

		let client = null;

		for (var i = 0; i < clientList.length; i++) {
			var item = clientList[i];
			if (item.url) {
				client = item;
				break;
			}
		}


		// If the user window/app is already open, but in the background or minimized
		if (client && 'navigate' in client) 
		{
			notification ? notification.close() : null;
			client.postMessage({
				type,
				title,
				body,
				data
			});
			client.focus();
		}

		// If the client's window/app is closed
		else 
		{
			notification ? notification.close() : null;
			clients.openWindow('/cronus-tech').then((client) => {
				if(client) 
				{
					client.postMessage({
						type,
						title,
						body,
						data
					});
				}
			})
		}



	}))
}





importScripts('https://www.gstatic.com/firebasejs/8.10.0/firebase-app.js');
importScripts('https://www.gstatic.com/firebasejs/8.10.0/firebase-messaging.js');

firebase.initializeApp({
	apiKey: "AIzaSyDHWX85q8abA_JWstCMF-dh6KBXh6qWzJA",
	authDomain: "cronus-9b5c7.firebaseapp.com",
	projectId: "cronus-9b5c7",
	storageBucket: "cronus-9b5c7.appspot.com",
	messagingSenderId: "389452364454",
	appId: "1:389452364454:web:141cb993218b2b06e39267",
	measurementId: "G-PCP78HSTH5"
});


// Retrieve an instance of Firebase Messaging so that it can handle background messages.
const messaging = firebase.messaging()

messaging.setBackgroundMessageHandler(function (payload) {
	console.log('[firebase-messaging-sw.js] Received background message ', payload);
	// Customize notification here
	const msgTitle = 'Cronus Tech Notification';
	const msgOptions = {
		body: 'You have a new notification from Cronus Tech...',
		icon: './img/icons/android-chrome-maskable-192x192.png',
		vibrate: [200, 100, 200, 100, 200, 100, 200],
		tag: 'Notification-example',
		data: {
			payload,
			url: '/'
		}
	}

	return self.registration.showNotification(notificationTitle, notificationOptions);
});