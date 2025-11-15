
const CONFIG = {
    API_URL: "https://api.climatiq.io",
    API_KEY: "CMK052XB255JQFPT74APYX6NVM",
    DATA_VERSION: "^27",
    STORAGE_KEY: "carbon_logs_v3"
};


const APP_STATE = {
    selectedActivity: null,
    allLogs: [],
    chartView: 'daily',
    myChart: null,
    currentFilter: ""
};

function getEl(id) {
    return document.getElementById(id);
}

function formatNum(num) {
    return parseFloat(num).toFixed(2);
}