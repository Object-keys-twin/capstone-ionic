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

// interface Tours {
// 	checkpoints: Array<string>;
// }
// interface IState {
// 	tours: [];
// }
// type TourState = Tours[];

// const Tab2: React.FC = () => {
class PublicTours extends Component {
	// state = {
	// 	latitude: 0,
	// 	longitude: 0
	// };

	// state: IState;

	constructor({}) {
		super({});
		this.state = {
			tours: []
		};
	}

	componentDidMount() {
		// this.getCurrentPosition();
		this.getTours();
	}

	getTours = () => {
		db.collection("tours")
			.get()
			.then(docs => {
				docs.forEach(doc => {
					this.setState({ tours: [...this.state.tours, doc] });
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
