const express = require('express');
const router = express.Router();
const Room = require('../models/Room');

// POST /api/rooms/join
// Join or create a room by roomId (6-8 alphanumeric)
router.post('/join', async (req, res) => {
  try {
    const { roomId } = req.body;
    if (!roomId || !roomId.match(/^[a-zA-Z0-9]{6,8}$/)) {
      return res.status(400).json({ error: 'Invalid room code. Must be 6-8 alphanumeric characters.' });
    }
    let room = await Room.findOne({ roomId });
    if (!room) {
      room = new Room({ roomId });
      await room.save();
    }
    room.lastActivity = new Date();
    await room.save();
    res.json({ roomId: room.roomId });
  } catch (err) {
    console.error('Error in /api/rooms/join:', err);
    res.status(500).json({ error: 'Internal server error.' });
  }
});

// GET /api/rooms/:roomId
// Get room info by roomId
router.get('/:roomId', async (req, res) => {
  try {
    const { roomId } = req.params;
    if (!roomId || !roomId.match(/^[a-zA-Z0-9]{6,8}$/)) {
      return res.status(400).json({ error: 'Invalid room code.' });
    }
    const room = await Room.findOne({ roomId });
    if (!room) return res.status(404).json({ error: 'Room not found.' });
    res.json(room);
  } catch (err) {
    console.error('Error in /api/rooms/:roomId:', err);
    res.status(500).json({ error: 'Internal server error.' });
  }
});

module.exports = router; 