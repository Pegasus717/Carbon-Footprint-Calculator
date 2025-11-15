// ============================================
// API INTEGRATION - Climatiq API calls
// ============================================

async function searchActivities() {
    const resultsDiv = getEl("searchResults");
    const query = getEl("searchInput").value.trim();
    
    resultsDiv.innerHTML = "";
    if (!query) {
        resultsDiv.innerHTML = "<p class='text-gray-400 text-center py-6'>Please enter a search term</p>";
        return;
    }

    resultsDiv.innerHTML = "<p class='text-gray-400 text-center py-6 pulse'>🔍 Searching...</p>";

    try {
        const response = await fetch(`${CONFIG.API_URL}/data/v1/search?query=${encodeURIComponent(query)}&data_version=${CONFIG.DATA_VERSION}&results_per_page=20`, {
            headers: { "Authorization": `Bearer ${CONFIG.API_KEY}` }
        });
        const data = await response.json();

        if (!response.ok) {
            resultsDiv.innerHTML = `<p class='text-red-400 text-center py-4'>❌ Error: ${data.message || "Search failed"}</p>`;
            return;
        }

        const results = data.results || data;
        if (!results || results.length === 0) {
            resultsDiv.innerHTML = "<p class='text-gray-400 text-center py-6'>No results found.</p>";
            return;
        }

        resultsDiv.innerHTML = "";
        for (let i = 0; i < Math.min(results.length, 20); i++) {
            const r = results[i];
            const name = r.name || r.activity_name || "Unknown";
            const id = r.activity_id || r.id || "";
            const region = r.region || "";
            const source = r.source || "";
            const unit = r.unit_type || r.unit || "unknown";

            const item = document.createElement("div");
            item.className = "p-4 bg-black/30 rounded-lg cursor-pointer hover:bg-black/50 border border-white/10 transition-all mb-2";
            item.innerHTML = `
                <div class="font-semibold text-lg mb-2">${name}</div>
                <div class="flex flex-wrap gap-2 text-xs">
                ${region ? `<span class="badge">📍 ${region}</span>` : ""}
                ${source ? `<span class="badge">📚 ${source}</span>` : ""}
                <span class="badge">⚖️ ${unit}</span>
                </div>
            `;
            item.addEventListener("click", () => selectActivity(id, name, region, source, unit));
            resultsDiv.appendChild(item);
        }
    } catch(error) {
        resultsDiv.innerHTML = "<p class='text-red-400 text-center py-4'>❌ Network error.</p>";
    }
}

async function calculateAndLog() {
    const resultDiv = getEl("result");
    resultDiv.innerHTML = "";

    if (!APP_STATE.selectedActivity || !APP_STATE.selectedActivity.activity_id) {
        resultDiv.innerHTML = "<p class='text-red-400 p-3 bg-red-900/30 rounded'>❌ Please select an activity first</p>";
        return;
    }

    const valueInput = getEl("valueInput");
    const inputValue = parseFloat(valueInput.value);

    if (!inputValue || isNaN(inputValue) || inputValue <= 0) {
        resultDiv.innerHTML = "<p class='text-red-400 p-3 bg-red-900/30 rounded'>❌ Please enter a valid positive number</p>";
        return;
    }

    resultDiv.innerHTML = "<p class='text-blue-400 p-3 bg-blue-900/30 rounded pulse'>⏳ Calculating emissions...</p>";

    try {
        const paramName = APP_STATE.selectedActivity.paramName || "amount";
        const paramUnit = APP_STATE.selectedActivity.paramUnit || APP_STATE.selectedActivity.unit_type;
        
        let parameters = {};
        
        if (paramName === "energy") {
            parameters = { energy: inputValue, energy_unit: paramUnit };
        } else if (paramName === "weight") {
            parameters = { weight: inputValue, weight_unit: paramUnit };
        } else if (paramName === "distance") {
            parameters = { distance: inputValue, distance_unit: paramUnit };
        } else {
            parameters = { amount: inputValue, amount_unit: paramUnit };
        }

        const response = await fetch(`${CONFIG.API_URL}/data/v1/estimate`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${CONFIG.API_KEY}`
            },
            body: JSON.stringify({
                emission_factor: {
                    activity_id: APP_STATE.selectedActivity.activity_id,
                    data_version: CONFIG.DATA_VERSION
                },
                parameters: parameters
            })
        });

        const responseData = await response.json();

        if (!response.ok) {
            let errorMessage = responseData.message || "Calculation failed";
            if (responseData.error === "unit_mismatch" && responseData.valid_unit_types) {
                errorMessage += `. Valid units: ${responseData.valid_unit_types.join(', ')}`;
            }
            resultDiv.innerHTML = `<p class='text-red-400 p-3 bg-red-900/30 rounded'>❌ Error: ${errorMessage}</p>`;
            return;
        }

        const co2e = responseData.co2e;
        const co2eUnit = responseData.co2e_unit || "kg";
        const emissionFactor = responseData.emission_factor || {};
        const emissionsPerUnit = (co2e / inputValue).toFixed(2);

        resultDiv.innerHTML = `
            <div class="bg-emerald-900/20 p-4 rounded-lg mt-3 border border-emerald-500/30">
                <div class="flex items-center gap-2 mb-2">
                <span class="text-2xl">✅</span>
                <span class="font-bold text-lg">Calculation Complete</span>
                </div>
                <div class="bg-black/30 p-3 rounded mt-2">
                <div class="text-3xl font-bold text-emerald-400 mb-1">${formatNum(co2e)} ${co2eUnit}</div>
                <div class="text-xs text-gray-300 mt-1">${inputValue} ${APP_STATE.selectedActivity.paramUnit || APP_STATE.selectedActivity.unit_type} = ${formatNum(co2e)} ${co2eUnit} CO₂e</div>
                <div class="text-xs text-gray-400 mt-1">(~${emissionsPerUnit} ${co2eUnit} per ${APP_STATE.selectedActivity.paramUnit || APP_STATE.selectedActivity.unit_type})</div>
                </div>
                ${emissionFactor.name ? `<div class="text-xs text-gray-400 mt-2">Source: ${emissionFactor.name}</div>` : ""}
            </div>
        `;

        const newLog = {
            timestamp: Date.now(),
            activity_name: APP_STATE.selectedActivity.name,
            activity_id: APP_STATE.selectedActivity.activity_id,
            input_value: inputValue,
            input_unit: APP_STATE.selectedActivity.paramUnit || APP_STATE.selectedActivity.unit_type,
            co2e: co2e,
            co2e_unit: co2eUnit
        };
        
        APP_STATE.allLogs.push(newLog);
        saveLogs();
        renderHistory();
        updateChart();
        
        valueInput.value = "";

    } catch(error) {
        console.error("Calculation error:", error);
        resultDiv.innerHTML = "<p class='text-red-400 p-3 bg-red-900/30 rounded'>❌ Network error. Please try again.</p>";
    }
}