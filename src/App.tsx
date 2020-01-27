import React, { Component } from "react";
import { Redirect, Route } from "react-router-dom";
import {
  IonApp,
  IonIcon,
  IonLabel,
  IonRouterOutlet,
  IonTabBar,
  IonTabButton,
  IonTabs
} from "@ionic/react";
import { Plugins } from "@capacitor/core";
import { IonReactRouter } from "@ionic/react-router";
import { apps, person, add } from "ionicons/icons";
import firebase from "firebase";
import Profile from "./pages/Profile";
import Explore from "./pages/Explore";
import Create from "./pages/Create";
import MapPage from "./pages/Map";
import Login from "./pages/Login";
import db from "./firebase/firebase";

import "./App.css";

/* Core CSS required for Ionic components to work properly */
import "@ionic/react/css/core.css";

/* Basic CSS for apps built with Ionic */
import "@ionic/react/css/normalize.css";
import "@ionic/react/css/structure.css";
import "@ionic/react/css/typography.css";

/* Optional CSS utils that can be commented out */
import "@ionic/react/css/padding.css";
import "@ionic/react/css/float-elements.css";
import "@ionic/react/css/text-alignment.css";
import "@ionic/react/css/text-transformation.css";
import "@ionic/react/css/flex-utils.css";
import "@ionic/react/css/display.css";

/* Theme variables */
import "./theme/variables.css";

const { Storage } = Plugins;

interface FavoriteObj {
  id: string;
  name: string;
}

interface LogInSignUpData {
  email: string;
  displayName: string;
  password: string;
}

interface UserData {
  email: string;
  uid?: string;
  displayName: string;
  photoURL: string;
  password: string;
  favorites: object;
  favoritesArray: Array<FavoriteObj>;
}

interface BusinessData {
  id: string;
  name: string;
  location: string;
  imageUrl: string;
  categories: Array<object>;
  rating?: number;
  latitude: number;
  longitude: number;
  price?: string | undefined;
  timestamp: string;
}

interface LooseObject {
  [key: string]: any;
}

type State = {
  user: UserData | null;
  loggedIn: boolean;
  logInSignUpError: boolean;
  showMapErrorToast: boolean;
  toastMessage: string;
  stringbean: Array<BusinessData>;
};

class App extends Component<{}, State> {
  state = {
    user: {
      email: "",
      uid: "",
      displayName: "",
      photoURL: "",
      password: "",
      favorites: {},
      favoritesArray: Array<FavoriteObj>()
    },
    loggedIn: false,
    logInSignUpError: false,
    showMapErrorToast: false,
    toastMessage: "",
    stringbean: Array<BusinessData>()
  };

  componentDidMount = () => {
    // this.getUser();
    this.getStringBeanOnMount();
    firebase.auth().onAuthStateChanged(async user => {
      if (user) {
        console.log("Currently logged in!");
        let userObj = {
          email: user.email || "",
          uid: user.uid || "",
          displayName: this.state.user.displayName || user.displayName || "",
          photoURL: user.photoURL || "",
          password: ""
        };

        this.setState({
          user: { ...this.state.user, ...userObj },
          loggedIn: true
        });

        const favorites = await this.fetchFavoritesHashTable(user.uid);
        const favoritesArray = await this.generateFavoritesArray(favorites);

        this.setState({
          user: { ...this.state.user, favorites, favoritesArray }
        });

        // Storage.set({
        //   key: "user",
        //   value: JSON.stringify(user)
        // });
      } else {
        console.log("Currently logged out.");
        this.setState({
          user: {
            email: "",
            uid: "",
            displayName: "",
            photoURL: "",
            password: "",
            favorites: {},
            favoritesArray: Array<FavoriteObj>()
          },
          loggedIn: false
        });
        // Storage.remove({
        //   key: "user"
        // });
      }
    });
  };

  fetchFavoritesHashTable = async (userId: string) => {
    const getUser = await db
      .collection("users")
      .doc(userId)
      .get();
    const userData = getUser.data();
    if (userData) {
      return userData.favorites;
    }
  };

  generateFavoritesArray = async (favorites: object) => {
    let favoritesArray = [];
    for (let favorite in favorites) {
      if (favorite === "initializer") continue;
      const favoriteObj = await this.fetchFavoriteData(favorite);
      if (favoriteObj) {
        favoritesArray.push(favoriteObj);
      }
    }
    return favoritesArray;
  };

  getStringBeanOnMount = async () => {
    const data = await Storage.get({ key: "stringbean" });
    if (data.value) {
      this.setState({ stringbean: JSON.parse(data.value) });
    }
  };

  //leaving this here. not using local storage means that the login page will flash upon refresh as it waits for authentication
  //maybe for the sake of appearance we should end up using local storage just to not have the login page flash.

