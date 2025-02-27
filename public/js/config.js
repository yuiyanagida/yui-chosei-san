import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js';
import { getFirestore, connectFirestoreEmulator } from 'https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js';
import { getFunctions, connectFunctionsEmulator } from 'https://www.gstatic.com/firebasejs/10.8.0/firebase-functions.js';

const firebaseConfig = {
  apiKey: "AIzaSyDOzuJA5Xu5BWOH7YWfxUxk8p691A3ZUkY",
  authDomain: "yui-chosei-san.firebaseapp.com",
  projectId: "yui-chosei-san",
  storageBucket: "yui-chosei-san.firebasestorage.app",
  messagingSenderId: "72210640574",
  appId: "1:72210640574:web:b8d039c29742e8c61478ef"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const functions = getFunctions(app);

// エミュレータに接続（開発環境の場合のみ）
if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
  console.log('Running on localhost, connecting to emulators...');
  try {
    connectFirestoreEmulator(db, 'localhost', 8081);
    connectFunctionsEmulator(functions, 'localhost', 5001);
    console.log('Successfully connected to emulators');
  } catch (error) {
    console.error('Failed to connect to emulators:', error);
  }
}

export { db, functions }; 