document.addEventListener('DOMContentLoaded', () => {
    const socket = io();
    let username = "";

    const loginScreen = document.getElementById('login-screen');
    const chatContainer = document.getElementById('chat-container');
    const loginBtn = document.getElementById('login-button');
    const usernameInput = document.getElementById('username-input');
    const input = document.getElementById('input');
    const sendBtn = document.getElementById('send');
    const messages = document.getElementById('messages');

    loginBtn.addEventListener('click', () => {
        const val = usernameInput.value.trim();
        if (val !== "") {
            username = val;
            loginScreen.style.display = 'none';
            chatContainer.style.display = 'flex';
        } else {
            alert("Введите имя!");
        }
    });

    sendBtn.addEventListener('click', () => {
        if (input.value) {
            socket.emit('chat message', { name: username, text: input.value });
            input.value = '';
        }
    });

    socket.on('chat message', (data) => {
        const item = document.createElement('div');
        item.innerHTML = `<b>${data.name}:</b> ${data.text}`;
        messages.appendChild(item);
        messages.scrollTop = messages.scrollHeight;
    });
});