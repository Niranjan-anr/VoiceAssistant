// App.js
import React, { useState, useRef, useEffect } from 'react';
import AssistantUI from './AssistantUI';
import './App.css';
import startupSound from './startup.mp3'; // Changed to new startup sound
import { getJoke, getDefinition, getWeather, getDuckDuckAnswer, getWikipediaAnswer } from './AssistanApi';

const wakeWords = ["hey odel", "okay odel", "hello odel", "listen odel"];

const App = () => {
  const [output, setOutput] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [initialized, setInitialized] = useState(false);
  const synthRef = useRef(window.speechSynthesis);
  const recognitionRef = useRef(null);
  const wakeRecognitionRef = useRef(null);
  const audioRef = useRef(null);

  const speak = (text) => {
    synthRef.current.cancel();
    const utter = new SpeechSynthesisUtterance(text);
    utter.lang = 'en-IN';
    utter.rate = 0.9;
    utter.onend = () => {
      startWakeListener();
    };
    synthRef.current.speak(utter);
  };

  const handleStart = () => {
    setInitialized(true);
    if (audioRef.current) {
      audioRef.current.play().catch(console.warn);
      const intro = new SpeechSynthesisUtterance("Hello! This is Odel. Ready to assist you.");
      intro.lang = 'en-IN';
      intro.rate = 0.85;
      intro.onend = () => {
        startWakeListener();
      };
      synthRef.current.speak(intro);
    }
  };

  const controlLight = async (state) => {
    await fetch("https://iotx0-f34a3-default-rtdb.firebaseio.com/light.json", {
      method: "PUT",
      body: JSON.stringify(state),
    });
  };

  const interruptAndListen = () => {
    synthRef.current.cancel();
    if (wakeRecognitionRef.current) {
      wakeRecognitionRef.current.stop();
    }
    startListening();
  };

  const startWakeListener = () => {
    if (!('SpeechRecognition' in window || 'webkitSpeechRecognition' in window)) return;

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    wakeRecognitionRef.current = new SpeechRecognition();
    wakeRecognitionRef.current.continuous = true;
    wakeRecognitionRef.current.interimResults = true;
    wakeRecognitionRef.current.lang = 'en-IN';

    wakeRecognitionRef.current.onresult = (event) => {
      const transcript = Array.from(event.results).map(r => r[0].transcript).join('').toLowerCase();
      if (wakeWords.some(word => transcript.includes(word))) {
        console.log("Wake word detected");
        interruptAndListen();
      }
    };

    wakeRecognitionRef.current.onerror = () => {
      console.warn("Wake word listener error. Restarting...");
      setTimeout(() => wakeRecognitionRef.current?.start(), 1000);
    };

    wakeRecognitionRef.current.start();
  };

  const startListening = () => {
    if (!('SpeechRecognition' in window || 'webkitSpeechRecognition' in window)) {
      speak("Sorry, speech recognition is not supported in this browser.");
      return;
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    recognitionRef.current = new SpeechRecognition();
    recognitionRef.current.lang = 'en-IN';
    recognitionRef.current.continuous = false;
    recognitionRef.current.interimResults = false;

    recognitionRef.current.onresult = async (event) => {
      const query = event.results[0][0].transcript.toLowerCase();
      setOutput(`🎙️ You said: "${query}"`);
      await processQuery(query);
      setIsListening(false);
    };

    recognitionRef.current.onerror = () => {
      speak("Sorry, I didn't catch that.");
      setIsListening(false);
    };

    recognitionRef.current.start();
    setIsListening(true);
  };

  const processQuery = async (query) => {
    if (!navigator.onLine) {
      speak("You are currently offline. I can only do basic tasks.");
      return;
    }

    if (query.includes("turn on the light")) {
      await controlLight(1);
      speak("Light turned on.");
    } else if (query.includes("turn off the light")) {
      await controlLight(0);
      speak("Light turned off.");
    } else if (["how are you", "how are you doing", "how do you do"].some(p => query.includes(p))) {
      speak("I'm doing great! Thanks for asking. How are you?");
    } else if (["what is your name", "who are you"].some(p => query.includes(p))) {
      speak("I am Odel, your voice assistant buddy.");
    } else if (["who made you", "who created you"].some(p => query.includes(p))) {
      speak("I was created by Niranjan. That's all I know.");
    } else if (["thank you", "thanks"].some(p => query.includes(p))) {
      speak("You're welcome!");
    } else if (["hello", "hi", "hey"].some(p => query === p || query.includes("hello"))) {
      speak("Hello there! How can I help?");
    } else if (query.includes("what's up")) {
      speak("Just processing thoughts at lightning speed!");
    } else if (query.includes("do you love me")) {
      speak("Of course! You're my favorite human.");
    } else if (query.includes("tell me about yourself")) {
      speak("I'm Odel, a voice assistant built to answer, help, and have fun conversations with you.");
    } else if (query.includes("joke")) {
      const joke = await getJoke();
      speak(joke);
    } else if (query.includes("weather")) {
      const weather = await getWeather();
      speak(weather);
    } else if (query.includes("define")) {
      const word = query.replace("define", "").trim();
      const meaning = await getDefinition(word);
      speak(`Definition of ${word}: ${meaning}`);
    } else {
      let answer = await getDuckDuckAnswer(query);
      if (!answer || answer.length < 5) {
        answer = await getWikipediaAnswer(query);
      }
      speak(answer);
    }
  };

  useEffect(() => {
    window.addEventListener('online', () => speak("You're back online."));
    window.addEventListener('offline', () => speak("You are offline. Some features may not work."));
    return () => {
      window.removeEventListener('online', () => {});
      window.removeEventListener('offline', () => {});
      synthRef.current.cancel();
      recognitionRef.current?.abort();
      wakeRecognitionRef.current?.abort();
    };
  }, []);

  return (
    <div>
      {!initialized ? (
        <div className="start-overlay">
          <button className="start-button" onClick={handleStart}>🚀 Start Odel Assistant</button>
        </div>
      ) : null}
      <AssistantUI
        isListening={isListening}
        output={output}
        onTalk={interruptAndListen}
      />
      <audio ref={audioRef} src={startupSound} preload="auto" />
    </div>
  );
};

export default App;
