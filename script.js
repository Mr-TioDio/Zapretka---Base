
const socket = io(); 

const input = document.getElementById('input');
const send = document.getElementById('send');
const messages = document.getElementById('messages');

send.onclick = () => {
    if (input.value) {
        socket.emit('chat message', input.value);
        input.value = '';
    }
};

socket.on('chat message', (msg) => {
    const item = document.createElement('div');
    item.textContent = msg;
    messages.appendChild(item);
});