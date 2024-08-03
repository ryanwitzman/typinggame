const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcrypt');

const db = new sqlite3.Database('./database.sqlite', (err) => {
    if (err) {
        console.error(err.message);
    }
    console.log('Connected to the SQLite database.');
});

db.run(`CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE,
    password TEXT,
    displayName TEXT,
    lastDisplayNameChange TEXT
)`);

db.run(`CREATE TABLE IF NOT EXISTS leaderboard (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    userId INTEGER,
    category TEXT,
    value INTEGER,
    dateAchieved TEXT,
    FOREIGN KEY(userId) REFERENCES users(id)
)`);

module.exports = {
    createUser: (username, password) => {
        return new Promise((resolve, reject) => {
            bcrypt.hash(password, 10, (err, hash) => {
                if (err) reject(err);
                db.run('INSERT INTO users (username, password, displayName) VALUES (?, ?, ?)', [username, hash, username], (err) => {
                    if (err) reject(err);
                    resolve();
                });
            });
        });
    },
    
    getUser: (username) => {
        return new Promise((resolve, reject) => {
            db.get('SELECT * FROM users WHERE username = ?', [username], (err, row) => {
                if (err) reject(err);
                resolve(row);
            });
        });
    },
    
    updateDisplayName: (userId, newDisplayName) => {
        return new Promise((resolve, reject) => {
            db.run('UPDATE users SET displayName = ?, lastDisplayNameChange = ? WHERE id = ?', [newDisplayName, new Date().toISOString(), userId], (err) => {
                if (err) reject(err);
                resolve();
            });
        });
    },
    
    updateLeaderboard: (userId, category, value) => {
        return new Promise((resolve, reject) => {
            db.run('INSERT OR REPLACE INTO leaderboard (userId, category, value, dateAchieved) VALUES (?, ?, ?, ?)', 
                [userId, category, value, new Date().toISOString()], (err) => {
                if (err) reject(err);
                resolve();
            });
        });
    },
    
    getLeaderboard: (category) => {
        return new Promise((resolve, reject) => {
            db.all(`SELECT u.username, u.displayName, l.value, l.dateAchieved 
                    FROM leaderboard l 
                    JOIN users u ON l.userId = u.id 
                    WHERE l.category = ? 
                    ORDER BY l.value DESC 
                    LIMIT 10`, [category], (err, rows) => {
                if (err) reject(err);
                resolve(rows);
            });
        });
    }
};
