class ChatApp {
    constructor() {
        this.socket = io();
        this.username = '';
        this.initializeElements();
        this.bindEvents();
    }

    initializeElements() {
        // Login screen
        this.loginScreen = document.getElementById('login-screen');
        this.usernameInput = document.getElementById('username-input');
        this.descriptionInput = document.getElementById('description-input');
        this.avatarUpload = document.getElementById('avatar-upload');
        this.avatarPreview = document.getElementById('avatar-preview');
        this.loginButton = document.getElementById('login-button');

        // Chat container
        this.chatContainer = document.getElementById('chat-container');
        this.currentUserAvatar = document.getElementById('current-user-avatar');
        this.currentUserName = document.getElementById('current-user-name');
        this.friendsContainer = document.getElementById('friends-container');
        this.messages = document.getElementById('messages');
        this.input = document.getElementById('input');
        this.sendButton = document.getElementById('send');
    }

    bindEvents() {
        // Login events
        this.loginButton.addEventListener('click', () => this.handleLogin());
        this.avatarUpload.addEventListener('change', (e) => this.handleAvatarUpload(e));

        // Chat events
        this.sendButton.addEventListener('click', () => this.sendMessage());
        this.input.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.sendMessage();
        });

        // Socket events
        this.socket.on('chat message', (data) => this.displayMessage(data));
        this.socket.on('load history', (messages) => this.loadHistory(messages));
    }

    async handleLogin() {
        const username = this.usernameInput.value.trim();
        if (!username) {
            alert('Пожалуйста, введите имя');
            return;
        }

        this.username = username;

        // Save profile info
        if (this.avatarUpload.files[0]) {
            await this.uploadAvatar();
        }

        if (this.descriptionInput.value.trim()) {
            await this.updateProfile();
        }

        // Update UI
        this.currentUserName.textContent = username;
        this.loginScreen.style.display = 'none';
        this.chatContainer.style.display = 'flex';

        // Load chat history
        this.socket.emit('load history');
    }

    async handleAvatarUpload(event) {
        const file = event.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                this.avatarPreview.src = e.target.result;
                this.avatarPreview.style.display = 'block';
            };
            reader.readAsDataURL(file);
        }
    }

    async uploadAvatar() {
        const file = this.avatarUpload.files[0];
        if (!file) return;

        try {
            const base64 = await this.convertFileToBase64(file);
            const response = await fetch('/upload-avatar', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                    username: this.username, 
                    imageData: base64 
                })
            });
            
            const result = await response.json();
            if (result.success) {
                this.currentUserAvatar.src = result.avatarUrl;
            }
        } catch (error) {
            console.error('Error uploading avatar:', error);
        }
    }

    async updateProfile() {
        try {
            await fetch('/update-profile', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    username: this.username,
                    description: this.descriptionInput.value.trim()
                })
            });
        } catch (error) {
            console.error('Error updating profile:', error);
        }
    }

    sendMessage() {
        const message = this.input.value.trim();
        if (message && this.username) {
            this.socket.emit('chat message', {
                name: this.username,
                text: message
            });
            this.input.value = '';
        }
    }

    displayMessage(data) {
        const messageDiv = document.createElement('div');
        messageDiv.className = 'message';
        
        messageDiv.innerHTML = `
            <img src="" class="message-avatar" onerror="this.src='https://via.placeholder.com/40'">
            <div class="message-content">
                <div class="message-sender">${data.name}</div>
                <div class="message-text">${data.text}</div>
            </div>
        `;
        
        this.messages.appendChild(messageDiv);
        this.messages.scrollTop = this.messages.scrollHeight;
    }

    loadHistory(messages) {
        messages.forEach(message => {
            this.displayMessage(message);
        });
    }

    convertFileToBase64(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = () => resolve(reader.result);
            reader.onerror = error => reject(error);
        });
    }
}

// Initialize the app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new ChatApp();
});