import firebase from "firebase";

const firebaseConfig = {
  apiKey: "AIzaSyDeshjd9HiHi3NY5mYnA14-35gtWTJvyTg",
  authDomain: "capstone-96611.firebaseapp.com",
  databaseURL: "https://capstone-96611.firebaseio.com",
  projectId: "capstone-96611",
  storageBucket: "capstone-96611.appspot.com",
  messagingSenderId: "782217933791",
  appId: "1:782217933791:web:423b73dbe29842b0100a6a",
  measurementId: "G-H1S9MN6CDT"
};

firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();

export default db;
