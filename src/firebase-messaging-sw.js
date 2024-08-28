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


const SW_VERSION = '1.0.0';



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





let filesInUploadQueue = 0; // Files currently in the upload queue
const maxFilesInUploadQueue = 1; // Max files to upload at a time
let moreFilesToUpload = false; // If there are more files to upload, set to true




async function registerUploadSync() {
	
	var syncId = 'SyncDocUploads';
	// console.log('SW - Registering Sync: ', syncId);

	// Keeping the below code here in comments, just as an idea.
	// It should be noted that a sync tag is immediately consumed after the sync event is fired and even if multiple sync events 
	// were to register, our startDocumentUploads function protects against multiple uploads.
	// const tags = await self.registration.sync.getTags();
	// console.log('SW - Sync tags: ', tags);
	// if(tags && tags.filter(tag => tag == syncId).length >= 2) { return } // not tested yet, but should work okay, not needed though.

	try {
		await self.registration.sync.register(syncId);
		moreFilesToUpload = false;
	} catch (err) {
		console.log('SW - Sync registration failed: ', err);
	}
}




self.addEventListener('sync', async function(event) {

	if(event.tag == 'SyncDocUploads') 
	{

		const action = async () => {
			let error;
			try {
				// console.log('Trying to upload document...');
				await startDocumentUploads();
				if(moreFilesToUpload)
				{
					registerUploadSync();
				}
			}
			catch(e) {
				// console.log('SW - Error uploading document showing at sync listener: ', e);
				error = true;
				throw e;
			}
			finally {
				if(error && event.lastChance)
				{
					// console.log('SW - Last chance to upload document: ', error);
					registerUploadSync();
				}
			}
		}



		event.waitUntil(action());

	}
});






async function startDocumentUploads() {

	// Get all documents from IDB and store in allDocs variable
	var docTypes = await getDocumentTypesFromDB();
	var allDocs = [];

	if(docTypes && docTypes.length >= 1)
	{
		await Promise.all(docTypes.map(async docType => {
			var docs = await getDocumentsFromDB(docType.name);
			allDocs.push({docTypeId: docType.id, docTypeName: docType.name, docs: docs});
		}));
	}

	// console.log('SW - All Documents from IDB: ', allDocs);




	// Loop through all documents and upload them
	await Promise.all(allDocs.map(async docType => {

		if(docType.docs && docType.docs.length >= 1)
		{
			await Promise.all(docType.docs.map(async doc => {

				// We don't need this code yet, but it will work once JC links happen in the background as well.
				if(docType.id == 19)
				{
					var docLinked = callJobCardLinkStore.find(jcData => jcData.jobCardLinks.find(jcLink => jcLink.jobCard.id == doc.jobCardId) == undefined);
					// console.log('Doc linked: ', docLinked, doc.jobCardId);
				}


				// Start the upload process for each document
				if(doc.uploadComplete === false && doc.uploading === false)
				{

					// If the max files in the upload queue is reached, return
					if(filesInUploadQueue >= maxFilesInUploadQueue) 
					{ 
						moreFilesToUpload = true;
						return 
					}

					if(docType.id == 19 && !docLinked) { return }
					

					filesInUploadQueue++;

					// If the document is not uploaded and not uploading, start the upload process
					await uploadDocument(docType, doc)
					// If successful, set uploading to false and uploadComplete to true and remove the file to save memory
					.then(async () => {
						// console.log('Document uploaded successfully: ', docType.docTypeName, doc.id, doc);

						doc.uploading = false;
						doc.uploadComplete = true;
						doc.file = 'Uploaded';
						await updateDocumentInDB(docType.docTypeName, doc);

						filesInUploadQueue--;
					})
					// If failed, set uploading to false and keep uploadComplete to false, it will try again on the next sync
					.catch(async e => {
						// console.log('Error uploading document: ', e);

						doc.uploading = false;
						await updateDocumentInDB(docType.docTypeName, doc);

						filesInUploadQueue--;

						throw e;

					})
				}




				// If the document is already uploaded, set uploading to false
				else if(doc.uploadComplete === true && doc.uploading === true)
				{
					doc.uploading = false;
					await updateDocumentInDB(docType.docTypeName, doc);
					// console.log('SW - Document already uploaded: ', docType.docTypeName, doc.id, doc);
				}




				// If the document is uploaded and not uploading, delete it from the DB
				else if(doc.uploadComplete === true && doc.uploading === false && doc.file != 'Uploaded')
				{
					await deleteDocumentFileFromDB(docType.docTypeName, doc.id);
					// console.log('SW - Deleting file from IDB: ', docType.docTypeName, doc.id, doc);
				}

			}));
		}

	}));


}









