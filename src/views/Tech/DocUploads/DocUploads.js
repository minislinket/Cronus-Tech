const Compressor = require('compressorjs');
import { axiosMySQL } from '../../../axios/axios';
import idb from '../../../idb/idb';

// initial state
const state = () => ({
    documents: [],

    loading: false,

    uploadDocModal: false,
    selectedDocumentTypeId: '',
    selectedDocument: '',

    lastDocumentRefresh: ''
})





// getters
const getters = {
    documents: (state) => {
        return state.documents;
    },



    loading: (state) => {
        return state.loading;
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

    async loadStateFromIDBAfterPageReload({ dispatch }) {
        if(idb)
        {
            await dispatch('getDocuments');
        }
        else
        {
            setTimeout(async() => {
                await dispatch('getDocuments');
            }, 1000);
        }
    },






    async makeThumbnail({ }, file) {
        return new Promise((res, rej) => {
            new Compressor(file, {
                width: 80,
                success(result) {
                    res(result);
                },
                error(err) {
                    rej(err.message);
                },
            });
        })
    },






    uploadDocModal({ commit }, toggle) {
        commit('uploadDocModal', toggle);
    },

    selectedDocumentTypeId({ commit }, typeId) {
        commit('selectedDocumentTypeId', typeId);
    },

    selectedDocument({ commit }, document) {
        commit('selectedDocument', document);
    },




    loading({ commit }, toggle) {
        commit('loading', toggle);
    },



    async addLocalDocuments({ commit, dispatch }, payload) {

        console.log('Adding a local file for upload: ', payload);

        if(payload.fileTypeId == 19)
        {
            dispatch('addJobCardFileForUpload', payload);
        }
        else
        {
            dispatch('addLocalDocumentsForUpload', payload);
        }
    },



    async addLocalDocumentsForUpload({ commit, dispatch }, payload) {

        dispatch('loading', true);

        var user = JSON.parse(localStorage.getItem('user'));
        var files = payload.documentList;

        await Promise.all(files.map(async file => {

            var documentData = {
                job_card_id: payload.jobCardId ? Number(payload.jobCardId) : '',
                job_card_linked: false,
                job_card_link_added: false,
                call_id: payload.call.id,
                customer_store_id: payload.call.customerStoreId,
                customer_store_name: payload.call.customerStoreName,
                type: payload.fileTypeId,
                name: file.name,
                size: file.size,
                status: 'pending upload',
                doc_added: new Date().toISOString().split('T')[0] + ' ' + new Date().toISOString().split('T')[1],
                upload_started: '',
                upload_completed: '',
                upload_attempts: 0,
                upload_error: '',
                upload_data_synced: false,
                file: file,
                employee_code: user.employeeCode,
                thumbnail: '',
                required: false
            };


            switch(payload.fileTypeId) {

                case 1:
                    documentData.thumbnail = await dispatch('makeThumbnail', file);
                    break
                // case 19: 
                //     documentData.required = true;
                //     break
            }

            var localDocument = await idb.saveOrUpdateDocument(documentData);
            commit('addDocument', localDocument);

        }));

        dispatch('loading', false);
        dispatch('Loading/setLoading', false, { root: true });
        idb.startDocumentUploads();
    },








    async checkIfFileExists({ state, dispatch }, payload) {
        return new Promise(async res => {

            var file = payload.file;
            var call = payload.call;
            var jobCardId = Number(payload.jobCardId);
            var fileTypeId = payload.fileTypeId;

            var documents = state.documents;
            var existingDocument = documents.find(doc => jobCardId == doc.job_card_id || doc.call_id === call.id && doc.status == 'document required' && doc.type === fileTypeId);

            if(existingDocument) 
            {
                var updateDocument = {
                    id: existingDocument.id,
                    status: file ? 'pending upload' : 'document required',
                    file: file ? file : '',
                    size: file ? file.size : '',
                    name: file ? file.name : '',
                    upload_data_synced: false,
                }
                jobCardId ? updateDocument.job_card_id = Number(jobCardId) : null;

                await dispatch('updateDocument', updateDocument);
                res(true);
            }
            else
            {
                res(false)
            }
        })
    },








    async updateDocument({ commit, dispatch }, document) {
        dispatch('loading', true);
        console.log('Updating doc: ', document);
        var updateDocument = await idb.saveOrUpdateDocument(document);
        commit('updateDocument', updateDocument);
        dispatch('loading', false);
        dispatch('updateOrAddServerDocument', updateDocument);
        idb.startDocumentUploads();
    },





    async addJobCardFileForUpload({ commit, dispatch }, payload) {
        dispatch('loading', true);
        await dispatch('findAndUpdateLinkedJobCard', payload);
        dispatch('Loading/setLoading', false, { root: true });
        dispatch('loading', false);
        idb.startDocumentUploads();
    },





    async findAndUpdateLinkedJobCard({ state, dispatch }, payload) {
        return new Promise(async res => {

            var file = payload.documentList[0];
            var documents = state.documents;

            var existingDocument = documents.find(doc => Number(payload.jobCardId) == doc.job_card_id && doc.call_id === payload.call.id /* && doc.status == 'document required' */);
            if(existingDocument) 
            {
                var updateDocument = {
                    id: existingDocument.id,
                    status: 'pending upload',
                    file: file,
                    size: file.size,
                    name: file.name,
                    upload_data_synced: false,
                }

                await dispatch('updateDocument', updateDocument);
                res(true);
            }
            else
            {
                res(false)
            }
        })       
    },





    async linkJobCard({ commit, dispatch }, payload) {
        dispatch('loading', true);

        var user = JSON.parse(localStorage.getItem('user'));
        var requiredJobCardExists = await dispatch('checkIfRequiredJobCardExists', payload);
        if(requiredJobCardExists) { return }

        var documentData = {
            job_card_id: Number(payload.jobCard.id),
            job_card_linked: false,
            job_card_link_added: true,
            call_id: payload.call.id,
            customer_store_id: payload.call.customerStoreId,
            customer_store_name: payload.call.customerStoreName,
            type: 19,
            name: '',
            size: '',
            status: 'document required',
            doc_added: new Date().toISOString().split('T')[0] + ' ' + new Date().toISOString().split('T')[1],
            upload_started: '',
            upload_completed: '',
            upload_attempts: 0,
            upload_error: '',
            upload_data_synced: false,
            file: '',
            employee_code: user.employeeCode,
            thumbnail: '',
            required: true
        }

        var localDocument = await idb.saveOrUpdateDocument(documentData);
        commit('addDocument', localDocument);
        dispatch('loading', false);

    },




    async checkIfRequiredJobCardExists({ state, dispatch }, payload) {
        return new Promise(async res => {

            var documents = state.documents;
            var existingDocument = documents.find(doc => doc.call_id === payload.call.id && doc.status == 'document required' && !doc.job_card_link_added);

            if(existingDocument) 
            {
                var updateDocument = {
                    id: existingDocument.id,
                    job_card_id: Number(payload.jobCard.id),
                    job_card_linked: false,
                    job_card_link_added: true,
                    upload_data_synced: false,
                }

                await dispatch('updateDocument', updateDocument);
                res(true);
            }
            else
            {
                res(false)
            }
        })
    },




    async addRequiredJobCard({ commit, dispatch }, payload) {

        dispatch('loading', true);

        var user = JSON.parse(localStorage.getItem('user'));

        var jobCardData = {
            job_card_id: '',
            job_card_linked: false,
            job_card_link_added: false,
            call_id: payload.call.id,
            customer_store_id: payload.call.customerStoreId,
            customer_store_name: payload.call.customerStoreName,
            type: 19,
            name: '',
            size: '',
            status: 'document required',
            doc_added: new Date().toISOString().split('T')[0] + ' ' + new Date().toISOString().split('T')[1],
            upload_started: '',
            upload_completed: '',
            upload_attempts: 0,
            upload_error: '',
            upload_data_synced: false,
            file: '',
            employee_code: user.employeeCode,
            thumbnail: '',
            required: true
        };

        var localDocument = await idb.saveOrUpdateDocument(jobCardData);
        commit('addDocument', localDocument);
        dispatch('loading', false);
    },






    async removeDocument({ commit, dispatch }, document) {
        dispatch('loading', true);
        await idb.deleteDocument(document.id);
        commit('removeDocument', document);
        dispatch('loading', false);
    },






    async getDocuments({ state, commit, dispatch }, bypassWait) {
        if(state.lastDocumentRefresh && !bypassWait) {
            var now = new Date();
            var diff = now - state.lastDocumentRefresh;
            if(diff < 1000) {
                console.log('not refreshing documents, too soon');
                return;
            }
        }
        console.log('refreshing documents');
        state.lastDocumentRefresh = new Date();
        var documents = await idb.getDocuments();
        await Promise.all(documents.map(async doc => doc.file = '')); // remove the file if there is one, saves memory
        documents = documents.filter(doc => doc.status != 'archived' || doc.status.indexOf('delete') == -1);
        console.log('Documents from IDB: ', documents);
        commit('documents', documents);
    },







    // async checkForExistingJobCard({ state, dispatch }, payload) {
    //     return new Promise(async res => {

    //         var call = payload.call;
    //         var jobCard = payload.jobCard;

    //         var documents = state.documents;
    //         var existingJobCard = documents.find(doc => doc.call_id === call.id && doc.status == 'document required' && doc.type === 19);

    //         if(existingJobCard) 
    //         {
    //             var updateDocument = {
    //                 id: existingJobCard.id,
    //                 status: 'document required',
    //                 job_card_id: jobCard.id,
    //                 job_card_linked: payload.linked,
    //                 job_card_link_added: payload.linkSent,
    //             }
    //             await dispatch('updateDocument', updateDocument);
    //             res(true);
    //         }
    //         else
    //         {
    //             res(false)
    //         }
    //     })
    // },





    async checkExistingRequiredDocsOnRerouted({ dispatch, state }, call) {
        var documents = state.documents;   
        var thirtyMinutesAgo = new Date().getTime() - (30 * 60 * 1000);
        var thirtyMinutesAgoDate = new Date(thirtyMinutesAgo);        
        
        var removeRequiredDocs = documents.filter(doc => doc.call_id === call.id && doc.required === true && doc.status === 'document required' && thirtyMinutesAgoDate < new Date(doc.doc_added) && !doc.job_card_id);
        // console.log('removeRequiredDocs: ', removeRequiredDocs)
        if(removeRequiredDocs && removeRequiredDocs.length >= 1)
        {
            await Promise.all(removeRequiredDocs.map(async doc => {
                doc.status = 'deleted rerouted';
                var serverDocUpdated = await dispatch('removeServerDocument', doc);
                if(serverDocUpdated)
                {
                    await dispatch('removeDocument', doc);
                }
                else
                {
                    doc.upload_data_synced = false;
                    idb.saveOrUpdateDocument(doc);
                }
            }))
            dispatch('getDocuments');
        }
    },







    async archiveCallDocuments({ dispatch, state }, callId) {
        
        var callDocuments = state.documents.filter(doc => doc.call_id === callId);
        // console.log('callDocuments: ', callDocuments, callId);
        
        if(callDocuments && callDocuments.length >= 1)
        {
            await Promise.all(callDocuments.map(async doc => {
                doc.status = 'archived';
                var serverDocUpdated = await dispatch('removeServerDocument', doc);
                if(serverDocUpdated)
                {
                    await dispatch('removeDocument', doc);
                }
                else
                {
                    doc.upload_data_synced = false;
                    idb.saveOrUpdateDocument(doc);
                }
            }))
            dispatch('getDocuments');
        }
    },







    async updateOrAddServerDocument({ dispatch }, document) {
        return axiosMySQL.post('/docUploads/docUploads.php', document)
        .then(resp => {
            // Yay, it worked.
            document.upload_data_synced = true;
            idb.saveOrUpdateDocument(document);
            return true;
        })
        .catch(err => {
            return false;
            // best effort service here for now, if it fails often we'll build a retry mechanism
        })
    },




    async removeServerDocument({ dispatch }, document) {
        return axiosMySQL.post('/docUploads/removeDocUpload.php', document)
        .then(resp => {
            // Yay, it worked.
            return true;
        })
        .catch(err => {
            return false;
            // best effort service here for now, if it fails often we'll build a retry mechanism
        })
    },










    async getApprovedRemovals({ state, dispatch }) {

        dispatch('loading', true);

        var user = JSON.parse(localStorage.getItem('user'));

        await axiosMySQL.post('docUploads/getApprovedRemovals.php', user.employeeCode)
        .then(async resp => {
            console.log('getApprovedRemovals: ', resp.data);
            if(resp.status == 200 && resp.data && resp.data.length >= 1)
            {
                var removals = resp.data;
                await dispatch('getDocuments', true);
                console.log(state.documents);
                removals.map(async removal => {
                    var document = state.documents.find(doc => doc.employee_code === removal.technician_employee_code && Number(doc.call_id) === Number(removal.call_id) && doc.status == 'document required');
                    console.log('Found matching doc in state: ', document);
                    if(document)
                    {
                        document.status = 'can delete';
                        await dispatch('updateDocument', document);
                        await dispatch('updateDocAdminStatus', { call_id: document.call_id, employee_code: document.employee_code, status: 'delete received' });
                    }
                })
            }
            dispatch('loading', false);
        })
        .catch(err => {
            console.log('getApprovedRemovals error: ', err);
            dispatch('loading', false);
        })

    },





    async removeAdminApprovedDoc({ dispatch }, document) {

        if(document)
        {
            document.status = 'deleted admin';
            await dispatch('updateDocAdminStatus', { call_id: document.call_id, employee_code: document.employee_code, status: 'deleted' });
            await dispatch('removeServerDocument', document);
            await dispatch('removeDocument', document);
        }

    },





    async updateDocAdminStatus({ dispatch }, document) {

        await axiosMySQL.post('docUploads/updateDocAdminStatus.php', document)

    },




}





// mutations
const mutations = {

    documents(state, docs) {
        state.documents = docs;
    },



    loading(state, toggle) {
        state.loading = toggle;
    },



    uploadDocModal(state, toggle) {
        state.uploadDocModal = toggle;
    },

    selectedDocumentTypeId(state, id) {
        state.selectedDocumentTypeId = id;
    },

    selectedDocument(state, doc) {
        state.selectedDocument = doc;
    },





    addDocument(state, document) {
        state.documents.push(document);
    },


    updateDocument(state, document) {
        var index = state.documents.findIndex(doc => doc.id === document.id);
        state.documents[index] = document;
    },


    removeDocument(state, document) {
        state.documents = state.documents.filter(doc => doc.id !== document.id);
    }

}





export default {
    namespaced: true,
    state,
    getters,
    actions,
    mutations
}