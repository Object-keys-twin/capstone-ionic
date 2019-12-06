import {
  IonCard,
  IonCardContent,
  IonCardHeader,
  IonCardTitle,
  IonContent,
  IonHeader,
  IonItem,
  IonPage,
  IonTitle,
  IonToolbar,
  IonIcon,
  IonRefresher,
  IonRefresherContent,
  IonButton,
  IonImg,
  IonFab,
  IonFabButton,
  IonFabList
} from "@ionic/react";
import { RefresherEventDetail } from "@ionic/core";
import React, { Component } from "react";
import { Plugins } from "@capacitor/core";
import { walk, logOut, settings } from "ionicons/icons";
import { Link } from "react-router-dom";
import "./Tab1.css";
import firebase from "firebase";
import db from "../firebase/firebase";

const { Storage } = Plugins;

type Props = {
  user: userData;
};

type State = {
  tours: Array<DbData>;
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
      .where("user", "==", this.props.user.email)
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

  render() {
    return (
      <IonPage>
        <IonHeader>
          <IonToolbar>
            <IonTitle className="header">Profile</IonTitle>
          </IonToolbar>
        </IonHeader>
        <IonContent>
          <IonCard className="welcome-card">
            <IonImg
              src={this.props.user.photoURL || "assets/icon/bean-profile.png"}
            />
            <IonCardHeader>
              <IonCardTitle class="header">
                Welcome, {this.props.user.displayName || this.props.user.email}
              </IonCardTitle>
            </IonCardHeader>
            <IonCardContent></IonCardContent>
          </IonCard>
          <IonCard>
            <IonCardTitle className="string-bean-title">
              My Stringbeans
            </IonCardTitle>
          </IonCard>
          {this.state.tours.map((tour, i) => (
            <IonCard className="welcome-card" key={i}>
              <IonItem>
                <IonIcon slot="start" color="medium" icon={walk} />
                <IonCardTitle>
                  <Link
                    to={{
                      pathname: "/map",
                      state: { checkpoints: tour.checkpoints }
                    }}
                  >
                    {tour.name}
                  </Link>
                </IonCardTitle>
              </IonItem>
              <IonCardContent>
                {tour.checkpoints.map((checkpoint, i) => {
                  if (checkpoint) {
                    return <IonItem key={i}>{checkpoint.name}</IonItem>;
                  }
                })}
              </IonCardContent>
            </IonCard>
          ))}

          <IonFab vertical="bottom" horizontal="end" slot="fixed">
            <IonFabButton id="settings-button">
              <IonIcon class="settings-tray-icon" icon={settings} />
            </IonFabButton>
            <IonFabList side="start" id="profile-settings-tray">
              <IonFabButton
                class="settings-tray-button"
                id="logout"
                onClick={this.signOut}
              >
                <IonIcon class="settings-tray-icon" icon={logOut} />
              </IonFabButton>
              <IonFabButton class="settings-tray-button">
                Bookmarks
              </IonFabButton>
              <IonFabButton class="settings-tray-button">
                Something
              </IonFabButton>
            </IonFabList>
          </IonFab>
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

export default Profile;
