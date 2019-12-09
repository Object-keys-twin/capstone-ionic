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
  IonButton,
  IonMenuButton,
  IonFab,
  IonIcon,
  IonItemSliding,
  IonItemOption,
  IonItemOptions
} from "@ionic/react";

import { list, trash } from "ionicons/icons";
import { menuController } from "@ionic/core";
import { Plugins } from "@capacitor/core";
import db from "../firebase/firebase";
import BeanMenuForm from "./BeanMenuForm";
import firebase from "firebase";
import "./BeanMenu.css";
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
  removeFromStringBean: (id: string) => void;
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
    if (!this.props.stringbean.length) {
      console.log("No beans to string!");
      return;
    }
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
              <IonTitle class="header-font bean-menu-header">
                To String
              </IonTitle>
            </IonToolbar>
          </IonHeader>
          <IonContent>
            <IonList>
              {this.props.stringbean.map((bean, idx) => (
                <IonItemSliding key={idx}>
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
              ))}
            </IonList>
          </IonContent>
          <IonButton
            id="publish-button"
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
      </>
    );
  }
}
