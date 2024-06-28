const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

app.use(express.static(path.join(__dirname, 'public')));

const players = new Map();
let currentWord = '';
const words = ['javascript', 'threejs', 'websocket', 'multiplayer', 'typing', 'game'];

function getRandomWord() {
    return words[Math.floor(Math.random() * words.length)];
}

io.on('connection', (socket) => {
    console.log('New player connected');

    players.set(socket.id, { id: socket.id, progress: 0 });

    socket.emit('gameState', { players: Array.from(players.values()), currentWord });

    socket.on('typingProgress', (progress) => {
        const player = players.get(socket.id);
        if (player) {
            player.progress = progress;
            io.emit('playerProgress', { id: socket.id, progress });
        }
    });

    socket.on('disconnect', () => {
        players.delete(socket.id);
        io.emit('playerDisconnected', socket.id);
    });
});

function startNewRound() {
    currentWord = getRandomWord();
    players.forEach(player => player.progress = 0);
    io.emit('newRound', { currentWord, players: Array.from(players.values()) });
}

setInterval(startNewRound, 30000); // New round every 30 seconds

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
