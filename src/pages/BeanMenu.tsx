import React, { Component } from "react";
import {
  IonMenu,
  IonHeader,
  IonTitle,
  IonContent,
  IonList,
  IonItem,
  IonRouterOutlet,
  IonButton,
  IonMenuButton,
  IonFab,
  IonIcon,
  IonItemSliding,
  IonItemOption,
  IonItemOptions,
  IonToast
} from "@ionic/react";

import { list, trash } from "ionicons/icons";
import { menuController } from "@ionic/core";
// import { Plugins } from "@capacitor/core";
import db from "../firebase/firebase";
import BeanMenuForm from "./BeanMenuForm";
import firebase from "firebase";
import "./BeanMenu.css";
// const { Storage } = Plugins;

interface BusinessData {
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

type State = {
  showAlert: boolean;
  publishError: boolean;
  toastMessage: string;
};

type Props = {
  stringbean: Array<BusinessData>;
  removeFromStringBean: (id: string) => void;
  clearStorageOnPublish: () => void;
};

export default class BeanMenu extends Component<Props, State> {
  state = {
    showAlert: false,
    publishError: false,
    toastMessage: ""
  };

  toggleAlert = () => {
    this.setState({ showAlert: !this.state.showAlert });
  };

  createOrUpdateCheckpoint = async (bean: BusinessData) => {
    let beanRef = db.collection("checkpoints").doc(bean.id);
    let getBean = await beanRef.get();
    if (!getBean.data()) {
      if (bean.price === undefined) {
        bean.price = "not available";
      }
      await beanRef.set(bean);
      console.log("Created checkpoint in Firestore:", bean.name);
    }
    //this only creates. need to add update functionality, so as yelp data update in the future, firestore will also be updated
  };

  publishTour = async (name: string, description: string) => {
    if (!this.props.stringbean.length) {
      this.setState({
        publishError: true,
        toastMessage: "No beans to string!"
      });
      console.log("No beans to string!");
      return;
    }

    if (name === "") {
      this.setState({
        publishError: true,
        toastMessage: "Please name your stringbean!"
      });
      console.log("Please name your stringbean!");
      return;
    }

    let checkpoints = Array<string>();

    this.props.stringbean.forEach(async bean => {
      await this.createOrUpdateCheckpoint(bean);
    });

    this.props.stringbean.forEach(bean => {
      checkpoints.push(bean.id);
    });

    let username: string | null = "";
    let user = firebase.auth().currentUser;
    if (user) username = user.displayName || user.email;
    // the case of currentUser being null does not need to be handled because of the sign-in observer (onAuthStateChanged in App.tsx)

    let tour = {
      checkpoints,
      name,
      description,
      created: firebase.firestore.Timestamp.fromDate(new Date()),
      user: username,
      upvotes: 0
    };

    await db
      .collection("tours")
      .add(tour)
      .then(ref => {
        console.log("Added document with ID: ", ref.id);
      });

    this.props.clearStorageOnPublish();
  };

  render() {
    return (
      <>
        <IonMenu
          id="beanmenu"
          side="end"
          contentId="main"
          type="overlay"
          swipeGesture={true}
        >
          <IonHeader>
            <IonTitle
              size="small"
              class="tab-header header-font"
              id="bean-menu-header"
            >
              My Stringbean
            </IonTitle>
          </IonHeader>
          <IonContent class="modal-content">
            <IonList>
              {this.props.stringbean.map((bean, idx) => {
                return (
                  <IonItemSliding key={bean.id}>
                    <IonItemOptions side="end">
                      <IonItemOption
                        color="danger"
                        onClick={() => {
                          this.props.removeFromStringBean(bean.id);
                        }}
                      >
                        <IonIcon slot="icon-only" icon={trash}></IonIcon>
                      </IonItemOption>
                    </IonItemOptions>
                    <IonItem lines="none">{bean.name}</IonItem>
                  </IonItemSliding>
                );
              })}
            </IonList>
          </IonContent>
          <IonItem no-padding lines="full" id="bean-menu-button-container">
            <IonButton
              id="publish-button"
              onClick={() => {
                this.toggleAlert();
              }}
            >
              Publish Stringbean
            </IonButton>
          </IonItem>

          <BeanMenuForm
            showAlert={this.state.showAlert}
            toggleAlert={this.toggleAlert}
            publishTour={this.publishTour}
          />
        </IonMenu>
        <IonFab id="menu-button" vertical="bottom" horizontal="end">
          <IonMenuButton
            id="menu-button2"
            autoHide={false}
            onClick={() => menuController.open}
          >
            <IonIcon id="menu-icon" icon={list} />
          </IonMenuButton>
        </IonFab>

        <IonRouterOutlet id="main"></IonRouterOutlet>
        <IonToast
          cssClass="publish-toast"
          isOpen={this.state.publishError}
          message={this.state.toastMessage}
          duration={2000}
          onDidDismiss={() => {
            this.setState({ publishError: false, toastMessage: "" });
          }}
        />
      </>
    );
  }
}
