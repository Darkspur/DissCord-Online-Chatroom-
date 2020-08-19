const socket = io();

const chatMessages = document.querySelector('.chat-messages');
const chatForm = document.getElementById('chat-form');
const roomName = document.getElementById('room-name');
const userList = document.getElementById('users');

// Retrieve Username and Room from URL
const {username, room} = Qs.parse(location.search, {
    // To ignore the '?','=' and all those signs
    ignoreQueryPrefix: true
});

// Join chat
socket.emit('joinRoom', { username,room });

socket.on('roomUsers',({ room,users })=>{
    outputRoomName(room);
    outputUsers(users);
});

socket.on('message', (message)=>{
    //console.log(message);
    outputMessage(message);

    // Scroll down on new message
    chatMessages.scrollTop = chatMessages.scrollHeight;
});

// Submitting message
chatForm.addEventListener('submit', (e)=>{
    // Stops the default action of submit 
    e.preventDefault();

    // Retrieving the message
    const msg = e.target.elements.msg.value;

    // Emitting out the message to Server
    socket.emit('chatMessage', msg);

    // Clearing out input after submitting
    e.target.elements.msg.value = '';
    e.target.elements.msg.focus();
});

// Output message to DOM
function outputMessage(message){
    const div = document.createElement('div');
    div.classList.add('message');

    // If user messages
    if(message.id === socket.id)
    {
        div.innerHTML = `<div class="user"><p class="meta">You <span>${message.time}</span></p>
        <p class="text">
            ${message.text}
        </p></div>`;
    }
    // If bot messages
    else if(message.id === 'botID'){
        div.innerHTML = `<div class="bot">
        <p class="text"><b>
            ${message.text}
        </b></p></div>`;
    }
    // If other users of the room message
    else{
        div.innerHTML = `<div class="roomUsers"><p class="meta">${message.username} <span>${message.time}</span></p>
        <p class="text">
            ${message.text}
        </p></div>`;
    }
    document.querySelector('.chat-messages').appendChild(div);
}

// Add room name to DOM
function outputRoomName(room){
    roomName.innerText = room;
}

// Add users to DOM
function outputUsers(users){
    userList.innerHTML = `
        ${users.map(user => `<li>${user.username}</li>`).join('')}
    `;
}



