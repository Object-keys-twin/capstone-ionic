import {
	IonContent,
	IonHeader,
	IonPage,
	IonTitle,
	IonToolbar,
	IonImg,
	IonFab,
	IonInput
} from "@ionic/react";
import React, { Component } from "react";

export class Home extends Component {
	state = {
		text: ""
	};

	// updateText() {
	// 	this.setState({ text });
	// }

	render() {
		return (
			<IonPage>
				<IonHeader>
					<IonToolbar>
						<IonTitle>Ionic Blank</IonTitle>
					</IonToolbar>
				</IonHeader>
				<IonContent className="ion-padding">
					<IonInput
						placeholder="Enter post"
						// onIonChange={this.updateText}
					></IonInput>
				</IonContent>
			</IonPage>
		);
	}
}
export default Home;
