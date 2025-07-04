import React, { useState, useRef } from 'react';
import DrawingCanvas from './DrawingCanvas';
import Toolbar from './Toolbar';
import './Whiteboard.css';

function Whiteboard({ roomId, onLeave }) {
  const [color, setColor] = useState('black');
  const [width, setWidth] = useState(4);
  const [userCount, setUserCount] = useState(1);
  const [copied, setCopied] = useState(false);
  const drawingCanvasRef = useRef();

  const handleUserCount = (count) => setUserCount(count);
  const handleLeaveRoom = () => {
    if (drawingCanvasRef.current && drawingCanvasRef.current.leaveRoom) {
      drawingCanvasRef.current.leaveRoom();
    }
    if (onLeave) onLeave();
  };
  const handleClear = () => {
    if (drawingCanvasRef.current && drawingCanvasRef.current.clearCanvas) {
      drawingCanvasRef.current.clearCanvas();
    }
  };
  const handleCopyRoomCode = () => {
    navigator.clipboard.writeText(roomId);
    setCopied(true);
    setTimeout(() => setCopied(false), 1200);
  };

  return (
    <div className="whiteboard-bg">
      <div className="whiteboard-card">
        <div className="whiteboard-header-row">
          <h2 className="whiteboard-title">
            Room: <span className="whiteboard-roomcode">{roomId}</span>
            <button onClick={handleCopyRoomCode} title="Copy room code" className="whiteboard-copy-btn">
              {copied ? 'Copied!' : 'Copy'}
            </button>
          </h2>
          <div className="whiteboard-usercount">
            <span className="whiteboard-usercount-icon">
              <svg width="20" height="20" fill="none" viewBox="0 0 20 20"><circle cx="10" cy="10" r="8" fill="#3182ce" opacity="0.15"/><path d="M10 5v5l3 3" stroke="#3182ce" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
              {userCount} active
            </span>
          </div>
        </div>
        <Toolbar color={color} width={width} onColorChange={setColor} onWidthChange={setWidth} onClear={handleClear} responsive />
        <div className="whiteboard-canvas-row">
          <DrawingCanvas ref={drawingCanvasRef} roomId={roomId} color={color} width={width} onUserCount={handleUserCount} />
        </div>
        <button onClick={handleLeaveRoom} className="whiteboard-leave-btn">Leave Room</button>
      </div>
    </div>
  );
}

export default Whiteboard; 