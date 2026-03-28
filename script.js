const socket = io();
let username = "";

const loginScreen = document.getElementById('login-screen');
const chatContainer = document.getElementById('chat-container');
const loginBtn = document.getElementById('login-button');
const usernameInput = document.getElementById('username-input');
const input = document.getElementById('input');
const send = document.getElementById('send');
const messages = document.getElementById('messages');

loginBtn.onclick = () => {
    if (usernameInput.value.trim() !== "") {
        username = usernameInput.value;
        loginScreen.style.display = 'none';
        chatContainer.style.display = 'flex';
    }
};

send.onclick = () => {
    if (input.value) {
        socket.emit('chat message', { name: username, text: input.value });
        input.value = '';
    }
};

socket.on('chat message', (data) => {
    const item = document.createElement('div');
    item.innerHTML = `<b>${data.name}:</b> ${data.text}`;
    messages.appendChild(item);
    messages.scrollTop = messages.scrollHeight;
});