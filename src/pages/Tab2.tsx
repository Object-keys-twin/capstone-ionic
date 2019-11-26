import {
	IonContent,
	IonHeader,
	IonPage,
	IonTitle,
	IonToolbar,
	IonImg,
	IonFab,
	IonInput,
	IonList,
	IonItem,
	IonLabel
} from "@ionic/react";
import React, { Component } from "react";
import { Plugins } from "@capacitor/core";
import { getBusinesses } from "../store";
import { connect } from "react-redux";
import db from "../firebase/firebase";
const { Geolocation } = Plugins;

interface DbData {
	checkpoints: Array<string>;
	description: string;
	name: string;
	// timestamp: object;
	upvotes: number;
	user: string;
}

type State = {
	tours: Array<DbData>;
};

class PublicTours extends Component<{}, State> {
	state = {
		tours: []
	};

	componentDidMount() {
		this.getTours();
	}

	getTours = () => {
		db.collection("tours")
			.get()
			.then(docs => {
				docs.forEach(doc => {
					this.setState({
						tours: [...this.state.tours, doc.data()]
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
		const { tours } = this.state;
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
					<IonList>
						{tours.map(tour => (
							<IonItem>
								<IonLabel>tour</IonLabel>
							</IonItem>
						))}
					</IonList>
				</IonContent>
			</IonPage>
		);
	}
}

export default PublicTours;
