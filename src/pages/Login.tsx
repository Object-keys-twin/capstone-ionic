import React, { Component } from "react";
import {
	IonContent,
	IonHeader,
	IonPage,
	IonTitle,
    IonToolbar,
    IonButton
} from "@ionic/react";





  class Login extends Component <{signIn:()=> void}>  {
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


