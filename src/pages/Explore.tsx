import {
  IonContent,
  IonHeader,
  IonPage,
  IonItem,
  IonRefresher,
  IonRefresherContent,
  IonTitle,
  IonCard,
  IonCardContent,
  IonIcon,
  IonGrid,
  IonCol,
  IonRow,
  IonSkeletonText
} from "@ionic/react";
import { RefresherEventDetail } from "@ionic/core";
import { heartEmpty, heart, arrowDroprightCircle } from "ionicons/icons";
import React, { Component } from "react";
import { Link } from "react-router-dom";
import db from "../firebase/firebase";
import "./Explore.css";

type Props = {
  favorites: { [key: string]: number };
  toggleFavorite: (checkpointId: string) => void;
};

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
  tours: Array<DbData>;
};

class Explore extends Component<Props, State> {
  state = { tours: Array<DbData>() };
  componentDidMount() {
    this.getTours();
  }

  refresh = (e: CustomEvent<RefresherEventDetail>) => {
    setTimeout(() => {
      this.getTours();
      e.detail.complete();
    }, 2000);
  };

  getTours = () => {
    let tours = Array<DbData>();
    db.collection("tours")
      .get()
      .then(docs => {
        docs.forEach(doc => {
          tours.push({
            checkpoints: doc.data().checkpoints,
            description: doc.data().description,
            name: doc.data().name,
            created: doc.data().timestamp,
            upvotes: doc.data().upvotes,
            user: doc.data().user
          });
        });

        this.setState({ tours });

        tours.forEach((tour, idx) => {
          this.getCheckpointsData(tour, idx);
        });
      });
  };

  getCheckpointsData = async (tour: DbData, idx: number) => {
    let checkpointsWithData: Array<CheckpointData> = [];
    for (let i = 0; i < tour.checkpoints.length; i++) {
      const checkpoint = await db
        .collection("checkpoints")
        .doc(`${tour.checkpoints[i]}`)
        .get();
      const checkpointData = checkpoint.data();
      if (checkpointData) {
        const checkpointObj = {
          id: checkpointData.id,
          name: checkpointData.name,
          location: checkpointData.location,
          imageUrl: checkpointData.imageUrl,
          categories: checkpointData.categories,
          rating: checkpointData.rating,
          latitude: checkpointData.latitude,
          longitude: checkpointData.longitude,
          price: checkpointData.price
        };
        checkpointsWithData.push(checkpointObj);
      }
    }

    let tours = this.state.tours;
    tours[idx].checkpoints = checkpointsWithData;
    this.setState({ tours });
  };

  renderHeart = (checkpointId: string) => {
    let favorites = this.props.favorites;

    if (favorites[checkpointId]) return heart;
    else return heartEmpty;
  };

  render() {
    const { tours } = this.state;
    return (
      <IonPage>
        <IonHeader class="tab-header-block">
          <IonTitle size="small" class="tab-header header-font">
            Stringbeans
          </IonTitle>
        </IonHeader>
        <IonContent className="beancontent">
          {tours.map((tour, idx) => (
            <IonCard className="stringbean-card" key={idx}>
              <IonItem lines="none" class="stringbean-header-container">
                <IonGrid class="checkpoint-row stringbean-header">
                  <IonCol class="list-checkpoint-col">
                    <IonRow>{tour.name}</IonRow>
                    <IonRow class="stringbean-creator">{tour.user}</IonRow>
                  </IonCol>
                  <IonCol class="list-favorites-col">
                    <Link
                      className="stringbean-link"
                      to={
                        tour.checkpoints[0].name &&
                        Object.entries(this.props.favorites).length !== 0
                          ? {
                              pathname: "/map",
                              state: { checkpoints: tour.checkpoints }
                            }
                          : { pathname: "/explore" }
                      }
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
                {tour.checkpoints.map((checkpoint, idx) => {
                  if (checkpoint) {
                    return (
                      <IonGrid item-content class="checkpoint-row" key={idx}>
                        <IonCol class="list-checkpoint-col">
                          <IonItem lines="none">
                            {checkpoint.name &&
                            Object.entries(this.props.favorites).length !==
                              0 ? (
                              checkpoint.name
                            ) : (
                              <IonSkeletonText
                                animated
                                width="70vw"
                                class="explore-skeleton-text"
                              />
                            )}
                          </IonItem>
                        </IonCol>
                        <IonCol class="list-favorites-col">
                          {checkpoint.name &&
                          Object.entries(this.props.favorites).length !== 0 ? (
                            <IonIcon
                              onClick={() =>
                                this.props.toggleFavorite(checkpoint.id)
                              }
                              class="favorites-icon list-favorites-icon"
                              icon={this.renderHeart(checkpoint.id)}
                            />
                          ) : (
                            <IonIcon
                              class="skeleton-heart list-favorites-icon"
                              icon={heart}
                            />
                          )}
                        </IonCol>
                      </IonGrid>
                    );
                  }
                  return <></>;
                })}
              </IonCardContent>
            </IonCard>
          ))}

          <IonRefresher slot="fixed" onIonRefresh={this.refresh}>
            <IonRefresherContent className="refresher-content"></IonRefresherContent>
          </IonRefresher>
        </IonContent>
      </IonPage>
    );
  }
}
export default Explore;
