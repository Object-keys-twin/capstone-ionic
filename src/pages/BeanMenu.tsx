import React, { Component } from "react";
import {
  IonMenu,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonList,
  IonItem,
  IonRouterOutlet,
  IonButtons,
  IonButton,
  IonMenuButton
} from "@ionic/react";

import { menuController } from "@ionic/core";
import { Plugins } from "@capacitor/core";
import db from "../firebase/firebase";
import BeanMenuForm from "./BeanMenuForm";
import firebase from "firebase";
const { Storage } = Plugins;

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

type State = {
  stringbean: Array<BusinessData>;
  showAlert: boolean;
  name: string;
  description: string;
};

type Props = {
  stringbean: Array<BusinessData>;
};

export default class BeanMenu extends Component<Props, State> {
  state = {
    stringbean: Array<BusinessData>(),
    showAlert: false,
    name: "",
    description: ""
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
    }
  };

  publishTour = async (name: string, description: string) => {
    let checkpoints = Array<string>();

    this.props.stringbean.forEach(async bean => {
      await this.createOrUpdateCheckpoint(bean);
    });

    this.props.stringbean.forEach(bean => {
      checkpoints.push(bean.id);
    });

    let userEmail: string = "";
    const data = await Storage.get({ key: "user" });
    if (data.value) {
      userEmail = JSON.parse(data.value).email;
    }

    let tour = {
      checkpoints,
      name: name,
      description: description,
      created: firebase.firestore.Timestamp.fromDate(new Date()),
      user: userEmail
    };

    await db
      .collection("tours")
      .add(tour)
      .then(ref => {
        console.log("Added document with ID: ", ref.id);
      });

    await Storage.remove({ key: "stringbean" });
  };

  render() {
    return (
      <>
        <IonMenu side="end" contentId="main" type="overlay" swipeGesture={true}>
          <IonHeader>
            <IonToolbar color="primary">
              <IonTitle>My Beans</IonTitle>
            </IonToolbar>
          </IonHeader>
          <IonContent>
            <IonList>
              {this.props.stringbean.map((bean, idx) => (
                <IonItem key={idx}>{bean.name}</IonItem>
              ))}
            </IonList>
          </IonContent>
          <IonButton
            onClick={() => {
              this.toggleAlert();
            }}
          >
            Publish Stringbean
          </IonButton>
          <BeanMenuForm
            showAlert={this.state.showAlert}
            toggleAlert={this.toggleAlert}
            publishTour={this.publishTour}
            // handleChange={this.handleChange}
          />
        </IonMenu>
        <IonHeader>
          <IonToolbar>
            <IonButtons slot="end">
              <IonMenuButton
                autoHide={false}
                onClick={() => menuController.open}
              ></IonMenuButton>
            </IonButtons>
          </IonToolbar>
        </IonHeader>
        <IonRouterOutlet id="main"></IonRouterOutlet>
      </>
    );
  }
}
