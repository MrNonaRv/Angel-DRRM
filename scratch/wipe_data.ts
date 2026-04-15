import Database from 'better-sqlite3';

try {
    const db = new Database('mambusao_drrm.db');
    
    // Clear inventory tables but keep the profile (admin)
    db.prepare('DELETE FROM equipment').run();
    db.prepare('DELETE FROM medicines').run();
    db.prepare('DELETE FROM kits').run();
    db.prepare('DELETE FROM logs').run();
    
    console.log('Successfully cleared all inventory and log data. System is now fresh.');
    db.close();
} catch (error) {
    if (error.code === 'BUSY') {
        console.error('Database is busy (locked). Please close the running application and try again.');
    } else {
        console.error('Error wiping data:', error.message);
    }
}
