// ============================================
// STORAGE MANAGEMENT - Firebase Firestore operations
// ============================================

// Load logs from Firestore for the current user
async function loadLogs() {
    try {
        const user = auth.currentUser;
        if (!user) {
            APP_STATE.allLogs = [];
            return;
        }

        const logsRef = db.collection('carbonLogs')
            .where('uid', '==', user.uid);
        
        const snapshot = await logsRef.get();
        APP_STATE.allLogs = [];
        
        snapshot.forEach(doc => {
            const logData = doc.data();
            APP_STATE.allLogs.push({
                id: doc.id,
                ...logData
            });
        });
        
        // Sort by timestamp descending (newest first)
        APP_STATE.allLogs.sort((a, b) => b.timestamp - a.timestamp);
        
    } catch(error) {
        console.error('Error loading logs:', error);
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

        const docRef = await db.collection('carbonLogs').add(logWithUid);
        return docRef.id;
    } catch(error) {
        console.error('Error saving log:', error);
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