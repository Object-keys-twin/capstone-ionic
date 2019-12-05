import React, { Component } from "react";
import { connect } from "react-redux";
import "./Map.css";
// import {actions, RootState, selectors} from '../store';
import Map from "./MapView";
import {
  IonHeader,
  IonToolbar,
  IonButtons,
  IonMenuButton,
  IonTitle,
  IonContent,
  IonPage,
  IonButton,
  IonItem,
  IonIcon,
  IonLabel,
  IonFab,
  IonFabButton
} from "@ionic/react";
import { navigate } from "ionicons/icons";
import { Plugins } from "@capacitor/core";

type State = {
  latitude: number;
  longitude: number;
  link: string;
};

type Props = {
  location: any;
};

const { Geolocation } = Plugins;

class MapPage extends Component<Props, State> {
  state = {
    latitude: 0,
    longitude: 0,
    link: ""
  };

  componentDidMount = async () => {
    await this.getCurrentPosition();
    await this.launchGoogleMapsNav();
    console.log("props", this.props.location.state.checkpoints);
  };

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

  launchGoogleMapsNav = () => {
    if (this.props.location.state) {
      const { checkpoints } = this.props.location.state;
      let checkpointsString: string = "";
      for (let i = 0; i < checkpoints.length - 1; i++) {
        checkpointsString +=
          checkpoints[i].latitude + "%2C" + checkpoints[i].longitude + "%7C";
      }
      let lastCheckpoint: string = `${
        checkpoints[checkpoints.length - 1].latitude
      }%2C${checkpoints[checkpoints.length - 1].longitude}`;
      let newCheckpointsString = checkpointsString.slice(
        0,
        checkpointsString.length - 3
      );
      let googleUrl = `https://www.google.com/maps/dir/?api=1&origin=${this.state.latitude}%2C${this.state.longitude}&destination=${lastCheckpoint}&waypoints=${newCheckpointsString}`;
      this.setState({ link: googleUrl });
    }
  };
  render() {
    console.log(this.state);

    if (this.props.location.state) {
      const { checkpoints } = this.props.location.state;

      return (
        <IonPage>
          <IonHeader>
            <IonToolbar>
              <IonButtons slot="start"></IonButtons>
              <IonTitle>Map</IonTitle>
            </IonToolbar>
          </IonHeader>

          <IonContent class="map-page">
            {this.state.latitude ? (
              <IonContent>
                <Map
                  lat={this.state.latitude}
                  long={this.state.longitude}
                  checkpoints={checkpoints}
                />
                <IonFab vertical="bottom" horizontal="center" slot="fixed">
                  <IonFabButton
                    id="nav-button"
                    href={this.state.link}
                    target="_blank"
                  >
                    <IonIcon icon={navigate} id="icon" />
                  </IonFabButton>
                </IonFab>
              </IonContent>
            ) : (
              <IonItem>Finding location...</IonItem>
            )}
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
