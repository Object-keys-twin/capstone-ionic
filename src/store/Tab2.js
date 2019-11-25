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
import { getBusinesses } from ".";
import { connect } from "react-redux";
const { Geolocation } = Plugins;

export class Home extends Component {
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

	// updateText() {
	// 	this.setState({ text });
	// }

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

const mapState = state => ({
	businesses: state.businesses
});

const mapDispatch = dispatch => ({
	getBusinesses: (lat, long) => dispatch(getBusinesses(lat, long))
});

export default connect(mapState, mapDispatch)(Home);
