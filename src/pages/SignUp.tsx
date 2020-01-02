import React, { Component } from "react";
import {
  IonButton,
  IonItem,
  IonInput,
  IonIcon,
  IonCardHeader,
  IonCardTitle,
  IonGrid,
  IonRow,
  IonCardContent,
  IonToast
} from "@ionic/react";
import { eye, eyeOff, arrowRoundBack } from "ionicons/icons";
import "./SignUp.css";

enum PasswordVisibility {
  Password = "password",
  Text = "text"
}

interface userData {
  email: string;
  uid?: string;
  displayName: string;
  photoURL: string;
  password: string;
  favorites: object;
}

type Props = {
  handleSubmit: (user: userData, type?: string) => void;
  showSignUp: () => void;
  resetLogInSignUpError: () => void;
  logInSignUpError: boolean;
  toastMessage: string;
};

type State = {
  passwordVisibility: boolean;
  displayName: string;
  email: string;
  password: string;
  showSignUp: boolean;
};

export default class SignUp extends Component<Props, State> {
  state = {
    passwordVisibility: false,
    displayName: "",
    email: "",
    password: "",
    showSignUp: false
  };

  handleEmail = (e: string) => {
    this.setState({ email: e });
  };

  handlePassword = (e: string) => {
    this.setState({ password: e });
  };

  handleDisplayName = (e: string) => {
    this.setState({ displayName: e });
  };

  togglePassword = () => {
    this.setState({
      passwordVisibility: !this.state.passwordVisibility
    });
  };

  createAccount = () => {
    let newUser = {
      email: this.state.email,
      uid: "",
      displayName: this.state.displayName,
      photoURL: "",
      password: this.state.password,
      favorites: {}
    };
    this.props.handleSubmit(newUser, "signup");
  };

  render() {
    return (
      <>
        <IonCardHeader class="login-signup-header">
          <IonCardTitle class="header-font login-signup-header">
            Sign Up
          </IonCardTitle>
        </IonCardHeader>
        <IonCardContent class="login-signup-input-container">
          <IonItem class="login-signup-input-nestedcontainer login-ionitem">
            <IonInput
              clearInput
              type="text"
              class="login-signup-input-field"
              name="displayName"
              placeholder="Username (optional)"
              onIonChange={e =>
                this.handleDisplayName((e.target as HTMLInputElement).value)
              }
            ></IonInput>
          </IonItem>
        </IonCardContent>
        <IonCardContent class="login-signup-input-container">
          <IonItem class="login-signup-input-nestedcontainer login-ionitem">
            <IonInput
              class="login-signup-input-field"
              clearInput
              type="email"
              placeholder="Email"
              name="email"
              onIonChange={e =>
                this.handleEmail((e.target as HTMLInputElement).value)
              }
            ></IonInput>
          </IonItem>
        </IonCardContent>
        <IonCardContent class="login-signup-input-container">
          <IonItem
            lines="none"
            class="login-signup-input-nestedcontainer login-ionitem"
          >
            <IonInput
              class="login-signup-input-field"
              clearInput
              onIonChange={e =>
                this.handlePassword((e.target as HTMLInputElement).value)
              }
              type={
                this.state.passwordVisibility === false
                  ? PasswordVisibility.Password
                  : PasswordVisibility.Text
              }
              placeholder="Password"
              name="password"
            ></IonInput>

            {this.state.password ? (
              <IonIcon
                class="password-icon"
                icon={this.state.passwordVisibility ? eyeOff : eye}
                onClick={this.togglePassword}
              />
            ) : null}
          </IonItem>
        </IonCardContent>

        <IonGrid class="login-signup-button-container">
          <IonRow class="signup-button-row">
            <IonButton
              class="login-signup-button"
              onClick={this.props.showSignUp}
            >
              <IonIcon icon={arrowRoundBack}></IonIcon>
            </IonButton>
            <IonButton class="login-signup-button" onClick={this.createAccount}>
              Create Account
            </IonButton>
          </IonRow>
        </IonGrid>
        <IonToast
          cssClass="login-signup-toast"
          isOpen={this.props.logInSignUpError}
          message={this.props.toastMessage}
          duration={2000}
          onDidDismiss={() => {
            this.props.resetLogInSignUpError();
          }}
        />
      </>
    );
  }
}
