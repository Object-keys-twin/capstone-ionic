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
import { Plugins } from "@capacitor/core";
import { getBusinesses } from "../store";
import { connect } from "react-redux";
import db from "../firebase/firebase";
const { Geolocation } = Plugins;

type State = {
	tours: Array<string>;
};

class PublicTours extends Component<{}, State> {
	async componentDidMount() {
		await this.setState({
			tours: []
		});
		this.getTours();
	}

	getTours = () => {
		db.collection("tours")
			.get()
			.then(docs => {
				docs.forEach(async doc => {
					await this.setState({
						tours: [...this.state.tours, doc.id]
					});
					console.log(this.state.tours);
				});
			});
	};

	// async getCurrentPosition() {
	// 	const coordinates = await Geolocation.getCurrentPosition();
	// 	this.setState({
	// 		latitude: coordinates.coords.latitude,
	// 		longitude: coordinates.coords.longitude
	// 	});
	// }

	// updateText() {
	// 	this.setState({ text });
	// }

	render() {
		return (
			<IonPage>
				<IonHeader>
					PUBLIC TOURS
					{/* <IonToolbar>
						{this.state.latitude === 0 ? (
							<IonTitle>Locating...</IonTitle>
						) : (
							<IonTitle>
								Lat: {this.state.latitude}, Long: {this.state.longitude}
							</IonTitle>
						)}
					</IonToolbar> */}
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

export default PublicTours;
