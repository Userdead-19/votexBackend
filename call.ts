const io = require('socket.io-client');

const socket = io('https://votexbackend.onrender.com');

socket.on('connect', () => {
    console.log('Connected to the server');
});

socket.on('message', (data: any) => {
    console.log('Received message:', data);
});

