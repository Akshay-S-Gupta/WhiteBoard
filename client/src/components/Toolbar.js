import React from 'react';
import './Toolbar.css';

const COLORS = ['black', 'red', 'blue', 'green'];

function Toolbar({ color, width, onColorChange, onWidthChange, onClear, responsive }) {
  return (
    <div className={`toolbar${responsive ? ' toolbar-responsive' : ''}`}>
      <div className="toolbar-group toolbar-colors">
        <span className="toolbar-label">Color:</span>
        {COLORS.map(c => (
          <button
            key={c}
            className={`toolbar-color-btn${color === c ? ' selected' : ''}`}
            style={{ background: c, color: c === 'black' ? '#fff' : '#000' }}
            onClick={() => onColorChange(c)}
          />
        ))}
      </div>
      <div className="toolbar-group toolbar-width">
        <span className="toolbar-label">Width:</span>
        <input
          type="range"
          min={2}
          max={16}
          value={width}
          onChange={e => onWidthChange(Number(e.target.value))}
          className="toolbar-slider"
        />
        <span className="toolbar-width-value">{width}px</span>
      </div>
      <button
        onClick={onClear}
        className="toolbar-clear-btn"
      >
        Clear
      </button>
    </div>
  );
}

export default Toolbar; 