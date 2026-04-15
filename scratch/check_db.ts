import Database from 'better-sqlite3';

const db = new Database('mambusao_drrm.db');

console.log('--- Current Equipment Conditions ---');
const equipment = db.prepare('SELECT id, name, condition FROM equipment').all();
console.table(equipment);

console.log('--- Current Log Statuses ---');
const logs = db.prepare('SELECT id, borrowerName, status FROM logs').all();
console.table(logs);
