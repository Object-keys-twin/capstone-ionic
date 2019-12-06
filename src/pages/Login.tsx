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
  IonInput,
  IonIcon
} from "@ionic/react";
import { eye, eyeOff } from "ionicons/icons";
import "./Login.css";
import SignUp from "./SignUp";

enum PasswordVisibility {
  Password = "password",
  Text = "text"
}

interface userData {
  email: string | null;
  uid?: string | null;
  displayName: string | null;
  photoURL: string | null;
  password: string;
}

type Props = {
  handleGoogle: () => void;
  handleSubmit: (user: userData, type?: string) => void;
  logInError: boolean;
};

type State = {
  passwordVisibility: boolean;
  displayName: string;
  email: string;
  password: string;
  showSignUp: boolean;
};

class Login extends Component<Props, State> {
  state = {
    passwordVisibility: false,
    displayName: "",
    email: "",
    password: "",
    showSignUp: false
  };

  togglePassword = () => {
    this.setState({
      passwordVisibility: !this.state.passwordVisibility
    });
  };

  handleEmail = (e: string) => {
    this.setState({ email: e });
  };

  handlePassword = (e: string) => {
    this.setState({ password: e });
  };

  showSignUp = () => {
    this.setState({ showSignUp: !this.state.showSignUp });
  };

  logIn = () => {
    let tryLogIn = {
      email: this.state.email,
      uid: "",
      displayName: "",
      photoURL: "",
      password: this.state.password
    };
    this.props.handleSubmit(tryLogIn);
  };

  render() {
    if (!this.state.showSignUp) {
      return (
        <IonPage>
          <IonHeader>
            <IonToolbar>
              <IonTitle className="header">Login</IonTitle>
            </IonToolbar>
          </IonHeader>
          <IonContent>
            <IonItem>
              <IonLabel>Email</IonLabel>
              <IonInput
                required
                clearInput
                type="email"
                placeholder="mrbean123@email.com"
                onIonChange={e =>
                  this.handleEmail((e.target as HTMLInputElement).value)
                }
              ></IonInput>
            </IonItem>
            <IonItem>
              <IonLabel>Password</IonLabel>
              <IonInput
                required
                clearInput
                onIonChange={e =>
                  this.handlePassword((e.target as HTMLInputElement).value)
                }
                type={
                  this.state.passwordVisibility === false
                    ? PasswordVisibility.Password
                    : PasswordVisibility.Text
                }
                placeholder="123123123"
              ></IonInput>

              {this.state.password ? (
                <IonIcon
                  icon={this.state.passwordVisibility ? eyeOff : eye}
                  onClick={this.togglePassword}
                />
              ) : (
                <IonItem />
              )}
            </IonItem>
            <IonButton
              onClick={() => {
                this.logIn();
              }}
            >
              Log In
            </IonButton>
            <IonButton
              onClick={() => {
                this.props.handleGoogle();
              }}
            >
              Login with Google
            </IonButton>
            <IonButton
              onClick={() => {
                this.showSignUp();
              }}
            >
              Sign Up
            </IonButton>
            {this.props.logInError ? (
              <IonItem>Wrong email/password!</IonItem>
            ) : (
              <IonItem></IonItem>
            )}
          </IonContent>
        </IonPage>
      );
    }
    return (
      <SignUp
        handleSubmit={this.props.handleSubmit}
        showSignUp={this.showSignUp}
      />
    );
  }
}
export default Login;
