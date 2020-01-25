import React, { Component } from "react";
import "./Map.css";

import Map from "./MapView";
import {
  IonContent,
  IonPage,
  IonIcon,
  IonFab,
  IonFabButton,
  IonSpinner
} from "@ionic/react";
import { navigate } from "ionicons/icons";
import { Plugins } from "@capacitor/core";

interface CheckpointData {
  id: string;
  name: string;
  location: string;
  imageUrl: string;
  categories: Array<object>;
  rating?: number;
  latitude: number;
  longitude: number;
  price?: string | undefined;
}

interface DbData {
  checkpoints: Array<CheckpointData>;
  description: string;
  name: string;
  created: Date;
  upvotes: number;
  user: string;
}

type State = {
  latitude: number;
  longitude: number;
  link: string;
};

type Props = {
  location: { state: DbData };
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
  };

  getCurrentPosition = async () => {
    const coordinates = await Geolocation.getCurrentPosition();
    this.setState({
      latitude: coordinates.coords.latitude,
      longitude: coordinates.coords.longitude
    });
  };

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
      let googleUrl = `https://www.google.com/maps/dir/?api=1&origin=${this.state.latitude}%2C${this.state.longitude}&destination=${lastCheckpoint}&travelmode=walking&waypoints=${newCheckpointsString}`;
      this.setState({ link: googleUrl });
    }
  };
  render() {
    if (this.props.location.state) {
      const { checkpoints } = this.props.location.state;

      return (
        <IonPage>
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
              <IonContent>
                <IonSpinner class="spinner"></IonSpinner>
              </IonContent>
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

export default MapPage;
