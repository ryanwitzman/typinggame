const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const path = require('path');
const fetch = require('node-fetch');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

app.use(express.static(path.join(__dirname, 'public')));

const lobbies = new Map();
const players = new Map();

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

io.on('connection', (socket) => {
    console.log('New player connected');

    socket.on('createLobby', () => {
        const lobbyId = Math.random().toString(36).substring(2, 8);
        lobbies.set(lobbyId, { players: new Set(), paragraph: null });
        socket.join(lobbyId);
        socket.emit('lobbyCreated', lobbyId);
    });

    socket.on('joinLobby', (lobbyId) => {
        const lobby = lobbies.get(lobbyId);
        if (lobby) {
            socket.join(lobbyId);
            lobby.players.add(socket.id);
            socket.emit('joinedLobby', lobbyId);
            io.to(lobbyId).emit('playerJoined', { id: socket.id, progress: 0 });
        } else {
            socket.emit('error', 'Lobby not found');
        }
    });

    socket.on('startGame', async () => {
        const lobbyId = Array.from(socket.rooms).find(room => room !== socket.id);
        if (lobbyId && lobbies.has(lobbyId)) {
            const lobby = lobbies.get(lobbyId);
            lobby.paragraph = await getRandomParagraph();
            const gameState = {
                players: Array.from(lobby.players).map(id => ({ id, progress: 0 })),
                paragraph: lobby.paragraph
            };
            io.to(lobbyId).emit('gameStarted', gameState);
        }
    });

    socket.on('typingProgress', (progress) => {
        const lobbyId = Array.from(socket.rooms).find(room => room !== socket.id);
        if (lobbyId) {
            io.to(lobbyId).emit('playerProgress', { id: socket.id, progress });
        }
    });

    socket.on('disconnect', () => {
        for (const [lobbyId, lobby] of lobbies) {
            if (lobby.players.has(socket.id)) {
                lobby.players.delete(socket.id);
                io.to(lobbyId).emit('playerDisconnected', socket.id);
                if (lobby.players.size === 0) {
                    lobbies.delete(lobbyId);
                }
                break;
            }
        }
    });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
