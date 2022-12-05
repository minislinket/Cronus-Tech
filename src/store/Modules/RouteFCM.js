// initial state
const state = () => ({

    callUrlMap: [
        {
            name: 'Call Allocated:',
            url: '/call'
        },
        {
            name: 'Allocation Cancelled:',
            url: '/calls'
        },
        {
            name: 'Call Updated:',
            url: '/call'
        },
    ]

})





// getters
const getters = {
    
}





// actions
const actions = {


    async getRoute({ state, dispatch }, payload) {

        console.log(payload);

        var route = '/dashboard';
        
        await Promise.all(state.callUrlMap.map(async item => {
            if(payload.title.indexOf(item.name) !== -1)
            {

                switch(item.name) 
                {

                    case 'Call Allocated:': 
                        // await dispatch('Calls/refreshTechnicianCalls', false, { root: true });
                        dispatch('Calls/showActiveCalls', false , { root: true });
                        // console.log('Going to find call...');
                        
                        if(payload.data.callId)
                        {
                            await dispatch('Call/loadCall', payload.data.callId, { root: true });
                            route = item.url + '/' + payload.data.callId; 
                        }
                        break

                    case 'Allocation Cancelled:':
                        // console.log('The call allocation has been cancelled, refreshing technician calls and removing localstorage calls')
                        
                        // await dispatch('Calls/refreshTechnicianCalls', false, { root: true });
                        route = item.url;
                        break

                    case 'Call Updated:':
                        if(payload.data.callId)
                        {

                            // await dispatch('Calls/refreshTechnicianCalls', false, { root: true });
                            await dispatch('Call/loadCall', payload.data.callId, { root: true });
                            route = item.url + '/' + payload.data.callId; 
                        }
                        break
                }

                
                
            }
        })) 
        return route;

    },



}





// mutations
const mutations = {

}





export default {
    namespaced: true,
    state,
    getters,
    actions,
    mutations
}