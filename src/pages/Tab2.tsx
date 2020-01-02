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
  IonRow
} from "@ionic/react";
import { RefresherEventDetail } from "@ionic/core";
import { heartEmpty, heart, walk } from "ionicons/icons";
import React, { Component } from "react";
import { Link } from "react-router-dom";
import db from "../firebase/firebase";
import "./Tab2.css";

type Props = {
  favorites: { [key: string]: any };
  toggleFavorite: (checkpointId: string) => void;
};

interface CheckpointData {
  id: string;
  imageUrl: string;
  latitude: number;
  location: string;
  longitude: number;
  name: string;
  price: string;
  rating: number;
}

interface DbData {
  checkpoints: Array<CheckpointData>;
  description: string;
  name: string;
  created: object;
  upvotes: number;
  user: string;
}

type State = {
  tours: Array<DbData>;
};
class PublicTours extends Component<Props, State> {
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
    let tourData = Array<DbData>();
    db.collection("tours")
      .get()
      .then(docs => {
        docs.forEach(doc => {
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
                      to={{
                        pathname: "/map",
                        state: { checkpoints: tour.checkpoints }
                      }}
                    >
                      <IonIcon
                        class="list-favorites-icon"
                        icon={walk}
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
                          <IonItem lines="none">{checkpoint.name}</IonItem>
                        </IonCol>
                        <IonCol class="list-favorites-col">
                          <IonIcon
                            onClick={() =>
                              this.props.toggleFavorite(checkpoint.id)
                            }
                            class="favorites-icon list-favorites-icon"
                            icon={this.renderHeart(checkpoint.id)}
                          />
                        </IonCol>
                      </IonGrid>
                    );
                  }
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
export default PublicTours;
