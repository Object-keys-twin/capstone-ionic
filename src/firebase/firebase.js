// import firebase from "firebase/app";
// import "firebase/firestore";

import firebase from "firebase";
import 'firebase/auth'

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

// export default class FirebaseWrapper {
// 	constructor() {
// 		this.initialized = false;
// 		this._firebaseInstance = null;
// 		this._firebaseWrapperInstance = null;
// 		this._firestore = null;
// 	}

// 	Initialize(config) {
// 		if (!this.initialized) {
// 			this._firebaseInstance = firebase.initializeApp(config);
// 			this._firestore = firebase.firestore();
// 			this.initialized = true;
// 			console.log("It worked!!!!");
// 		} else {
// 			console.log("Already initialized!");
// 		}
// 	}

// 	static GetInstance() {
// 		if (null == this._firebaseWrapperInstance) {
// 			this._firebaseWrapperInstance = new FirebaseWrapper();
// 		}
// 		return this._firebaseWrapperInstance;
// 	}

// 	async CreateNewDocument(collectionPath, doc) {
// 		try {
// 			const ref = this._firestore.collection(collectionPath).doc();
// 			const timestamp = firebase.firestore.Timestamp.now().toDate();
// 			return await ref.set({ ...doc, createdAt: timestamp, id: ref.id });
// 		} catch (error) {
// 			console.log("error creating new document ", error);
// 		}
// 	}
// }
