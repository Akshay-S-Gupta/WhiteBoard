import React, { useState } from 'react';
// import { BrowserRouter as Router, Route, Switch } from 'react-router-dom';
import RoomJoin from './components/RoomJoin';
import Whiteboard from './components/Whiteboard';

function App() {
  const [roomId, setRoomId] = useState(null);

  return (
    <div className="App">
      {!roomId ? (
        <RoomJoin onJoin={setRoomId} />
      ) : (
        <Whiteboard roomId={roomId} onLeave={() => setRoomId(null)} />
      )}
    </div>
  );
}

export default App;