  // getUser = async () => {
  //   const data = await Storage.get({
  //     key: "user"
  //   });

  //   if (data.value) {
  //     const user = JSON.parse(data.value);
  //     this.setState({
  //       user: user,
  //       loggedIn: true
  //     });
  //   }
  // };

  handleSubmit = (user: LogInSignUpData, type?: string) => {
    if (!user.email) {
      this.setState({
        logInSignUpError: true,
        toastMessage: "Please enter an email address."
      });
    } else if (!user.password) {
      this.setState({
        logInSignUpError: true,
        toastMessage: "Please enter a password."
      });
    } else {
      if (type === "signup") {
        this.createUserOnFirestore(user.email, user.password, user.displayName);
      } else {
        this.signInOnFirestore(user.email, user.password);
      }
    }
  };

  resetLogInSignUpError = () => {
    this.setState({ logInSignUpError: false, toastMessage: "" });
  };

  createUserOnFirestore = (
    email: string,
    password: string,
    displayName: string
  ) => {
    if (email && password) {
      firebase
        .auth()
        .createUserWithEmailAndPassword(email, password)
        .catch(error => {
          const errorCode = error.code;
          const errorMessage = error.message;
          console.log("Sign-up error:", errorCode, errorMessage);
          this.setState({
            logInSignUpError: true,
            toastMessage:
              "Invalid email and/or password! Passwords must be at least 6 characters and contain a lowercase, uppercase, and number."
          });
        })
        .then(async () => {
          console.log("Created new user on Firebase.");
          let user = firebase.auth().currentUser;
          if (user) {
            //updateProfile takes longer than setState and the onAuthStateChanged listener reaction, so in onAuthStateChanged, when updating state, need to grab the displayName from state instead of the firebase user data
            if (displayName) {
              user.updateProfile({
                displayName: displayName
              });
              this.setState({
                user: { ...this.state.user, displayName: displayName }
              });
            }

            let newUser = {
              email,
              displayName: displayName || "",
              favorites: { initializer: 1 },
              friends: {}
            };

            await db
              .collection("users")
              .doc(user.uid)
              .set(newUser)
              .then(() => {
                console.log("Added new user to Firestore.");
              });
          }
        });
    }
  };

  signInOnFirestore = (email: string, password: string) => {
    if (email && password) {
      firebase
        .auth()
        .signInWithEmailAndPassword(email, password)
        .catch(error => {
          const errorMessage = error.message;
          console.log("Log-in error:", errorMessage);
          this.setState({
            logInSignUpError: true,
            toastMessage: "Wrong username and/or password!"
          });
        });
    }
  };

  handleGoogle = () => {
    var provider = new firebase.auth.GoogleAuthProvider();
    firebase
      .auth()
      .signInWithPopup(provider)
      .then(result => {
        console.log("Google login success.");
        if (result.user) {
          const { uid, displayName, email, photoURL } = result.user;

          this.setState({
            user: {
              ...this.state.user,
              uid: uid || "",
              displayName: displayName || "",
              email: email || "",
              photoURL: photoURL || ""
            }
          });
          // Storage.set({
          //   key: "user",
          //   value: JSON.stringify(user)
          // });
        }
      })
      .catch(function(error) {
        var errorMessage = error.message;
        alert("Google sign in error: " + errorMessage);
      });
  };

  toggleFavorite = async (checkpointId: string) => {
    const userRef = db.collection("users").doc(this.state.user.uid);
    const userData = await userRef.get();
    const user = userData.data();
    if (user) {
      let favorites = user.favorites;
      let favoritesArray = this.state.user.favoritesArray;

      if (!favorites[checkpointId]) {
        favorites[checkpointId] = 1;
        console.log("Added favorite.");
        const favoriteObj = await this.fetchFavoriteData(checkpointId);
        if (favoriteObj) {
          favoritesArray.push(favoriteObj);
        }
      } else {
        delete favorites[checkpointId];
        console.log("Deleted favorite.");
        favoritesArray = favoritesArray.filter(
          favorite => favorite.id !== checkpointId
        );
      }

      userRef.update({
        favorites
      });

      this.setState({
        user: { ...this.state.user, favorites, favoritesArray }
      });
    }
  };

  fetchFavoriteData = async (checkpointId: string) => {
    const checkpoint = await db
      .collection("checkpoints")
      .doc(checkpointId)
      .get();
    const checkpointData = checkpoint.data();

    if (checkpointData) {
      const checkpointName: string = checkpointData.name;
      return {
        id: checkpointId,
        name: checkpointName
      };
    } else {
      console.log("Could not find favorite in database beans/checkpoints.");
    }
  };

