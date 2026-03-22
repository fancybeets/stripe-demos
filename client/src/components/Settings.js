import React from 'react';
import { useTheme } from '../context/ThemeContext';
import './Settings.css';

const Settings = ({ onMaximize, isMaximized }) => {
  const { theme, setTheme } = useTheme();

  return (
    <div className="view-content">
      <div className="settings-container">
        <div className="settings-section">
          <div className="settings-title">DISPLAY</div>
          <div className="settings-body">
            <div className="settings-controls">
              <div className="settings-row">
                <div className="settings-label">THEME</div>
                <select
                  className="settings-select"
                  value={theme}
                  onChange={(e) => setTheme(e.target.value)}
                >
                  <option value="apocalypse">APOCALYPSE</option>
                  <option value="simple">SIMPLE</option>
                  <option value="dark">DARK</option>
                </select>
              </div>
              <div className="settings-row settings-maximize-row">
                <div className="settings-label">MAXIMIZE</div>
                <input
                  type="checkbox"
                  className="settings-checkbox"
                  checked={!!isMaximized}
                  onChange={onMaximize}
                />
              </div>
            </div>
            <div className="settings-note">
              Theme and maximize can be set via query string and will be saved to local storage:
              <ul>
                <li><code>?theme=apocalypse|simple|dark</code></li>
                <li><code>?maximized=true|false</code></li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;
