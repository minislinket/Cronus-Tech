import LZString from "lz-string";
import { axiosOffice } from "../../../axios/axios";

// initial state
const state = () => ({

    controller: '',
    techController: '',
    eventsController: '',

    loading: false,
    branchCalls: [],
    activeTechs: [],

    filteredTechs: [],

    selectedBranch: '',
    selectedTech: '',

    callCommentsModalActive: false,
    callComments: [],
})





// getters
const getters = {


    loading: (state) => {
        return state.loading;
    },

    
    branchCalls: (state) => {
        return state.branchCalls;
    },


    activeTechs: (state) => {
        return state.activeTechs;
    },


    filteredTechs: (state) => {
        return state.filteredTechs;
    },


    selectedBranch: (state) => {
        return state.selectedBranch;
    },

    
    selectedTech: (state) => {
        return state.selectedTech;
    },


    controller: (state) => {
        return state.controller;
    },


    callCommentsModalActive: (state) => {
        return state.callCommentsModalActive;
    },


    callComments: (state) => {
        return state.callComments;
    },
    

}





// actions
const actions = {



    initController({ commit }) {
        commit('initController');
    },



    loading({ commit }, toggle) {
        commit('loading', toggle);
    },


    callCommentsModalActive({ commit }, toggle) {
        commit('callCommentsModalActive', toggle);
    },


    callComments({ commit }, comments) {
        commit('callComments', comments);
    },


    setSelectedTech({ commit }, tech) {
        commit('setSelectedTech', tech);
    },


    setSelectedBranch({ commit }, branch) {
        commit('setSelectedBranch', branch);
        localStorage.setItem('techCallsSelectedBranch', JSON.stringify(branch));
    },



    filterByOperator({ commit, state }, filterOperator) {

        var user = JSON.parse(localStorage.getItem('user'));

        if(filterOperator)
        {
            state.activeTechs.map(tech => {
                tech.filteredCalls = tech.calls.filter(call => call.operatorEmployeeCode === user.employeeCode);
                tech.filteredCalls.length <= 0 ? tech.noCallsToShow = true : tech.noCallsToShow = false;
            })
        }
        else
        {
            state.activeTechs.map(tech => {
                tech.filteredCalls = tech.calls;
                tech.noCallsToShow = false;
                tech.filterByStatus = 0;
            })
            commit('filteredTechs', state.activeTechs);
        }
    },         



    filterCallsByTech({ commit, state }, techEmployeeCode) {
        // console.log('Filtering Calls by tech: ', techEmployeeCode);
        if(!techEmployeeCode)
        {
            // console.log('Committing all active techs to display: ', state.activeTechs);
            state.activeTechs.map(tech => {
                tech.filteredCalls = tech.calls;
                tech.noCallsToShow = false;
                tech.filterByStatus = 0;
            })
            commit('filteredTechs', state.activeTechs);
            return 
        }
        
        var filteredTechs = state.activeTechs.filter(tech => tech.employeeCode === techEmployeeCode);
        // console.log('Committing filtered techs: ', filteredTechs);
        commit('filteredTechs', filteredTechs);
    },







    filterCallsByTechStatus({ commit, state }, techStatusId) {

        if(!techStatusId)
        {
            state.activeTechs.map(tech => {
                tech.filteredCalls = tech.calls;
                tech.noCallsToShow = false;
                tech.filterByStatus = 0;
            })
            return
        }



        state.activeTechs.map(tech => {

            if(techStatusId == 8)
            {
                if(tech.displayName == 'Completed Calls')
                {
                    if(tech.calls && tech.calls.length >= 1)
                    {
                        tech.filteredCalls = tech.calls.filter(call => call.techState == techStatusId);
                        tech.filteredCalls.length <= 0 ? tech.noCallsToShow = true : tech.noCallsToShow = false;
                    }
                }
                else
                {
                    tech.noCallsToShow = true;
                }
            }
            else
            {
                tech.filterByStatus = techStatusId;

                if(tech.displayName === 'Open Calls') { 
                    tech.noCallsToShow = true; 
                }

                if(tech.calls && tech.calls.length >= 1)
                {
                    tech.filteredCalls = tech.calls.filter(call => call.techState == techStatusId);
                    tech.filteredCalls.length <= 0 ? tech.noCallsToShow = true : tech.noCallsToShow = false;
                }
            }

            

            // console.log('Filtered Tech: ', tech);
        })

    },







    filterCallsByStore({ state }, searchInput) {

        if(!searchInput)
        {
            state.activeTechs.map(tech => {
                tech.filteredCalls = tech.calls;
                tech.noCallsToShow = false;
                tech.filterByStatus = 0;
            })
            return
        }



        state.activeTechs.map(tech => {
            if(tech.calls && tech.calls.length >= 1)
            {
                tech.filteredCalls = tech.calls.filter(call => {
                    if(call.customerStoreName && call.customerStoreName.toLowerCase().indexOf(searchInput.toLowerCase()) !== -1)
                        return call;
                    
                    if(call.customerStoreBranchCode && call.customerStoreBranchCode.toLowerCase().indexOf(searchInput.toLowerCase()) !== -1)
                        return call;
                })
                tech.filteredCalls.length <= 0 ? tech.noCallsToShow = true : tech.noCallsToShow = false;
            }
        })

    },






    setFilteredTechs({ commit }, filteredTechs) {
        commit('filteredTechs', filteredTechs);
    },














    async getBranchCalls({ commit, dispatch }, selectedBranchId) {
        dispatch('loading', true);

        var allTechs = JSON.parse(localStorage.getItem('employees'));
        var user = JSON.parse(localStorage.getItem('user'));
        var branchId = selectedBranchId ? selectedBranchId : user.branchId;
        var customer_stores = JSON.parse(LZString.decompress(localStorage.getItem('customer_stores')));
        

        var openCallParams = { branch_id: branchId, call_status_id: 1 };
        var allocatedCallParams = { branch_id: branchId, call_status_id: 2 };


        // Select all of Locksecure's Calls
        if(selectedBranchId == 1) 
        { 
            delete openCallParams.branch_id;
            delete allocatedCallParams.branch_id;
        }

        var getOpenCalls = dispatch('getCallsFromServer', openCallParams);
        var getAllocatedCalls = dispatch('getCallsFromServer', allocatedCallParams);


        var [openCalls, allocatedCalls] = await Promise.all([getOpenCalls, getAllocatedCalls]);


        var getCallTechs = dispatch('getCallTechnicians', allocatedCalls);
        var getCallComments = dispatch('getCallComments', allocatedCalls);
        var getOpenCallComments = dispatch('getCallComments', openCalls);
        var getCallEvents = dispatch('getCallEvents', allocatedCalls);
        await Promise.all([getCallTechs, getCallComments, getOpenCallComments, getCallEvents]);

        
        if
        ( openCalls === false || allocatedCalls === false ) { return }



        openCalls.map(call => {
            call['storeProblem'] = false;
            call['orderProblem'] = false;
            call['stockProblem'] = false;

            // Stock Required: || Awaiting Order! || Store Problem:

            call.comments.map(comment => {
                if(!comment.resolved)
                {
                    if(comment.comment.indexOf('Stock Required:') !== -1) { call.stockProblem = true }   
                    else if(comment.comment.indexOf('Awaiting Order!') !== -1) { call.orderProblem = true }
                    else if(comment.comment.indexOf('Store Problem:') !== -1) { call.storeProblem = true }
                }
            })

            call['technicians'] = [];
            var store = customer_stores.filter(store =>  store.id === call.customerStoreId)[0];
            if(store)
            {
                call.customerStore = store;
                call.customerStoreName = store.name;
                call.customerStoreBranchCode = store.branchCode;
            }
            else
            {
                call.customerStore = '';
                call.customerStoreName = '';
                call.customerStoreBranchCode = '';
            }
        })
        


        var allTechEmployeeCodes = []
        var deAllocatedCalls = [];
        var completedCalls = [];

        
        
        await Promise.all(allocatedCalls.map(call => {


            call['storeProblem'] = false;
            call['orderProblem'] = false;
            call['stockProblem'] = false;

            // Stock Required: || Awaiting Order! || Store Problem:

            call.comments.map(comment => {
                if(!comment.resolved)
                {
                    if(comment.comment.indexOf('Stock Required:') !== -1) { call.stockProblem = true }   
                    else if(comment.comment.indexOf('Awaiting Order!') !== -1) { call.orderProblem = true }
                    else if(comment.comment.indexOf('Store Problem:') !== -1) { call.storeProblem = true }
                }
            })


            if(call.technicians && call.technicians.length >= 1)
            {
                call.technicians.map(callTech => allTechEmployeeCodes.push(callTech.technicianEmployeeCode));
            }
            else
            {
                call.technicians = [];
                deAllocatedCalls.push(call);
            }

            // Assign customer store
            var store = customer_stores.filter(store =>  store.id === call.customerStoreId)[0];
            if(store)
            {
                call.customerStore = store;
                call.customerStoreName = store.name;
                call.customerStoreBranchCode = store.branchCode;
            }
            else
            {
                call.customerStore = '';
                call.customerStoreName = '';
                call.customerStoreBranchCode = '';
            }
        }))

        // console.log('All Techs before filter: ', allTechEmployeeCodes);

        var allActiveTechsEmployeeCodes = [...new Set(allTechEmployeeCodes)];;
        var allActiveTechs = [];

        // console.log('Our final Tech emp code Set: ', allActiveTechsEmployeeCodes);
        // console.log('All the freaking tech\'s we have:::::', allTechs);

        allTechs.map(technician => {
            if(allActiveTechsEmployeeCodes.includes(technician.employeeCode))
            {
                allActiveTechs.push(technician);
            }
        })



        openCalls.sort((a, b) => {
            return new Date(a.openTime) - new Date(b.openTime);
        });

        openCalls.map(call => call.technicians = []);


        var openCallFakeTech = {
            employeeCode: 'OPECAL',
            active: true,
            technician: true,
            fullName: '',
            displayName: 'Open Calls',
            branchId: branchId,
            inventoryStoreId: null,
            capacityId: null,
            lastLoginOne: null,
            lastLoginTwo: null,
            firebaseTokenDesktop: null,
            firebaseTokenMobile: null,
            calls: openCalls,
            noCallsToShow: openCalls.length >= 1 ? false : true,
            filteredCalls: openCalls
        }



        var deAllocatedCallFakeTech = {
            employeeCode: 'UNALL',
            active: true,
            technician: true,
            fullName: '',
            displayName: 'Un-Allocated Calls',
            branchId: branchId,
            inventoryStoreId: null,
            capacityId: null,
            lastLoginOne: null,
            lastLoginTwo: null,
            firebaseTokenDesktop: null,
            firebaseTokenMobile: null,
            calls: deAllocatedCalls,
            noCallsToShow: deAllocatedCalls.length >= 1 ? false : true,
            filteredCalls: deAllocatedCalls
        }



        

        // await dispatch('getCallEvents', allocatedCalls);
        // console.log('Allocated Calls: ', allocatedCalls);



        allActiveTechs.map(tech => {
            tech['calls'] = [];
            tech['pendingCalls'] = 0;
            tech['receivedCalls'] = 0;
            tech['enRouteCalls'] = 0;
            tech['reroutedCalls'] = 0;
            tech['onSiteCalls'] = 0;
            tech['onHoldCalls'] = 0;
            tech['returningCalls'] = 0;
            tech['transferredCalls'] = 0;
            tech['completedCalls'] = 0;
            tech['filterByStatus'] = 0;
            tech['completedForToday'] = 0;

            var techCalls = JSON.parse(JSON.stringify(allocatedCalls.filter(call => call.technicianEmployeeCodes.includes(tech.employeeCode))));
            if(techCalls && techCalls.length >= 1)
            {   

                techCalls.sort((a, b) => {
                    return new Date(a.openTime) - new Date(b.openTime);
                });

                tech.noCallsToShow = false;
                tech.calls = techCalls;
                tech.filteredCalls = techCalls;
                
                tech.calls.map(call => {
                    call['mainTech'] = tech.displayName;
                    call.techState = '';
                    call.latestTechUpdate = '';

                    

                    if(call.events && call.events.length >= 1)
                    {
                        var techUpdateEvents = call.events.filter(event => event.description.indexOf('Updated technician status:') !== -1 && event.employeeCode.indexOf(tech.employeeCode) !== -1);
                        call.latestTechUpdate = techUpdateEvents[0] ? techUpdateEvents[0].time : '';

                        var lastUpdate = new Date(call.latestTechUpdate);
                        var today = new Date();
                        var updateMonth = lastUpdate.getMonth();
                        var nowMonth = today.getMonth();
                        var updateDay = lastUpdate.getDate();
                        var nowDay = today.getDate();

                        if(updateMonth == nowMonth && updateDay == nowDay)
                        {
                            tech.completedForToday++; 
                        }
                    }




                    if(call.technicians && call.technicians.length >= 1)
                    {
                        call.techState = call.technicians.filter(callTech => callTech.technicianEmployeeCode == tech.employeeCode)[0].technicianCallStatusId;
                        call.techState === 1 ? tech.pendingCalls++ : null;
                        call.techState === 2 ? tech.receivedCalls++ : null;
                        call.techState === 3 ? tech.enRouteCalls++ : null;
                        call.techState === 4 ? tech.onSiteCalls++ : null;
                        call.techState === 5 ? tech.returningCalls++ : null;
                        call.techState === 6 ? tech.onHoldCalls++ : null;
                        call.techState === 7 ? tech.reroutedCalls++ : null;
                        call.techState === 9 ? tech.transferredCalls++ : null;
                        if(call.techState === 8)
                        {
                            completedCalls.push(call);
                            tech.completedCalls++;
                        }
                    }
                })
            }
        })



        var completedCallFakeTech = {
            employeeCode: 'COMPCA',
            active: true,
            technician: true,
            fullName: '',
            displayName: 'Completed Calls',
            branchId: branchId,
            inventoryStoreId: null,
            capacityId: null,
            lastLoginOne: null,
            lastLoginTwo: null,
            firebaseTokenDesktop: null,
            firebaseTokenMobile: null,
            calls: completedCalls,
            noCallsToShow: completedCalls.length >= 1 ? false : true,
            filteredCalls: completedCalls
        }

        // console.log('Completed Calls fake tech: ', completedCallFakeTech);



        allActiveTechs.unshift(deAllocatedCallFakeTech, openCallFakeTech, completedCallFakeTech);

        

        // console.log('Active Technicians for branch ', branchId,': ', allActiveTechs);
        commit('activeTechs', allActiveTechs);
        commit('branchCalls', allocatedCalls);
        commit('filteredTechs', allActiveTechs);

        dispatch('loading', false);

    },







    async initialCallProcessing({ dispatch }, calls) {
        // Get call technicians, comments & events
        var getCallTechs = dispatch('getCallTechnicians', calls);
        var getCallComments = dispatch('getCallComments', calls);
        var getCallEvents = dispatch('getCallEvents', calls);
        await Promise.all([getCallTechs, getCallComments, getCallEvents])
    },







    async getCallComments({ }, calls) {
        if(calls && calls.length >= 1)
        {
            await Promise.all(calls.map(async call => {
                call['comments'] = [];
                await axiosOffice.get('calls/comments?call_id='+call.id)
            
                .then(resp => {
                    if(resp.status == 200 && resp.data)
                    {   
                        resp.data.sort((a,b) => {
                            return b.id - a.id;
                        })
                        call.comments = resp.data
                    }
                })
                .catch(err => {
                    console.error('Axios Error: ', err);
                    console.error('Axios Error Response: ', err.response);
                })

            }))
        }
    },








    async getCallEvents({ }, calls) {
        const signal = state.eventsController ? state.eventsController.signal : '';

        if(calls && calls.length >= 1)
        {
            await Promise.all(calls.map(async call => {
                call['events'] = [];
                await axiosOffice.get('calls/'+ call.id +'/events', { signal })
            
                .then(resp => {
                    if(resp.status == 200 && resp.data)
                    {   
                        resp.data.sort((a,b) => {
                            return b.id - a.id;
                        })
                        call.events = resp.data
                    }
                })
                .catch(err => {
                    console.error('Axios Error: ', err);
                    console.error('Axios Error Response: ', err.response);
                })

            }))
        }
        

    },









    async getCallsFromServer({ state }, params) {
        const signal = state.controller ? state.controller.signal : '';

        return axiosOffice.get('calls', {
            params: params,
            signal
        })
        .then(resp => {
            // console.log(resp);
            if(resp.status == 200)
                return resp.data;
            else
                return [];
        })
        .catch(err => {
            console.error('Axios Office Error: ', err);
            console.error('Axios Office Error Response: ', err.response);
            return false;
        })
    },





    abortSearch({ state, commit, dispatch }) {
        state.controller.abort();
        state.techController.abort();
        state.eventsController.abort();
        dispatch('loading', false);
        commit('softReset');
        dispatch('initController');
    },







    async getCallTechnicians({ }, calls) {
        const signal = state.techController ? state.techController.signal : '';

        if(calls.length >= 1)
        {
            await Promise.all(calls.map(async call => {

                call['technicianEmployeeCodes'] = [];


                await axiosOffice.get('calls/techs', {
                    params: {
                        call_id: call.id,
                        status_id: call.techState
                    },
                    signal
                })
                .then(async resp => {
                    if(resp.status === 200)

                        call['technicians'] = resp.data;
                        
                        await Promise.all(resp.data.map(tech => {
                            call.technicianEmployeeCodes.push(tech.technicianEmployeeCode);
                        }));                  
                })
                .catch(err => {
                    console.error('Axios Office Error: ', err);
                    console.error('Axios Office Error Response: ', err.response);
                })
            }))
        }
        else
        {
            return [];
        }
    }

}





// mutations
const mutations = {

    initController(state) {
        state.controller = new AbortController();
        state.techController = new AbortController();
        state.eventsController = new AbortController();
    },


    loading(state, toggle) {
        state.loading = toggle;
    },


    callCommentsModalActive(state, toggle) {
        state.callCommentsModalActive = toggle;
    },


    callComments(state, comments) {
        state.callComments = comments;
    },


    branchCalls(state, calls) {
        state.branchCalls = calls;
    },



    activeTechs(state, techs) {
        state.activeTechs = techs;
    },



    filteredTechs(state, calls) {
        state.filteredTechs = calls;
    },




    setSelectedBranch(state, branch) {
        state.selectedBranch = branch;
    },


    setSelectedTech(state, tech) {
        state.selectedTech = tech;
    },



    softReset(state) {
        state.branchCalls = [];
        state.activeTechs = [];
        state.filteredTechs = [];
        // console.log('Soft Reset: ', state)
    }

}





export default {
    namespaced: true,
    state,
    getters,
    actions,
    mutations
}