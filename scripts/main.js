
function setupEventListeners() {
    getEl("searchBtn").addEventListener("click", searchActivities);
    getEl("searchInput").addEventListener("keydown", (e) => {
        if (e.key === "Enter") searchActivities();
    });
    getEl("calcBtn").addEventListener("click", calculateAndLog);
    getEl("clearBtn").addEventListener("click", () => {
        APP_STATE.selectedActivity = null;
        getEl("selectedCard").classList.add("hidden");
        getEl("noSelection").style.display = "";
        getEl("result").innerHTML = "";
    });
    getEl("clearAllBtn").addEventListener("click", () => {
        if (confirm("Clear all logs? This cannot be undone.")) {
            APP_STATE.allLogs = [];
            saveLogs();
            renderHistory();
            updateChart();
        }
    });
    getEl("filterInput").addEventListener("input", filterHistory);
    getEl("viewDaily").addEventListener("click", () => {
        APP_STATE.chartView = 'daily';
        getEl("viewDaily").className = "btn bg-blue-600 hover:bg-blue-700 text-sm active";
        getEl("viewWeekly").className = "btn bg-gray-700 hover:bg-gray-600 text-sm";
        updateChart();
    });
    getEl("viewWeekly").addEventListener("click", () => {
        APP_STATE.chartView = 'weekly';
        getEl("viewWeekly").className = "btn bg-blue-600 hover:bg-blue-700 text-sm active";
        getEl("viewDaily").className = "btn bg-gray-700 hover:bg-gray-600 text-sm";
        updateChart();
    });
    getEl("historyList").addEventListener("click", (e) => {
        if (e.target.classList.contains("deleteBtn")) {
            APP_STATE.allLogs.splice(parseInt(e.target.getAttribute("data-index")), 1);
            saveLogs();
            renderHistory();
            updateChart();
        }
    });
}

function initApp() {
    loadLogs();
    renderHistory();
    updateChart();
    updateStatistics();
    setupEventListeners();
}


document.addEventListener('DOMContentLoaded', initApp);