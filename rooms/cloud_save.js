/* rooms/cloud_save.js — Firebase auth + cloud saves
   Works only after you fill rooms/firebase_config.js and enable it.
*/

const SAVE_KEYS = [
  "inventory",
  "sanity_v1",
  "pickedUpItems_v1",
  "gameProgress_v1",
  "content_flags_v1",
  "lastRoom",
  "lastEnding_v1",
  "trophies_v2",
  "trophy_stats_v1"
];

const PREFIX_KEYS = [
  "dialogue_used_",
  "entity_seen_",
  "rested_",
  "ritual_"
];

function cloudStatus(text, isError = false) {
  const el = document.getElementById("accountStatus");
  if (el) {
    el.textContent = text;
    el.classList.toggle("error", isError);
  }
}

function readLocalSave() {
  const data = {};
  Object.keys(localStorage).forEach(key => {
    if (SAVE_KEYS.includes(key) || PREFIX_KEYS.some(prefix => key.startsWith(prefix))) {
      data[key] = localStorage.getItem(key);
    }
  });
  return {
    version: 1,
    updatedAt: Date.now(),
    data
  };
}

function applyLocalSave(save) {
  if (!save?.data) throw new Error("Cloud save is empty or invalid.");
  Object.entries(save.data).forEach(([key, value]) => localStorage.setItem(key, value));
}

function configReady() {
  const cfg = window.FIREBASE_GAME_CONFIG;
  return !!(cfg?.enabled && cfg?.firebaseConfig?.apiKey && !cfg.firebaseConfig.apiKey.includes("PASTE_"));
}

function setSignedOutUI() {
  document.getElementById("accountSignedOut")?.classList.remove("hidden");
  document.getElementById("accountSignedIn")?.classList.add("hidden");
}

function setSignedInUI(user) {
  document.getElementById("accountSignedOut")?.classList.add("hidden");
  document.getElementById("accountSignedIn")?.classList.remove("hidden");
  const email = document.getElementById("accountEmail");
  if (email) email.textContent = user.email || user.uid;
}

async function bootFirebaseAccount() {
  if (!configReady()) {
    cloudStatus("Firebase is not configured yet. Open rooms/firebase_config.js and paste your Firebase config.", true);
    setSignedOutUI();
    document.querySelectorAll("[data-needs-firebase]").forEach(btn => btn.disabled = true);
    return;
  }

  try {
    const { initializeApp } = await import("https://www.gstatic.com/firebasejs/10.12.4/firebase-app.js");
    const {
      getAuth,
      createUserWithEmailAndPassword,
      signInWithEmailAndPassword,
      signOut,
      onAuthStateChanged
    } = await import("https://www.gstatic.com/firebasejs/10.12.4/firebase-auth.js");
    const { getFirestore, doc, setDoc, getDoc, serverTimestamp } = await import("https://www.gstatic.com/firebasejs/10.12.4/firebase-firestore.js");

    const app = initializeApp(window.FIREBASE_GAME_CONFIG.firebaseConfig);
    const auth = getAuth(app);
    const db = getFirestore(app);
    const collection = window.FIREBASE_GAME_CONFIG.saveCollection || "playerSaves";

    function currentUserOrThrow() {
      const user = auth.currentUser;
      if (!user) throw new Error("Sign in first.");
      return user;
    }

    async function saveToCloud() {
      const user = currentUserOrThrow();
      const save = readLocalSave();
      await setDoc(doc(db, collection, user.uid), {
        ...save,
        email: user.email || null,
        serverUpdatedAt: serverTimestamp()
      });
      cloudStatus("Saved current progress to your account.");
    }

    async function loadFromCloud() {
      const user = currentUserOrThrow();
      const snap = await getDoc(doc(db, collection, user.uid));
      if (!snap.exists()) {
        cloudStatus("No cloud save found for this account yet.", true);
        return;
      }
      applyLocalSave(snap.data());
      cloudStatus("Loaded cloud save. Return to the title screen or continue.");
      window.Trophies?.checkAll?.();
    }

    document.getElementById("signupBtn")?.addEventListener("click", async () => {
      const email = document.getElementById("emailInput").value.trim();
      const password = document.getElementById("passwordInput").value;
      try {
        await createUserWithEmailAndPassword(auth, email, password);
        cloudStatus("Account created and signed in.");
      } catch (err) {
        cloudStatus(err.message, true);
      }
    });

    document.getElementById("loginBtn")?.addEventListener("click", async () => {
      const email = document.getElementById("emailInput").value.trim();
      const password = document.getElementById("passwordInput").value;
      try {
        await signInWithEmailAndPassword(auth, email, password);
        cloudStatus("Signed in.");
      } catch (err) {
        cloudStatus(err.message, true);
      }
    });

    document.getElementById("logoutBtn")?.addEventListener("click", async () => {
      await signOut(auth);
      cloudStatus("Signed out.");
    });

    document.getElementById("saveCloudBtn")?.addEventListener("click", async () => {
      try { await saveToCloud(); }
      catch (err) { cloudStatus(err.message, true); }
    });

    document.getElementById("loadCloudBtn")?.addEventListener("click", async () => {
      if (!confirm("Load cloud save over this browser save?")) return;
      try { await loadFromCloud(); }
      catch (err) { cloudStatus(err.message, true); }
    });

    onAuthStateChanged(auth, user => {
      if (user) {
        setSignedInUI(user);
        cloudStatus("Signed in. You can save or load cloud progress.");
      } else {
        setSignedOutUI();
      }
    });
  } catch (err) {
    cloudStatus(`Firebase failed to load: ${err.message}`, true);
  }
}

document.addEventListener("DOMContentLoaded", bootFirebaseAccount);
