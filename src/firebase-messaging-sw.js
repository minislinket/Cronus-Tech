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




// const eventSource = new EventSource("http://localhost:3000/connect_sse");

// eventSource.onerror = function (event) {
// 	eventSource.close();
// }

// eventSource.onmessage = function (event) {
//     console.log('Caught SSE in SW', event);
// 	if(event.data == 'update')
// 	{
// 		messageApp('checkForUpdates', '', '', '');
// 	}

// 	if(event.data == 'heartbeat')
// 	{
// 		messageApp('heartbeat', '', '', '');
// 	}
//     // if('serviceWorker' in navigator)
//     // {
        

//     // }
//     // navigator.geolocation.getCurrentPosition(positionData => {
//     //     console.log(positionData);
//     // })
// }


// self.addEventListener('message', function (event) {

// 	messageApp('wakeUp', 'wake up', '', '');

// })


function messageApp(type, title, body, data) {
	self.clients.matchAll().then(clients => {
		clients.forEach(client => {
		  client.postMessage({ type, title, body, data });
		});
	});
}




async function startNewDocumentUploads() {

	var docTypes = await getDocumentTypesFromDB();
	var allDocs = [];

	if(docTypes && docTypes.length >= 1)
	{
		await Promise.all(docTypes.map(async docType => {
			var docs = await getDocumentsFromDB(docType.name);
			allDocs.push({docTypeId: docType.id, docTypeName: docType.name, docs: docs});
		}));
	}

	console.log('SW - All Documents from IDB: ', allDocs);


	allDocs.map(async docType => {

		if(docType.docs && docType.docs.length >= 1)
		{
			docType.docs.map(async doc => {

				// Start the upload process for each document
				if(doc.uploadComplete === false && doc.uploading === false)
				{
					
					doc.uploading = true;
					await updateDocumentInDB(docType.docTypeName, doc);
					console.log('SW - Starting upload for: ', docType.docTypeName, doc.id, doc);
					registerSync(docType.docTypeName, doc);
				}

				// If the document is already uploaded, set uploading to false
				else if(doc.uploadComplete === true && doc.uploading === true)
				{
					
					doc.uploading = false;
					await updateDocumentInDB(docType.docTypeName, doc);
					console.log('SW - Document already uploaded: ', docType.docTypeName, doc.id, doc);
				}

				// If the document is uploaded and not uploading, delete it from the DB
				else if(doc.uploadComplete === true && doc.uploading === false)
				{
					
					await deleteDocumentFromDB(docType.docTypeName, doc.id);
					console.log('SW - Deleting document from DB: ', docType.docTypeName, doc.id, doc);
				}

			})
		}

	});

}





async function registerSync(docTypeName, doc) {
	
	var syncId = 'uploadDocument_' + docTypeName + '_' + doc.id;
	console.log('SW - Registering Sync: ', syncId);

	try {
		await self.registration.sync.register(syncId);
	} catch (err) {
		console.log('SW - Sync registration failed: ', err);
		doc.uploading = false;
	}
}




self.addEventListener('sync', async function(event) {

	if(event.tag.indexOf('uploadDocument_') !== -1)
	{

		var docTypeName = event.tag.split('_')[1];
		var docId = event.tag.split('_')[2];

		docId = Number(docId);

		console.log('SW - Getting doc from db with: ', docTypeName, docId);
		var doc = await getDocumentByIdFromDB(docTypeName, docId);
		console.log('SW - Sync document: ', doc);

		const action = async () => {
			let error;
			try {
				console.log('Trying to upload document...');
				await uploadDocument(docTypeName, doc);
				doc.uploading = false;
				doc.uploadComplete = true;
				await updateDocumentInDB(docTypeName, doc);
			}
			catch(e) {
				error = true;
				throw e;
			}
			finally {
				if(error && event.lastChance)
				{
					doc.uploading = false;
					await updateDocumentInDB(docTypeName, doc);
				}
			}
		}

		event.waitUntil(action());
	}
});



async function uploadDocument(docTypeName, doc) {

	try {
		var docTypes = await getDocumentTypesFromDB();
		var docTypeId = docTypes.find(dt => dt.name === docTypeName).id;

		console.log('Uploading document: ', docTypeName, doc, docTypeId, doc.file);

		var formData = new FormData();
		var newFile = new File([doc.file], doc.file.name, { type: doc.file.type })
		formData.append('file', newFile);
		// formData.append('file', doc.file);

		console.log('Form Data: ', formData, newFile);

		// var flag = false;
		var method = 'POST';
		var query = 'http://129.232.180.146/cronus/api/';
		var body = formData;
		var signature = await getSignatureFromDB();

		docTypeId == 19 
		? 
		query += 'job_cards/' + doc.jobCardId + '/upload' 
		: 
		query += 'customers/store/' + doc.customerStoreId + '/upload?customer_call_id=' + doc.call_id  + '&document_type_id=' + doc.fileTypeId;

		console.log('Performing fetch with: ',docTypeName, method, query, body, signature, doc);
	}
	catch(e) {
		console.log('Error uploading document: ', e);
		return false;
	}


	var myHeaders = new Headers();
	myHeaders.append("Authorization", "Bearer: " + signature);
	// myHeaders.append("Content-Type", "multipart/form-data");
	// myHeaders.append("Accept", "multipart/form-data");

	return await fetch(query, {
		method,
		headers: myHeaders,
		body: formData
	})
	.then(resp => {
		if(!resp.ok)
		{	
			doc.uploading = false;
			updateDocumentInDB(docTypeName, doc);
			throw 'Failed to post file...' + JSON.parse(resp);
		}
	})

	// flag = await doFetch(method, query, body, signature, doc, SQLData, SQLQuery);

	// if(!flag)
	// {
	// 	doc.uploading = false;
	// 	doc.uploadComplete = true;
	// 	await updateDocumentInDB(docTypeName, doc);
	// }
}





