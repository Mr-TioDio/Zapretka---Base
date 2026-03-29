const socket = io();
const loginScreen = document.getElementById('login-screen');
const chatContainer = document.getElementById('chat-container');
const usernameInput = document.getElementById('username-input');
const currentUserName = document.getElementById('current-user-name');
const messages = document.getElementById('messages');
const input = document.getElementById('input');

let username = localStorage.getItem('chatUsername') || '';

if (username) enterChat();

document.getElementById('login-button').addEventListener('click', () => {
    username = usernameInput.value.trim();
    if (username) {
        localStorage.setItem('chatUsername', username);
        enterChat();
    }
});

function enterChat() {
    loginScreen.style.display = 'none';
    chatContainer.style.display = 'block';
    currentUserName.textContent = username;
    socket.emit('load history');
}

document.getElementById('send').addEventListener('click', () => {
    if (input.value.trim()) {
        socket.emit('chat message', { name: username, text: input.value.trim() });
        input.value = '';
    }
});

socket.on('chat message', (data) => {
    const div = document.createElement('div');
    div.innerHTML = `<span class="message-sender">${data.name}:</span> ${data.text}`;
    messages.appendChild(div);
    messages.scrollTop = messages.scrollHeight;
});

socket.on('load history', (msgs) => {
    messages.innerHTML = '';
    msgs.forEach(m => {
        const div = document.createElement('div');
        div.innerHTML = `<span class="message-sender">${m.name}:</span> ${m.text}`;
        messages.appendChild(div);
    });
});