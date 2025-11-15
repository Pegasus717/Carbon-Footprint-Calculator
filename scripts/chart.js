// ============================================
// CHART MANAGEMENT - Chart.js operations
// ============================================

function updateChart() {
    const canvas = getEl("chartCanvas");
    const ctx = canvas.getContext("2d");

    if (!APP_STATE.myChart) {
        APP_STATE.myChart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: [],
                datasets: [{
                    label: 'CO₂ Emissions (kg)',
                    data: [],
                    borderColor: 'rgb(37, 99, 235)',
                    backgroundColor: 'rgba(37, 99, 235, 0.1)',
                    tension: 0.4,
                    fill: true,
                    pointRadius: 4,
                    pointHoverRadius: 6
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { display: false },
                    tooltip: {
                        backgroundColor: 'rgba(0, 0, 0, 0.8)',
                        titleColor: '#fff',
                        bodyColor: '#fff',
                        borderColor: 'rgba(255, 255, 255, 0.2)',
                        borderWidth: 1
                    }
                },
                scales: {
                    x: { 
                        ticks: { color: '#ccc' }, 
                        grid: { color: 'rgba(255, 255, 255, 0.1)' } 
                    },
                    y: { 
                        ticks: { color: '#ccc' }, 
                        grid: { color: 'rgba(255, 255, 255, 0.1)' }, 
                        beginAtZero: true 
                    }
                }
            }
        });
    }

    if (APP_STATE.allLogs.length === 0) {
        APP_STATE.myChart.data.labels = [];
        APP_STATE.myChart.data.datasets[0].data = [];
        APP_STATE.myChart.update();
        return;
    }

    let labels = [];
    let data = [];

    if (APP_STATE.chartView === 'weekly') {
        const weeklyData = {};
        
        for (let i = 0; i < APP_STATE.allLogs.length; i++) {
            const log = APP_STATE.allLogs[i];
            const logDate = new Date(log.timestamp);
            const weekStart = new Date(logDate);
            
            const dayOfWeek = logDate.getDay();
            const daysToMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
            weekStart.setDate(logDate.getDate() - daysToMonday);
            weekStart.setHours(0, 0, 0, 0);
            
            const weekKey = weekStart.toLocaleDateString();
            
            if (!weeklyData[weekKey]) {
                weeklyData[weekKey] = 0;
            }
            weeklyData[weekKey] += log.co2e;
        }

        const weekKeys = Object.keys(weeklyData).sort();
        labels = weekKeys.slice(-30);
        data = labels.map(function(key) {
            return weeklyData[key];
        });
    } else {
        const last30 = APP_STATE.allLogs.slice(-30);
        labels = last30.map(function(log) {
            return new Date(log.timestamp).toLocaleDateString();
        });
        data = last30.map(function(log) {
            return log.co2e;
        });
    }

    APP_STATE.myChart.data.labels = labels;
    APP_STATE.myChart.data.datasets[0].data = data;
    APP_STATE.myChart.update();
}