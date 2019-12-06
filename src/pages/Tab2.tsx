import {
  IonContent,
  IonHeader,
  IonPage,
  IonList,
  IonItem,
  IonLabel,
  IonCol,
  IonGrid,
  IonRefresher,
  IonRefresherContent,
  IonTitle,
  IonToolbar
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
          // this.setState({
          // 	tours: [
          // 		...this.state.tours,
          // 		{
          // 			checkpoints: doc.data().checkpoints,
          // 			description: doc.data().description,
          // 			name: doc.data().name,
          // 			created: doc.data().timestamp,
          // 			upvotes: doc.data().upvotes,
          // 			user: doc.data().user
          // 		}
          // 	]
          // });
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
    // console.log("in the render");
    // console.log("ARRAY OF TOURS: ", this.state.tours);
    const { tours } = this.state;

    return (
      <IonPage>
        <IonHeader>
          <IonToolbar>
            <IonTitle class="header">Explore</IonTitle>
          </IonToolbar>
        </IonHeader>
        <IonContent className="ion-padding">
          <IonList>
            {tours.map((tour, idx) => (
              <IonItem key={idx} className="mainListRow">
                <IonGrid>
                  <IonCol>
                    <IonLabel>
                      <Link
                        to={{
                          pathname: "/map",
                          state: { checkpoints: tour.checkpoints }
                        }}
                      >
                        {tour.name}
                      </Link>
                    </IonLabel>
                    <IonList>
                      {tour.checkpoints.map((checkpoint, idx) => {
                        if (checkpoint)
                          return <IonItem key={idx}>{checkpoint.name}</IonItem>;
                      })}
                    </IonList>
                  </IonCol>
                </IonGrid>
              </IonItem>
            ))}
          </IonList>
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
