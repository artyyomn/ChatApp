'use strict';

var usernamePage = document.querySelector('#username-page');
var roomPage = document.querySelector('#room-page');
var chatPage = document.querySelector('#chat-page');
var usernameForm = document.querySelector('#usernameForm');
var messageForm = document.querySelector('#messageForm');
var messageInput = document.querySelector('#message');
var messageArea = document.querySelector('#messageArea');
var connectingElement = document.querySelector('.connecting');
var createRoomForm = document.querySelector('#createRoomForm');
var joinRoomForm = document.querySelector('#joinRoomForm');
var roomCodeDisplay = document.querySelector('#room-code-display');

var stompClient = null;
var username = null;
var roomCode = null;

function connect(event) {
    username = document.querySelector('#name').value.trim();

    if (username) {
        usernamePage.classList.add('hidden');
        roomPage.classList.remove('hidden');
    }
    event.preventDefault();
}

function createRoom(event) {
    fetch('/api/rooms/create', { method: 'POST' })
        .then(response => response.json())
        .then(data => {
            roomCode = data.roomCode;
            roomCodeDisplay.textContent = 'Room: ' + roomCode;
            roomPage.classList.add('hidden');
            chatPage.classList.remove('hidden');
            connectToWebSocket();
        });
    event.preventDefault();
}

function joinRoom(event) {
    var roomCodeInput = document.querySelector('#roomCode').value.trim();

    if (roomCodeInput) {
        fetch('/api/rooms/join', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ roomCode: roomCodeInput, username: username })
        })
        .then(response => {
            if (response.ok) {
                return response.json();
            } else {
                alert('Invalid room code or room is full.');
                return Promise.reject('Invalid room code');
            }
        })
        .then(data => {
            roomCode = data.roomCode;
            roomCodeDisplay.textContent = 'Room: ' + roomCode;
            roomPage.classList.add('hidden');
            chatPage.classList.remove('hidden');
            connectToWebSocket();
        })
        .catch(error => console.error('Error joining room:', error));
    }
    event.preventDefault();
}

function connectToWebSocket() {
    var socket = new SockJS('/ws');
    stompClient = Stomp.over(socket);

    stompClient.connect({}, onConnected, onError);
}

function onConnected() {
    stompClient.subscribe('/topic/public/' + roomCode, onMessageReceived);

    stompClient.send("/app/chat.addUser/" + roomCode,
        {},
        JSON.stringify({ sender: username, type: 'JOIN' })
    );

    connectingElement.classList.add('hidden');
}

function onError(error) {
    connectingElement.textContent = 'Could not connect to WebSocket server. Please refresh this page to try again!';
    connectingElement.style.color = 'red';
}

function sendMessage(event) {
    var messageContent = messageInput.value.trim();

    if (messageContent && stompClient) {
        var chatMessage = {
            sender: username,
            content: messageInput.value,
            type: 'CHAT'
        };

        stompClient.send("/app/chat.sendMessage/" + roomCode, {}, JSON.stringify(chatMessage));
        messageInput.value = '';
    }
    event.preventDefault();
}

function onMessageReceived(payload) {
    var message = JSON.parse(payload.body);

    var messageElement = document.createElement('li');

    if (message.type === 'JOIN' || message.type === 'LEAVE') {
        messageElement.classList.add('event-message');
        message.content = message.sender + (message.type === 'JOIN' ? ' joined!' : ' left!');
        
        var textElement = document.createElement('p');
        var messageText = document.createTextNode(message.content);
        textElement.appendChild(messageText);
        messageElement.appendChild(textElement);

    } else {
        messageElement.classList.add('chat-message');
        
        var messageBubble = document.createElement('div');
        messageBubble.classList.add('message-bubble');

        if (message.sender === username) {
            messageElement.classList.add('sent');
        } else {
            messageElement.classList.add('received');
            var messageInfo = document.createElement('div');
            messageInfo.classList.add('message-info');
            var usernameElement = document.createElement('span');
            usernameElement.textContent = message.sender;
            messageInfo.appendChild(usernameElement);
            messageBubble.appendChild(messageInfo);
        }

        var messageContentElement = document.createElement('p');
        messageContentElement.textContent = message.content;

        messageBubble.appendChild(messageContentElement);
        messageElement.appendChild(messageBubble);
    }

    messageArea.appendChild(messageElement);
    messageArea.scrollTop = messageArea.scrollHeight;
}

usernameForm.addEventListener('submit', connect, true);
createRoomForm.addEventListener('submit', createRoom, true);
joinRoomForm.addEventListener('submit', joinRoom, true);
messageForm.addEventListener('submit', sendMessage, true);