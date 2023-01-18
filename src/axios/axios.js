import axios from 'axios'
import store from '../store';


const axiosOffice = axios.create();
const axiosMySQL = axios.create();
// const axiosOldDB = axios.create();

var online = true;
window.onoffline = () => {
    online = false;
}

window.ononline = () => {
    online = true;
}


var user = localStorage.getItem('user');
user ? user = JSON.parse(user) : user = 'N/A';





axiosOffice.interceptors.response.use((response) => response, (error) => {
    // console.log('⛔ GLOBAL error catch: ', error);
    if(error.code != 'ERR_CANCELED')
    {    
        var saveError = JSON.parse(JSON.stringify(error));
        logError(saveError);
    }

    throw error;
});




function logError(error) {
    // console.log('Logging error: ', err, online);
    if(!online) { 
        backupLogInLocal(error);
        return
    }


    if(user) { error.user = user }

    axiosMySQL.post('/errorLog/errorLog.php', error)

}




function backupLogInLocal(err) {

    var backupLog = localStorage.getItem('backup_error_log');
    if(backupLog)
    {
        backupLog = JSON.parse(backupLog);
        
        if(user) { err.user = user }
        backupLog.push(err);
        localStorage.setItem('backup_error_log', JSON.stringify(backupLog));
    }
    else
    {
        backupLog = [];

        if(user) { err.user = user }
        backupLog.push(err);
        localStorage.setItem('backup_error_log', JSON.stringify(backupLog));
    }
    
}




// Set environment variables according to mode 
if (process.env.NODE_ENV === 'production') 
{
    console.log('Production Mode');

    var baseURLOffice = '';
    var baseURLMySQL = '';

    if(window.location.hostname === 'localhost')
    {
        baseURLOffice = 'http://129.232.180.146/cronus/api/';
        baseURLMySQL = 'http://localhost/cronus-tech/src/api/';
    }
    else
    {
        baseURLOffice = 'https://office.locksecure.co.za/cronus/api/';
        baseURLMySQL = 'https://dev.locksecure.co.za/tech-api/';
    }


    axiosOffice.defaults.baseURL = baseURLOffice;
    axiosMySQL.defaults.baseURL = baseURLMySQL;
      

}


else if (process.env.NODE_ENV === 'development')
{
    // console.log('Dev Mode');

    // axiosOffice.defaults.baseURL = 'http://129.232.180.146/cronus/api/';
    // axiosMySQL.defaults.baseURL = 'http://localhost/cronusv2.1/src/api/';
    // axiosOldDB.defaults.baseURL = 'http://localhost/cronusv2.1/src/api2/';
}

    

export {
    axiosOffice,
    axiosMySQL,
    // axiosOldDB
}


