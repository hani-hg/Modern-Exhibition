// js/firebase-config.js

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.0/firebase-app.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.7.0/firebase-firestore.js";
import { getStorage } from "https://www.gstatic.com/firebasejs/10.7.0/firebase-storage.js";

const firebaseConfig = {
  apiKey: "AIzaSyDagDhybZwbnKOvnLBBARMX9-ErLw964Mo",
  authDomain: "modern-exhibition.firebaseapp.com",
  projectId: "modern-exhibition",
  storageBucket: "modern-exhibition.firebasestorage.app",
  messagingSenderId: "870468289709",
  appId: "1:870468289709:web:fe0ca644c24e37f818b224"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const storage = getStorage(app);

export { db, storage, app };