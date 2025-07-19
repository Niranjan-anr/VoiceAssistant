export const handleSmallTalk = (query) => {
  const q = query.toLowerCase();

  const map = [
    { triggers: ["how are you", "how are you doing", "how do you do"], response: "I'm doing great! Thanks for asking." },
    { triggers: ["what is your name", "who are you"], response: "I am Odel, your voice assistant buddy." },
    { triggers: ["who made you", "who created you"], response: "I was created by Niranjan. That's all I know." },
    { triggers: ["are you real", "are you human", "are you alive"], response: "I may not be human, but I'm always here to help." },
    { triggers: ["thank you", "thanks"], response: "You're welcome!" },
    { triggers: ["hello", "hi", "hey"], response: "Hello there! How can I help?" },
    { triggers: ["what's up"], response: "Just processing thoughts at lightning speed!" },
    { triggers: ["do you love me"], response: "Of course! You're my favorite human." },
    { triggers: ["tell me about yourself"], response: "I'm Odel, a voice assistant built to answer, help, and have fun conversations with you." },
  ];

  for (const item of map) {
    if (item.triggers.some(t => q.includes(t))) {
      return item.response;
    }
  }

  return null;
};
