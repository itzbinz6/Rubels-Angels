// firebase-init.js
// One shared Firebase setup, imported by index.html, menu.html, and admin.html.
// Keeping this in a single file means the config only lives in one place.

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

const firebaseConfig = {
  apiKey: "AIzaSyC4mtPCFvp-aZJKZVJuPDcjQCYb5af3eiU",
  authDomain: "rubels-angels.firebaseapp.com",
  projectId: "rubels-angels",
  storageBucket: "rubels-angels.firebasestorage.app",
  messagingSenderId: "288026772278",
  appId: "1:288026772278:web:cdcf17291779d7d9b12997"
};

const app = initializeApp(firebaseConfig);

export const db = getFirestore(app);
export const auth = getAuth(app);
