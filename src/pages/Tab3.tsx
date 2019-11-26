import React, { Component } from "react";
import {
	IonHeader,
	IonToolbar,
	IonPage,
	IonTitle,
	IonContent,
	IonSearchbar
} from "@ionic/react";
import { Plugins } from "@capacitor/core";

const { Geolocation } = Plugins;

class CreateStory extends Component {
	state = {
		latitude: 0,
		longitude: 0
	};

	componentDidMount() {
		this.getCurrentPosition();
	}

	async getCurrentPosition() {
		const coordinates = await Geolocation.getCurrentPosition();
		this.setState({
			latitude: coordinates.coords.latitude,
			longitude: coordinates.coords.longitude
		});
	}

	// handleChange(e: HTMLInputElement);
	render() {
		return (
			<IonPage>
				<IonHeader>
					<IonToolbar>
						{this.state.latitude === 0 ? (
							<IonTitle>Locating...</IonTitle>
						) : (
							<IonTitle>
								Lat: {this.state.latitude}, Long: {this.state.longitude}
							</IonTitle>
						)}
					</IonToolbar>
				</IonHeader>
				{/* <IonSearchbar onIonChange={}></IonSearchbar> */}
				<IonContent />
			</IonPage>
		);
	}
}

export default CreateStory;
