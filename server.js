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
let currentParagraphs = new Map();

async function getRandomParagraph(wordCount = 20) {
    try {
        const response = await fetch(`https://random-word-api.herokuapp.com/word?number=${wordCount}`);
        const words = await response.json();
        return words.join(' ');
    } catch (error) {
        console.error('Error fetching random words:', error);
        return 'The quick brown fox jumps over the lazy dog.'; // Fallback sentence
    }
}

io.on('connection', async (socket) => {
    console.log('New player connected');

    const paragraph = await getRandomParagraph();
    players.set(socket.id, { id: socket.id, progress: 0 });
    currentParagraphs.set(socket.id, paragraph);

    socket.emit('gameState', { 
        players: Array.from(players.values()), 
        paragraph: paragraph 
    });

    socket.on('typingProgress', (progress) => {
        const player = players.get(socket.id);
        if (player) {
            player.progress = progress;
            io.emit('playerProgress', { id: socket.id, progress });
        }
    });

    socket.on('disconnect', () => {
        players.delete(socket.id);
        currentParagraphs.delete(socket.id);
        io.emit('playerDisconnected', socket.id);
    });
});

async function startNewRound() {
    for (let [id, player] of players) {
        const paragraph = await getRandomParagraph();
        currentParagraphs.set(id, paragraph);
        player.progress = 0;
        io.to(id).emit('newRound', { paragraph });
    }
    io.emit('updatePlayers', Array.from(players.values()));
}

setInterval(startNewRound, 60000); // New round every 60 seconds

// Start the first round immediately
startNewRound();

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
