import {
  IonCard,
  IonCardContent,
  IonCardTitle,
  IonContent,
  IonHeader,
  IonItem,
  IonPage,
  IonTitle,
  IonIcon,
  IonImg,
  IonFab,
  IonFabButton,
  IonFabList,
  IonModal,
  IonButton,
  IonList,
  IonItemSliding,
  IonItemOption,
  IonItemOptions
} from "@ionic/react";
// import { RefresherEventDetail } from "@ionic/core";
import React, { Component } from "react";

import { create, heart, logOut, settings, trash } from "ionicons/icons";
import { Link } from "react-router-dom";
import axios from "axios";
import firebase from "firebase";
import db from "../firebase/firebase";
import { yelpApiKey } from "../secrets";

import "./Tab1.css";

interface FavoriteObj {
  id: string;
  name: string;
}

interface BusinessData {
  id: string;
  name: string;
  location: object;
  imageUrl: string;
  categories: Array<object>;
  rating?: number;
  latitude: number;
  longitude: number;
  price?: string | undefined;
}

type Props = {
  user: userData;
  toggleFavorite: (checkpointId: string) => void;
  favoritesArray: Array<FavoriteObj>;
};

type State = {
  tours: Array<DbData>;
  favoritesModal: boolean;
  addCheckpointModal: boolean;
  currentFavoriteData: BusinessData;
};

interface DbData {
  checkpoints: Array<any>;
  description: string;
  name: string;
  created: object;
  upvotes: number;
  user: string;
}

interface userData {
  email: string;
  uid: string;
  displayName: string;
  photoURL: string;
}

class Profile extends Component<Props, State> {
  state = {
    tours: Array<DbData>(),
    favoritesModal: false,
    addCheckpointModal: false,
    currentFavoriteData: {
      id: "",
      name: "",
      location: {},
      imageUrl: "",
      categories: [],
      rating: 0,
      latitude: 0,
      longitude: 0,
      price: ""
    }
  };

  componentDidMount() {
    this.getUserTours();
  }

  getUserTours = () => {
    db.collection("tours")
      .where("user", "==", this.props.user.displayName || this.props.user.email)
      .onSnapshot(querySnapshot => {
        let tourData = Array<DbData>();
        querySnapshot.forEach(doc => {
          tourData.push({
            checkpoints: doc.data().checkpoints,
            description: doc.data().description,
            name: doc.data().name,
            created: doc.data().timestamp,
            upvotes: doc.data().upvotes,
            user: doc.data().user
          });
        });

        this.setState({ tours: tourData });

        this.state.tours.forEach((tour, id) => {
          this.getCheckpoints(tour, id);
        });
      });
  };

  getCheckpoints = async (tour: any, idx: number) => {
    let checkpointsWithData: any = [];
    for (let i = 0; i < tour.checkpoints.length; i++) {
      const checkpoint = await db
        .collection("checkpoints")
        .doc(`${tour.checkpoints[i]}`)
        .get();
      checkpointsWithData.push(checkpoint.data());
    }

    let tours = this.state.tours;
    tours.forEach((el, i) => {
      if (i === idx) el.checkpoints = checkpointsWithData;
    });
    this.setState({ tours });
  };

  signOut = () => {
    firebase
      .auth()
      .signOut()
      .then(function() {
        // Sign-out successful.
      })
      .catch(function(error) {
        // An error happened.
      });
  };

  getBusinessFromYelp = async (businessId: string) => {
    const api = axios.create({
      baseURL: "https://cors-anywhere.herokuapp.com/https://api.yelp.com/v3",
      headers: {
        Authorization: `Bearer ${yelpApiKey}`
      }
    });
    const { data } = await api.get("/businesses/{id}", {
      params: {
        id: businessId
      }
    });

    const info = data.businesses.map((business: any) => ({
      id: business.id,
      name: business.name,
      location:
        business.location.display_address[0] +
        ", " +
        business.location.display_address[1],
      latitude: business.coordinates.latitude,
      longitude: business.coordinates.longitude,
      price: business.price,
      imageUrl: business.image_url,
      categories: business.categories,
      rating: business.rating
    }));

    this.setState({ currentFavoriteData: info });
  };

