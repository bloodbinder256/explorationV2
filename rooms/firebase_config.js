/* rooms/firebase_config.js
   Paste your Firebase Web App config here.

   How to get this:
   Firebase Console → Project Settings → General → Your apps → Web app → Config

   Leave enabled:false until you paste real values.
*/
window.FIREBASE_GAME_CONFIG = {
  enabled: false,

  firebaseConfig: {
    apiKey: "PASTE_API_KEY_HERE",
    authDomain: "PASTE_PROJECT_ID.firebaseapp.com",
    projectId: "PASTE_PROJECT_ID",
    storageBucket: "PASTE_PROJECT_ID.appspot.com",
    messagingSenderId: "PASTE_SENDER_ID",
    appId: "PASTE_APP_ID"
  },

  saveCollection: "playerSaves"
};
