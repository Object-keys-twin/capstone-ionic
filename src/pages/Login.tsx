import db from '../firebase/firebase'
import React, { Component } from "react";
import {
	IonCard,
	IonCardContent,
	IonCardHeader,
	IonCardSubtitle,
	IonCardTitle,
	IonContent,
	IonHeader,
	IonIcon,
	IonItem,
	IonLabel,
	IonList,
	IonListHeader,
	IonPage,
	IonTitle,
    IonToolbar,
    IonButton
} from "@ionic/react";





  class Login extends Component <{signIn:()=> void}>  {
      constructor(props:any) {
          super(props)
      }
      render() {
      return (
          <IonPage>
              <IonHeader>
                  <IonToolbar>
                      <IonTitle>
                          Login
                      </IonTitle>
                  </IonToolbar>
              </IonHeader>
              <IonContent>
                  <IonButton onClick={() => {this.props.signIn()}}>Login with Google</IonButton>
              </IonContent>
          </IonPage>
      )
      }
  }


  export default Login


