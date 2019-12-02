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
import { IonReactRouter } from "@ionic/react-router";
import { apps, flash, send } from "ionicons/icons";
import firebase from 'firebase'
import Tab1 from "./pages/Tab1";
import Home from "./pages/Tab2";
import CreateStory from "./pages/Tab3";
import Details from "./pages/Details";
import Login from './pages/Login'


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
import BeanMenu from "./pages/BeanMenu";
import { render } from "react-dom";
type State = {
	email: string | null
}
interface userObj {
	email:string | null
}

class App extends Component <{}, State > {
	state= {
		email:''
	}

	handleGoogle = (e?:any) => {
        //e.preventDefault();
        var provider = new firebase.auth.GoogleAuthProvider();
        firebase.auth().signInWithPopup(provider).then((result)=> {
          // This gives you a Google Access Token. You can use it to access the Google API.
          //var token = result.credential.accessToken;
          // The signed-in user info.
          //var user = result.user;
          console.log('Google login success')
		  console.log(result.user)
		  if (result.user) {
			this.setState({
				email:result.user.email
			})
		}
        //   props.history.push("/tab2")
          

        }).catch(function(error) {
          var errorMessage = error.message;
          alert("Google sign in error: "+ errorMessage);
        });
      }
	componentDidMount () {
		const user:userObj|null = firebase.auth().currentUser

	}
	render(){
	console.log('email',this.state.email)
	return (
this.state.email?
		(
		<IonApp>
			<IonReactRouter>
				<IonTabs>
					<IonRouterOutlet>
						<Route path="/tab1" component={Tab1} exact={true} />
						<Route path="/tab2" component={Home} exact={true} />
						<Route path="/tab2/details" component={Details} />
						<Route path="/tab3" component={CreateStory} />
						{/* <Route path="/tab4" component={BeanMenu} /> */}
						<Route
							path="/"
							render={() => <Redirect to="/tab2" />}
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
						{/* <IonTabButton tab="tab4" href="/tab4">
							<IonIcon icon={send} />
							<IonLabel>Tab Four</IonLabel>
						</IonTabButton> */}
					</IonTabBar>
				</IonTabs>
			</IonReactRouter>
		</IonApp>
	): (<Login handleGoogle = {this.handleGoogle}/>)
	)
	}
};
// }

export default App;
