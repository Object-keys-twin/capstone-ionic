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
import React, { Component, useRef } from "react";

import { create, heart, logOut, settings, trash } from "ionicons/icons";
import { Link } from "react-router-dom";
import "./Tab1.css";
import firebase from "firebase";
import db from "../firebase/firebase";

type Props = {
  user: userData;
  favorites: { [key: string]: any };
  toggleFavorite: (checkpointId: string) => void;
};

type State = {
  tours: Array<DbData>;
  favoritesModal: boolean;
  favoritesArray: Array<object>;
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
    favoritesArray: Array<any>()
  };

  componentDidMount() {
    // this.getTours();

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
  }

  // refresh = (e: CustomEvent<RefresherEventDetail>) => {
  //   setTimeout(() => {
  //     this.getTours();
  //     e.detail.complete();
  //   }, 2000);
  // };

  // getTours = () => {
  //   let tourData = Array<DbData>();
  //   db.collection("tours")
  //     .where("user", "==", this.props.user.email)
  //     .get()
  //     .then(docs => {
  //       docs.forEach(doc => {
  //         tourData.push({
  //           checkpoints: doc.data().checkpoints,
  //           description: doc.data().description,
  //           name: doc.data().name,
  //           created: doc.data().timestamp,
  //           upvotes: doc.data().upvotes,
  //           user: doc.data().user
  //         });
  //       });
  //       this.setState({ tours: tourData });
  //       this.state.tours.forEach((tour, id) => {
  //         this.getCheckpoints(tour, id);
  //       });
  //     });
  // };

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

  fetchFavoritesData = async () => {
    let favoritesArray = [];
    for (let favorite in this.props.favorites) {
      const checkpoint = await db
        .collection("checkpoints")
        .doc(favorite)
        .get();
      const checkpointData = checkpoint.data();

      if (checkpointData) {
        const checkpointName = checkpointData.name;
        const favoriteObj = {
          id: favorite,
          name: checkpointName
        };
        favoritesArray.push(favoriteObj);
      } else {
        console.log("Could not find favorite in database checkpoints.");
      }
    }
    this.setState({ favoritesArray });
  };

  deleteFavorite = (favoriteId: string) => {
    const shortenedFavorites = this.state.favoritesArray.filter(
      favorite => favorite.id !== favoriteId
    );
    this.setState({ favoritesArray: shortenedFavorites });
  };

  render() {
    this.fetchFavoritesData();
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

          <IonModal isOpen={this.state.favoritesModal} id="favorites-modal">
            <IonHeader>
              <IonTitle
                size="small"
                class="tab-header header-font"
                id="favorites-header"
              >
                My Favorites
              </IonTitle>
            </IonHeader>
            {this.state.favoritesArray.length ? (
              <IonContent>
                <IonList>
                  {this.state.favoritesArray.map(favorite => {
                    let ref: any;
                    return (
                      <IonItemSliding
                        key={favorite.id}
                        ref={element => {
                          ref = element;
                        }}
                      >
                        <IonItem lines="none">{favorite.name}</IonItem>
                        <IonItemOptions side="end">
                          <IonItemOption
                            color="danger"
                            onClick={() => {
                              this.deleteFavorite(favorite.id);
                              this.props.toggleFavorite(favorite.id);

                              // ref.close();
                            }}
                          >
                            <IonIcon slot="icon-only" icon={trash}></IonIcon>
                          </IonItemOption>
                        </IonItemOptions>
                      </IonItemSliding>
                    );
                  })}
                  {/* I can't map because favorites is an object not an array. so i need to iterate through the favorites object, look up each id in the database's checkpoints and grab the checkpoint name. then push the name and the id into an array of objects, where each object has two keys, name and id. then i can map through the array to render it. each list item in the array will have a heart, and onclick it will need to use the id to call toggleFavorite. but then it will also need to live update the heart icon. i guess when toggleFavorite is called in App.tsx, it will re-render everything? and the iterating through favorites object function might be called automatically? */}
                </IonList>
              </IonContent>
            ) : (
              <IonContent></IonContent>
            )}
            <IonButton
              class="modal-button"
              onClick={() => {
                this.setState({ favoritesModal: false });
              }}
            >
              Back
            </IonButton>
          </IonModal>
        </IonContent>
      </IonPage>
    );
  }
}

export default Profile;
