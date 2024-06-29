const socketIo = require('socket.io');

function initChatServer(io) {
    io.on('connection', (socket) => {
        console.log('New chat connection');

        socket.on('joinLobbyChat', (lobbyId) => {
            socket.join(`lobby_${lobbyId}`);
        });

        socket.on('leaveLobbyChat', (lobbyId) => {
            socket.leave(`lobby_${lobbyId}`);
        });

        socket.on('lobbyMessage', (data) => {
            io.to(`lobby_${data.lobbyId}`).emit('lobbyMessage', {
                sender: socket.id,
                message: data.message
            });
        });
    });
}

module.exports = { initChatServer };
