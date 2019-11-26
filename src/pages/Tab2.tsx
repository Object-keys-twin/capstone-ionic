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
import db from "../firebase/firebase";
import "./Tab2.css";
const { Geolocation } = Plugins;

interface DbData {
	checkpoints: Array<string>;
	description: string;
	name: string;
	timestamp: object;
	upvotes: number;
	user: string;
}

type State = {
	tours: Array<DbData>;
};

class PublicTours extends Component<{}, State> {
	state = { tours: Array<DbData>() };

	componentDidMount() {
		this.getTours();
	}

	getTours = () => {
		db.collection("tours")
			.get()
			.then(docs => {
				docs.forEach(doc => {
					this.setState({
						tours: [
							...this.state.tours,
							{
								checkpoints: doc.data().checkpoints,
								description: doc.data().description,
								name: doc.data().name,
								timestamp: doc.data().timestamp,
								upvotes: doc.data().upvotes,
								user: doc.data().user
							}
						]
					});
					//console.log(this.state.tours);
				});
			});
		// .then(docs => (this.setState({tours: docs})))
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
		console.log(tours);
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
						{tours.map((tour, idx) => (
							<IonItem key={idx} onClick={() => {}} className="mainListRow">
								<IonLabel>{tour.name}</IonLabel>
								<IonList>
									{tour.checkpoints.map(checkpoint => (
										<IonItem>{checkpoint}</IonItem>
									))}
								</IonList>
							</IonItem>
						))}
					</IonList>
				</IonContent>
			</IonPage>
		);
	}
}

export default PublicTours;
