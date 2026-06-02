// Завдання 1. Аналіз запиту та індексація
// 1.1 Аналіз ДО створення індексу (зробіть скріншот плану виконання для README)
db.tracks.find({
  track_genre: "pop",
  "audio_features.danceability": { $gte: 0.7 }
}).sort({ popularity: -1 }).explain("executionStats");

// 1.2 Створення індексу (правило ESR)
db.tracks.createIndex({ track_genre: 1, popularity: -1, "audio_features.danceability": 1 });

// 1.3 Аналіз ПІСЛЯ створення індексу (зробіть скріншот для README)
db.tracks.find({
  track_genre: "pop",
  "audio_features.danceability": { $gte: 0.7 }
}).sort({ popularity: -1 }).explain("executionStats");


// Завдання 2. Індекс для інших полів
// 2.1. Складений індекс для пошуку музики для роботи
db.tracks.createIndex({ explicit: 1, "audio_features.instrumentalness": 1, "audio_features.speechiness": 1 });

// Перевірка використання індексу
db.tracks.find({
  "audio_features.instrumentalness": { $gt: 0.5 },
  "audio_features.speechiness": { $lt: 0.1 },
  explicit: false
}).explain("executionStats");