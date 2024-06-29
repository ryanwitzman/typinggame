const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const path = require('path');
const fetch = require('node-fetch');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

app.use(express.static(path.join(__dirname, 'public')));

const players = new Map();
let currentWord = '';
async function getRandomWord() {
    try {
        const response = await fetch('https://random-word-api.herokuapp.com/word');
        const words = await response.json();
        return words[0];
    } catch (error) {
        console.error('Error fetching random word:', error);
        return 'fallback'; // Return a fallback word in case of an error
    }
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

async function startNewRound() {
    currentWord = await getRandomWord();
    players.forEach(player => player.progress = 0);
    io.emit('newRound', { currentWord, players: Array.from(players.values()) });
}

setInterval(startNewRound, 30000); // New round every 30 seconds

// Start the first round immediately
startNewRound();

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
