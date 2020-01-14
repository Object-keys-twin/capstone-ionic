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
  IonItemOptions,
  IonGrid,
  IonRow,
  IonText,
  IonSkeletonText,
  IonCol
} from "@ionic/react";
import React, { Component } from "react";

import {
  create,
  heart,
  logOut,
  settings,
  trash,
  arrowDroprightCircle
} from "ionicons/icons";
import { Link } from "react-router-dom";
import firebase from "firebase";
import db from "../firebase/firebase";

import "./Tab1.css";

interface FavoriteObj {
  id: string;
  name: string;
}

// interface BusinessData {
//   id: string;
//   name: string;
//   location: string;
//   imageUrl: string;
//   categories: Array<object>;
//   rating?: number;
//   latitude: number;
//   longitude: number;
//   price?: string | undefined;
// }

type Props = {
  user: userData;
  toggleFavorite: (checkpointId: string) => void;
  favoritesArray: Array<FavoriteObj>;
  addToStringBean: (business: object) => void;
};

type State = {
  tours: Array<DbData>;
  favoritesModal: boolean;
  addCheckpointModal: string;
  currentFavoriteData: object;
  showSkeleton: boolean;
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
    addCheckpointModal: "",
    currentFavoriteData: {
      id: "",
      name: "",
      location: "",
      imageUrl: "",
      categories: [],
      rating: 0,
      latitude: 0,
      longitude: 0,
      price: ""
    },
    showSkeleton: false
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

  getBusinessFromFirestore = async (businessId: string) => {
    this.setState({ showSkeleton: true });

    const business = await db
      .collection("checkpoints")
      .doc(`${businessId}`)
      .get();
    const businessObj = business.data();

    if (businessObj) {
      this.setState({ currentFavoriteData: businessObj, showSkeleton: false });
    }
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
              <IonItem lines="none" class="stringbean-header-container">
                <IonGrid class="checkpoint-row stringbean-header">
                  <IonCol class="list-checkpoint-col">
                    <IonRow>{tour.name}</IonRow>
                  </IonCol>
                  <IonCol class="list-favorites-col">
                    <Link
                      className="stringbean-link"
                      to={{
                        pathname: "/map",
                        state: { checkpoints: tour.checkpoints }
                      }}
                    >
                      <IonIcon
                        class="list-favorites-icon"
                        icon={arrowDroprightCircle}
                      ></IonIcon>
                    </Link>
                  </IonCol>
                </IonGrid>
              </IonItem>

              <IonCardContent class="stringbean-card-content">
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

            <IonContent class="modal-content">
              <IonList>
                {this.props.favoritesArray.map(favorite => {
                  return (
                    <IonItemSliding key={favorite.id}>
                      <IonItem
                        class="favorites-list-name"
                        lines="none"
                        onClick={() => {
                          this.setState({ addCheckpointModal: favorite.id });
                          this.getBusinessFromFirestore(favorite.id);
                        }}
                      >
                        {favorite.name}
                      </IonItem>
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
                      <IonModal
                        isOpen={favorite.id === this.state.addCheckpointModal}
                      >
                        <IonGrid class="modal-grid">
                          <IonRow class="modal-info">
                            {this.state.showSkeleton ? (
                              <IonGrid class="modal-info-grid">
                                <IonRow class="modal-info-text modal-name">
                                  <IonSkeletonText
                                    animated
                                    width="70vw"
                                    class="skeleton-name"
                                  ></IonSkeletonText>
                                </IonRow>
                                <IonRow class="modal-info-text">
                                  <IonSkeletonText
                                    animated
                                    width="50vw"
                                    class="skeleton-location"
                                  ></IonSkeletonText>
                                </IonRow>
                                <IonRow>
                                  <IonSkeletonText
                                    animated
                                    width="60vw"
                                    class="skeleton-image"
                                  ></IonSkeletonText>
                                </IonRow>
                                <IonRow class="modal-info-text">
                                  <IonSkeletonText
                                    animated
                                    width="35vw"
                                    class="skeleton-rating-price"
                                  ></IonSkeletonText>
                                </IonRow>
                                <IonRow class="modal-info-text">
                                  <IonSkeletonText
                                    animated
                                    width="30vw"
                                    class="skeleton-rating-price"
                                  ></IonSkeletonText>
                                </IonRow>
                              </IonGrid>
                            ) : (
                              <IonGrid class="modal-info-grid">
                                <IonRow class="modal-info-text modal-name">
                                  {this.state.currentFavoriteData.name}
                                </IonRow>
                                <IonRow class="modal-info-text">
                                  {this.state.currentFavoriteData.location}
                                </IonRow>
                                <IonRow>
                                  <IonImg
                                    class="modal-image"
                                    src={
                                      this.state.currentFavoriteData.imageUrl ||
                                      "assets/icon/bean-profile.png"
                                    }
                                  ></IonImg>
                                </IonRow>
                                <IonRow class="modal-info-text">
                                  Rating:{" "}
                                  {this.state.currentFavoriteData.rating}
                                  /5
                                </IonRow>
                                <IonRow class="modal-info-text">
                                  Price:&nbsp;
                                  <IonText class="modal-price-dollars">
                                    {this.state.currentFavoriteData.price ||
                                      "N/A"}
                                  </IonText>
                                </IonRow>
                              </IonGrid>
                            )}
                          </IonRow>
                          <IonRow class="modal-buttons-row">
                            <IonButton
                              class="modal-button modal-button-add"
                              size="small"
                              onClick={() => {
                                this.props.addToStringBean(
                                  this.state.currentFavoriteData
                                );
                                this.setState({ addCheckpointModal: "" });
                              }}
                              disabled={this.state.showSkeleton}
                            >
                              Add To Stringbean
                            </IonButton>
                            <IonButton
                              class="modal-button  modal-button-back"
                              onClick={() => {
                                this.setState({ addCheckpointModal: "" });
                              }}
                            >
                              Back
                            </IonButton>
                          </IonRow>
                        </IonGrid>
                      </IonModal>
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
        </IonContent>
      </IonPage>
    );
  }
}

export default Profile;
