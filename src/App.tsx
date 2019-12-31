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
// import { Plugins } from "@capacitor/core";
import { IonReactRouter } from "@ionic/react-router";
import { apps, person, add } from "ionicons/icons";
import firebase from "firebase";
import Profile from "./pages/Tab1";
import Home from "./pages/Tab2";
import CreateStory from "./pages/Tab3";
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

// const { Storage } = Plugins;

type State = {
  user: userData | null;
  loggedIn: boolean;
  logInSignUpError: boolean;
  toastMessage: string;
};

interface userData {
  email: string;
  uid?: string;
  displayName: string;
  photoURL: string;
  password: string;
  favorites: object;
}

class App extends Component<{}, State> {
  state = {
    user: {
      email: "",
      uid: "",
      displayName: "",
      photoURL: "",
      password: "",
      favorites: {}
    },
    loggedIn: false,
    logInSignUpError: false,
    toastMessage: ""
  };

  componentDidMount = () => {
    // this.getUser();
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

        let favorites = {};
        const getUser = await db
          .collection("users")
          .doc(user.uid)
          .get();
        const userData = getUser.data();
        if (userData) {
          favorites = userData.favorites;
        }
        this.setState({
          user: { ...this.state.user, ...userObj, favorites },
          loggedIn: true
        });
        // Storage.set({
        //   key: "user",
        //   value: JSON.stringify(user)
        // });
        console.log("Logged in firebase user:", user);
      } else {
        console.log("Not logged in.");
        this.setState({ loggedIn: false });
        // Storage.remove({
        //   key: "user"
        // });
      }
    });
  };

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

  handleSubmit = (user: userData, type?: string) => {
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
      //do a lookup in firebase to make sure the displayName isn't already taken, and maybe email too? or is that builtin
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
              "Invalid email and/or password! Passwords must be at least 6 characters."
          });
        })
        .then(async () => {
          let user = firebase.auth().currentUser;
          if (user) {
            //updateProfile takes longer than setState and the onAuthStateChanged listener reaction, so in onAuthStateChanged, need to grab the displayName from state instead of the firebase user data when updating state
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
              favorites: {},
              friends: {}
            };

            await db
              .collection("users")
              .doc(user.uid)
              .set(newUser)
              .then(() => {
                console.log("Added new user.");
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
          var errorCode = error.code;
          var errorMessage = error.message;
          console.log("Log-in error:", errorCode, errorMessage);
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
        console.log("Google login success");
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

      if (!favorites[checkpointId]) {
        favorites[checkpointId] = 1;
        console.log("Added favorite.");
      } else {
        delete favorites[checkpointId];
        console.log("Deleted favorite.");
      }
      userRef.update({
        favorites
      });

      this.setState({
        user: { ...this.state.user, favorites }
      });
    }
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
                    <Profile {...props} user={this.state.user} />
                  )}
                  exact={true}
                />
                <Route
                  path="/explore"
                  render={props => (
                    <Home
                      {...props}
                      favorites={this.state.user.favorites}
                      toggleFavorite={this.toggleFavorite}
                    />
                  )}
                  exact={true}
                />
                <Route
                  path="/create"
                  render={props => (
                    <CreateStory
                      {...props}
                      favorites={this.state.user.favorites}
                      toggleFavorite={this.toggleFavorite}
                    />
                  )}
                />
                <Route path="/map" component={MapPage} exact={true} />
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
                {/* <IonTabButton tab="map" href="/map">
									<IonIcon icon={send} />
									<IonLabel>Map</IonLabel>
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
