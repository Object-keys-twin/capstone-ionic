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

enum PasswordOrConfirm {
  Password = "passwordVisibility",
  Confirm = "passwordConfirmVisibility"
}

interface LogInSignUpData {
  email: string;
  displayName: string;
  password: string;
}

type Props = {
  handleSubmit: (user: LogInSignUpData, type?: string) => void;
  showSignUp: () => void;
  resetLogInSignUpError: () => void;
  logInSignUpError: boolean;
  toastMessage: string;
};

type State = {
  passwordVisibility: boolean;
  passwordConfirmVisibility: boolean;
  displayName: string;
  email: string;
  password: string;
  passwordConfirm: string;
  showSignUp: boolean;
};

export default class SignUp extends Component<Props, State> {
  state = {
    passwordVisibility: false,
    passwordConfirmVisibility: false,
    displayName: "",
    email: "",
    password: "",
    passwordConfirm: "",
    showSignUp: false
  };

  handleSignUpField = (event: HTMLInputElement) => {
    this.setState({ ...this.state, [event.name]: event.value });
  };

  toggleVisibility = (passwordOrConfirm: PasswordOrConfirm) => {
    this.setState<never>({
      [passwordOrConfirm]: !this.state[passwordOrConfirm]
    });
  };

  //add toggling of colors

  createAccount = () => {
    let newUser = {
      email: this.state.email,
      displayName: this.state.displayName,
      password: this.state.password
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
                this.handleSignUpField(e.target as HTMLInputElement)
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
                this.handleSignUpField(e.target as HTMLInputElement)
              }
            ></IonInput>
          </IonItem>
        </IonCardContent>
        <IonCardContent class="login-signup-input-container">
          <IonItem class="login-signup-input-nestedcontainer login-ionitem">
            <IonInput
              class="login-signup-input-field"
              clearInput
              name="password"
              placeholder="Password"
              onIonChange={e =>
                this.handleSignUpField(e.target as HTMLInputElement)
              }
              type={
                this.state.passwordVisibility === false
                  ? PasswordVisibility.Password
                  : PasswordVisibility.Text
              }
            ></IonInput>

            {this.state.password ? (
              <IonIcon
                class="password-icon"
                icon={this.state.passwordVisibility ? eyeOff : eye}
                onClick={() =>
                  this.toggleVisibility(PasswordOrConfirm.Password)
                }
              />
            ) : null}
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
              name="passwordConfirm"
              placeholder="Confirm Password"
              onIonChange={e =>
                this.handleSignUpField(e.target as HTMLInputElement)
              }
              type={
                this.state.passwordConfirmVisibility === false
                  ? PasswordVisibility.Password
                  : PasswordVisibility.Text
              }
            ></IonInput>

            {this.state.passwordConfirm ? (
              <IonIcon
                class="password-icon"
                icon={this.state.passwordConfirmVisibility ? eyeOff : eye}
                onClick={() => this.toggleVisibility(PasswordOrConfirm.Confirm)}
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
