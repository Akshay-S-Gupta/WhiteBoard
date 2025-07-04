import React from 'react';

const COLORS = ['#e6194b', '#3cb44b', '#ffe119', '#4363d8', '#f58231', '#911eb4', '#46f0f0', '#f032e6', '#bcf60c', '#fabebe'];

function getColorForUser(userId) {
  // Deterministic color for each user
  let hash = 0;
  for (let i = 0; i < userId.length; i++) {
    hash = userId.charCodeAt(i) + ((hash << 5) - hash);
  }
  return COLORS[Math.abs(hash) % COLORS.length];
}

function UserCursors({ cursors, ownUserId }) {
  return (
    <>
      {Object.entries(cursors).map(([userId, cursor]) => {
        if (userId === ownUserId) return null;
        return (
          <div
            key={userId}
            style={{
              position: 'absolute',
              left: cursor.x,
              top: cursor.y,
              pointerEvents: 'none',
              zIndex: 10,
              transform: 'translate(-50%, -50%)',
            }}
          >
            <svg width={24} height={24} style={{ display: 'block' }}>
              <circle cx={12} cy={12} r={8} fill={getColorForUser(userId)} opacity={0.7} />
            </svg>
          </div>
        );
      })}
    </>
  );
}

export default UserCursors; 