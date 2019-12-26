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
import Profile from "./pages/Tab1";
import Home from "./pages/Tab2";
import CreateStory from "./pages/Tab3";
import MapPage from "./pages/Map";
import Login from "./pages/Login";

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

type State = {
  user: userData | null;
  loggedIn: boolean;
  logInError: boolean;
  signUpError: boolean;
  toastMessage: string;
};

interface userData {
  email: string | null;
  uid?: string | null;
  displayName: string | null;
  photoURL: string | null;
  password: string;
}

class App extends Component<{}, State> {
  state = {
    user: {
      email: "",
      uid: "",
      displayName: "",
      photoURL: "",
      password: ""
    },
    loggedIn: false,
    logInError: false,
    signUpError: false,
    toastMessage: ""
  };

  componentDidMount = () => {
    this.getUser();
    firebase.auth().onAuthStateChanged(user => {
      if (user) {
        console.log("Currently logged in!");
        let userObj = {
          ...this.state.user
        };
        userObj = {
          email: user.email || "",
          uid: user.uid || "",
          displayName: user.displayName || "",
          photoURL: user.photoURL || "",
          password: ""
        };
        this.setState({
          user: userObj,
          loggedIn: true,
          logInError: false,
          signUpError: false
        });
        Storage.set({
          key: "user",
          value: JSON.stringify(user)
        });
        console.log("logged in user", user);
      } else {
        console.log("Not logged in.");
        this.setState({ loggedIn: false });
        Storage.remove({
          key: "user"
        });
      }
    });
  };

  getUser = async () => {
    const data = await Storage.get({
      key: "user"
    });

    if (data.value) {
      const user = JSON.parse(data.value);
      this.setState({
        user: user,
        loggedIn: true
      });
    }
  };

  handleSubmit = (user: userData, type?: string) => {
    if (!user.email) {
      this.setState({
        logInError: true,
        signUpError: true,
        toastMessage: "Please enter an email address."
      });
    } else if (!user.password) {
      this.setState({
        logInError: true,
        signUpError: true,
        toastMessage: "Please enter a password."
      });
    }
    // if (user.email && user.password)
    else {
      if (type === "signup") {
        this.createUserOnFirestore(user.email, user.password);
      } else {
        this.signInOnFirestore(user.email, user.password);
      }
    }
  };

  resetLogInError = () => {
    this.setState({ logInError: false, signUpError: false, toastMessage: "" });
  };

  createUserOnFirestore = (email: string, password: string) => {
    if (email && password) {
      firebase
        .auth()
        .createUserWithEmailAndPassword(email, password)
        .catch(function(error) {
          const errorCode = error.code;
          const errorMessage = error.message;
          console.log("Sign-up error:", errorCode, errorMessage);
        });
      this.setState({
        signUpError: true,
        toastMessage:
          "Invalid email and/or password! Passwords must be at least 6 characters."
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
            logInError: true,
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
          const user = {
            uid: uid,
            displayName: displayName,
            email: email,
            photoURL: photoURL
          };
          this.setState({
            user: {
              ...this.state.user,
              uid: uid,
              displayName: displayName,
              email: email,
              photoURL: photoURL
            }
          });
          Storage.set({
            key: "user",
            value: JSON.stringify(user)
          });
        }
      })
      .catch(function(error) {
        var errorMessage = error.message;
        alert("Google sign in error: " + errorMessage);
      });
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
                <Route path="/explore" component={Home} exact={true} />
                <Route path="/create" component={CreateStory} />
                <Route path="/map" component={MapPage} exact={true} />
                {/* <Route path="/signup" component={SignUp} exact={true} /> */}
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
        resetLogInError={this.resetLogInError}
        logInError={this.state.logInError}
        signUpError={this.state.signUpError}
        toastMessage={this.state.toastMessage}
      />
    );
  }
}
// }

export default App;
