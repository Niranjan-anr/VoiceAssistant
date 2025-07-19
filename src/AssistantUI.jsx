// components/AssistantUI.js
import React from 'react';
import odelAvatar from './odel-avatar.svg';
import startupSound from './startup.mp3';

const AssistantUI = ({ isListening, output, onTalk }) => (
  <div className="container">
    <audio id="startup-audio" src={startupSound} preload="auto" autoPlay />
    <img src={odelAvatar} alt="Odel Avatar" className="odel-avatar" />
    <div className="intro-animation">🤖 Odel is online</div>
    <h1 className="title">🧠 Odel Voice Assistant</h1>
    <button className="listen-button" onClick={onTalk}>
      🎤 Talk to Odel
    </button>
    {isListening && <div className="wave-animation">🎧 Listening...</div>}
    <p className="output-text">{output}</p>
  </div>
);

export default AssistantUI;
