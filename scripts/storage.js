// ============================================
// STORAGE MANAGEMENT - Firebase Firestore operations
// ============================================

// Real-time listener unsubscribe function
let logsUnsubscribe = null;

// Load logs from Firestore for the current user
async function loadLogs() {
    try {
        const user = auth.currentUser;
        if (!user) {
            console.log('No user logged in, clearing logs');
            APP_STATE.allLogs = [];
            // Unsubscribe from previous listener if exists
            if (logsUnsubscribe) {
                logsUnsubscribe();
                logsUnsubscribe = null;
            }
            return;
        }

        console.log('Loading logs for user:', user.uid);
        
        // Unsubscribe from previous listener if exists
        if (logsUnsubscribe) {
            logsUnsubscribe();
        }
        
        const logsRef = db.collection('carbonLogs')
            .where('uid', '==', user.uid);
        
        // Set up real-time listener
        logsUnsubscribe = logsRef.onSnapshot((snapshot) => {
            APP_STATE.allLogs = [];
            
            snapshot.forEach(doc => {
                const logData = doc.data();
                // Ensure timestamp is a number (handle Firestore Timestamp if needed)
                let timestamp = logData.timestamp;
                if (timestamp && timestamp.toMillis) {
                    timestamp = timestamp.toMillis();
                } else if (timestamp && timestamp.seconds) {
                    timestamp = timestamp.seconds * 1000;
                }
                
                APP_STATE.allLogs.push({
                    id: doc.id,
                    ...logData,
                    timestamp: timestamp || Date.now()
                });
            });
            
            // Sort by timestamp descending (newest first)
            APP_STATE.allLogs.sort((a, b) => b.timestamp - a.timestamp);
            
            console.log(`Loaded ${APP_STATE.allLogs.length} logs from Firestore`);
            
            // Update UI when data changes
            renderHistory();
            updateChart();
            updateStatistics();
        }, (error) => {
            console.error('Error in real-time listener:', error);
        });
        
    } catch(error) {
        console.error('Error loading logs:', error);
        console.error('Error code:', error.code);
        console.error('Error message:', error.message);
        APP_STATE.allLogs = [];
    }
}

// Save a single log to Firestore
async function saveLog(logData) {
    try {
        const user = auth.currentUser;
        if (!user) {
            console.error('No user logged in');
            return null;
        }

        const logWithUid = {
            ...logData,
            uid: user.uid,
            createdAt: firebase.firestore.FieldValue.serverTimestamp()
        };

        console.log('Saving log to Firestore:', logWithUid);
        const docRef = await db.collection('carbonLogs').add(logWithUid);
        console.log('Log saved successfully with ID:', docRef.id);
        return docRef.id;
    } catch(error) {
        console.error('Error saving log:', error);
        console.error('Error code:', error.code);
        console.error('Error message:', error.message);
        throw error;
    }
}

// Save all logs (legacy function - now just updates statistics)
async function saveLogs() {
    updateStatistics();
}

// Delete a log from Firestore
async function deleteLog(logId) {
    try {
        const user = auth.currentUser;
        if (!user) {
            console.error('No user logged in');
            return false;
        }

        // Verify the log belongs to the current user
        const logDoc = await db.collection('carbonLogs').doc(logId).get();
        if (!logDoc.exists || logDoc.data().uid !== user.uid) {
            console.error('Log not found or access denied');
            return false;
        }

        await db.collection('carbonLogs').doc(logId).delete();
        return true;
    } catch(error) {
        console.error('Error deleting log:', error);
        return false;
    }
}

// Delete all logs for the current user
async function deleteAllLogs() {
    try {
        const user = auth.currentUser;
        if (!user) {
            console.error('No user logged in');
            return false;
        }

        const logsRef = db.collection('carbonLogs')
            .where('uid', '==', user.uid);
        
        const snapshot = await logsRef.get();
        const batch = db.batch();
        
        snapshot.forEach(doc => {
            batch.delete(doc.ref);
        });
        
        await batch.commit();
        return true;
    } catch(error) {
        console.error('Error deleting all logs:', error);
        return false;
    }
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