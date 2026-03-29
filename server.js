const express = require('express');
const app = express();
const http = require('http').createServer(app);
const io = require('socket.io')(http);
const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');
const sharp = require('sharp');

const db = new sqlite3.Database('chat.db');

// Инициализация базы данных
db.serialize(() => {
    db.run("CREATE TABLE IF NOT EXISTS users (id INTEGER PRIMARY KEY AUTOINCREMENT, username TEXT UNIQUE NOT NULL, description TEXT DEFAULT '', avatar_filename TEXT DEFAULT NULL, created_at DATETIME DEFAULT CURRENT_TIMESTAMP)");
    db.run("CREATE TABLE IF NOT EXISTS friends (id INTEGER PRIMARY KEY AUTOINCREMENT, user_id INTEGER NOT NULL, friend_id INTEGER NOT NULL, status TEXT NOT NULL DEFAULT 'pending', FOREIGN KEY (user_id) REFERENCES users (id), FOREIGN KEY (friend_id) REFERENCES users (id))");
    db.run("CREATE TABLE IF NOT EXISTS messages (id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT, text TEXT, recipient_id INTEGER DEFAULT NULL, timestamp DATETIME DEFAULT CURRENT_TIMESTAMP)");
});

// Middleware
app.use(express.json({ limit: '5mb' }));
app.use(express.static(path.join(__dirname)));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Маршрут для загрузки аватара
app.post('/upload-avatar', async (req, res) => {
    if (!req.body.username || !req.body.imageData) return res.status(400).json({ error: 'No data' });
    try {
        const base64Data = req.body.imageData.replace(/^data:image\/\w+;base64,/, '');
        const imageBuffer = Buffer.from(base64Data, 'base64');
        const filename = `avatar_${req.body.username}_${Date.now()}.webp`;
        const outputPath = path.join(__dirname, 'uploads', 'avatars', filename);

        await sharp(imageBuffer).resize(500, 500, { fit: sharp.fit.inside, withoutEnlargement: true }).webp({ quality: 80 }).toFile(outputPath);

        db.run('INSERT OR REPLACE INTO users (username, avatar_filename) VALUES (?, ?)', [req.body.username, filename], (err) => {
            if (err) return res.status(500).json({ error: 'DB error' });
            res.json({ success: true, avatarUrl: `/uploads/avatars/${filename}` });
        });
    } catch (error) { res.status(500).json({ error: 'Processing failed' }); }
});

app.post('/update-profile', (req, res) => {
    const { username, description } = req.body;
    db.run('UPDATE users SET description = ? WHERE username = ?', [description, username], (err) => {
        if (err) return res.status(500).json({ error: 'DB error' });
        res.json({ success: true });
    });
});

// Логика сокетов
io.on('connection', (socket) => {
    socket.on('load history', () => {
        db.all("SELECT * FROM messages WHERE recipient_id IS NULL ORDER BY id ASC LIMIT 50", [], (err, rows) => {
            if (!err) socket.emit('load history', rows);
        });
    });

    socket.on('chat message', (data) => {
        if (data.name && data.text.trim() !== "") {
            db.run("INSERT INTO messages (name, text) VALUES (?, ?)", [data.name, data.text.trim()], function(err) {
                if (!err) io.emit('chat message', { name: data.name, text: data.text.trim(), id: this.lastID });
            });
        }
    });
});

const PORT = process.env.PORT || 3000;
http.listen(PORT, () => console.log(`Server running on port ${PORT}`));