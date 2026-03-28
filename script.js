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

    // Проверка, есть ли уже сохраненное имя
    const savedUsername = localStorage.getItem('chatUsername');
    if (savedUsername) {
        username = savedUsername;
        loginScreen.style.display = 'none';
        chatContainer.style.display = 'flex';
        console.log(`Добро пожаловать обратно, ${username}!`);
    }

    // Обработка нажатия кнопки "Войти"
    loginBtn.addEventListener('click', () => {
        const val = usernameInput.value.trim();
        if (val !== "") {
            username = val;
            localStorage.setItem('chatUsername', username); // Сохраняем имя
            loginScreen.style.display = 'none';
            chatContainer.style.display = 'flex';
            console.log(`Пользователь ${username} вошел в чат`);
        } else {
            alert("Пожалуйста, введите ваше имя.");
        }
    });

    // Обработка нажатия кнопки "Отправить"
    sendBtn.addEventListener('click', () => {
        sendMessage();
    });

    // Обработка нажатия Enter в поле ввода
    input.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            sendMessage();
        }
    });

    function sendMessage() {
        if (input.value.trim() !== "") {
            const messageData = { name: username, text: input.value };
            socket.emit('chat message', messageData);
            input.value = '';
        }
    }

    // Прием сообщения от сервера
    socket.on('chat message', (data) => {
        displayMessage(data);
    });

    // Загрузка истории сообщений при подключении
    socket.on('load history', (messagesList) => {
        messagesList.forEach(data => {
            displayMessage(data);
        });
        messages.scrollTop = messages.scrollHeight; // Прокрутка к последним сообщениям
    });

    // Функция для отображения сообщения
    function displayMessage(data) {
        const item = document.createElement('div');
        item.className = 'message';
        item.innerHTML = `<b>${data.name}:</b> ${data.text}`;
        messages.appendChild(item);
        messages.scrollTop = messages.scrollHeight; // Автопрокрутка вниз
    }
});