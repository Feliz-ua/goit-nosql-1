// scripts/02_transform.js
db.tracks_raw.aggregate([
  {
    $project: {
      track_id: 1,
      track_name: 1,
      album_name: 1,
      explicit: 1,
      popularity: 1,
      duration_ms: 1,
      track_genre: 1,
      // 3. Перетворення артистів у масив з очищенням пробілів
      artists: {
        $map: {
          input: { $split: ["$artists", ";"] },
          as: "artist",
          in: { $trim: { input: "$$artist" } }
        }
      },
      // 4. Формування вкладеного об'єкта аудіо-характеристик
      audio_features: {
        danceability: "$danceability",
        energy: "$energy",
        loudness: "$loudness",
        speechiness: "$speechiness",
        acousticness: "$acousticness",
        instrumentalness: "$instrumentalness",
        liveness: "$liveness",
        valence: "$valence",
        tempo: "$tempo",
        key: "$key",
        mode: "$mode",
        time_signature: "$time_signature"
      },
      // Обчислення тривалості в секундах
      duration_sec: { 
        $round: [{ $divide: ["$duration_ms", 1000] }, 1] 
      },
      // Визначення рівня популярності
      popularity_tier: {
        $switch: {
          branches: [
            { case: { $gte: ["$popularity", 70] }, then: "high" },
            { case: { $and: [{ $gte: ["$popularity", 40] }, { $lt: ["$popularity", 70] }] }, then: "medium" }
          ],
          default: "low"
        }
      }
    }
  },
  // 6. Збереження результату у нову колекцію
  { $out: "tracks" }
]);

// 7. Перевірка результату
print("Кількість документів у tracks:", db.tracks.countDocuments({}));
print("Приклад документа:");
printjson(db.tracks.findOne());