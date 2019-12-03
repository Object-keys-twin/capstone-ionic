import React, { Component } from "react";
import {
  IonContent,
  IonHeader,
  IonPage,
  IonTitle,
  IonToolbar,
  IonButton
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
