// firebase-config.js - Configuração do Firebase

// Configuração do Firebase
const firebaseConfig = {
    apiKey: "AIzaSyAKuR2ZimIicaIMCAFvoQamQw93C8q2CqM",
    authDomain: "draion.firebaseapp.com",
    databaseURL: "https://draion-default-rtdb.firebaseio.com/",
    projectId: "draion",
    storageBucket: "draion.firebasestorage.app",
    messagingSenderId: "529279708385",
    appId: "1:529279708385:web:394cf6f11eb745b44e9ba0",
    measurementId: "G-FD5YGLD121"
};

// Inicializar Firebase
firebase.initializeApp(firebaseConfig);

// Exportar referência do banco de dados
export const database = firebase.database();

console.log('Firebase inicializado com sucesso');