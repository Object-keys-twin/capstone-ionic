import React, { Component } from 'react';
import {connect} from 'react-redux';
// import {actions, RootState, selectors} from '../store';
import Map from './MapView';
import {IonHeader, IonToolbar, IonButtons, IonMenuButton, IonTitle, IonContent} from '@ionic/react';
// import {Location} from '../store/locations/types';
import {Plugins} from '@capacitor/core';

type State = {
	latitude: number;
	longitude: number;
}

const {Geolocation} = Plugins;

class MapPage extends Component <{}, State> {
	state = {
		latitude: 0,
		longitude: 0,
	}

	componentDidMount() {
		this.getCurrentPosition();
	}

	getCurrentPosition = async () => {
		const coordinates = await Geolocation.getCurrentPosition();
		this.setState(
			{
				latitude: coordinates.coords.latitude,
				longitude: coordinates.coords.longitude
			}
		);
	};
		render (){
    return (
        <>
            <IonHeader>
                <IonToolbar>
                    <IonButtons slot="start">
                        <IonMenuButton></IonMenuButton>
                    </IonButtons>
                    <IonTitle>Map</IonTitle>
                </IonToolbar>
            </IonHeader>

            <IonContent class="map-page">
                <Map lat = {this.state.latitude} long = {this.state.longitude}/>
            </IonContent>
        </>
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

export default MapPage
