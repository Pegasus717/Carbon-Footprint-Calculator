// ============================================
// CONFIGURATION - All settings in one place
// ============================================

const CONFIG = {
    API_URL: "https://api.climatiq.io",
    API_KEY: "CMK052XB255JQFPT74APYX6NVM",
    DATA_VERSION: "^27"
};

// Global state
const APP_STATE = {
    selectedActivity: null,
    allLogs: [],
    chartView: 'daily',
    myChart: null,
    currentFilter: ""
};

// Helper functions
function getEl(id) {
    return document.getElementById(id);
}

function formatNum(num) {
    return parseFloat(num).toFixed(2);
}