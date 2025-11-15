// ============================================
// MAIN APPLICATION - Event listeners & initialization
// ============================================

// Event listeners
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
    getEl("clearAllBtn").addEventListener("click", async () => {
        if (confirm("Clear all logs? This cannot be undone.")) {
            const success = await deleteAllLogs();
            if (success) {
                APP_STATE.allLogs = [];
                saveLogs();
                renderHistory();
                updateChart();
            } else {
                alert("Error deleting logs. Please try again.");
            }
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
    getEl("historyList").addEventListener("click", async (e) => {
        if (e.target.classList.contains("deleteBtn")) {
            const logId = e.target.getAttribute("data-log-id");
            if (logId) {
                const success = await deleteLog(logId);
                if (success) {
                    // Remove from local array
                    APP_STATE.allLogs = APP_STATE.allLogs.filter(log => log.id !== logId);
                    saveLogs();
                    renderHistory();
                    updateChart();
                } else {
                    alert("Error deleting log. Please try again.");
                }
            }
        }
    });
}

// Initialize application
async function initApp() {
    // Wait for auth to be ready
    if (!authReady) {
        // Wait for auth state to be determined
        await new Promise((resolve) => {
            const unsubscribe = auth.onAuthStateChanged((user) => {
                unsubscribe();
                resolve();
            });
        });
    }
    
    // Only proceed if user is authenticated
    if (auth.currentUser) {
        await loadLogs();
        renderHistory();
        updateChart();
        updateStatistics();
        setupEventListeners();
    }
}

// Start the app when DOM is loaded (but auth-guard will handle initialization)
document.addEventListener('DOMContentLoaded', () => {
    // Setup event listeners immediately
    setupEventListeners();
    
    // If auth is ready and user is logged in, load data
    if (typeof authReady !== 'undefined' && authReady && auth.currentUser) {
        initApp();
    }
});