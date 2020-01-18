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
import db from "../firebase/firebase";
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
  accountData: AccountData;
  showSignUp: boolean;
  showErrorToast: boolean;
  toastMessage: string;
};

interface AccountData {
  displayName: string;
  displayNameColor: string;
  email: string;
  password: string;
  passwordColor: string;
  passwordVisibility: boolean;
  passwordConfirm: string;
  passwordConfirmColor: string;
  passwordConfirmVisibility: boolean;
}

export default class SignUp extends Component<Props, State> {
  state = {
    accountData: {
      displayName: "",
      displayNameColor: "",
      email: "",
      password: "",
      passwordColor: "",
      passwordVisibility: false,
      passwordConfirm: "",
      passwordConfirmColor: "",
      passwordConfirmVisibility: false
    },
    showSignUp: false,
    showErrorToast: false,
    toastMessage: ""
  };

  handleSignUpField = (event: HTMLInputElement) => {
    this.setState({
      accountData: { ...this.state.accountData, [event.name]: event.value }
    });

    if (event.name === "password" || event.name === "passwordConfirm") {
      this.togglePasswordConfirmColor();
      if (event.name === "password") {
        this.togglePasswordColor();
      }
    } else if (event.name === "displayName") {
      this.toggleDisplayNameColor();
    }
  };

  toggleVisibility = (passwordOrConfirm: PasswordOrConfirm) => {
    this.setState<never>({
      accountData: {
        ...this.state.accountData,
        [passwordOrConfirm]: !this.state.accountData[passwordOrConfirm]
      }
    });
  };

  //------TOGGLERS FOR INPUT FIELD ERROR - RED BACKGROUND-------------
  toggleDisplayNameColor = async () => {
    let duplicate = await this.checkForDuplicateDisplayName();
    if (duplicate) {
      this.setState({
        accountData: {
          ...this.state.accountData,
          displayNameColor: "input-error"
        }
      });
    } else {
      this.setState({
        accountData: { ...this.state.accountData, displayNameColor: "" }
      });
    }
  };

  //helper function for toggleDisplayNameColor
  checkForDuplicateDisplayName = async () => {
    let displayName = this.state.accountData.displayName;
    if (!displayName) {
      return false;
    }

    const duplicateName = await db
      .collection("users")
      .where("displayName", "==", `${displayName}`)
      .get();

    return duplicateName.empty === false;
  };

  togglePasswordColor = () => {
    let password = this.state.accountData.password;
    //password needs to contain at least one number, one uppercase, one lowercase, and be at least 6 characters
    if (password && !password.match(/^(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{6,}$/)) {
      this.setState({
        accountData: {
          ...this.state.accountData,
          passwordColor: "input-error"
        }
      });
    } else {
      this.setState({
        accountData: { ...this.state.accountData, passwordColor: "" }
      });
    }
  };

  togglePasswordConfirmColor = () => {
    if (
      this.state.accountData.password !== this.state.accountData.passwordConfirm
    ) {
      this.setState({
        accountData: {
          ...this.state.accountData,
          passwordConfirmColor: "input-error"
        }
      });
    } else {
      this.setState({
        accountData: {
          ...this.state.accountData,
          passwordConfirmColor: ""
        }
      });
    }
  };
  //-----------------------------------------------------------------

  //-----FINAL VALIDATIONS BEFORE CREATING ON FIREBASE AND FIRESTORE------
  checkPasswordComplexityStatus = () => {
    if (this.state.accountData.passwordColor === "input-error") {
      this.setState({
        showErrorToast: true,
        toastMessage:
          "Passwords must be at least 6 characters & contain a lowercase, uppercase, and number."
      });
      return true;
    }
    return false;
  };

  checkPasswordMatchStatus = () => {
    if (this.state.accountData.passwordConfirmColor === "input-error") {
      this.setState({
        showErrorToast: true,
        toastMessage: "Passwords don't match!"
      });
      return true;
    }
    return false;
  };

  checkDisplayNameStatus = () => {
    if (this.state.accountData.displayNameColor === "input-error") {
      this.setState({
        showErrorToast: true,
        toastMessage: "Username already taken!"
      });
      return true;
    }
    return false;
  };
  //----------------------------------------------------------------
  createAccount = () => {
    let error =
      this.checkPasswordComplexityStatus() ||
      this.checkPasswordMatchStatus() ||
      this.checkDisplayNameStatus();
    if (error) return;

    let newUser = {
      email: this.state.accountData.email,
      displayName: this.state.accountData.displayName,
      password: this.state.accountData.password
    };
    this.props.handleSubmit(newUser, "signup");
  };

  resetErrorToast = () => {
    this.setState({ showErrorToast: false, toastMessage: "" });
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
          <IonItem
            class={
              "login-signup-input-nestedcontainer login-ionitem " +
              this.state.accountData.displayNameColor
            }
          >
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
          <IonItem
            class={
              "login-signup-input-nestedcontainer login-ionitem " +
              this.state.accountData.passwordColor
            }
          >
            <IonInput
              class="login-signup-input-field"
              clearInput
              clearOnEdit={false}
              name="password"
              placeholder="Password"
              onIonChange={e =>
                this.handleSignUpField(e.target as HTMLInputElement)
              }
              type={
                this.state.accountData.passwordVisibility === false
                  ? PasswordVisibility.Password
                  : PasswordVisibility.Text
              }
            ></IonInput>

            {this.state.accountData.password ? (
              <IonIcon
                class="password-icon"
                icon={this.state.accountData.passwordVisibility ? eyeOff : eye}
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
            class={
              "login-signup-input-nestedcontainer login-ionitem " +
              this.state.accountData.passwordConfirmColor
            }
          >
            <IonInput
              class="login-signup-input-field"
              clearInput
              clearOnEdit={false}
              name="passwordConfirm"
              placeholder="Confirm Password"
              onIonChange={e =>
                this.handleSignUpField(e.target as HTMLInputElement)
              }
              type={
                this.state.accountData.passwordConfirmVisibility === false
                  ? PasswordVisibility.Password
                  : PasswordVisibility.Text
              }
            ></IonInput>

            {this.state.accountData.passwordConfirm ? (
              <IonIcon
                class="password-icon"
                icon={
                  this.state.accountData.passwordConfirmVisibility
                    ? eyeOff
                    : eye
                }
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
          isOpen={this.props.logInSignUpError || this.state.showErrorToast}
          message={this.props.toastMessage || this.state.toastMessage}
          duration={2000}
          onDidDismiss={() => {
            this.props.resetLogInSignUpError();
            this.resetErrorToast();
          }}
        />
      </>
    );
  }
}
