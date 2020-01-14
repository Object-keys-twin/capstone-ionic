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

interface LogInSignUpData {
  email: string;
  displayName: string;
  password: string;
}

type Props = {
  handleGoogle: () => void;
  handleSubmit: (user: LogInSignUpData, type?: string) => void;
  resetLogInSignUpError: () => void;
  logInSignUpError: boolean;
  toastMessage: string;
};

type State = {
  passwordVisibility: boolean;
  email: string;
  password: string;
  showSignUp: boolean;
};

class Login extends Component<Props, State> {
  state = {
    passwordVisibility: false,
    email: "",
    password: "",
    showSignUp: false
  };

  togglePassword = () => {
    this.setState({
      passwordVisibility: !this.state.passwordVisibility
    });
  };

  handleLoginField = (event: HTMLInputElement) => {
    this.setState({ ...this.state, [event.name]: event.value });
  };

  showSignUp = () => {
    this.setState({ showSignUp: !this.state.showSignUp });
  };

  logIn = () => {
    let tryLogIn = {
      email: this.state.email,
      displayName: "",
      password: this.state.password
    };
    this.props.handleSubmit(tryLogIn);
  };

  render() {
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
            <IonRow>
              <IonItem lines="none" id="main-title">
                Bean
              </IonItem>
            </IonRow>
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
                          name="email"
                          onIonChange={e =>
                            this.handleLoginField(e.target as HTMLInputElement)
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
                          name="password"
                          onIonChange={e =>
                            this.handleLoginField(e.target as HTMLInputElement)
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
                          size="small"
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
                      isOpen={this.props.logInSignUpError}
                      message={this.props.toastMessage}
                      duration={2000}
                      onDidDismiss={() => {
                        this.props.resetLogInSignUpError();
                      }}
                    />
                  </>
                ) : (
                  <SignUp
                    handleSubmit={this.props.handleSubmit}
                    showSignUp={this.showSignUp}
                    resetLogInSignUpError={this.props.resetLogInSignUpError}
                    logInSignUpError={this.props.logInSignUpError}
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
}

export default Login;
