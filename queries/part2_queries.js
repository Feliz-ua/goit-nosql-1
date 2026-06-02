// 1. Треки для вечірки
const partyTracks = db.tracks.find({
  "audio_features.danceability": { $gt: 0.7 },
  "audio_features.energy": { $gt: 0.7 },
  duration_ms: { $gte: 180000, $lte: 300000 }
}).toArray();

// 2. Виконавці, у яких усі треки популярні
const popularArtists = db.tracks.aggregate([
  { $unwind: "$artists" },
  {
    $group: {
      _id: "$artists",
      track_count: { $sum: 1 },
      min_popularity: { $min: "$popularity" },
      avg_popularity: { $avg: "$popularity" }
    }
  },
  {
    $match: {
      track_count: { $gte: 3 },
      min_popularity: { $gte: 60 }
    }
  },
  {
    $project: {
      artist_name: "$_id",
      track_count: 1,
      min_popularity: 1,
      avg_popularity: { $round: ["$avg_popularity", 1] },
      _id: 0
    }
  },
  { $sort: { avg_popularity: -1 } },
  { $limit: 20 }
]).toArray();

// 3. Нетипові треки (за темпом)
const outlierTracks = db.tracks.aggregate([
  {
    $group: {
      _id: "$track_genre",
      avg_tempo: { $avg: "$audio_features.tempo" },
      std_dev: { $stdDevPop: "$audio_features.tempo" },
      tracks: { $push: "$$ROOT" }
    }
  },
  {
    $addFields: {
      outlier_threshold: {
        $add: ["$avg_tempo", { $multiply: [2, "$std_dev"] }]
      }
    }
  },
  { $unwind: "$tracks" },
  {
    $match: {
      $expr: { $gt: ["$tracks.audio_features.tempo", "$outlier_threshold"] }
    }
  },
  {
    $group: {
      _id: "$_id",
      avg_tempo: { $first: "$avg_tempo" },
      outlier_threshold: { $first: "$outlier_threshold" },
      outlier_tracks: {
        $push: {
          _id: "$tracks._id",
          track_name: "$tracks.track_name",
          popularity: "$tracks.popularity",
          artists: "$tracks.artists",
          audio_features: { tempo: "$tracks.audio_features.tempo" }
        }
      }
    }
  },
  {
    $project: {
      genre: "$_id",
      avg_tempo: { $round: ["$avg_tempo", 1] },
      outlier_threshold: { $round: ["$outlier_threshold", 1] },
      outlier_tracks: 1,
      _id: 0
    }
  }
]).toArray();

// 4. Треки для фонової роботи
const backgroundTracks = db.tracks.find({
  "audio_features.loudness": { $lt: -10 },
  "audio_features.speechiness": { $lt: 0.1 },
  "audio_features.instrumentalness": { $gt: 0.5 },
  explicit: false
}).toArray();