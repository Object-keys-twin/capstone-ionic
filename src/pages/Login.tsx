import React, { Component } from "react";
import {
  IonContent,
  IonHeader,
  IonPage,
  IonTitle,
  IonToolbar,
  IonButton,
  IonItem,
  IonLabel,
  IonInput
} from "@ionic/react";

type Props = {
  handleGoogle: () => void;
};
class Login extends Component<Props> {
  render() {
    return (
      <IonPage>
        <IonHeader>
          <IonToolbar>
            <IonTitle>Login</IonTitle>
          </IonToolbar>
        </IonHeader>
        <IonContent>
          <IonItem>
            <IonLabel>Username</IonLabel>
            <IonInput clearInput></IonInput>
          </IonItem>
          <IonItem>
            <IonLabel>Email</IonLabel>
            <IonInput
              clearInput
              type="email"
              placeholder="mrbean123@email.com"
            ></IonInput>
          </IonItem>
          <IonItem>
            <IonLabel>Password</IonLabel>
            <IonInput
              clearInput
              type="password"
              placeholder="password"
            ></IonInput>
          </IonItem>
          <IonButton
            onClick={() => {
              this.props.handleGoogle();
            }}
          >
            Login with Google
          </IonButton>
        </IonContent>
      </IonPage>
    );
  }
}
export default Login;
