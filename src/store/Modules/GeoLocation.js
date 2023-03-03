import { axiosOffice } from "../../axios/axios";

// initial state
const state = () => ({
    
    loading: false,
    stopGeoLocationService: false,
    startGeoLocationService: false,
    geoLocationUpdateTimeMinutes: 0.1,

    location: {
        lat: '',
        long: '',
        timeStamp: '',
        accuracy: '',
        speed: ''
    },




})





// getters
const getters = {
    loading: (state) => {
        return state.loading;
    },


    stopGeoLocationService: (state) => {
        return state.stopGeoLocationService;
    },

    startGeoLocationService: (state) => {
        return state.startGeoLocationService;
    },


    geoLocationUpdateTimeMinutes: (state) => {
        return state.geoLocationUpdateTimeMinutes;
    },


    location: (state) => {
        return state.location;
    }

}





// actions
const actions = {



    updateCurrentLocation({ commit, dispatch }) {

        // console.log('Updating GeoLocation...');
        navigator.geolocation.getCurrentPosition(positionData => {
            // console.log(positionData);
            if(positionData)
            {
                // dispatch('checkLocationAccuracy', positionData);
                commit('location', positionData);
            }
        })
    },







    updateServerWithLocation({ commit }, customerStoreId) {

        var user = JSON.parse(localStorage.getItem('user'));

        navigator.geolocation.getCurrentPosition(positionData => {
            if(positionData)
            {
                commit('location', positionData);

                var locationData = {
                    "recordedEmployeeCode": user.employeeCode,
                    "customerStoreId": customerStoreId,
                    "latitude": positionData.coords.latitude,
                    "longitude": positionData.coords.longitude
                }

                axiosOffice.post('customers/stores/'+ customerStoreId +'/location', locationData)
                .then(resp => {
                    console.log(resp);
                })
                .catch(err => {
                    console.error('Axios Office Error: ', err);
                    console.error('Axios Office Error Response: ', err.response);
                })
            }

        })

    },






    
    checkLocationAccuracy({ dispatch }, positionData) {
        if(positionData.coords && positionData.coords.accuracy)
        {
            if(positionData.coords.accuracy > 20)
            {
                // repeat get gps or watch for better accuracy
                dispatch('watchGPSLocation')
            }
        }
        else
        {
            // repeat get gps or watch for better accuracy
            dispatch('watchGPSLocation')
        }   
    },






    watchGPSLocation({ dispatch, commit }) {
        var retry = 0;
        var retryMax = 5;

        const options = {
            enableHighAccuracy: true,
            maximumAge: 30000,
            timeout: 27000
        };

        var watchId = navigator.geolocation.watchPosition(successCallBack, errorCallBack, options);
        

        function successCallBack(positionData) {
            retry++;
            if(retry < retryMax )
            {
                if(positionData && positionData.coords && positionData.coords.accuracy < 20)
                {
                    commit('location', positionData);
                    navigator.geolocation.clearWatch(watchId);
                }
            }
            else
            {
                commit('location', positionData);
                navigator.geolocation.clearWatch(watchId);
            }
        }


        function errorCallBack(err) {
            console.error('Geo Location Error: ', err);
        }
    },








    stopGeoLocationService({ commit }) {
        commit('stopGeoLocationService');
    },

    startGeoLocationService({ commit }) {
        commit('startGeoLocationService');
    },
    

}





// mutations
const mutations = {

    loading(state, toggle) {
        state.loading = toggle;
    },


    stopGeoLocationService(state) {
        state.stopGeoLocationService = true;
        setTimeout(() => {
            state.stopGeoLocationService = false;
        }, 500);
    },


    startGeoLocationService(state) {
        state.startGeoLocationService = true;
        setTimeout(() => {
            state.startGeoLocationService = false;
        }, 500);
    },



    location(state, positionData) {
        
        console.log('Updating position: ', positionData);
        state.location.accuracy = positionData.coords ? positionData.coords.accuracy : '';
        state.location.long = positionData.coords ? positionData.coords.longitude : '';
        state.location.lat = positionData.coords ? positionData.coords.latitude : '';
        state.location.timeStamp = positionData.timestamp ? positionData.timestamp : '';
        state.location.speed = positionData.coords ? positionData.coords.speed : '';


        var storedLocations = localStorage.getItem('location');
        console.log(JSON.parse(storedLocations));
        if(storedLocations)
        {
            storedLocations = JSON.parse(storedLocations);
            storedLocations.push({ long: state.location.long, lat: state.location.lat, accuracy: Math.round(state.location.accuracy).toFixed(2), time: new Date(state.location.timeStamp).toISOString(), speed: state.location.speed });
            localStorage.setItem('location', JSON.stringify(storedLocations));
        }
        else
        {
            console.log('creating storedLocations')
            localStorage.setItem('location', JSON.stringify([{ long: state.location.long, lat: state.location.lat, accuracy: Math.round(state.location.accuracy).toFixed(2), time: state.location.timeStamp, speed: state.location.speed }]));
        }
    }
    

}





export default {
    namespaced: true,
    state,
    getters,
    actions,
    mutations
}