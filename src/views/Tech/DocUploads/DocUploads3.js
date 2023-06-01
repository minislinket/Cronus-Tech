async checkForExistingJobCards({ state, dispatch }, payload) {
    return new Promise(async (res, rej) => {

        var call = payload.call;
        var jobCards = payload.call.jobCards;
        
        var docs = state.documents;

        if(docs.length <= 0)
        {
            console.log('📁⚠ Getting docs from IDDB...');  
            docs = await dispatch('getAllDocuments', 'checkForExistingJobCards');
        }

        await Promise.all(jobCards.map(async jc => {

            var existingJC = docs.find(doc => doc.job_card_id === jc.id);
            console.log('Checking for existing document: ', existingJC, jc);

            if(existingJC) 
            { res() }
            else
            {
                console.log('Creating new JC Doc on local DB');
                await dispatch('createJobCardDocument', { jobCard: jc, call });
                console.log('Local Doc created, resolving promise.');
                res();
            }
        }));

    });
},







async createJobCardDocument({ dispatch }, payload) {
    return new Promise(async (res, rej) => {
    // payload = { fileTypeId: 19, jobCard: this.jobCard, call: this.call }

        var user = JSON.parse(localStorage.getItem('user'));

        var documentData = {
            job_card_id: payload.jobCard ? payload.jobCard.id : '',
            call_id: payload.call ? payload.call.id : '',
            customer_store_id: payload.call && payload.call.customerStoreId ? payload.call.customerStoreId : '',
            customer_store_name: payload.call && payload.call.customerStoreName ? payload.call.customerStoreName : '',
            type: 19,
            name: payload.jobCard ? payload.jobCard.id : '',
            size: payload.jobCard.cmisDocumentId ? '100' : '',
            status: payload.jobCard.cmisDocumentId ? 'complete' : 'document required',
            doc_added: new Date(),
            upload_started: payload.jobCard.uploadedDate ? payload.jobCard.uploadedDate : '',
            upload_completed: payload.jobCard.uploadedDate ? payload.jobCard.uploadedDate : '',
            upload_attempts: 0,
            upload_error: '',
            file: '',
            employee_id: user.id
        }

        await dispatch('storeDocument', documentData);
        res();
    });

},









async getAllDocuments({ commit, dispatch }, from) {
    dispatch('loading', true);
    return new Promise(async function(resolve, reject) {

        var request = window.indexedDB.open("DocUploads", 1);

        request.onupgradeneeded = async function (event) {
            await dispatch('createOrUpdateDocumentStore', event);
        };

        request.onsuccess = function(event) {
            var db = event.target.result;
            var transaction = db.transaction(["document_uploads"], "readonly");
            var objectStore = transaction.objectStore("document_uploads");
            var cursorRequest = objectStore.openCursor();
            var documents = [];
    
            cursorRequest.onsuccess = function(event) {
                var cursor = event.target.result;
                if (cursor) 
                {
                    documents.push(cursor.value);
                    cursor.continue();
                } else 
                {   
                    dispatch('loading', false);
                    console.log('Retrieved documents from IndexedDB: ', documents, from);
                    commit('documents', documents);
                    resolve(documents);
                }
            };
    
            cursorRequest.onerror = function(event) {
                reject(new Error("Error retrieving documents from IndexedDB: " + event.target.error));
                dispatch('loading', false);
            };
        };
    
        request.onerror = function(event) {
            console.log('IDDB not opened, this is either an error or more likely that the database has not been created yet.');
            dispatch('loading', false);
        };

    });
},





async prepareDocumentsForUpload({ dispatch }, payload) {
    // payload = { formData, fileTypeId: this.fileTypeId, jobCardId: this.jobCardId, call: this.call }

    dispatch('loading', true);

    var user = JSON.parse(localStorage.getItem('user'));

    var documents = [];

    await Promise.all(payload.formData.getAll("file").map(async file => {
            
            var documentData = {
                job_card_id: payload.jobCardId ? Number(payload.jobCardId) : '',
                call_id: payload.call ? payload.call.id : '',
                customer_store_id: payload.call && payload.call.customerStoreId ? payload.call.customerStoreId : '',
                customer_store_name: payload.call && payload.call.customerStoreName ? payload.call.customerStoreName : '',
                type: payload.fileTypeId,
                name: file.name,
                size: file.size,
                status: 'pending upload',
                doc_added: new Date(),
                upload_started: '',
                upload_completed: '',
                upload_attempts: 0,
                upload_error: '',
                file: file,
                employee_code: user.employeeCode,
                thumbnail: '',
                required: false
            };

            if(payload.fileTypeId === 1)
            {
                var thumbnail = await dispatch('makeThumbnail', file);
                documentData.thumbnail = thumbnail;
            }

            if(payload.fileTypeId === 19) { documentData.required = true }

            documents.push(documentData);
        }
    ));

    console.log('Documents to be uploaded: ', documents);

    await Promise.all(documents.map(async doc => {
        await dispatch('storeDocument', doc);
    }));

    dispatch('startDocumentUploadSync');
    dispatch('loading', false);
},




