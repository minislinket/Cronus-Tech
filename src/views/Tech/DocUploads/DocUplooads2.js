const Compressor = require('compressorjs');

// initial state
const state = () => ({
    documents: '',
    uploadDocModal: false,
    selectedDocumentTypeId: '',
    selectedDocument: ''
})





// getters
const getters = {
    documents: (state) => {
        return state.documents;
    },

    uploadDocModal: (state) => {
        return state.uploadDocModal;
    },


    selectedDocumentTypeId: (state) => {
        return state.selectedDocumentTypeId;
    },


    selectedDocument: (state) => {
        return state.selectedDocument;
    },
}





// actions
const actions = {


    uploadDocModal({ commit }, toggle) {
        commit('uploadDocModal', toggle);
    },


    selectedDocumentTypeId({ commit }, typeId) {
        commit('selectedDocumentTypeId', typeId);
    },


    selectedDocument({ commit }, document) {
        commit('selectedDocument', document);
    },



    async checkExistingRequiredDocsOnRerouted({ dispatch, state }, callId) {
        var documents = await dispatch('getAllDocuments');
        
        var today = new Date().toLocaleDateString();
        var removeRequiredDocs = documents.filter(doc => doc.call_id === callId && doc.required === true && doc.status === 'document required' && doc.doc_added.toLocaleDateString() == today);
        
        if(removeRequiredDocs && removeRequiredDocs.length >= 1)
        {
            removeRequiredDocs.map(doc => {
                dispatch('deleteDocument', doc.id);
            })
        }
    },




    async addLocalJCFileIfNotExist({ dispatch, state }, payload) {
        dispatch('addingPreLoadedDocs', true);
        var documents = await dispatch('getAllDocuments');
        console.log('Documents: ', documents);
        if(documents)
        {
            var hasDoc = documents.filter(doc => doc.job_card_id === payload.jobCard.id);
            // console.log('hasDoc', hasDoc, payload, ![]);
            if(!hasDoc || hasDoc.length <= 0)
            {
                dispatch('addLocalJCFile', payload);
            }
        }
        // else
        // {
        //     // console.log('Didn\'t find any documents, let\'s add it:', payload);
        //     dispatch('addLocalJCFile', payload);
        // }
        
    },


    addLocalJCFile({ dispatch }, payload) {

        console.log('File apparently doesn\'t exist, let\'s add it: ', payload);

        var user = JSON.parse(localStorage.getItem('user'));

        // Open the IndexedDB database
        var request = window.indexedDB.open("DocUploads", 1);

        // Handle database upgrade or creation
        request.onupgradeneeded = function (event) {
            var db = event.target.result;
            // Create the "document_uploads" table
            var objectStore = db.createObjectStore("document_uploads", { keyPath: "id", autoIncrement: true });
            objectStore.createIndex("job_card_id", "job_card_id", { unique: false });
            objectStore.createIndex("call_id", "call_id", { unique: false });
            objectStore.createIndex("customer_store_id", "customer_store_id", { unique: false });
            objectStore.createIndex("customer_store_name", "customer_store_name", { unique: false });
            objectStore.createIndex("type", "type", { unique: false });
            objectStore.createIndex("name", "name", { unique: false });
            objectStore.createIndex("size", "size", { unique: false });
            objectStore.createIndex("status", "status", { unique: false });
            objectStore.createIndex("doc_added", "doc_added", { unique: false });
            objectStore.createIndex("upload_started", "upload_started", { unique: false });
            objectStore.createIndex("upload_completed", "upload_completed", { unique: false });
            objectStore.createIndex("upload_attempts", "upload_attempts", { unique: false });
            objectStore.createIndex("upload_error", "upload_error", { unique: false });
            objectStore.createIndex("document", "document", { unique: false });
            objectStore.createIndex("employee_code", "employee_code", { unique: false });
            objectStore.createIndex("thumbnail", "thumbnail", { unique: false });
            objectStore.createIndex("required", "required", { unique: false });
        };


        // Once database is opened successfully
        request.onsuccess = function (event) {
            var db = event.target.result;


            var requiredJobCard = {
                job_card_id: payload.jobCard.id,
                call_id: payload.call ? payload.call.id : '',
                customer_store_id: payload.call.customerStoreId ? payload.call.customerStoreId : '',
                customer_store_name: payload.call.customerStoreName ? payload.call.customerStoreName : '',
                type: 19,
                name: payload.jobCard.id,
                size: payload.jobCard.cmisDocumentId ? '100' : '',
                status: payload.jobCard.cmisDocumentId ? 'complete' : 'document required',
                doc_added: new Date(),
                upload_started: payload.jobCard.cmisDocumentId ? payload.jobCard.uploadedDate : '',
                upload_completed: payload.jobCard.cmisDocumentId ? payload.jobCard.uploadedDate : '',
                upload_attempts: 0,
                upload_error: '',
                document: '',
                employee_code: user.employeeCode,
                thumbnail: '',
                required: true
            }


            var transaction = db.transaction(["document_uploads"], "readwrite");
            var objectStore = transaction.objectStore("document_uploads");

            // Add the document to the object store
            var request = objectStore.add(requiredJobCard);

            request.onsuccess = function (event) {
                console.log('Document added to IndexedDB', payload);
            };

            request.onerror = function (event) {
                console.log('Error adding document to IndexedDB', payload);
            }
        }


    },





    setRequiredDocument({ }, payload) {
        
        var user = JSON.parse(localStorage.getItem('user'));

        // Open the IndexedDB database
        var request = window.indexedDB.open("DocUploads", 1);

        // Handle database upgrade or creation
        request.onupgradeneeded = function (event) {
            var db = event.target.result;
            // Create the "document_uploads" table
            var objectStore = db.createObjectStore("document_uploads", { keyPath: "id", autoIncrement: true });
            objectStore.createIndex("job_card_id", "job_card_id", { unique: false });
            objectStore.createIndex("call_id", "call_id", { unique: false });
            objectStore.createIndex("customer_store_id", "customer_store_id", { unique: false });
            objectStore.createIndex("customer_store_name", "customer_store_name", { unique: false });
            objectStore.createIndex("type", "type", { unique: false });
            objectStore.createIndex("name", "name", { unique: false });
            objectStore.createIndex("size", "size", { unique: false });
            objectStore.createIndex("status", "status", { unique: false });
            objectStore.createIndex("doc_added", "doc_added", { unique: false });
            objectStore.createIndex("upload_started", "upload_started", { unique: false });
            objectStore.createIndex("upload_completed", "upload_completed", { unique: false });
            objectStore.createIndex("upload_attempts", "upload_attempts", { unique: false });
            objectStore.createIndex("upload_error", "upload_error", { unique: false });
            objectStore.createIndex("document", "document", { unique: false });
            objectStore.createIndex("employee_code", "employee_code", { unique: false });
            objectStore.createIndex("thumbnail", "thumbnail", { unique: false });
            objectStore.createIndex("required", "required", { unique: false });
        };


        // Once database is opened successfully
        request.onsuccess = function (event) {
            var db = event.target.result;


            var requiredJobCard = {
                job_card_id: '',
                call_id: payload.call ? payload.call.id : '',
                customer_store_id: payload.call.customerStoreId ? payload.call.customerStoreId : '',
                customer_store_name: payload.call.customerStoreName ? payload.call.customerStoreName : '',
                type: 19,
                name: '',
                size: '',
                status: 'document required',
                doc_added: new Date(),
                upload_started: '',
                upload_completed: '',
                upload_attempts: 0,
                upload_error: '',
                document: '',
                employee_code: user.employeeCode,
                thumbnail: '',
                required: true
            }


            var transaction = db.transaction(["document_uploads"], "readwrite");
            var objectStore = transaction.objectStore("document_uploads");

            // Add the document to the object store
            var request = objectStore.add(requiredJobCard);

            request.onsuccess = function (event) {
                console.log('Document added to IndexedDB', payload);
            };

            request.onerror = function (event) {
                console.log('Error adding document to IndexedDB', payload);
            }
        }
    },





    startDocumentUploadSync({}) {
        return navigator.serviceWorker.getRegistration()
        .then(async reg => {
            reg.active.postMessage({type: 'uploadDocuments'});
        })
        .catch(err => {
            console.log(err);
        })
    },


    
    async storeDocument({ dispatch, rootGetters }, payload) {

        console.log('Adding/Updating document to IndexedDB...', payload);

        // First check if the document already exists in IndexedDB and if so, update it
        // console.log('First checking to see if document already exists in IndexedDB...');
        var updatingExisting = await dispatch('checkUpdateExistingDocument', payload);
        // console.log('Is there an existing file?', updatingExisting);
        if(updatingExisting) { return }

        // console.log('Looks like these are new documents, so lets add them to IndexedDB...');

        var user = JSON.parse(localStorage.getItem('user'));
        var SQLBase = '';	

        if(self.location.origin.indexOf('localhost') !== -1) 
        { SQLBase = 'http://localhost/cronus-tech/src/api/' }
        else 
        { SQLBase = 'https://dev.locksecure.co.za/tech-api/' }

        // console.log('Adding document to IndexedDB...', payload);

        // Open the IndexedDB database
        var request = window.indexedDB.open("DocUploads", 1);


        // Handle database upgrade or creation
        request.onupgradeneeded = function (event) {
            var db = event.target.result;
            // Create the "document_uploads" table
            var objectStore = db.createObjectStore("document_uploads", { keyPath: "id", autoIncrement: true });
            objectStore.createIndex("job_card_id", "job_card_id", { unique: false });
            objectStore.createIndex("call_id", "call_id", { unique: false });
            objectStore.createIndex("customer_store_id", "customer_store_id", { unique: false });
            objectStore.createIndex("customer_store_name", "customer_store_name", { unique: false });
            objectStore.createIndex("type", "type", { unique: false });
            objectStore.createIndex("name", "name", { unique: false });
            objectStore.createIndex("size", "size", { unique: false });
            objectStore.createIndex("status", "status", { unique: false });
            objectStore.createIndex("doc_added", "doc_added", { unique: false });
            objectStore.createIndex("upload_started", "upload_started", { unique: false });
            objectStore.createIndex("upload_completed", "upload_completed", { unique: false });
            objectStore.createIndex("upload_attempts", "upload_attempts", { unique: false });
            objectStore.createIndex("upload_error", "upload_error", { unique: false });
            objectStore.createIndex("document", "document", { unique: false });
            objectStore.createIndex("employee_code", "employee_code", { unique: false });
            objectStore.createIndex("thumbnail", "thumbnail", { unique: false });
            objectStore.createIndex("required", "required", { unique: false });
        };


        


        // Handle successful database opening
        request.onsuccess = async function(event) {
            var db = event.target.result;

            // Create an array to store documents
            var documents = [];

            // Iterate through the files in the FormData
        await Promise.all(payload.formData.getAll("file").map(async file => {

            // Create an object with the document data
            var documentData = {
                job_card_id: payload.jobCardId ? Number(payload.jobCardId) : '', // Set your desired values for other fields
                call_id: payload.callId ? payload.callId : '',
                customer_store_id: payload.customerStoreId ? payload.customerStoreId : '',
                customer_store_name: payload.customerStoreName ? payload.customerStoreName : '',
                type: payload.fileTypeId,
                name: file.name,
                size: file.size,
                status: 'pending upload',
                doc_added: new Date(),
                upload_started: '',
                upload_completed: '',
                upload_attempts: 0,
                upload_error: '',
                document: file,
                employee_code: user.employeeCode,
                thumbnail: '',
                required: false
            };

            if(payload.fileTypeId === 1)
            {
                var thumbnail = await dispatch('makeThumbnail', file);
                // console.log('Got a tn: ', thumbnail);
                documentData.thumbnail = thumbnail;
                // documentData.thumbnail_url = URL.createObjectURL(thumbnail);
            }

            if(payload.fileTypeId === 19) { documentData.required = true }

            // Push the document object to the documents array
            documents.push(documentData);
        }));
            
            

            

            // Start a transaction and store the documents in the "document_uploads" table
            var transaction = db.transaction(["document_uploads"], "readwrite");
            var objectStore = transaction.objectStore("document_uploads");

            // Loop through the documents array and store each document
            documents.forEach(function(documentData) {
                var req = objectStore.add(documentData);

                // Handle successful document storage
                req.onsuccess = async function(event) {
                    console.log("Document stored successfully in IndexedDB");

                    // console.log('Starting background sync for DocUploads...');
                    dispatch('startDocumentUploadSync');

                    var online = rootGetters['StaticResources/online'];

                    if(online)
                    {
                        var SQLData = JSON.parse(JSON.stringify(documentData));
                        if(SQLData.document) { SQLData.document = '' }

                        //Save a log of all tech call updates
                        await fetch(SQLBase + '/docUploads/docUploads.php', {
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
                };

                // Handle error storing document
                req.onerror = function(event) {
                    console.error("Error storing document in IndexedDB:", event.target.error);
                };
            });
        };

        // Handle error opening database
        request.onerror = function(event) {
            console.error("Error opening IndexedDB database:", event.target.error);
        };
        
    },








    async checkUpdateExistingDocument({ dispatch }, payload) {
        var user = JSON.parse(localStorage.getItem('user'));
        return new Promise(async (res,rej) => {
            var documents = await dispatch('getAllDocuments');
            var filesToUpload = payload.formData.getAll("file");
            var flag = false;

            if(filesToUpload.length == 1)
            {
                await Promise.all(documents.map(doc => {
                    if(payload.callId == doc.call_id && doc.status == 'document required' && doc.type == payload.fileTypeId)
                    {
                        flag = true;
                        var updateDoc = {
                            id: doc.id,
                            job_card_id: payload.jobCardId ? Number(payload.jobCardId) : '',
                            type: payload.fileTypeId,
                            name: filesToUpload[0].name,
                            size: filesToUpload[0].size,
                            status: 'pending upload',
                            document: filesToUpload[0],
                            employee_code: user.employeeCode,
                        }

                        dispatch('updateDocument', updateDoc);
                        flag = true
                    }
                }));            
            }

            flag ? res(true) : res(false);
        })
    },







    async makeThumbnail({ }, file) {
        return new Promise((res, rej) => {
            new Compressor(file, {
                width: 80,

                // The compression process is asynchronous,
                // which means you have to access the `result` in the `success` hook function.
                success(result) {
                    // console.log('Compressed File: ', result);
                    res(result);
                },
                error(err) {
                    // console.log(err.message);
                    rej(err.message);
                },
            });
        })
    },




    updateDocument({ dispatch, rootGetters }, updateDoc) {

        var SQLBase = '';	

        if(self.location.origin.indexOf('localhost') !== -1) 
        { SQLBase = 'http://localhost/cronus-tech/src/api/' }
        else 
        { SQLBase = 'https://dev.locksecure.co.za/tech-api/' }

        // Open the IndexedDB database
        var request = window.indexedDB.open("DocUploads", 1);

        // Handle database upgrade or creation
        request.onupgradeneeded = function (event) {
            return
        };


        // Handle successful database opening
        request.onsuccess = function(event) {
            var db = event.target.result;
    
            // Start a transaction and get the object store
            var transaction = db.transaction(["document_uploads"], "readwrite");
            var objectStore = transaction.objectStore("document_uploads");
    
            // Retrieve the document with the specified ID
            var getRequest = objectStore.get(updateDoc.id);
    
            getRequest.onsuccess = function(event) {
                var documentData = event.target.result;
                if(documentData) 
                {
                    // Update the document with the updated data
                    Object.assign(documentData, updateDoc);
                    var updateRequest = objectStore.put(documentData);

                    updateRequest.onsuccess = async function(event) {
                        console.log('Document updated successfully');

                        dispatch('getAllDocuments');
                        dispatch('startDocumentUploadSync');
                        
                        var online = rootGetters['StaticResources/online'];

                        if(online)
                        {
                            var SQLData = JSON.parse(JSON.stringify(documentData));
                            if(SQLData.document) { SQLData.document = '' }

                            //Save a log of all tech call updates
                            await fetch(SQLBase + '/docUploads/docUploads.php', {
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
                    };
        
                    updateRequest.onerror = function(event) {
                        console.error("Error updating document in IndexedDB: " + event.target.error);
                    };
                } 
                else 
                {
                    // Document not found
                    console.error("Document not found in IndexedDB");
                }
            };
    
            getRequest.onerror = function(event) {
                console.error("Error retrieving document from IndexedDB: " + event.target.error);
            };
        };
    
        // Handle error opening database
        request.onerror = function(event) {
                console.error("Error opening IndexedDB database: " + event.target.error);
        };

    },








    async getDocumentById({ dispatch, commit }, documentId) {
        
        var document = await dispatch('getDocumentByIdFromIndexedDB', documentId);
        // document.thumbnail ? document['thumbnail_url'] = URL.createObjectURL(document.thumbnail) : null;
        console.log('document: ', document);
        commit('documents', [document]);
        return document;
    },




    getDocumentByIdFromIndexedDB({ dispatch, rootGetters }, documentId) {

        console.log('Getting document from IndexedDB...', documentId);
        return new Promise(function (resolve, reject) {
            // Open the IndexedDB database
            var request = window.indexedDB.open("DocUploads", 1);

            // Handle database upgrade or creation
            // request.onupgradeneeded = function (event) {
            //     event.target.transaction.abort();
            //     return
            // };
            // Handle database upgrade or creation
            request.onupgradeneeded = function (event) {
                var db = event.target.result;
                // Create the "document_uploads" table
                var objectStore = db.createObjectStore("document_uploads", { keyPath: "id", autoIncrement: true });
                objectStore.createIndex("job_card_id", "job_card_id", { unique: false });
                objectStore.createIndex("call_id", "call_id", { unique: false });
                objectStore.createIndex("customer_store_id", "customer_store_id", { unique: false });
                objectStore.createIndex("customer_store_name", "customer_store_name", { unique: false });
                objectStore.createIndex("type", "type", { unique: false });
                objectStore.createIndex("name", "name", { unique: false });
                objectStore.createIndex("size", "size", { unique: false });
                objectStore.createIndex("status", "status", { unique: false });
                objectStore.createIndex("doc_added", "doc_added", { unique: false });
                objectStore.createIndex("upload_started", "upload_started", { unique: false });
                objectStore.createIndex("upload_completed", "upload_completed", { unique: false });
                objectStore.createIndex("upload_attempts", "upload_attempts", { unique: false });
                objectStore.createIndex("upload_error", "upload_error", { unique: false });
                objectStore.createIndex("document", "document", { unique: false });
                objectStore.createIndex("employee_code", "employee_code", { unique: false });
                objectStore.createIndex("thumbnail", "thumbnail", { unique: false });
                objectStore.createIndex("required", "required", { unique: false });
            };

            // Handle successful database opening
            request.onsuccess = function (event) {
                var db = event.target.result;

                // Start a transaction and get the object store
                var transaction = db.transaction(["document_uploads"], "readonly");
                var objectStore = transaction.objectStore("document_uploads");

                // Retrieve the document with the specified ID
                var getRequest = objectStore.get(Number(documentId));

                getRequest.onsuccess = function (event) {
                    var documentData = event.target.result;
                    if (documentData) {
                        // Document with the specified ID found, resolve the Promise with the document
                        resolve(documentData);
                    } else {
                        // Document not found
                        reject(new Error("Document not found in IndexedDB"));
                    }
                };

                getRequest.onerror = function (event) {
                    reject(new Error("Error retrieving document from IndexedDB: " + event.target.error));
                };
            };

            // Handle error opening database
            request.onerror = function (event) {
                console.log('IDDB not opened, this is either an error or more likely that the database has not been created yet.');
                // reject(new Error("Error opening IndexedDB database: " + event.target.error));
            };
        });
    },




    async getAllDocuments({ dispatch, commit }) {

        // console.log('Getting all documents from IndexedDB...');

        var documents = await dispatch('getAllDocumentsFromIndexedDB');

        // documents.map(doc => {
        //     doc.thumbnail ? doc['thumbnail_url'] = URL.createObjectURL(doc.thumbnail) : null;
        // });

        commit('documents', documents);
        return documents;
    },




    async getAllDocumentsFromIndexedDB({ dispatch }) {

        return new Promise(function(resolve, reject) {

            // Open the IndexedDB database
            var request = window.indexedDB.open("DocUploads", 1);

            // Handle database upgrade or creation
            request.onupgradeneeded = function (event) {
                var db = event.target.result;
                // Create the "document_uploads" table
                var objectStore = db.createObjectStore("document_uploads", { keyPath: "id", autoIncrement: true });
                objectStore.createIndex("job_card_id", "job_card_id", { unique: false });
                objectStore.createIndex("call_id", "call_id", { unique: false });
                objectStore.createIndex("customer_store_id", "customer_store_id", { unique: false });
                objectStore.createIndex("customer_store_name", "customer_store_name", { unique: false });
                objectStore.createIndex("type", "type", { unique: false });
                objectStore.createIndex("name", "name", { unique: false });
                objectStore.createIndex("size", "size", { unique: false });
                objectStore.createIndex("status", "status", { unique: false });
                objectStore.createIndex("doc_added", "doc_added", { unique: false });
                objectStore.createIndex("upload_started", "upload_started", { unique: false });
                objectStore.createIndex("upload_completed", "upload_completed", { unique: false });
                objectStore.createIndex("upload_attempts", "upload_attempts", { unique: false });
                objectStore.createIndex("upload_error", "upload_error", { unique: false });
                objectStore.createIndex("document", "document", { unique: false });
                objectStore.createIndex("employee_code", "employee_code", { unique: false });
                objectStore.createIndex("thumbnail", "thumbnail", { unique: false });
                objectStore.createIndex("required", "required", { unique: false });
            };
        
            // Handle successful database opening
            request.onsuccess = function(event) {
                var db = event.target.result;
        
                // Start a transaction and get the object store
                var transaction = db.transaction(["document_uploads"], "readonly");
                var objectStore = transaction.objectStore("document_uploads");
        
                // Open a cursor to iterate over the documents
                var documents = [];
                var cursorRequest = objectStore.openCursor();
        
                cursorRequest.onsuccess = function(event) {
                    var cursor = event.target.result;
                    if (cursor) 
                    {
                        // Add the document to the documents array
                        documents.push(cursor.value);
                        cursor.continue();
                    } else 
                    {
                        // All documents have been retrieved, resolve the Promise with documents
                        resolve(documents);
                    }
                };
        
                cursorRequest.onerror = function(event) {
                    reject(new Error("Error retrieving documents from IndexedDB: " + event.target.error));
                    
                };
            };
        
            // Handle error opening database
            request.onerror = function(event) {
                console.log('IDDB not opened, this is either an error or more likely that the database has not been created yet.');
                // reject(new Error("Error opening IndexedDB database: " + event.target.error));
            };
        });
    },







    deleteDocument({ dispatch }, documentId) {
            
            // Open the IndexedDB database
            var request = window.indexedDB.open("DocUploads", 1);

            // Handle database upgrade or creation
            request.onupgradeneeded = function (event) {
                return
            };

    
            // Handle successful database opening
            request.onsuccess = function(event) {
                var db = event.target.result;
        
                // Start a transaction and get the object store
                var transaction = db.transaction(["document_uploads"], "readwrite");
                var objectStore = transaction.objectStore("document_uploads");
        
                // Delete the document with the specified ID
                var deleteRequest = objectStore.delete(documentId);
        
                deleteRequest.onsuccess = function(event) {
                    // resolve(); // Document deletion successful
                    console.log('Document deletion successful');
                    dispatch('getAllDocuments');
                };
        
                deleteRequest.onerror = function(event) {
                    console.error("Error deleting document from IndexedDB: " + event.target.error);
                };
            };
        
            // Handle error opening database
            request.onerror = function(event) {
                console.error("Error opening IndexedDB database: " + event.target.error);
            };
    },






    createUpdateIndexedDB({ }, db) {
        var objectStore = db.createObjectStore("document_uploads", { keyPath: "id", autoIncrement: true });
        objectStore.createIndex("job_card_id", "job_card_id", { unique: false });
        objectStore.createIndex("call_id", "call", { unique: false });
        objectStore.createIndex("customer_store_id", "customer_store_id", { unique: false });
        objectStore.createIndex("customer_store_name", "customer_store_name", { unique: false });
        objectStore.createIndex("type", "type", { unique: false });
        objectStore.createIndex("name", "name", { unique: false });
        objectStore.createIndex("size", "size", { unique: false });
        objectStore.createIndex("status", "status", { unique: false });
        objectStore.createIndex("doc_added", "doc_added", { unique: false });
        objectStore.createIndex("upload_started", "upload_started", { unique: false });
        objectStore.createIndex("upload_completed", "upload_completed", { unique: false });
        objectStore.createIndex("upload_attempts", "upload_attempts", { unique: false });
        objectStore.createIndex("upload_error", "upload_error", { unique: false });
        objectStore.createIndex("document", "document", { unique: false });
        objectStore.createIndex("employee_code", "employee_code", { unique: false });
        objectStore.createIndex("thumbnail", "thumbnail", { unique: false });
        objectStore.createIndex("required", "required", { unique: false });
    },







    setUserSignature({}, signature) {
        // console.log('setting user\'s signature into indexedDB: ', signature);
        // Open the IndexedDB database
        var request = window.indexedDB.open("SignatureDB", 1);

        // Handle database upgrade or creation
        request.onupgradeneeded = function(event) {
            var db = event.target.result;
            
            // Create the "signature" table
            var objectStore = db.createObjectStore("signature", { keyPath: "id", autoIncrement: true });
            objectStore.createIndex("signature", "signature", { unique: false });
        };


        // Handle successful database opening
        request.onsuccess = function(event) {
            var db = event.target.result;
    
            // Start a transaction and get the object store
            var transaction = db.transaction(["signature"], "readwrite");
            var objectStore = transaction.objectStore("signature");
    
            // Retrieve the Signature with the specified ID
            var getRequest = objectStore.get(1);
    
            getRequest.onsuccess = function(event) {
                var storedSignature = event.target.result;
                if(storedSignature) 
                {
                    // console.log('Stored signature: ',storedSignature);
                    // Update the Signature with the updated data
                    storedSignature.signature = signature;
                    var updateRequest = objectStore.put(storedSignature);
        
                    updateRequest.onsuccess = function(event) {
                        // console.log('Signature updated successfully');
                        // dispatch('getAllDocuments');
                        // resolve(); // Signature update successful
                    };
        
                    updateRequest.onerror = function(event) {
                        console.error("Error updating Signature in IndexedDB: " + event.target.error);
                    };
                } 
                else 
                {
                    // Signature not found
                    console.log("Signature not found in IndexedDB");

                    var addRequest = objectStore.add({signature: signature});

                    // Handle successful Signature storage
                    addRequest.onsuccess = function(event) {
                        console.log("Signature stored successfully in IndexedDB");
                    };

                    // Handle error storing Signature
                    addRequest.onerror = function(event) {
                        console.error("Error storing Signature in IndexedDB:", event.target.error);
                    };
                }
            };
    
            getRequest.onerror = function(event) {
                console.error("Error retrieving Signature from IndexedDB: " + event.target.error);
            };
        };
    
        // Handle error opening database
        request.onerror = function(event) {
                console.error("Error opening IndexedDB database: " + event.target.error);
        };


    },

}





// mutations
const mutations = {

    documents(state, docs) {
        state.documents = docs;
    },


    uploadDocModal(state, toggle) {
        state.uploadDocModal = toggle;
    },


    selectedDocumentTypeId(state, id) {
        state.selectedDocumentTypeId = id;
    },


    selectedDocument(state, doc) {
        state.selectedDocument = doc;
    }

}





export default {
    namespaced: true,
    state,
    getters,
    actions,
    mutations
}