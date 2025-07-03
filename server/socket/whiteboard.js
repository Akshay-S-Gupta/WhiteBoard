const Room = require('../models/Room');

const userCursors = {};

module.exports = (io, socket) => {
  let currentRoom = null;
  let userId = socket.id;

  // User joins a room
  socket.on('join-room', async ({ roomId }) => {
    if (currentRoom) {
      socket.leave(currentRoom);
    }
    currentRoom = roomId;
    socket.join(roomId);
    // Send existing drawing data to new user
    const room = await Room.findOne({ roomId });
    if (room) {
      socket.emit('init-drawing', room.drawingData);
    }
    // Update user count
    io.to(roomId).emit('user-count', getUserCount(io, roomId));
  });

  // User leaves a room
  socket.on('leave-room', () => {
    if (currentRoom) {
      socket.leave(currentRoom);
      delete userCursors[userId];
      io.to(currentRoom).emit('user-count', getUserCount(io, currentRoom));
      socket.to(currentRoom).emit('cursor-leave', { userId });
      currentRoom = null;
    }
  });

  // Drawing events
  // Start drawing stroke (no longer persist to DB here)
  socket.on('draw-start', (data) => {
    if (!currentRoom) return;
    socket.to(currentRoom).emit('draw-start', { userId, ...data });
  });

  // Drawing path data
  socket.on('draw-move', (data) => {
    if (!currentRoom) return;
    socket.to(currentRoom).emit('draw-move', { userId, ...data });
  });

  // End drawing stroke, persist full stroke to DB
  socket.on('draw-end', async (data) => {
    if (!currentRoom) return;
    if (data && Array.isArray(data.points) && data.points.length > 1) {
      const command = { type: 'stroke', data, timestamp: new Date() };
      await Room.updateOne(
        { roomId: currentRoom },
        { $push: { drawingData: command }, $set: { lastActivity: new Date() } }
      );
    }
    io.to(currentRoom).emit('draw-end', { userId, ...data });
  });

  // Clear entire canvas
  socket.on('clear-canvas', async () => {
    if (!currentRoom) return;
    const command = { type: 'clear', data: {}, timestamp: new Date() };
    await Room.updateOne(
      { roomId: currentRoom },
      { $push: { drawingData: command }, $set: { lastActivity: new Date() } }
    );
    io.to(currentRoom).emit('clear-canvas');
  });

  // Cursor position update
  socket.on('cursor-move', (data) => {
    if (!currentRoom) return;
    userCursors[userId] = { ...data, userId };
    socket.to(currentRoom).emit('cursor-move', { userId, ...data });
  });

  // Handle user disconnect
  socket.on('disconnect', () => {
    if (currentRoom) {
      delete userCursors[userId];
      io.to(currentRoom).emit('user-count', getUserCount(io, currentRoom));
      socket.to(currentRoom).emit('cursor-leave', { userId });
    }
  });
};

// Helper: Get number of users in a room
function getUserCount(io, roomId) {
  const room = Array.from(io.sockets.adapter.rooms.get(roomId) || []);
  return room.length;
} 