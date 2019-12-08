import React, { Component } from "react";
import {
  IonContent,
  IonPage,
  IonButton,
  IonItem,
  IonInput,
  IonIcon,
  IonCard,
  IonCardHeader,
  IonCardTitle,
  IonGrid,
  IonRow,
  IonToast,
  IonCardContent
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
  resetLogInError: () => void;
  logInError: boolean;
  signUpError: boolean;
  toastMessage: string;
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
    // if (!this.state.showSignUp) {
    return (
      <IonPage>
        <IonContent>
          <video
            id="loginvideo"
            preload="auto"
            autoPlay
            loop
            src="assets/video/video.mp4"
          ></video>
          <IonGrid id="login-signup-grid">
            <IonRow id="login-signup-row">
              <IonCard class="login-signup-card">
                {!this.state.showSignUp ? (
                  <>
                    <IonCardHeader class="login-signup-header">
                      <IonCardTitle class="header-font login-signup-header">
                        Login
                      </IonCardTitle>
                    </IonCardHeader>
                    <IonCardContent class="login-signup-input-container">
                      <IonItem class="login-signup-input-nestedcontainer login-ionitem">
                        <IonInput
                          class="login-signup-input-field"
                          clearInput
                          type="email"
                          placeholder="Email"
                          onIonChange={e =>
                            this.handleEmail(
                              (e.target as HTMLInputElement).value
                            )
                          }
                        ></IonInput>
                      </IonItem>
                    </IonCardContent>
                    <IonCardContent class="login-signup-input-container">
                      <IonItem class="login-signup-input-nestedcontainer login-ionitem">
                        <IonInput
                          class="login-signup-input-field"
                          clearInput
                          onIonChange={e =>
                            this.handlePassword(
                              (e.target as HTMLInputElement).value
                            )
                          }
                          type={
                            this.state.passwordVisibility === false
                              ? PasswordVisibility.Password
                              : PasswordVisibility.Text
                          }
                          placeholder="Password"
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
                      <IonRow class="login-button-row">
                        <IonButton
                          class="login-signup-button"
                          onClick={() => {
                            this.logIn();
                          }}
                        >
                          Log In
                        </IonButton>
                        <IonButton
                          class="login-signup-button"
                          onClick={() => {
                            this.props.handleGoogle();
                          }}
                        >
                          Google Login
                        </IonButton>
                      </IonRow>
                      <IonRow class="login-button-row">
                        <IonButton
                          id="signup-button"
                          fill="clear"
                          onClick={() => {
                            this.showSignUp();
                          }}
                        >
                          Sign Up
                        </IonButton>
                      </IonRow>
                    </IonGrid>
                    <IonToast
                      cssClass="login-signup-toast"
                      isOpen={this.props.logInError}
                      message={this.props.toastMessage}
                      duration={2000}
                      onDidDismiss={() => {
                        this.props.resetLogInError();
                      }}
                    />
                  </>
                ) : (
                  <SignUp
                    handleSubmit={this.props.handleSubmit}
                    showSignUp={this.showSignUp}
                    resetLogInError={this.props.resetLogInError}
                    signUpError={this.props.signUpError}
                    toastMessage={this.props.toastMessage}
                  />
                )}
              </IonCard>
            </IonRow>
          </IonGrid>
        </IonContent>
      </IonPage>
    );
  }
  // return (
  //   <SignUp
  //     handleSubmit={this.props.handleSubmit}
  //     showSignUp={this.showSignUp}
  //     signUpError={this.props.signUpError}
  //   />
  // );
}
// }
export default Login;
