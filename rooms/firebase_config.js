/* rooms/firebase_config.js
   Firebase web config for Exploration cloud saves.

   This is a Firebase browser config. It is not a password.
   Keep your Firestore rules locked and restrict the API key in Google Cloud.
*/
window.GAME_FIREBASE_CONFIG = {
  enabled: true,

  firebaseConfig: {
    apiKey: "AIzaSyAidB97G_wweN9w7c2gJYtP9DlbIc_Bqwk",
    authDomain: "exploration-cloud.firebaseapp.com",
    projectId: "exploration-cloud",
    storageBucket: "exploration-cloud.firebasestorage.app",
    messagingSenderId: "541321883134",
    appId: "1:541321883134:web:32343b3e51fb37fdbba4af",
    measurementId: "G-VS6H9E5X5T"
  },

  saveCollection: "playerSaves"
};

// Compatibility alias. Some older scripts looked for this name.
window.FIREBASE_GAME_CONFIG = window.GAME_FIREBASE_CONFIG;
