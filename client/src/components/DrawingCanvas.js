import React, { useRef, useEffect, useState, useImperativeHandle, forwardRef } from 'react';
import io from 'socket.io-client';
import UserCursors from './UserCursors';

const SOCKET_URL = process.env.REACT_APP_SOCKET_URL || 'http://localhost:5000';

const DrawingCanvas = forwardRef(function DrawingCanvas({ roomId, color, width, onClear, onUserCount }, ref) {
  const canvasRef = useRef(null);
  const [socket, setSocket] = useState(null);
  const [drawing, setDrawing] = useState(false);
  const [lastPoint, setLastPoint] = useState(null);
  const [userId, setUserId] = useState(null);
  const [cursors, setCursors] = useState({});
  // Track lastPoint for each remote user
  const remoteLastPoints = useRef({});
  const cursorTimeouts = useRef({});
  // Accumulate points for the current stroke
  const currentStroke = useRef([]);

  useImperativeHandle(ref, () => ({
    leaveRoom: () => {
      if (socket) socket.emit('leave-room');
    },
    clearCanvas: () => {
      handleClear();
    }
  }), [socket]);

  useEffect(() => {
    const s = io(SOCKET_URL);
    setSocket(s);
    setUserId(s.id);
    s.emit('join-room', { roomId });
    s.on('init-drawing', (drawingData) => {
      redrawFromData(drawingData);
    });
    s.on('draw-start', handleRemoteDrawStart);
    s.on('draw-move', handleRemoteDrawMove);
    s.on('draw-end', handleRemoteDrawEnd);
    s.on('clear-canvas', clearCanvas);
    s.on('cursor-move', handleRemoteCursorMove);
    s.on('cursor-leave', handleRemoteCursorLeave);
    s.on('user-count', (count) => {
      if (onUserCount) onUserCount(count);
    });
    return () => {
      s.emit('leave-room');
      s.disconnect();
    };
    // eslint-disable-next-line
  }, [roomId]);

  // Drawing handlers
  const startDraw = (x, y) => {
    setDrawing(true);
    setLastPoint({ x, y });
    currentStroke.current = [{ x, y }];
    if (socket) socket.emit('draw-start', { x, y, color, width });
  };
  const draw = (x, y) => {
    if (!drawing) return;
    drawLine(lastPoint.x, lastPoint.y, x, y, color, width);
    setLastPoint({ x, y });
    currentStroke.current.push({ x, y });
    if (socket) socket.emit('draw-move', { x, y, color, width });
  };
  const endDraw = () => {
    setDrawing(false);
    setLastPoint(null);
    if (currentStroke.current.length > 1 && socket) {
      socket.emit('draw-end', {
        color,
        width,
        points: currentStroke.current
      });
    } else if (socket) {
      socket.emit('draw-end', {});
    }
    currentStroke.current = [];
  };

  // Mouse/touch events
  const handlePointerDown = (e) => {
    const { x, y } = getCanvasCoords(e);
    startDraw(x, y);
    emitCursor(x, y);
  };
  const handlePointerMove = (e) => {
    const { x, y } = getCanvasCoords(e);
    if (drawing) draw(x, y);
    emitCursor(x, y);
  };
  const handlePointerUp = () => endDraw();

  // Cursor emit
  const emitCursor = (x, y) => {
    if (socket) socket.emit('cursor-move', { x, y, color });
  };

  // Helpers
  function getCanvasCoords(e) {
    const rect = canvasRef.current.getBoundingClientRect();
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    return {
      x: clientX - rect.left,
      y: clientY - rect.top
    };
  }
  function drawLine(x1, y1, x2, y2, color, width) {
    const ctx = canvasRef.current.getContext('2d');
    ctx.strokeStyle = color;
    ctx.lineWidth = width;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.stroke();
  }
  function clearCanvas() {
    const ctx = canvasRef.current.getContext('2d');
    ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
    remoteLastPoints.current = {};
    setCursors({});
    if (onClear) onClear();
  }
  function redrawFromData(drawingData) {
    clearCanvas();
    drawingData.forEach(cmd => {
      if (cmd.type === 'clear') {
        clearCanvas();
      } else if (cmd.type === 'stroke' && cmd.data && Array.isArray(cmd.data.points)) {
        drawStroke(cmd.data);
      }
    });
  }
  function drawStroke(stroke) {
    const { color, width, points } = stroke;
    if (!points || points.length < 2) return;
    for (let i = 1; i < points.length; i++) {
      drawLine(points[i - 1].x, points[i - 1].y, points[i].x, points[i].y, color, width);
    }
  }

  // Remote events (track per user)
  function handleRemoteDrawStart({ userId, x, y, color, width }) {
    if (!userId) return;
    remoteLastPoints.current[userId] = { x, y, color, width };
  }
  function handleRemoteDrawMove({ userId, x, y, color, width }) {
    if (!userId) return;
    const last = remoteLastPoints.current[userId];
    if (last) {
      drawLine(last.x, last.y, x, y, color, width);
    }
    remoteLastPoints.current[userId] = { x, y, color, width };
  }
  function handleRemoteDrawEnd({ userId, color, width, points }) {
    if (!userId) return;
    delete remoteLastPoints.current[userId];
    // Optionally, draw the full stroke if points are provided (for robustness)
    if (points && points.length > 1) {
      drawStroke({ color, width, points });
    }
  }

  // Remote cursor events
  function handleRemoteCursorMove({ userId, x, y, color }) {
    setCursors(prev => ({ ...prev, [userId]: { x, y, color } }));
    // Hide cursor after 3s inactivity
    if (cursorTimeouts.current[userId]) clearTimeout(cursorTimeouts.current[userId]);
    cursorTimeouts.current[userId] = setTimeout(() => {
      setCursors(prev => {
        const copy = { ...prev };
        delete copy[userId];
        return copy;
      });
    }, 3000);
  }
  function handleRemoteCursorLeave({ userId }) {
    setCursors(prev => {
      const copy = { ...prev };
      delete copy[userId];
      return copy;
    });
  }

  // Clear button (removed, now handled by Toolbar)
  const handleClear = () => {
    if (socket) socket.emit('clear-canvas');
    clearCanvas();
  };

  return (
    <div style={{ position: 'relative' }}>
      <canvas
        ref={canvasRef}
        width={800}
        height={600}
        style={{ border: '1px solid #ccc', background: '#fff', touchAction: 'none' }}
        onMouseDown={handlePointerDown}
        onMouseMove={handlePointerMove}
        onMouseUp={handlePointerUp}
        onMouseLeave={handlePointerUp}
        onTouchStart={handlePointerDown}
        onTouchMove={handlePointerMove}
        onTouchEnd={handlePointerUp}
      />
      <UserCursors cursors={cursors} ownUserId={userId} />
    </div>
  );
});

export default DrawingCanvas; 