  render() {
    return (
      <IonPage>
        <IonHeader class="tab-header-block">
          <IonTitle size="small" class="tab-header header-font">
            My Profile
          </IonTitle>
          <IonFab vertical="top" horizontal="end">
            <IonFabButton id="settings-button">
              <IonIcon class="settings-tray-icon" icon={settings} />
            </IonFabButton>
            <IonFabList side="bottom" id="profile-settings-tray">
              <IonFabButton
                class="settings-tray-button"
                id="favorites-button"
                onClick={() => {
                  this.setState({ favoritesModal: true });
                }}
              >
                <IonIcon
                  class="settings-tray-icon favorites-icon"
                  icon={heart}
                />
              </IonFabButton>
              <IonFabButton class="settings-tray-button" id="edit-button">
                <IonIcon class="settings-tray-icon" icon={create} />
              </IonFabButton>
              <IonFabButton
                class="settings-tray-button"
                id="logout-button"
                onClick={this.signOut}
              >
                <IonIcon class="settings-tray-icon" icon={logOut} />
              </IonFabButton>
            </IonFabList>
          </IonFab>
        </IonHeader>
        <IonContent className="beancontent">
          <IonCard class="profile-card">
            <IonImg
              id="profile-photo"
              src={this.props.user.photoURL || "assets/icon/bean-profile.png"}
            />

            <IonCardTitle id="profile-text">
              Welcome, {this.props.user.displayName || this.props.user.email}!
            </IonCardTitle>
          </IonCard>
          <IonCard id="string-bean-title-card">
            <IonCardTitle className="string-bean-title">
              My Stringbeans
            </IonCardTitle>
          </IonCard>
          {this.state.tours.map((tour, i) => (
            <IonCard className="stringbean-card" key={i}>
              <Link
                className="stringbean-link"
                to={{
                  pathname: "/map",
                  state: { checkpoints: tour.checkpoints }
                }}
              >
                <IonItem lines="none" className="stringbean-header-container">
                  {tour.name}
                </IonItem>

                <IonCardContent>
                  {tour.checkpoints.map((checkpoint, i) => {
                    if (checkpoint) {
                      return (
                        <IonItem lines="none" key={i}>
                          {checkpoint.name}
                        </IonItem>
                      );
                    }
                  })}
                </IonCardContent>
              </Link>
            </IonCard>
          ))}

          <IonModal isOpen={this.state.favoritesModal}>
            <IonHeader>
              <IonTitle
                size="small"
                class="tab-header header-font"
                id="favorites-header"
              >
                My Favorites
              </IonTitle>
            </IonHeader>

            <IonContent>
              <IonList>
                {this.props.favoritesArray.map(favorite => {
                  return (
                    <IonItemSliding key={favorite.id}>
                      <IonItem lines="none">{favorite.name}</IonItem>
                      <IonItemOptions side="end">
                        <IonItemOption
                          color="danger"
                          onClick={() => {
                            this.props.toggleFavorite(favorite.id);
                          }}
                        >
                          <IonIcon slot="icon-only" icon={trash}></IonIcon>
                        </IonItemOption>
                      </IonItemOptions>
                    </IonItemSliding>
                  );
                })}
              </IonList>
            </IonContent>

            <IonButton
              class="modal-button"
              id="favorites-modal-button-back"
              onClick={() => {
                this.setState({ favoritesModal: false });
              }}
            >
              Back To My Profile
            </IonButton>
          </IonModal>
          <IonModal isOpen={this.state.addCheckpointModal}>
            <IonHeader>
              <IonTitle
                size="small"
                class="tab-header header-font"
                id="favorites-header"
              >
                My Favorites
              </IonTitle>
            </IonHeader>
          </IonModal>
        </IonContent>
      </IonPage>
    );
  }
}

export default Profile;
