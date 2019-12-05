import React, { Component } from "react";
import { connect } from "react-redux";
// import {actions, RootState, selectors} from '../store';
import Map from "./MapView";
import {
	IonHeader,
	IonToolbar,
	IonButtons,
	IonMenuButton,
	IonTitle,
	IonContent,
	IonPage
} from "@ionic/react";
import { Plugins } from "@capacitor/core";

type State = {
	latitude: number;
	longitude: number;
};

type Props = {
	location: any;
};

const { Geolocation } = Plugins;

class MapPage extends Component<Props, State> {
	state = {
		latitude: 0,
		longitude: 0
	};

	componentDidMount() {
		this.getCurrentPosition();
		console.log("props", this.props.location.state.checkpoints);
	}

	getCurrentPosition = async () => {
		const coordinates = await Geolocation.getCurrentPosition();
		this.setState({
			latitude: coordinates.coords.latitude,
			longitude: coordinates.coords.longitude
		});
	};

	// setInterval = (callback: (fn: any) => void, time: number) => {
	// 	callback(this.getCurrentPosition()), 3000;
	// };

	render() {
		console.log(this.state);

		if (this.props.location.state) {
			const { checkpoints } = this.props.location.state;

			return (
				<IonPage>
					<IonHeader>
						<IonToolbar>
							<IonButtons slot="start">
								<IonMenuButton></IonMenuButton>
							</IonButtons>
							<IonTitle>Map</IonTitle>
						</IonToolbar>
					</IonHeader>
					<IonContent class="map-page">
						<Map
							lat={this.state.latitude}
							long={this.state.longitude}
							checkpoints={checkpoints}
						/>
					</IonContent>
				</IonPage>
			);
		}
		return (
			<IonPage>
				<IonContent>Loading...</IonContent>
			</IonPage>
		);
	}
}

// const mapDispatchToProps = {
//     addLocation: (location: Location) => actions.locations.updateLocations(location)
// };

// const mapStateToProps = (state: RootState) => ({
//     locations: selectors.locations.allLocations(state.locations),
//     mapCenter: selectors.locations.mapCenter(state.locations),
//     userLocationRetrieved: state.locations.userLocationRetrieved
// });

export default MapPage;
