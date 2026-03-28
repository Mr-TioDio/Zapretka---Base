const express = require('express');
const app = express();
const http = require('http').createServer(app);
const io = require('socket.io')(http);
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const db = new sqlite3.Database('chat.db');

// Создаем таблицу, если ее нет
db.run("CREATE TABLE IF NOT EXISTS messages (id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT, text TEXT)");

app.use(express.static(path.join(__dirname)));

io.on('connection', (socket) => {
    // Отправляем историю сообщений новому пользователю
    db.all("SELECT * FROM messages ORDER BY id ASC LIMIT 50", [], (err, rows) => {
        if (err) {
            console.error("Ошибка при загрузке истории:", err.message);
            return;
        }
        socket.emit('load history', rows);
    });

    socket.on('chat message', (data) => {
        // Проверяем, чтобы имя и текст были не пустыми
        if (data.name && data.text.trim() !== "") {
            db.run("INSERT INTO messages (name, text) VALUES (?, ?)", [data.name, data.text.trim()], function(err) {
                if (err) {
                    console.error("Ошибка при сохранении сообщения:", err.message);
                    return;
                }
                // Отправляем сообщение всем, включая отправителя
                io.emit('chat message', { name: data.name, text: data.text.trim(), id: this.lastID });
            });
        }
    });

    socket.on('disconnect', () => {
        console.log('Пользователь отключился');
    });
});

const PORT = process.env.PORT || 3000;
http.listen(PORT, () => console.log(`Server running on port ${PORT}`));