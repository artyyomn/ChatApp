
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

var colors = [
    '#2196F3', '#32c787', '#00BCD4', '#ff5652',
    '#ffc107', '#ff85af', '#FF9800', '#39bbb0'
];

function connect(event) {
    username = document.querySelector('#name').value.trim();

    if(username) {
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
            roomCodeDisplay.textContent = 'Room Code: ' + roomCode;
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
        .then(response => response.json())
        .then(data => {
            if (data) {
                roomCode = data.roomCode;
                roomCodeDisplay.textContent = 'Room Code: ' + roomCode;
                roomPage.classList.add('hidden');
                chatPage.classList.remove('hidden');
                connectToWebSocket();
            } else {
                alert('Invalid room code');
            }
        });
    }
    event.preventDefault();
}

function connectToWebSocket() {
    var socket = new SockJS('/ws');
    stompClient = Stomp.over(socket);

    stompClient.connect({}, onConnected, onError);
}


function onConnected() {
    // Subscribe to the Public Topic
    stompClient.subscribe('/topic/public/' + roomCode, onMessageReceived);

    // Tell your username to the server
    stompClient.send("/app/chat.addUser",
        {},
        JSON.stringify({sender: username, type: 'JOIN'})
    )

    connectingElement.classList.add('hidden');
}


function onError(error) {
    connectingElement.textContent = 'Could not connect to WebSocket server. Please refresh this page to try again!';
    connectingElement.style.color = 'red';
}


function sendMessage(event) {
    var messageContent = messageInput.value.trim();

    if(messageContent && stompClient) {
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
    messageElement.classList.add('list-group-item');

    if(message.type === 'JOIN') {
        messageElement.classList.add('event-message');
        message.content = message.sender + ' joined!';
    } else if (message.type === 'LEAVE') {
        messageElement.classList.add('event-message');
        message.content = message.sender + ' left!';
    } else {
        messageElement.classList.add('chat-message');

        var avatarElement = document.createElement('i');
        var avatarText = document.createTextNode(message.sender[0]);
        avatarElement.appendChild(avatarText);
        avatarElement.style['background-color'] = getAvatarColor(message.sender);

        messageElement.appendChild(avatarElement);

        var usernameElement = document.createElement('span');
        var usernameText = document.createTextNode(message.sender);
        usernameElement.appendChild(usernameText);
        messageElement.appendChild(usernameElement);
    }

    var textElement = document.createElement('p');
    var messageText = document.createTextNode(message.content);
    textElement.appendChild(messageText);

    messageElement.appendChild(textElement);

    messageArea.appendChild(messageElement);
    messageArea.scrollTop = messageArea.scrollHeight;
}


function getAvatarColor(messageSender) {
    var hash = 0;
    for (var i = 0; i < messageSender.length; i++) {
        hash = 31 * hash + messageSender.charCodeAt(i);
    }

    var index = Math.abs(hash % colors.length);
    return colors[index];
}

usernameForm.addEventListener('submit', connect, true)
createRoomForm.addEventListener('submit', createRoom, true)
joinRoomForm.addEventListener('submit', joinRoom, true)
messageForm.addEventListener('submit', sendMessage, true)
