/*
Read Me:
This is a simple wrapper around IndexedDB to make it easier to use.
It's important to note that custom indexes can be created when adding records for the first time.
If the DB doesn't exist yet and records are retrieved/deleted, idb will return an empty array or false when updating.

Functions for use:
    POST:
    - addRecord(DB_NAME, DB_VERSION, customIndexes, record); Adds a record to the DB
    GET:
    - getAllRecords(DB_NAME, DB_VERSION); Gets all records from the DB
    - getRecord(DB_NAME, DB_VERSION, id); Gets a record from the DB with the specified record ID
    - getAllRecordsOfCustomIndex(DB_NAME, DB_VERSION, idx, value); Gets all records from the DB with the specified custom index
    PUT:
    - updateRecord(DB_NAME, DB_VERSION, updateRecord); Updates a record in the DB
    DELETE:
    - deleteRecord(DB_NAME, DB_VERSION, id); Deletes a record from the DB

    Other:
    - checkDatabaseExists(DB_NAME, DB_VERSION); Checks if the requested database exists
*/


let currentDB;

export default {

    // Check if the requested database exists
    async checkDatabaseExists(DB_NAME, DB_VERSION) {

        return new Promise(async (res, rej) => {

            var databases = await window.indexedDB.databases();
            var exists = databases.find(db => db.name === DB_NAME && db.version === DB_VERSION);
            res(exists);

        });

    },



    // Open an IndexedDB 
    async openDB(DB_NAME, DB_VERSION = 1, customIndexes = [], STORE_NAME = DB_NAME) {

        // console.log('Opening Indexed DB: ', DB_NAME, DB_VERSION, STORE_NAME);

        if(currentDB && currentDB.name === DB_NAME && currentDB.version === DB_VERSION) {
            return currentDB;
        }


        return new Promise(async (res, rej) => { 

            let request = window.indexedDB.open(DB_NAME, DB_VERSION);

            request.onerror = (e) => {
                console.error('Error opening Indexed DB', DB_NAME, DB_VERSION, e);
                rej(e);
            };

            request.onsuccess = (e) => {
                currentDB = request.result;
                res(currentDB);
            };

            // The onupgradeneeded event only runs when the DB is first created or when a version change is done
            request.onupgradeneeded = async(e) => {

                var DB = e.target.result;
                DB.createObjectStore(STORE_NAME, { autoIncrement: true, keyPath: 'id' });

                if(customIndexes.length > 0) {
                    var store = e.target.transaction.objectStore(STORE_NAME);
                    await Promise.all(customIndexes.map(index => {
                        if(store && !store.indexNames.contains(index.name))
                            store.createIndex(index.name, index.key, {unique: index.unique})
                    }));
                }
            };

        })

    },




    // Add a record to an IndexedDB
    async addRecord(DB_NAME, DB_VERSION, customIndexes, record) {

        let DB = await this.openDB(DB_NAME, DB_VERSION, customIndexes);

        return new Promise((res, rej) => {

            const STORE_NAME = DB_NAME;
            const transaction = DB.transaction(STORE_NAME, 'readwrite');
            const store = transaction.objectStore(STORE_NAME);
            const request = store.add(record);

            request.onerror = (e) => {
                console.error('Error adding record to Indexed DB', e);
                rej(e);
            };

            request.onsuccess = (e) => {
                res(e);
            };

        })

    },





    // Get all records from an IndexedDB
    async getAllRecords(DB_NAME, DB_VERSION) {

        let dbExists = await this.checkDatabaseExists(DB_NAME, DB_VERSION);
        if(!dbExists) {
            return [];
        }

        let DB = await this.openDB(DB_NAME, DB_VERSION);

        return new Promise((res, rej) => {

            const STORE_NAME = DB_NAME;
            const transaction = DB.transaction(STORE_NAME, 'readonly');
            const store = transaction.objectStore(STORE_NAME);
            const request = store.getAll();

            request.onerror = (e) => {
                console.error('Error getting all records from Indexed DB', e);
                rej(e);
            };

            request.onsuccess = (e) => {
                res(e.target.result);
            };

        })

    },





    // Get a record from an IndexedDB
    async getRecord(DB_NAME, DB_VERSION, id) {

        let dbExists = await this.checkDatabaseExists(DB_NAME, DB_VERSION);
        if(!dbExists) {
            return [];
        }

        let DB = await this.openDB(DB_NAME, DB_VERSION);

        return new Promise((res, rej) => {

            const STORE_NAME = DB_NAME;
            const transaction = DB.transaction(STORE_NAME, 'readonly');
            const store = transaction.objectStore(STORE_NAME);
            const request = store.get(id);

            request.onerror = (e) => {
                console.error('Error getting record from Indexed DB', e);
                rej(e);
            };

            request.onsuccess = (e) => {
                res(e.target.result);
            };

        })

    },




    async getAllRecordsOfCustomIndex(DB_NAME, DB_VERSION, idx, value) {

        let dbExists = await this.checkDatabaseExists(DB_NAME, DB_VERSION);
        if(!dbExists) {
            return [];
        }
        
        let DB = await this.openDB(DB_NAME, DB_VERSION);

        return new Promise((res, rej) => {

            const STORE_NAME = DB_NAME;
            const transaction = DB.transaction(STORE_NAME, 'readonly');
            const store = transaction.objectStore(STORE_NAME);
            const index = store.index(idx);
            const request = index.getAll(value);

            request.onerror = (e) => {
                console.error('Error getting all records from Indexed DB', e);
                rej(e);
            };

            request.onsuccess = (e) => {
                res(e.target.result);
            };

        })
    },





    // Update a record in an IndexedDB
    async updateRecord(DB_NAME, DB_VERSION, updateRecord) {

        let dbExists = await this.checkDatabaseExists(DB_NAME, DB_VERSION);
        if(!dbExists) {
            return false;
        }

        let DB = await this.openDB(DB_NAME, DB_VERSION);

        return new Promise(async (res, rej) => {

            const STORE_NAME = DB_NAME;
            const record = await this.getRecord(DB_NAME, DB_VERSION, updateRecord.id);
            if(!record) 
            {
                console.error('Error updating record in Indexed DB: Record not found');
                rej('Record not found');
                return;
            }

            const transaction = DB.transaction(STORE_NAME, 'readwrite');
            const store = transaction.objectStore(STORE_NAME);

            // Update our existing record, adding new properties and updating existing ones
            for (var key in updateRecord) {
                if (updateRecord.hasOwnProperty(key)) 
                {
                    record[key] = updateRecord[key];
                }

            }

            const request = store.put(record);

            request.onerror = (e) => {
                console.error('Error updating record in Indexed DB', e);
                rej(e);
            };

            request.onsuccess = (e) => {
                res(e);
            };

        })

    },






    // Delete a record from an IndexedDB
    async deleteRecord(DB_NAME, DB_VERSION, id) {

        let dbExists = await this.checkDatabaseExists(DB_NAME, DB_VERSION);
        if(!dbExists) {
            return false;
        }

        let DB = await this.openDB(DB_NAME, DB_VERSION);

        return new Promise((res, rej) => {

            const STORE_NAME = DB_NAME;
            const transaction = DB.transaction(STORE_NAME, 'readwrite');
            const store = transaction.objectStore(STORE_NAME);
            const request = store.delete(id);

            request.onerror = (e) => {
                console.error('Error deleting record from Indexed DB', e);
                rej(e);
            };

            request.onsuccess = (e) => {
                res(e);
            };

        })

    },

}