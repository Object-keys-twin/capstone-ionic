import {
  IonContent,
  IonHeader,
  IonPage,
  IonList,
  IonItem,
  IonLabel,
  IonRefresher,
  IonRefresherContent,
  IonTitle,
  IonCard,
  IonCardContent
} from "@ionic/react";
import { RefresherEventDetail } from "@ionic/core";
import React, { Component } from "react";
import { Link } from "react-router-dom";
import db from "../firebase/firebase";
import "./Tab2.css";

interface DbData {
  checkpoints: Array<any>;
  description: string;
  name: string;
  created: object;
  upvotes: number;
  user: string;
}

type State = {
  tours: Array<DbData>;
};
class PublicTours extends Component<{}, State> {
  state = { tours: Array<DbData>() };
  componentDidMount() {
    this.getTours();
  }

  refresh = (e: CustomEvent<RefresherEventDetail>) => {
    setTimeout(() => {
      this.getTours();
      console.log("Async operation has ended");
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
      const checkpoints = await db
        .collection("checkpoints")
        .doc(`${tour.checkpoints[i]}`)
        .get();
      checkpointsWithData.push(checkpoints.data());
    }
    let tours = this.state.tours;
    tours.forEach((el, i) => {
      if (i === idx) el.checkpoints = checkpointsWithData;
    });
    this.setState({ tours });
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
              <Link
                className="stringbean-link"
                to={{
                  pathname: "/map",
                  state: { checkpoints: tour.checkpoints }
                }}
              >
                <IonItem lines="none" class="stringbean-title">
                  {tour.name}
                </IonItem>

                <IonCardContent class="stringbean-card-content">
                  {tour.checkpoints.map((checkpoint, idx) => {
                    if (checkpoint) {
                      return (
                        <IonItem lines="none" key={idx}>
                          {checkpoint.name}
                        </IonItem>
                      );
                    }
                  })}
                </IonCardContent>
              </Link>
            </IonCard>
          ))}

          <IonRefresher slot="fixed" onIonRefresh={this.refresh}>
            <IonRefresherContent
              pullingIcon="arrow-dropdown"
              pullingText="Pull to refresh"
              refreshingSpinner="circles"
              refreshingText="Refreshing..."
            ></IonRefresherContent>
          </IonRefresher>
        </IonContent>
      </IonPage>
    );
  }
}
export default PublicTours;