  addToStringBean = async (bean: LooseObject) => {
    //timestamp will be used as unique key value for My Stringbean .map rendering
    bean["timestamp"] = new Date().toString();

    let stringBeanArray = [];

    const localStorage = await Storage.get({ key: "stringbean" });
    if (localStorage.value) {
      stringBeanArray = JSON.parse(localStorage.value);
    }
    stringBeanArray.push(bean);

    this.setState({ stringbean: stringBeanArray });
    await Storage.set({
      key: "stringbean",
      value: JSON.stringify(stringBeanArray)
    });
    console.log("Added bean to current stringbean!");
  };

  removeFromStringBean = async (idx: number) => {
    let storage: any;
    let parsedStorageStringbean: Array<BusinessData>;

    storage = await Storage.get({
      key: "stringbean"
    });

    parsedStorageStringbean = JSON.parse(storage.value);
    parsedStorageStringbean.splice(idx, 1);

    this.setState({
      stringbean: parsedStorageStringbean
    });
    await Storage.set({
      key: "stringbean",
      value: JSON.stringify(parsedStorageStringbean)
    });
  };

  clearStorageOnPublish = async () => {
    await Storage.remove({ key: "stringbean" });
    this.setState({ stringbean: Array<BusinessData>() });
  };

  updateDisplayNameOrEmail = (displayNameOrEmail: string, type: string) => {
    if (type === "displayName") {
      this.setState({
        user: { ...this.state.user, displayName: displayNameOrEmail }
      });
    }
    if (type === "email") {
      this.setState({
        user: { ...this.state.user, email: displayNameOrEmail }
      });
    }
  };

  showMapErrorToast = () => {
    this.setState({
      toastMessage: "Location could not be determined.",
      showMapErrorToast: true
    });
    setTimeout(
      () => this.setState({ toastMessage: "", showMapErrorToast: false }),
      2000
    );
  };

  render() {
    if (this.state.loggedIn) {
      return (
        <IonApp>
          <IonReactRouter>
            <IonTabs>
              <IonRouterOutlet>
                <Route
                  path="/profile"
                  render={props => (
                    <Profile
                      {...props}
                      user={this.state.user}
                      favoritesArray={this.state.user.favoritesArray}
                      toggleFavorite={this.toggleFavorite}
                      addToStringBean={this.addToStringBean}
                      updateDisplayNameOrEmail={this.updateDisplayNameOrEmail}
                      mapErrorToastMessage={this.state.toastMessage}
                      showMapErrorToast={this.state.showMapErrorToast}
                    />
                  )}
                  exact={true}
                />
                <Route
                  path="/explore"
                  render={props => (
                    <Explore
                      {...props}
                      favorites={this.state.user.favorites}
                      toggleFavorite={this.toggleFavorite}
                      mapErrorToastMessage={this.state.toastMessage}
                      showMapErrorToast={this.state.showMapErrorToast}
                    />
                  )}
                  exact={true}
                />
                <Route
                  path="/create"
                  render={props => (
                    <Create
                      {...props}
                      favorites={this.state.user.favorites}
                      stringbean={this.state.stringbean}
                      toggleFavorite={this.toggleFavorite}
                      addToStringBean={this.addToStringBean}
                      removeFromStringBean={this.removeFromStringBean}
                      clearStorageOnPublish={this.clearStorageOnPublish}
                      mapErrorToastMessage={this.state.toastMessage}
                      showMapErrorToast={this.state.showMapErrorToast}
                      showMapErrorToastFunction={this.showMapErrorToast}
                    />
                  )}
                />
                <Route
                  path="/map"
                  render={props => (
                    <MapPage
                      {...props}
                      showMapErrorToastFunction={this.showMapErrorToast}
                    />
                  )}
                  exact={true}
                />
                <Route
                  path="/"
                  render={() => <Redirect to="/explore" />}
                  exact={true}
                />
              </IonRouterOutlet>
              <IonTabBar slot="bottom">
                <IonTabButton tab="profile" href="/profile">
                  <IonIcon icon={person} />
                  <IonLabel>Profile</IonLabel>
                </IonTabButton>
                <IonTabButton tab="explore" href="/explore">
                  <IonIcon icon={apps} />
                  <IonLabel>Explore</IonLabel>
                </IonTabButton>
                <IonTabButton tab="create" href="/create">
                  <IonIcon icon={add} />
                  <IonLabel>Create</IonLabel>
                </IonTabButton>
                {/* <IonTabButton tab="messages" href="/messages">
									<IonIcon icon={send} />
									<IonLabel>Messages</IonLabel>
								</IonTabButton> */}
              </IonTabBar>
            </IonTabs>
          </IonReactRouter>
        </IonApp>
      );
    }
    return (
      <Login
        handleGoogle={this.handleGoogle}
        handleSubmit={this.handleSubmit}
        resetLogInSignUpError={this.resetLogInSignUpError}
        logInSignUpError={this.state.logInSignUpError}
        toastMessage={this.state.toastMessage}
      />
    );
  }
}
// }

export default App;