self.addEventListener('fetch', async event => {

	const request = event.request;
	if(request.url.endsWith('/cronus/api/techs') && request.method === 'POST')
	{
		event.respondWith(fetch(request.clone())
		.then(response => {
			if(!response.ok) { throw ERROR_MSG; }
			event.waitUntil(uploadDocument(docTypeName, doc));
			return response;
		})
		.catch(e => {
			event.waitUntil(requestToDefect(request.clone())
			.then(doc => saveDoc(doc)));
			throw e;
		})
		);
	}

});




async function deleteDocumentFromDB(docTypeName, docId) {

	return new Promise((res, rej) => {

		var docDB = indexedDB.open(docTypeName, 1);

		docDB.onerror = function(e) {
			rej(false);
		}

		docDB.onsuccess = function(e) {
			var db = e.target.result;
			var transaction = db.transaction(docTypeName, 'readwrite');
			var store = transaction.objectStore(docTypeName);
			var request = store.delete(docId);

			request.onsuccess = function(e) {
				res(true);
			}

			request.onerror = function(e) {
				console.error('SW - Error deleting document: ', e);
				rej(false);
			}
		}
	});
}





async function updateDocumentInDB(docTypeName, doc) {

	return new Promise((res, rej) => {

		var docDB = indexedDB.open(docTypeName, 1);

		docDB.onerror = function(e) {
			rej(false);
		}

		docDB.onsuccess = function(e) {
			var db = e.target.result;
			var transaction = db.transaction(docTypeName, 'readwrite');
			var store = transaction.objectStore(docTypeName);
			var request = store.put(doc);

			request.onsuccess = function(e) {
				res(true);
			}

			request.onerror = function(e) {
				console.error('SW - Error updating document: ', e);
				rej(false);
			}
		}
	});

}





async function getDocumentByIdFromDB(docTypeName, docId) {

	var databases = await indexedDB.databases();
	var exists = databases.find(db => db.name === docTypeName && db.version === 1);
	if(!exists) { return [] }
	
	return new Promise((res, rej) => {

		
		var docDB = indexedDB.open(docTypeName, 1);

		docDB.onerror = function(e) {
			rej(false);
		}

		docDB.onsuccess = function(e) {
			console.log('Successfully opened document DB: ', docTypeName, e.target.result);
			var db = e.target.result;
			var transaction = db.transaction(docTypeName, 'readonly');
			var store = transaction.objectStore(docTypeName);
			console.log('Got DB Store: ', store);
			var request = store.get(docId);

			request.onsuccess = function(e) {
				res(e.target.result);
			}

			request.onerror = function(e) {
				console.error('SW - Error getting document: ', e);
				rej(false);
			}
		}
	});



}




async function getDocumentsFromDB(docTypeName) {

	var databases = await indexedDB.databases();
	var exists = databases.find(db => db.name === docTypeName && db.version === 1);
	if(!exists) { return [] }
	
	return new Promise((res, rej) => {

		
		var docDB = indexedDB.open(docTypeName, 1);

		docDB.onerror = function(e) {
			rej(false);
		}

		docDB.onsuccess = function(e) {
			// console.log('Successfully opened document DB: ', docTypeName, e.target.result);
			var db = e.target.result;
			var transaction = db.transaction(docTypeName, 'readwrite');
			var store = transaction.objectStore(docTypeName);
			var request = store.getAll();

			request.onsuccess = function(e) {
				res(e.target.result);
			}

			request.onerror = function(e) {
				console.error('SW - Error getting documents: ', e);
				rej(false);
			}
		}
	});

}




async function getDocumentTypesFromDB() {

	return new Promise((res, rej) => {

		var docTypesDB = indexedDB.open('document_types', 1);

		docTypesDB.onerror = function(e) {
			rej(false);
		}

		docTypesDB.onsuccess = function(e) {
			var db = e.target.result;
			var transaction = db.transaction('document_types', 'readwrite');
			var store = transaction.objectStore('document_types');
			var request = store.getAll();

			request.onsuccess = function(e) {
				res(e.target.result);
			}

			request.onerror = function(e) {
				console.error('SW - Error getting document types: ', e);
				rej(false);
			}
		}
	});
}





