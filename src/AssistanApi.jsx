// utils/api.js
export const getDuckDuckAnswer = async (query) => {
  try {
    const res = await fetch(`https://api.duckduckgo.com/?q=${encodeURIComponent(query)}&format=json`);
    const data = await res.json();
    return data.AbstractText || data.Answer || data.Definition || '';
  } catch {
    return '';
  }
};

export const getWikipediaAnswer = async (query) => {
  try {
    const title = encodeURIComponent(query);
    const res = await fetch(`https://en.wikipedia.org/api/rest_v1/page/summary/${title}`);
    const data = await res.json();
    return data.extract || 'No summary available.';
  } catch {
    return 'Error fetching from Wikipedia.';
  }
};

export const getJoke = async () => {
  const res = await fetch("https://official-joke-api.appspot.com/random_joke");
  const data = await res.json();
  return `${data.setup} ... ${data.punchline}`;
};

export const getDefinition = async (word) => {
  const res = await fetch(`https://api.dictionaryapi.dev/api/v2/entries/en/${word}`);
  const data = await res.json();
  return data[0]?.meanings[0]?.definitions[0]?.definition || "No definition found.";
};

export const getWeather = async () => {
  const res = await fetch("https://api.open-meteo.com/v1/forecast?latitude=12.97&longitude=77.59&current_weather=true");
  const data = await res.json();
  return `The current temperature is ${data.current_weather.temperature}°C.`;
};
export const controlLight = async (state) => {
  await fetch("https://iotx0-f34a3-default-rtdb.firebaseio.com/light.json", {
    method: "PUT",
    body: JSON.stringify(state),
  });
};  