const path = require('path');
const http = require('http');
const express = require('express');
const socketio = require('socket.io');
const formatMessage = require('./utils/messages');
const { userJoin, getCurrentUser,userLeave,getRoomUsers } = require('./utils/users');

const app = express();
const server = http.createServer(app);
const io = socketio(server);

const botName = 'dissBot';
const botID = 'botID';
// Setting static folder
app.use(express.static(path.join(__dirname, '/public')));

// Runnning when client connects
io.on('connection', (socket)=>{
    // Join room
    socket.on('joinRoom', ({ username,room })=>{

        const user = userJoin(socket.id,username,room);

        socket.join(user.room);

        // Welcome message for the new logged in user
        socket.emit('message', formatMessage(botID,botName,'Welcome to dissCord'));

        // For every other user in the chat
        socket.broadcast.to(user.room).emit('message',formatMessage(botID,botName,`${user.username} has joined the chat`));

        // Send user and room info
        io.to(user.room).emit('roomUsers',{
            room: user.room,
            users: getRoomUsers(user.room)
        });
    });

    socket.on('chatMessage', (msg)=>{
        const user = getCurrentUser(socket.id);
     
        io.to(user.room).emit('message', formatMessage(user.id,user.username,msg));
    })
    
    // For other users in the chat 
    socket.on('disconnect', ()=>{
        const user = userLeave(socket.id);

        console.log(user);
        if(user){ io.to(user.room).emit('message', formatMessage(botID,botName,`${user.username} has left us`));

        // Send user and room info
        io.to(user.room).emit('roomUsers',{
                room: user.room,
                users: getRoomUsers(user.room)
            });
        }
    });   
});

const PORT = 4000 || process.env.PORT;

server.listen(PORT, ()=> {
    console.log("server running on port " + PORT);
});

