const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

// Stockage en mémoire
const rooms = new Map(); // Map<roomName, Set<{id, username, avatar}>>
const messageHistory = new Map(); // Map<roomName, Array<message>>
const userSockets = new Map(); // Map<socketId, {username, room, avatar}>

// Servir le fichier index.html
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// Fonction pour générer un avatar aléatoire
function generateAvatar(username) {
  const colors = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA07A', '#98D8C8', '#F7DC6F', '#BB8FCE', '#85C1E2'];
  const color = colors[Math.floor(Math.random() * colors.length)];
  const initial = username.charAt(0).toUpperCase();
  return { color, initial };
}

// Fonction pour obtenir les utilisateurs d'un salon
function getRoomUsers(room) {
  if (!rooms.has(room)) return [];
  return Array.from(rooms.get(room));
}

// Fonction pour ajouter un utilisateur à un salon
function addUserToRoom(room, socketId, username, avatar) {
  if (!rooms.has(room)) {
    rooms.set(room, new Set());
  }
  rooms.get(room).add({ id: socketId, username, avatar });
  userSockets.set(socketId, { username, room, avatar });
}

// Fonction pour retirer un utilisateur d'un salon
function removeUserFromRoom(socketId) {
  const userData = userSockets.get(socketId);
  if (!userData) return null;
  
  const { username, room, avatar } = userData;
  if (rooms.has(room)) {
    const roomUsers = rooms.get(room);
    roomUsers.forEach(user => {
      if (user.id === socketId) {
        roomUsers.delete(user);
      }
    });
    if (roomUsers.size === 0) {
      rooms.delete(room);
      messageHistory.delete(room);
    }
  }
  userSockets.delete(socketId);
  return { username, room, avatar };
}

// Fonction pour ajouter un message à l'historique
function addMessageToHistory(room, message) {
  if (!messageHistory.has(room)) {
    messageHistory.set(room, []);
  }
  const history = messageHistory.get(room);
  history.push(message);
  // Garder seulement les 100 derniers messages
  if (history.length > 100) {
    history.shift();
  }
}

// Écoute des connexions Socket.IO
io.on('connection', (socket) => {
  console.log('Un utilisateur est connecté');

  // Rejoindre un salon
  socket.on('join room', (data) => {
    const { username, room } = data;
    const avatar = generateAvatar(username);
    
    socket.join(room);
    addUserToRoom(room, socket.id, username, avatar);

    // Envoyer l'historique des messages au nouvel arrivant
    if (messageHistory.has(room)) {
      socket.emit('message history', messageHistory.get(room));
    }

    // Envoyer l'avatar généré au client
    socket.emit('avatar assigned', avatar);

    // Notifier tous les membres du salon
    io.to(room).emit('room message', { 
      message: `${username} a rejoint le salon ${room}.` 
    });

    // Envoyer la liste mise à jour des utilisateurs à tous
    io.to(room).emit('room users', getRoomUsers(room));

    console.log(`${username} a rejoint le salon ${room}`);
  });

  // Quitter un salon et en rejoindre un autre
  socket.on('change room', (data) => {
    const oldUserData = removeUserFromRoom(socket.id);
    
    if (oldUserData) {
      const { username, room: oldRoom } = oldUserData;
      socket.leave(oldRoom);
      
      // Notifier l'ancien salon
      io.to(oldRoom).emit('room message', {
        message: `${username} a quitté le salon ${oldRoom}.`
      });
      io.to(oldRoom).emit('room users', getRoomUsers(oldRoom));
    }

    // Rejoindre le nouveau salon
    const { username, room: newRoom } = data;
    const avatar = generateAvatar(username);
    
    socket.join(newRoom);
    addUserToRoom(newRoom, socket.id, username, avatar);

    // Envoyer l'historique au client
    if (messageHistory.has(newRoom)) {
      socket.emit('message history', messageHistory.get(newRoom));
    }

    socket.emit('avatar assigned', avatar);
    socket.emit('room changed', { room: newRoom });

    // Notifier le nouveau salon
    io.to(newRoom).emit('room message', {
      message: `${username} a rejoint le salon ${newRoom}.`
    });
    io.to(newRoom).emit('room users', getRoomUsers(newRoom));

    console.log(`${username} a changé de salon vers ${newRoom}`);
  });

  // Envoyer un message dans un salon
  socket.on('chat message', (data) => {
    const messageData = {
      username: data.username,
      room: data.room,
      message: data.message,
      timestamp: new Date().toISOString(),
      avatar: userSockets.get(socket.id)?.avatar
    };

    // Ajouter à l'historique
    addMessageToHistory(data.room, messageData);

    // Émettre à tous les clients du salon
    io.to(data.room).emit('chat message', messageData);
    
    console.log(`[${data.room}] ${data.username}: ${data.message}`);
  });

  // Indicateur de saisie
  socket.on('typing', (data) => {
    socket.to(data.room).emit('user typing', {
      username: data.username,
      isTyping: data.isTyping
    });
  });

  // Message privé
  socket.on('private message', (data) => {
    const { to, message, from } = data;
    
    // Trouver le socket du destinataire
    let recipientSocketId = null;
    userSockets.forEach((userData, socketId) => {
      if (userData.username === to) {
        recipientSocketId = socketId;
      }
    });

    if (recipientSocketId) {
      const messageData = {
        from,
        message,
        timestamp: new Date().toISOString(),
        avatar: userSockets.get(socket.id)?.avatar
      };

      // Envoyer au destinataire
      io.to(recipientSocketId).emit('private message', messageData);
      
      // Confirmer à l'expéditeur
      socket.emit('private message sent', {
        to,
        message,
        timestamp: messageData.timestamp
      });

      console.log(`Message privé de ${from} à ${to}: ${message}`);
    } else {
      socket.emit('private message error', {
        error: `L'utilisateur ${to} n'est pas connecté.`
      });
    }
  });

  // Réaction à un message
  socket.on('message reaction', (data) => {
    io.to(data.room).emit('message reaction', {
      username: data.username,
      emoji: data.emoji,
      messageIndex: data.messageIndex
    });
  });

  // Déconnexion
  socket.on('disconnect', () => {
    console.log('Un utilisateur est déconnecté');
    const userData = removeUserFromRoom(socket.id);
    
    if (userData) {
      const { username, room } = userData;
      
      // Notifier les autres membres
      socket.to(room).emit('room message', {
        message: `${username} a quitté le salon ${room}.`
      });
      
      // Mettre à jour la liste des utilisateurs
      io.to(room).emit('room users', getRoomUsers(room));
      
      console.log(`${username} a quitté le salon ${room}`);
    }
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Serveur en écoute sur le port ${PORT}`);
});
