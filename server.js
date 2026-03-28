const express = require('express');
const app = express();
const http = require('http').createServer(app);
const io = require('socket.io')(http);
const path = require('path');

// Указываем, что все файлы лежат в папке, где находится server.js
app.use(express.static(path.join(__dirname)));

io.on('connection', (socket) => {
    console.log('Кто-то зашел в чат');
    socket.on('chat message', (msg) => {
        io.emit('chat message', msg);
    });
});

http.listen(3000, () => {
    console.log('Сервер запущен на http://localhost:3000');
});