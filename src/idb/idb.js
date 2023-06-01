import store from '../store/index.js';

const DB_NAME = 'DocUploads';
const DB_VERSION = 1;
let DB;

// Check for page reload and load document state from IDB
const pageAccessedByReload = window.performance.getEntriesByType('navigation').map((nav) => nav.type).includes('reload');

if(pageAccessedByReload)
{
    if(store)
    {
        store.dispatch('DocUploads/loadStateFromIDBAfterPageReload');
    }
    else
    {
        setTimeout(() => {
            store.dispatch('DocUploads/loadStateFromIDBAfterPageReload');
        }, 1000);
    }
}


// This is our IDB object
export default {


	async getDb() {
		return new Promise((resolve, reject) => {

			if(DB) { return resolve(DB); }
			// console.log('OPENING DB', DB_NAME, ' - ', DB_VERSION);
			let request = window.indexedDB.open(DB_NAME, DB_VERSION);
			
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



	async deleteDocument(documentId) {

		let db = await this.getDb();

		return new Promise(resolve => {

            // console.log('Deleting document from IDB: ', documentId);

			let trans = db.transaction(['document_uploads'],'readwrite');
			let objectStore = trans.objectStore('document_uploads');
			var delRequest = objectStore.delete(documentId);

            delRequest.onsuccess = function(event) {
                resolve();
            }

            delRequest.onerror = function(event) {
                console.error('Error deleting document from IDB: ', event);
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



	async saveOrUpdateDocument(document) {

		let db = await this.getDb();

		return new Promise(resolve => {

			let trans = db.transaction(['document_uploads'],'readwrite');
            let objectStore = trans.objectStore('document_uploads');


            if(document.id)
            {
                // console.log('We have a doc id, finding the match and updating it');
                var getRequest = objectStore.get(document.id);

                getRequest.onerror = e => {
                    console.error('Error opening db', e);
                };

                getRequest.onsuccess = function(event) {

                    var storedDocument = event.target.result;
                    if(storedDocument) 
                    {
                        // Update the stored document with the latest data
                        Object.assign(storedDocument, document);
                        var putRequest = objectStore.put(storedDocument);
                        putRequest.onerror = e => {
                            console.error('Error opening db', e);
                        };
                        putRequest.onsuccess = function(event) {
                            resolve(storedDocument);
                        };
                    } 
                    else 
                    {
                        delete document.id;
                        // console.log('No match found, adding a new document')
                        var addRequest = objectStore.add(document);

                        addRequest.onerror = e => {
                            console.error('Error opening db', e);
                        };
                        addRequest.onsuccess = function(event) {
                            document.id = event.target.result;
                            store.dispatch('DocUploads/updateOrAddServerDocument', document);
                            resolve(document);
                        };
                        
                    }
                };
            }
            else
            {
                // console.log('No doc id, adding a new document')
                var addRequest = objectStore.add(document);
                addRequest.onerror = e => {
                    console.error('Error opening db', e);
                };
                addRequest.onsuccess = function(event) {
                    document.id = event.target.result;
                    store.dispatch('DocUploads/updateOrAddServerDocument', document);
                    resolve(document);
                };
                
            }

            

		});
	
	},



    // The Service Worker uses this, we only need to save it here for it to have access to it
    async setUserSignature(signature) {

        let request = window.indexedDB.open('SignatureDB', 1);
        
        request.onerror = e => {
            console.log('Error opening db', e);
        };

        request.onsuccess = e => {
            var db = e.target.result;
            let trans = db.transaction(['signature'],'readwrite');
            let objectStore = trans.objectStore('signature');

            var getRequest = objectStore.get(1);
            getRequest.onsuccess = function(event) {

                var storedSignature = event.target.result;
                if(storedSignature) 
                {
                    // Update the Signature with the updated data
                    storedSignature.signature = signature;
                    objectStore.put(storedSignature);
                } 
                else 
                {
                    var signatureData = {
                        signature,
                        id: 1
                    }
                    objectStore.add(signatureData);
                }
            };

        };
        
        request.onupgradeneeded = e => {
            // console.log('onupgradeneeded');
            let db = e.target.result;
            db.createObjectStore("signature", { autoIncrement: false, keyPath:'id' });
        };
    },




    async startDocumentUploads() {
        try {
            const reg = await navigator.serviceWorker.getRegistration();
            reg.active.postMessage({ type: 'uploadDocuments' });
        } catch (err) {
            console.error(err);
        }
    }

}