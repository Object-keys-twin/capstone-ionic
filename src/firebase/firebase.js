import firebase from "firebase/app";
import "firebase/firestore";

export default class FirebaseWrapper {
	constructor() {
		this.initialized = false;
		this._firebaseInstance = null;
		this._firebaseWrapperInstance = null;
		this._firestore = null;
	}

	Initialize(config) {
		if (!this.initialized) {
			this._firebaseInstance = firebase.initializeApp(config);
			this._firestore = firebase.firestore();
			this.initialized = true;
			console.log("It worked!!!!");
		} else {
			console.log("Already initialized!");
		}
	}

	static GetInstance() {
		if (null == this._firebaseWrapperInstance) {
			this._firebaseWrapperInstance = new FirebaseWrapper();
		}
		return this._firebaseWrapperInstance;
	}

	async CreateNewDocument(collectionPath, doc) {
		try {
			const ref = this._firestore.collection(collectionPath).doc();
			const timestamp = firebase.firestore.Timestamp.now().toDate();
			return await ref.set({ ...doc, createdAt: timestamp, id: ref.id });
		} catch (error) {
			console.log("error creating new document ", error);
		}
	}
}
