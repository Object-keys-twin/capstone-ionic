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
import {History} from 'history'
import { IonReactRouter } from "@ionic/react-router";
import { apps, flash, send } from "ionicons/icons";
import Tab1 from "./pages/Tab1";
import Login from "./pages/Login";
import Home from "./pages/Tab2";
import CreateStory from "./pages/Tab3";
import Details from "./pages/Details";
import {withRouter} from 'react-router'

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

import FirebaseWrapper from "./firebase/firebase";
import { firebaseConfig } from "./firebase/config";
import firebase  from 'firebase';



type State= {
	displayName: string;
	email:string;
	photoURL: string;
}

interface appHistory {
	history: History
}
class App extends Component <{}, State> {
	constructor(props:any) {
		super(props)
	}
	state= {
		displayName: '',
		email:'',
		photoURL: ''
	}

	signIn = async (): Promise<void>=> {
		const provider = new firebase.auth.GoogleAuthProvider();
        firebase.auth().signInWithPopup(provider)
        .then((result:any) => {
            // This gives you a Google Access Token. You can use it to access the Google API.
            if (result) {
                var token = result.credential.accessToken;
                console.log('token', token)
                // The signed-in user info.
                var user = result.user;
				console.log('user', user)
				this.setState({
						displayName: user.displayName,
						email: user.email,
						photoURL: user.photoURL
				})
            }
      
            // ...
          }).catch(function(error:any) {
            // Handle Errors here.
            var errorCode = error.code;
            console.log(errorCode)
            var errorMessage = error.message;
            console.log(errorMessage)
            // The email of the user's account used.
            var email = error.email;
            // The firebase.auth.AuthCredential type that was used.
            var credential = error.credential;
            // ...
          })
        
        } 
		
	render() {
		return(
		this.state.displayName?  (
		<IonApp>
			<IonReactRouter>
				<IonTabs>
					<IonRouterOutlet>
					{/* <Route path="/login" render={(props) => <Login {...props} signIn={this.signIn}/>} exact={true} /> */}
						<Route path="/tab1" render={(props) => <Tab1 {...props} user={this.state}/>}exact={true} />
						<Route path="/tab2" component={Home} exact={true} />
						<Route path="/tab2/details" component={Details} />
						<Route path="/tab3" component={CreateStory} />
						<Route
							path="/"
							render={() =><Redirect to="/tab2"  />}
							exact={true}
						/>
					</IonRouterOutlet>
					<IonTabBar slot="bottom">
						<IonTabButton tab="tab1" href="/tab1">
							<IonIcon icon={flash} />
							<IonLabel>Home</IonLabel>
						</IonTabButton>
						<IonTabButton tab="tab2" href="/tab2">
							<IonIcon icon={apps} />
							<IonLabel>Tab Two</IonLabel>
						</IonTabButton>
						<IonTabButton tab="tab3" href="/tab3">
							<IonIcon icon={send} />
							<IonLabel>Tab Three</IonLabel>
						</IonTabButton>
					</IonTabBar>
				</IonTabs>
			</IonReactRouter>
		</IonApp>
	): (<Login signIn={this.signIn}/>)
		)}
}
// }

export default App;
