const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const path = require('path');
const { initChatServer } = require('./chat_server');

let fetch;

(async () => {
    const nodeFetch = await import('node-fetch');
    fetch = nodeFetch.default;
})();

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

app.use(express.static(path.join(__dirname, 'public')));

initChatServer(io);

const lobbies = new Map();
const players = new Map();
const leaderboard = new Map();

const paragraphs = [
    "The quick brown fox jumps over the lazy dog.",
    "A journey of a thousand miles begins with a single step.",
    "To be or not to be, that is the question.",
    "All that glitters is not gold.",
    "Where there's a will, there's a way.",
    "Practice makes perfect.",
    "Actions speak louder than words.",
    "Better late than never.",
    "Every cloud has a silver lining.",
    "Don't judge a book by its cover."
];

function getRandomParagraph() {
    return paragraphs[Math.floor(Math.random() * paragraphs.length)];
}

io.on('connection', (socket) => {
    console.log('New player connected');

    socket.on('createLobby', () => {
        const lobbyId = Math.random().toString(36).substring(2, 8);
        lobbies.set(lobbyId, { players: new Map(), paragraph: null, isPublic: false });
        socket.join(lobbyId);
        socket.emit('lobbyCreated', lobbyId);
    });

    socket.on('getLobbyList', () => {
        const publicLobbies = Array.from(lobbies.entries())
            .filter(([_, lobby]) => lobby.isPublic)
            .map(([id, _]) => id);
        socket.emit('lobbyList', publicLobbies);
    });

    socket.on('joinLobby', (lobbyId) => {
        const lobby = lobbies.get(lobbyId);
        if (lobby) {
            socket.join(lobbyId);
            lobby.players.set(socket.id, { id: socket.id, progress: 0, color: getRandomColor() });
            socket.emit('joinedLobby', lobbyId);
            io.to(lobbyId).emit('updateLobby', { players: Array.from(lobby.players.values()) });
        } else {
            socket.emit('error', 'Lobby not found');
        }
    });

    socket.on('startGame', (lobbyId) => {
        const lobby = lobbies.get(lobbyId);
        if (lobby && !lobby.gameStarted) {
            lobby.paragraph = getRandomParagraph();
            const gameState = {
                players: Array.from(lobby.players.values()),
                paragraph: lobby.paragraph
            };
            io.to(lobbyId).emit('gameStarted', gameState);
            lobby.gameStarted = true;
        }
    });

    socket.on('changeCarColor', (lobbyId) => {
        const lobby = lobbies.get(lobbyId);
        if (lobby && lobby.players.has(socket.id)) {
            const player = lobby.players.get(socket.id);
            player.color = getRandomColor();
            io.to(lobbyId).emit('updateLobby', { players: Array.from(lobby.players.values()) });
        }
    });

    socket.on('typingProgress', (progress) => {
        const lobbyId = Array.from(socket.rooms).find(room => room !== socket.id);
        if (lobbyId) {
            io.to(lobbyId).emit('playerProgress', { id: socket.id, progress });
        }
    });

    socket.on('gameFinished', (data) => {
        updateLeaderboard(socket.id, data);
    });

    socket.on('getLeaderboard', () => {
        const leaderboardData = Array.from(leaderboard.values())
            .sort((a, b) => b.gamesPlayed - a.gamesPlayed)
            .slice(0, 10);  // Top 10 players
        socket.emit('leaderboardData', leaderboardData);
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

function getRandomColor() {
    return '#' + Math.floor(Math.random()*16777215).toString(16);
}

function updateLeaderboard(playerId, gameData) {
    if (!leaderboard.has(playerId)) {
        leaderboard.set(playerId, {
            name: `Player${playerId.substr(0, 4)}`,
            gamesPlayed: 0,
            topSpeed: 0,
            dailyGames: 0,
            lastPlayedDate: null
        });
    }

    const playerData = leaderboard.get(playerId);
    playerData.gamesPlayed++;
    playerData.topSpeed = Math.max(playerData.topSpeed, gameData.speed);

    const today = new Date().toDateString();
    if (playerData.lastPlayedDate !== today) {
        playerData.dailyGames = 1;
        playerData.lastPlayedDate = today;
    } else {
        playerData.dailyGames++;
    }

    leaderboard.set(playerId, playerData);
}
