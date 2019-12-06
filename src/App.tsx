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
import Details from "./pages/Details";
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
    loggedIn: false
  };

  componentDidMount = () => {
    this.getUser();
    firebase.auth().onAuthStateChanged(user => {
      if (user) {
        console.log("Currently logged in!");
        this.setState({ loggedIn: true });
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
    if (type === "signup") {
      this.createUserOnFirestore(user.email, user.password);
    } else {
      this.signInOnFirestore(user.email, user.password);
    }
  };

  createUserOnFirestore = (email: string | null, password: string | null) => {
    if (email && password) {
      firebase
        .auth()
        .createUserWithEmailAndPassword(email, password)
        .catch(function(error) {
          const errorCode = error.code;
          const errorMessage = error.message;
          console.log("Sign-up error:", errorCode, errorMessage);
        });
    }
  };

  signInOnFirestore = (email: string | null, password: string | null) => {
    if (email && password) {
      firebase
        .auth()
        .signInWithEmailAndPassword(email, password)
        .catch(function(error) {
          var errorCode = error.code;
          var errorMessage = error.message;
          console.log("Log-in error:", errorCode, errorMessage);
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
    //!this.state.user.email
    if (this.state.loggedIn) {
      return (
        <IonApp id="app">
          <IonReactRouter>
            <IonTabs>
              <IonRouterOutlet>
                <Route
                  path="/tab1"
                  render={props => (
                    <Profile {...props} user={this.state.user} />
                  )}
                  exact={true}
                />
                <Route path="/tab2" component={Home} exact={true} />
                <Route path="/tab2/details" component={Details} />
                <Route path="/tab3" component={CreateStory} />
                <Route path="/map" component={MapPage} exact={true} />
                {/* <Route path="/signup" component={SignUp} exact={true} /> */}
                <Route
                  path="/"
                  render={() => <Redirect to="/tab2" />}
                  exact={true}
                />
              </IonRouterOutlet>
              <IonTabBar slot="bottom">
                <IonTabButton tab="tab1" href="/tab1">
                  <IonIcon icon={person} />
                  <IonLabel>Profile</IonLabel>
                </IonTabButton>
                <IonTabButton tab="tab2" href="/tab2">
                  <IonIcon icon={apps} />
                  <IonLabel>Tours</IonLabel>
                </IonTabButton>
                <IonTabButton tab="tab3" href="/tab3">
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
      />
    );
  }
}
// }

export default App;
