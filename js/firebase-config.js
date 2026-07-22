// js/firebase-config.js

// إعدادات Firebase
const firebaseConfig = {
    apiKey: "YOUR_API_KEY",
    authDomain: "modern-exhibition.firebaseapp.com",
    projectId: "modern-exhibition",
    storageBucket: "modern-exhibition.firebasestorage.app",
    messagingSenderId: "870468289709",
    appId: "1:870468289709:web:fe0ca644c24e37f818b224"
};

// تهيئة Firebase
firebase.initializeApp(firebaseConfig);

// تصدير الخدمات
const db = firebase.firestore();
const storage = firebase.storage();

console.log('✅ Firebase initialized successfully');