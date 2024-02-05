
export default {


    // Open an IndexedDB 
    async openDB(DB_NAME, DB_VERSION, STORE_NAME) {

        return new Promise((res, rej) => {

            const request = indexedDB.open(DB_NAME, DB_VERSION);

            request.onerror = (e) => {
                console.error('Error opening Indexed DB',DB_NAME, DB_VERSION, e);
                rej(e);
            };

            request.onsuccess = (e) => {
                DB = e.target.result;
                res(DB);
            };

            request.onupgradeneeded = (e) => {
                DB = e.target.result;
                DB.createObjectStore(STORE_NAME, { autoIncrement: true, keyPath: 'id' });
            };

        })

    },




    // Add a record to an IndexedDB
    async addRecord(DB, STORE_NAME, record) {

        return new Promise((res, rej) => {

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
    async getAllRecords(DB, STORE_NAME) {

        return new Promise((res, rej) => {

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
    async getRecord(DB, STORE_NAME, id) {

        return new Promise((res, rej) => {

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





    // Update a record in an IndexedDB
    async updateRecord(DB, STORE_NAME, record) {

        return new Promise((res, rej) => {

            const transaction = DB.transaction(STORE_NAME, 'readwrite');
            const store = transaction.objectStore(STORE_NAME);
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
    async deleteRecord(DB, STORE_NAME, id) {

        return new Promise((res, rej) => {

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