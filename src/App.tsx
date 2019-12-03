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
import Tab1 from "./pages/Tab1";
import Home from "./pages/Tab2";
import CreateStory from "./pages/Tab3";
import Details from "./pages/Details";
import MapPage from "./pages/Map";

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

const App: React.FC = () => {
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
						{/* <Route path="/tab4" component={BeanMenu} /> */}
						<Route
							path="/"
							render={() => <Redirect to="/tab1" />}
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
						<IonTabButton tab="map" href="/map">
							<IonIcon icon={send} />
							<IonLabel>Map</IonLabel>
						</IonTabButton>
						{/* <IonTabButton tab="tab4" href="/tab4">
							<IonIcon icon={send} />
							<IonLabel>Tab Four</IonLabel>
						</IonTabButton> */}
					</IonTabBar>
				</IonTabs>
			</IonReactRouter>
		</IonApp>
	);
};
// }

export default App;
