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
import { apps, flash, send } from "ionicons/icons";
import firebase from "firebase";
import Tab1 from "./pages/Tab1";
import Home from "./pages/Tab2";
import CreateStory from "./pages/Tab3";
import Details from "./pages/Details";
import MapPage from "./pages/Map";
import Login from "./pages/Login";

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
	email: string | null;
};

class App extends Component<{}, State> {
	state = {
		email: ""
	};

	componentDidMount = () => {
		this.getUser();
	};

	getUser = async () => {
		const data = await Storage.get({
			key: "user"
		});

		if (data.value) {
			const user = JSON.parse(data.value);
			this.setState({
				email: user.email
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
					this.setState({
						email: result.user.email
					});
					Storage.set({
						key: "user",
						value: JSON.stringify(result.user)
					});
				}
			})
			.catch(function(error) {
				var errorMessage = error.message;
				alert("Google sign in error: " + errorMessage);
			});
	};

	render() {
		if (this.state.email) {
			return (
				<IonApp>
					<IonReactRouter>
						<IonTabs>
							<IonRouterOutlet>
								<Route path="/tab1" component={Tab1} exact={true} />
								<Route path="/tab2" component={Home} exact={true} />
								<Route path="/tab2/details" component={Details} />
								<Route path="/tab3" component={CreateStory} />
								<Route path="/map" component={MapPage} exact={true} />
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
		return <Login handleGoogle={this.handleGoogle} />;
	}
}
// }

export default App;
