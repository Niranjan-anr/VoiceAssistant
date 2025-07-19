import startupSoundd from './startup1.mp3'; 

const StartScreen = ({ onStart }) => (
  <div className="start-overlay">
     <audio id="startup-audio" src={startupSoundd} preload="auto" autoPlay />
    <button className="start-button" onClick={onStart}>
      🚀 Start Odel Assistant
    </button>
  </div>
);

export default StartScreen;
