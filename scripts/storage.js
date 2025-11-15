// ============================================
// STORAGE MANAGEMENT - Local storage operations
// ============================================

function loadLogs() {
    try {
        const saved = localStorage.getItem(CONFIG.STORAGE_KEY);
        APP_STATE.allLogs = saved ? JSON.parse(saved) : [];
    } catch(e) {
        APP_STATE.allLogs = [];
    }
}

function saveLogs() {
    localStorage.setItem(CONFIG.STORAGE_KEY, JSON.stringify(APP_STATE.allLogs));
    updateStatistics();
}

function updateStatistics() {
    let totalCO2 = 0;
    for (let i = 0; i < APP_STATE.allLogs.length; i++) {
        totalCO2 += APP_STATE.allLogs[i].co2e;
    }
    
    let averageCO2 = APP_STATE.allLogs.length > 0 ? totalCO2 / APP_STATE.allLogs.length : 0;
    
    let weekCO2 = 0;
    const today = new Date();
    const weekStart = new Date(today);
    weekStart.setDate(today.getDate() - today.getDay());
    weekStart.setHours(0, 0, 0, 0);
    
    for (let i = 0; i < APP_STATE.allLogs.length; i++) {
        const logDate = new Date(APP_STATE.allLogs[i].timestamp);
        if (logDate >= weekStart) {
            weekCO2 += APP_STATE.allLogs[i].co2e;
        }
    }
    
    getEl("totalEmissions").textContent = formatNum(totalCO2) + " kg";
    getEl("totalEntries").textContent = APP_STATE.allLogs.length;
    getEl("avgEmissions").textContent = formatNum(averageCO2) + " kg";
    getEl("weekEmissions").textContent = formatNum(weekCO2) + " kg";
}