async function getSignatureFromDB() {

	return new Promise((res, rej) => {

		var signatureDB = indexedDB.open('Signature', 1);

		signatureDB.onerror = function(e) {
			rej(false);
		}

		signatureDB.onsuccess = function(e) {
			var db = e.target.result;
			var transaction = db.transaction('Signature', 'readwrite');
			var store = transaction.objectStore('Signature');
			var request = store.get(1);

			request.onsuccess = function(e) {
				res(e.target.result.signature);
			}

			request.onerror = function(e) {
				console.error('SW - Error getting signature: ', e);
				rej(false);
			}
		}
	});

}





// SW Sync Store for Call update data
let callSyncStore = [];
let callJobCardLinkStore = [];
let callCommentStore = [];
let CallOrderNumberStore = [];
let newCallStore = [];
let backgroundSyncActive = false;

// Listen for messages from the App
self.addEventListener('message', function (event) {
	// console.log('Message from app: ', event);



	if(event.data.type === 'startNewUploads')
	{
		startNewDocumentUploads();
	}



	// Check background sync happened
	if(event.data.type === 'checkBackgroundSyncNetworkErrors')
	{

		if(callSyncStore.length >= 1)
		{
			callSyncStore.map(callData => {
				event.waitUntil(updateCall(callData.call.id));
			})
		}

		if(callJobCardLinkStore.length >= 1)
		{
			callJobCardLinkStore.map(jobCardData => {
				event.waitUntil(linkJobCard(jobCardData.call.id));
			})
		}

		if(callCommentStore.length >= 1)
		{
			callCommentStore.map(commentData => {
				event.waitUntil(addCallComment(commentData.call.id));
			})
		}

		if(CallOrderNumberStore.length >= 1)
		{
			CallOrderNumberStore.map(orderNumberData => {
				event.waitUntil(linkOrderNumber(orderNumberData.call.id));
			})
		}

		if(newCallStore.length >= 1)
		{
			newCallStore.map(callData => {
				event.waitUntil(addNewCall(callData));
			})
		}
	}







	if(event.data.type === 'addNewCall')
	{
		var data = JSON.parse(event.data.data);
		var existingData = '';

		newCallStore.map(exData => {
			if(exData.call.customerStoreId === data.call.customerStoreId && exData.call.callDetails === data.call.callDetails)
			{
				existingData = exData;
			}
		});


		if(existingData)
		{
			event.waitUntil(addNewCall(existingData))
		}
		else
		{
			data['sending'] = false;
			data['sent'] = false;
			newCallStore.push(data);

			event.waitUntil(addNewCall(data));
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
			data.call.allJobCardsHaveCMIS ? delete data.call.allJobCardsHaveCMIS : null;
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




// self.addEventListener('sync', function(event) {
// 	console.log('Background sync event: ', event);
// 	if(event.tag.indexOf('updateCall_') !== -1)
// 	{
// 		var callId = event.tag.split('_')[1];
		
// 		backgroundSyncActive = true;
// 		event.waitUntil(updateCall(callId));
// 	}


// })




async function addNewCall(call) {
	var callData = newCallStore.find(exData => exData.customerStoreId === call.customerStoreId && exData.callDetails === call.callDetails);
	var flag = false;

	if(callData && !callData.sending)
	{
		callData.sending = true;

		var method = 'POST';
		var query = 'calls';
		var body = callData.call;
		var signature = callData.signature;
		
		var SQLData = '';
		// {
		// 	call, 
		// 	user: callData.user,
		// }
		var SQLQuery = '';

		flag = await doFetch(method, query, body, signature, call, SQLData, SQLQuery);
	}

	if(!flag)
	{
		newCallStore = newCallStore.filter(exData => exData.customerStoreId !== call.customerStoreId && exData.callDetails !== call.callDetails);
	}
	
}









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
		SQLBase = 'http://localhost/cronus-tech/src/api/'
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
			if(SQLQuery)
			{
				//Save a log of all tech call updates
				await fetch(SQLBase + SQLQuery, {
					body: JSON.stringify(SQLData),
					method: 'POST',
					headers: {
						'Content-Type': 'application/json',
					}
				})
				.catch(function(err) {
					console.error('SW SQL Fetch Error: ', err);
					console.error('SW SQL Fetch error response: ', err.response);
				})
			}

			sendData.sending = false;
			sendData.sent = true;
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

messaging.onBackgroundMessage((payload) => {
	console.log('[firebase-messaging-sw.js] Received background message ', payload);
	// messageApp('checkForUpdates', '', '', '');
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

// onBackgroundMessageHandler(messaging, function (payload) {
// 	console.log('[firebase-messaging-sw.js] Received background message ', payload);
// 	messageApp('checkForUpdates', '', '', '');
// 	// Customize notification here
// 	const msgTitle = 'Cronus Tech Notification';
// 	const msgOptions = {
// 		body: 'You have a new notification from Cronus Tech...',
// 		icon: './img/icons/android-chrome-maskable-192x192.png',
// 		vibrate: [200, 100, 200, 100, 200, 100, 200],
// 		tag: 'Notification-example',
// 		data: {
// 			payload,
// 			url: '/'
// 		}
// 	}

// 	return self.registration.showNotification(notificationTitle, notificationOptions);
// });