async function uploadDocument(docType, doc) {

	// Set the document to uploading in the DB
	doc.uploading = true;
	await updateDocumentInDB(docType.docTypeName, doc);
	// console.log('SW - Starting upload for: ', docType.docTypeName, doc.id, doc);
	
	// Get the document type ID from the DB
	var docTypes = await getDocumentTypesFromDB();
	var docTypeId = docTypes.find(dt => dt.name === docType.docTypeName).id;

	// Create a new FormData object and append the file to it
	var formData = new FormData();
	var newFile = new File([doc.file], doc.file.name, { type: doc.file.type })
	formData.append('file', newFile);

	// Setup the fetch query base, signature and method
	var method = 'POST';
	var query = '';
	var signature = await getSignatureFromDB();

	if(self.location.origin.indexOf('localhost') !== -1)
	{
		query = 'http://129.232.180.146/cronus/api/';
	}
	else
	{
		query = 'https://office.locksecure.co.za/cronus/api/';
	}

	// Setup the query
	docTypeId == 19 
	? 
	query += 'job_cards/' + doc.jobCardId + '/upload' 
	: 
	query += 'customers/store/' + doc.customerStoreId + '/upload?customer_call_id=' + doc.call_id  + '&document_type_id=' + doc.fileTypeId;



	// Fetch the document to the server
	return await fetch(query, {
		method,
		headers: {
			"Authorization": "Bearer: " + signature
		},
		body: formData
	})
	.then(async resp => {
		if(!resp.ok)
		{
			throw `Failed to upload document... ${resp.status}`;
		}
	})
	.catch(e => {
		throw e;
	})


}










async function deleteDocumentFileFromDB(docTypeName, docId) {

	return new Promise((res, rej) => {

		var docDB = indexedDB.open(docTypeName, 1);

		docDB.onerror = function(e) {
			rej(false);
		}

		docDB.onsuccess = function(e) {
			var db = e.target.result;
			var transaction = db.transaction(docTypeName, 'readwrite');
			var store = transaction.objectStore(docTypeName);
			var request = store.get(docId);

			request.onsuccess = function(e) {
				var doc = e.target.result;
				doc.file = 'Uploaded';
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

			var db = e.target.result;
			var transaction = db.transaction(docTypeName, 'readonly');
			var store = transaction.objectStore(docTypeName);
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
		registerUploadSync();
	}



	// Force new App data to load with user triggered event
	if(event.data.type === 'skipWaiting') 
	{ return skipWaiting() }



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
		// console.log(resp.status + ' - ' + JSON.stringify(sendData));

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




function awaitStateChange() {
	self.registration.addEventListener('statechange', function() {
		if (this.state === 'installed') self.skipWaiting();
	});
}



// Retrieve an instance of Firebase Messaging so that it can handle background messages.
const messaging = firebase.messaging()

messaging.onBackgroundMessage((payload) => {
	console.log('[firebase-messaging-sw.js] Received background message ', payload);



	if(payload.notification && payload.notification.title && payload.notification.title == 'Update Cronus Tech App')
	{
		self.registration.update().then(reg => {
			console.log('Update event: ', reg);
			if(reg.installing)
			{
				reg.installing.postMessage({type: 'skipWaiting'});
			}
			if(reg.waiting)
			{
				reg.waiting.postMessage({type: 'skipWaiting'});
			}
		});
		// self.addEventListener('statechange', () => {
		// 	console.log('Service Worker state changed...');
		// 	if(self.registration.waiting)
		// 	{
		// 		const worker = self.registration.waiting;
		// 		console.log('Got a waiting worker: ', worker);
		// 		worker.postMessage({ type: 'skipWaiting' });
		// 		self.registration.waiting.skipWaiting();
		// 	}

		// })
		self.addEventListener('updatefound', () => {
			// const worker = self.registration.waiting;
			// worker.skipWaiting();
			// worker.addEventListener('statechange', () => {
			// 	if (worker.state === 'installed') {
			// 		messageApp('checkForUpdates', '', '', '');
			// 	}
			// });
		})
	}



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

	// return self.registration.showNotification(msgTitle, msgOptions);
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

// 	return self.registration.showNotification(msgTitle, msgOptions);
// });