// App.js
import React, { useState, useRef, useEffect } from 'react';
import AssistantUI from './AssistantUI';
import './App.css';
import startupSound from './startup.mp3';
import {
  getJoke,
  getDefinition,
  getWeather,
  getDuckDuckAnswer,
  getWikipediaAnswer,
} from './AssistantApi';

const App = () => {
  const [output, setOutput] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [initialized, setInitialized] = useState(false);
  const [lastContext, setLastContext] = useState(null);
  const [conversationHistory, setConversationHistory] = useState([]);
  const synthRef = useRef(window.speechSynthesis);
  const recognitionRef = useRef(null);
  const audioRef = useRef(null);

  const speak = (text) => {
    synthRef.current.cancel();
    const utter = new SpeechSynthesisUtterance(text);
    utter.lang = 'en-IN';
    utter.rate = 0.9;
    synthRef.current.speak(utter);
  };

  const handleStart = () => {
    setInitialized(true);
    if (audioRef.current) {
      audioRef.current.play().catch(console.warn);
      const intro = new SpeechSynthesisUtterance("Hello! This is Odel. Ready to assist you.");
      intro.lang = 'en-IN';
      intro.rate = 0.85;
      synthRef.current.speak(intro);
    }
  };

  const controlLight = async (state) => {
    try {
      await fetch("https://iotx0-f34a3-default-rtdb.firebaseio.com/light.json", {
        method: "PUT",
        body: JSON.stringify(state),
      });
    } catch (err) {
      speak("Failed to control the light. Check your connection.");
    }
  };

  const startListening = () => {
    if (!('SpeechRecognition' in window || 'webkitSpeechRecognition' in window)) {
      speak("Sorry, speech recognition is not supported in this browser.");
      return;
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognizer = new SpeechRecognition();
    recognizer.lang = 'en-IN';
    recognizer.continuous = false;
    recognizer.interimResults = false;

    recognizer.onresult = async (event) => {
      const query = event.results[0][0].transcript.toLowerCase();
      setOutput(`🎙️ You said: "${query}"`);
      await processQuery(query);
      setIsListening(false);
    };

    recognizer.onerror = () => {
      speak("Sorry, I didn't catch that.");
      setIsListening(false);
    };

    recognizer.start();
    recognitionRef.current = recognizer;
    setIsListening(true);
  };

  const processQuery = async (query) => {
    if (!navigator.onLine) {
      speak("You are currently offline. I can only do basic tasks.");
      return;
    }

    const lowerQuery = query.toLowerCase();
    const newEntry = { userQuery: lowerQuery, assistantResponse: '', intent: '' };

    const say = (text, intent = '') => {
      speak(text);
      newEntry.assistantResponse = text;
      newEntry.intent = intent;
    };

    // Follow-up: small talk context
    if (lastContext === 'how-are-you' && /(i('|’)m|i am|doing|feeling)/.test(lowerQuery)) {
      setLastContext(null);
      return say("Glad to hear that!", 'response');
    }

    // Small Talk and Greetings
    if (/\b(hi|hello|hey|yo|buddy|sup|whats up)\b/.test(lowerQuery)) {
      return say("Hey there! How can I help?", 'greeting');
    }

    if (/how (are|r) (you|u)/.test(lowerQuery)) {
      setLastContext('how-are-you');
      return say("I'm doing great! What about you?", 'how-are-you');
    }

    if (/what('?s| is) your name|who are you/.test(lowerQuery)) {
      return say("I am Odel, your voice assistant buddy.", 'identity');
    }

    if (/who (made|created) you/.test(lowerQuery)) {
      return say("I was created by Niranjan. That's all I know.", 'creator');
    }

    if (/thank(s| you)/.test(lowerQuery)) {
      return say("You're welcome!", 'thanks');
    }

    if (/tell me about yourself/.test(lowerQuery)) {
      return say("I'm Odel, a voice assistant built to answer, help, and chat with you.", 'about');
    }

    if (/do you love me/.test(lowerQuery)) {
      return say("Of course! You're my favorite human.", 'love');
    }

    if (/turn on.*light/.test(lowerQuery)) {
      await controlLight(1);
      return say("Light turned on.", 'light-on');
    }

    if (/turn off.*light/.test(lowerQuery)) {
      await controlLight(0);
      return say("Light turned off.", 'light-off');
    }

    if (/joke/.test(lowerQuery)) {
      const joke = await getJoke();
      return say(joke, 'joke');
    }

    if (/weather/.test(lowerQuery)) {
      const weather = await getWeather();
      return say(weather, 'weather');
    }

    if (/define/.test(lowerQuery)) {
      const word = lowerQuery.replace("define", "").trim();
      const meaning = await getDefinition(word);
      return say(`Definition of ${word}: ${meaning}`, 'definition');
    }

    // General fallback using APIs
    let answer = await getDuckDuckAnswer(lowerQuery);
    if (!answer || answer.length < 5) {
      answer = await getWikipediaAnswer(lowerQuery);
    }

    if (!answer || answer.length < 5) {
      say("I couldn't find a good answer for that. Try rephrasing?", 'no-answer');
    } else {
      say(answer, 'info');
    }

    // Push to memory
    setConversationHistory(prev => [...prev.slice(-4), newEntry]);
  };

  useEffect(() => {
    const handleOnline = () => speak("You're back online.");
    const handleOffline = () => speak("You are offline. Some features may not work.");

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      synthRef.current.cancel();
      recognitionRef.current?.abort();
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
        onTalk={startListening}
      />
      <audio ref={audioRef} src={startupSound} preload="auto" />
    </div>
  );
};

export default App;