async storeDocument({ dispatch, rootGetters }, documentData) {
    return new Promise(async (res, rej) => {
        console.log('Adding/Updating document to IndexedDB...', documentData);

        // First check if the document already exists in IndexedDB and if so, update it
        // console.log('First checking to see if document already exists in IndexedDB...');
        var updatingExisting = await dispatch('checkUpdateExistingDocument', documentData);
        // console.log('Is there an existing file?', updatingExisting);
        if(updatingExisting) { return }

        // console.log('Looks like these are new documents, so lets add them to IndexedDB...');
        var SQLBase = '';	

        if(window.location.origin.indexOf('localhost') !== -1) 
        { SQLBase = 'http://localhost/cronus-tech/src/api/' }
        else 
        { SQLBase = 'https://dev.locksecure.co.za/tech-api/' }



        var request = window.indexedDB.open("DocUploads", 1);

        request.onupgradeneeded = async function (event) {
            await dispatch('createOrUpdateDocumentStore', event);
        };


        request.onsuccess = async function(event) {
            var db = event.target.result;

            var transaction = db.transaction(["document_uploads"], "readwrite");
            var objectStore = transaction.objectStore("document_uploads");
            var req = objectStore.add(documentData);

            req.onsuccess = async function(event) {
                console.log("Document stored successfully in IndexedDB");

                res();

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
                rej();
            };
            
        };

        // Handle error opening database
        request.onerror = function(event) {
            console.error("Error opening IndexedDB database:", event.target.error);
        };
    });
},







async checkUpdateExistingDocument({ state, dispatch }, documentData) {
    
    var user = JSON.parse(localStorage.getItem('user'));

    return new Promise(async (res,rej) => {
        console.log('📁🧷 Potentially getting docs from IDDB...');
        var documents = state.documents.length >= 1 ? state.documents : await dispatch('getAllDocuments', 'checkUpdateExistingDocument');
        var fileToUpload = documentData.document;
        var flag = false;

        if(fileToUpload)
        {
            await Promise.all(documents.map(async doc => {
                if(payload.call.id == doc.call_id && doc.status == 'document required' && doc.type == payload.fileTypeId)
                {
                    flag = true;
                    var updateDoc = {
                        id: doc.id,
                        job_card_id: payload.jobCardId ? Number(payload.jobCardId) : '',
                        type: payload.fileTypeId,
                        name: fileToUpload[0].name,
                        size: fileToUpload[0].size,
                        status: 'pending upload',
                        file: fileToUpload[0],
                        employee_code: user.employeeCode,
                    }

                    await dispatch('updateDocument', updateDoc);
                }
            }));            
        }

        flag ? res(true) : res(false);
    })
},







async updateDocument({ dispatch, rootGetters }, updateDoc) {

    return new Promise((res, rej)=> {

        var SQLBase = '';	

        if(window.location.origin.indexOf('localhost') !== -1) 
        { SQLBase = 'http://localhost/cronus-tech/src/api/' }
        else 
        { SQLBase = 'https://dev.locksecure.co.za/tech-api/' }




        var request = window.indexedDB.open("DocUploads", 1);

        request.onupgradeneeded = async function (event) {
            await dispatch('createOrUpdateDocumentStore', event);
        };

        request.onsuccess = function(event) {
            var db = event.target.result;
            var transaction = db.transaction(["document_uploads"], "readwrite");
            var objectStore = transaction.objectStore("document_uploads");
            var getRequest = objectStore.get(updateDoc.id);
    
            getRequest.onsuccess = async function(event) {
                var documentData = event.target.result;
                if(documentData) 
                {
                    // Update the document with the updated data
                    Object.assign(documentData, updateDoc);
                    var updateRequest = objectStore.put(documentData);

                    updateRequest.onsuccess = async function(event) {
                        console.log('Document updated successfully');

                        console.log('📁⚠ Getting docs from IDDB...'); 
                        await dispatch('getAllDocuments', 'updateDocument');
                        res();
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
                        rej();
                    };
                } 
                else 
                {
                    // Document not found
                    console.error("Document not found in IndexedDB");
                    rej();
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

    })
},









async deleteDocument({ dispatch }, documentId) {
    dispatch('loading', true);
    return new Promise((res,rej) => {
    // Open the IndexedDB database
        var request = window.indexedDB.open("DocUploads", 1);

        // Handle database upgrade or creation
        request.onupgradeneeded = function (event) {
            event.target.abort();  
            dispatch('loading', false);              
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
    
            deleteRequest.onsuccess = async function(event) {
                // resolve(); // Document deletion successful
                console.log('Document deletion successful');
                
                console.log('📁⚠ Getting docs from IDDB...'); 
                await dispatch('getAllDocuments', 'deleteDocument');
                dispatch('loading', false);
                res();
            };
    
            deleteRequest.onerror = function(event) {
                console.error("Error deleting document from IndexedDB: " + event.target.error);
                dispatch('loading', false);
            };
        };
    
        request.onerror = function(event) {
            console.log("IDDB DocUploads not open yet, cannot delete if do not exist...");
            dispatch('loading', false);
        };
    });
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








async createOrUpdateDocumentStore({ }, event) {
    return new Promise((res,rej) => {
        var db = event.target.result;

        // Create the "document_uploads" table
        var objectStore = db.createObjectStore("document_uploads", { keyPath: "id", autoIncrement: true });
        objectStore.createIndex("job_card_id", "job_card_id", { unique: true });
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
        objectStore.createIndex("file", "file", { unique: false });
        objectStore.createIndex("employee_code", "employee_code", { unique: false });
        objectStore.createIndex("thumbnail", "thumbnail", { unique: false });
        objectStore.createIndex("required", "required", { unique: false });

        res();
    })
},




