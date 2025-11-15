// ============================================
// UI MANAGEMENT - DOM manipulation
// ============================================

function selectActivity(id, name, region, source, unit) {
    APP_STATE.selectedActivity = { name, activity_id: id, region, source, unit_type: unit };
    showActivityDetails();
}

function showActivityDetails() {
    if (!APP_STATE.selectedActivity) return;

    getEl("selectedCard").classList.remove("hidden");
    getEl("noSelection").style.display = "none";
    getEl("activityName").textContent = APP_STATE.selectedActivity.name;
    getEl("unitType").textContent = APP_STATE.selectedActivity.unit_type;
    
    const infoDiv = getEl("activityInfo");
    infoDiv.innerHTML = "";
    if (APP_STATE.selectedActivity.region) {
        infoDiv.innerHTML += `<div>📍 Region: <span class="text-yellow-400">${APP_STATE.selectedActivity.region}</span></div>`;
    }
    if (APP_STATE.selectedActivity.source) {
        infoDiv.innerHTML += `<div>📚 Source: <span class="text-yellow-400">${APP_STATE.selectedActivity.source}</span></div>`;
    }

    const paramInputs = getEl("paramInputs");
    const unit = APP_STATE.selectedActivity.unit_type.toLowerCase();
    let inputHTML = "";
    
    if (unit.includes("energy") || unit.includes("kwh") || unit.includes("electric")) {
        inputHTML = `<label class="block text-sm font-semibold mb-2">⚡ Energy Consumption</label><input id="valueInput" class="input w-full" type="number" step="any" placeholder="Enter energy in kWh"><p class="text-xs text-gray-400 mt-1">Unit: kWh</p>`;
        APP_STATE.selectedActivity.paramName = "energy";
        APP_STATE.selectedActivity.paramUnit = "kWh";
    } else if (unit.includes("weight") || unit.includes("kg") || unit.includes("mass")) {
        inputHTML = `<label class="block text-sm font-semibold mb-2">⚖️ Weight</label><input id="valueInput" class="input w-full" type="number" step="any" placeholder="Enter weight in kg"><p class="text-xs text-gray-400 mt-1">Unit: kg</p>`;
        APP_STATE.selectedActivity.paramName = "weight";
        APP_STATE.selectedActivity.paramUnit = "kg";
    } else if (unit.includes("distance") || unit.includes("km") || unit.includes("mile")) {
        inputHTML = `<label class="block text-sm font-semibold mb-2">🚗 Distance</label><input id="valueInput" class="input w-full" type="number" step="any" placeholder="Enter distance in km"><p class="text-xs text-gray-400 mt-1">Unit: km</p>`;
        APP_STATE.selectedActivity.paramName = "distance";
        APP_STATE.selectedActivity.paramUnit = "km";
    } else {
        inputHTML = `<label class="block text-sm font-semibold mb-2">📊 Value</label><input id="valueInput" class="input w-full" type="number" step="any" placeholder="Enter value"><p class="text-xs text-gray-400 mt-1">Unit: ${APP_STATE.selectedActivity.unit_type}</p>`;
        APP_STATE.selectedActivity.paramName = "amount";
        APP_STATE.selectedActivity.paramUnit = APP_STATE.selectedActivity.unit_type;
    }
    paramInputs.innerHTML = inputHTML;
}

function renderHistory() {
    const historyList = getEl("historyList");
    historyList.innerHTML = "";

    if (APP_STATE.allLogs.length === 0) {
        historyList.innerHTML = "<p class='text-gray-400 text-center py-8'>📭 No logs yet. Start tracking your emissions!</p>";
        return;
    }

    let logsToShow = APP_STATE.allLogs;
    if (APP_STATE.currentFilter) {
        const filterLower = APP_STATE.currentFilter.toLowerCase();
        logsToShow = APP_STATE.allLogs.filter(function(log) {
            return log.activity_name.toLowerCase().includes(filterLower);
        });
    }

    const reversedLogs = [...logsToShow].reverse();
    
    for (let i = 0; i < reversedLogs.length; i++) {
        const log = reversedLogs[i];
        const logDate = new Date(log.timestamp);
        const dateString = logDate.toLocaleDateString() + " " + logDate.toLocaleTimeString();
        const logId = log.id || log.timestamp; // Use ID if available, fallback to timestamp
        
        const logItem = document.createElement("div");
        logItem.className = "p-4 bg-black/30 rounded-lg border border-white/10 hover:bg-black/50 transition-all";
        logItem.innerHTML = `
            <div class="flex justify-between items-start">
                <div class="flex-1">
                <div class="font-semibold text-lg mb-1">${log.activity_name}</div>
                <div class="text-xs text-gray-400 mb-2">${dateString}</div>
                <div class="text-sm text-gray-300 mb-2">
                    Input: <span class="text-yellow-400">${log.input_value} ${log.input_unit}</span>
                </div>
                <div class="inline-flex items-center gap-2 bg-emerald-900/20 px-3 py-2 rounded-lg border border-emerald-500/30">
                    <span class="text-xl">🌍</span>
                    <span class="text-emerald-400 font-bold text-lg">${formatNum(log.co2e)} ${log.co2e_unit}</span>
                </div>
                </div>
                <button class="deleteBtn text-red-400 hover:text-red-300 text-2xl font-bold ml-3 px-2" data-log-id="${logId}">×</button>
            </div>
        `;

        historyList.appendChild(logItem);
    }
}

function filterHistory() {
    APP_STATE.currentFilter = getEl("filterInput").value.trim();
    renderHistory();
}