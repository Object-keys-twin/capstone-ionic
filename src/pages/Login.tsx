import React, { Component } from "react";
import {
	IonContent,
	IonHeader,
	IonPage,
	IonTitle,
    IonToolbar,
    IonButton
} from "@ionic/react";
import * as firebase from 'firebase';
import {withRouter} from 'react-router-dom'
import db from '../firebase/firebase';
type Props = {
    handleGoogle:(e?:any) => void
}
  class Login extends Component <Props>  {

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
                  <IonButton onClick= {() => {this.props.handleGoogle()}}>Login with Google</IonButton>
              </IonContent>
          </IonPage>
      )
      }
  }
  export default Login

