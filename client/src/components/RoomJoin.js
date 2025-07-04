import React, { useState } from 'react';
import './RoomJoin.css';

function RoomJoin({ onJoin }) {
  const [roomCode, setRoomCode] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!roomCode.match(/^[a-zA-Z0-9]{6,8}$/)) {
      setError('Room code must be 6-8 alphanumeric characters.');
      return;
    }
    // Call backend to join/create room
    try {
      const res = await fetch('/api/rooms/join', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ roomId: roomCode })
      });
      if (res.ok) {
        onJoin(roomCode);
      } else {
        setError('Failed to join room.');
      }
    } catch (err) {
      setError('Server error.');
    }
  };

  return (
    <div className="roomjoin-bg">
      <div className="roomjoin-card">
        <h1 className="roomjoin-title">Collaborative Whiteboard</h1>
        <p className="roomjoin-desc">
          Enter a room code to join or create a collaborative whiteboard.<br />No login required!
        </p>
        <form onSubmit={handleSubmit} className="roomjoin-form">
          <input
            type="text"
            value={roomCode}
            onChange={e => setRoomCode(e.target.value)}
            placeholder="Enter room code"
            maxLength={8}
            className="roomjoin-input"
          />
          <button type="submit" className="roomjoin-btn">Join Room</button>
        </form>
        {error && <div className="roomjoin-error">{error}</div>}
      </div>
    </div>
  );
}

export default RoomJoin; 