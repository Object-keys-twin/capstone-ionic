import {
  IonCard,
  IonCardContent,
  IonCardTitle,
  IonContent,
  IonHeader,
  IonItem,
  IonPage,
  IonTitle,
  IonIcon,
  IonImg,
  IonFab,
  IonFabButton,
  IonFabList,
  IonModal,
  IonButton,
  IonList,
  IonItemSliding,
  IonItemOption,
  IonItemOptions,
  IonGrid,
  IonRow,
  IonText,
  IonSkeletonText,
  IonCol,
  IonInput,
  IonToast
} from "@ionic/react";
import React, { Component } from "react";

import {
  create,
  heart,
  logOut,
  settings,
  trash,
  arrowDroprightCircle,
  eye,
  eyeOff
} from "ionicons/icons";
import { Link } from "react-router-dom";
import firebase from "firebase";
import db from "../firebase/firebase";

import "./Profile.css";

interface FavoriteObj {
  id: string;
  name: string;
}

// interface BusinessData {
//   id: string;
//   name: string;
//   location: string;
//   imageUrl: string;
//   categories: Array<object>;
//   rating?: number;
//   latitude: number;
//   longitude: number;
//   price?: string | undefined;
// }

type Props = {
  user: UserData;
  toggleFavorite: (checkpointId: string) => void;
  favoritesArray: Array<FavoriteObj>;
  addToStringBean: (business: object) => void;
  updateDisplayNameOrEmail: (displayNameOrEmail: string, type: string) => void;
};

type State = {
  tours: Array<DbData>;
  showFavoritesModal: boolean;
  addCheckpointModal: string;
  currentFavoriteData: object;
  showSkeleton: boolean;
  showEditAccountModal: boolean;
  editAccountData: EditAccountData;
  showErrorToast: boolean;
  toastMessage: string;
};

interface EditAccountData {
  displayName: string;
  email: string;
  password: string;
  passwordConfirm: string;
  passwordConfirmColor: string;
  displayNameColor: string;
  passwordColor: string;
  passwordVisibility: boolean;
  passwordConfirmVisibility: boolean;
}

enum PasswordVisibility {
  Password = "password",
  Text = "text"
}

interface DbData {
  checkpoints: Array<any>;
  description: string;
  name: string;
  created: object;
  upvotes: number;
  user: string;
}

interface UserData {
  email: string;
  uid: string;
  displayName: string;
  photoURL: string;
}

class Profile extends Component<Props, State> {
  state = {
    tours: Array<DbData>(),
    showFavoritesModal: false,
    addCheckpointModal: "",
    currentFavoriteData: {
      id: "",
      name: "",
      location: "",
      imageUrl: "",
      categories: [],
      rating: 0,
      latitude: 0,
      longitude: 0,
      price: ""
    },
    showSkeleton: false,
    showEditAccountModal: false,
    editAccountData: {
      displayName: "",
      email: "",
      password: "",
      passwordConfirm: "",
      passwordConfirmColor: "",
      displayNameColor: "",
      passwordColor: "",
      passwordVisibility: false,
      passwordConfirmVisibility: false
    },
    showErrorToast: false,
    toastMessage: ""
  };

  componentDidMount() {
    this.getUserTours();
    this.setState({
      editAccountData: {
        ...this.state.editAccountData,
        displayName: this.props.user.displayName,
        email: this.props.user.email
      }
    });
  }

  getUserTours = () => {
    db.collection("tours")
      .where("user", "==", this.props.user.displayName || this.props.user.email)
      .onSnapshot(querySnapshot => {
        let tourData = Array<DbData>();
        querySnapshot.forEach(doc => {
          tourData.push({
            checkpoints: doc.data().checkpoints,
            description: doc.data().description,
            name: doc.data().name,
            created: doc.data().timestamp,
            upvotes: doc.data().upvotes,
            user: doc.data().user
          });
        });

        this.setState({ tours: tourData });

        this.state.tours.forEach((tour, id) => {
          this.getCheckpoints(tour, id);
        });
      });
  };

  getCheckpoints = async (tour: any, idx: number) => {
    let checkpointsWithData: any = [];
    for (let i = 0; i < tour.checkpoints.length; i++) {
      const checkpoint = await db
        .collection("checkpoints")
        .doc(`${tour.checkpoints[i]}`)
        .get();
      checkpointsWithData.push(checkpoint.data());
    }

    let tours = this.state.tours;
    tours.forEach((el, i) => {
      if (i === idx) el.checkpoints = checkpointsWithData;
    });
    this.setState({ tours });
  };

  signOut = () => {
    firebase
      .auth()
      .signOut()
      .then(function() {
        // Sign-out successful.
      })
      .catch(function(error) {
        // An error happened.
      });
  };

  getBusinessFromFirestore = async (businessId: string) => {
    this.setState({ showSkeleton: true });

    const business = await db
      .collection("checkpoints")
      .doc(`${businessId}`)
      .get();
    const businessObj = business.data();

    if (businessObj) {
      this.setState({ currentFavoriteData: businessObj, showSkeleton: false });
    }
  };

  handleEditAccountField = (event: HTMLInputElement) => {
    this.setState({
      editAccountData: {
        ...this.state.editAccountData,
        [event.name]: event.value
      }
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

  //------TOGGLERS FOR PASSWORDS VISIBILITIES--------------
  togglePasswordVisibility = () => {
    this.setState({
      editAccountData: {
        ...this.state.editAccountData,
        passwordVisibility: !this.state.editAccountData.passwordVisibility
      }
    });
  };

  togglePasswordConfirmVisibility = () => {
    this.setState({
      editAccountData: {
        ...this.state.editAccountData,
        passwordConfirmVisibility: !this.state.editAccountData
          .passwordConfirmVisibility
      }
    });
  };

  //------TOGGLERS FOR INPUT FIELD ERROR - RED BACKGROUND-------------
  toggleDisplayNameColor = async () => {
    let duplicate = await this.checkForDuplicateDisplayName();
    if (duplicate) {
      this.setState({
        editAccountData: {
          ...this.state.editAccountData,
          displayNameColor: "input-error"
        }
      });
    } else {
      this.setState({
        editAccountData: { ...this.state.editAccountData, displayNameColor: "" }
      });
    }
  };

  //helper function for toggleDisplayNameColor
  checkForDuplicateDisplayName = async () => {
    let displayName = this.state.editAccountData.displayName;
    if (displayName === this.props.user.displayName || !displayName) {
      return false;
    }

    const duplicateName = await db
      .collection("users")
      .where("displayName", "==", `${displayName}`)
      .get();

    return duplicateName.empty === false;
  };

  togglePasswordColor = () => {
    let password = this.state.editAccountData.password;
    //password needs to contain at least one number, one uppercase, one lowercase, and be at least 6 characters
    if (password && !password.match(/^(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{6,}$/)) {
      this.setState({
        editAccountData: {
          ...this.state.editAccountData,
          passwordColor: "input-error"
        }
      });
    } else {
      this.setState({
        editAccountData: { ...this.state.editAccountData, passwordColor: "" }
      });
    }
  };

  togglePasswordConfirmColor = () => {
    if (
      this.state.editAccountData.password !==
      this.state.editAccountData.passwordConfirm
    ) {
      this.setState({
        editAccountData: {
          ...this.state.editAccountData,
          passwordConfirmColor: "input-error"
        }
      });
    } else {
      this.setState({
        editAccountData: {
          ...this.state.editAccountData,
          passwordConfirmColor: ""
        }
      });
    }
  };
  //-----------------------------------------------------------------

  //-----FINAL VALIDATIONS BEFORE UPDATING FIRESTORE---------------
  checkPasswordComplexityStatus = () => {
    if (this.state.editAccountData.passwordColor === "input-error") {
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
    if (this.state.editAccountData.passwordConfirmColor === "input-error") {
      this.setState({
        showErrorToast: true,
        toastMessage: "Passwords don't match!"
      });
      return true;
    }
    return false;
  };

  checkDisplayNameStatus = () => {
    if (this.state.editAccountData.displayNameColor === "input-error") {
      this.setState({
        showErrorToast: true,
        toastMessage: "Username already taken!"
      });
      return true;
    }
    return false;
  };
  //----------------------------------------------------------------

  //--------UPDATE FIREBASE AND FIRESTORE--------------------------
  updateUserOnFirestore = async () => {
    let error =
      this.checkPasswordComplexityStatus() ||
      this.checkPasswordMatchStatus() ||
      this.checkDisplayNameStatus();
    if (error) return;

    this.updateFirebaseAndFirestore();
    console.log("Updated user on Firebase and Firestore.");
    this.setState({ showEditAccountModal: false });
  };

  updateFirebaseAndFirestore = () => {
    const user = firebase.auth().currentUser;
    const userRef = db.collection("users").doc(this.props.user.uid);
    const { displayName, email, password } = this.state.editAccountData;
    if (user) {
      if (displayName !== user.displayName) {
        user.updateProfile({
          displayName
        });
        userRef.update({ displayName });
        this.props.updateDisplayNameOrEmail(displayName, "displayName");
      }
      if (email !== user.email) {
        user.updateEmail(email);
        userRef.update({ email });
        this.props.updateDisplayNameOrEmail(email, "email");
      }
      if (password) {
        user.updatePassword(password);
      } //need to cause re-verification thing to happen when changing password and email
      //also allow peeking at password entries
    }
  };

  //----------------------------------------------------------------

  resetErrorToast = () => {
    this.setState({ showErrorToast: false, toastMessage: "" });
  };

  render() {
    return (
      <IonPage>
        <IonHeader class="tab-header-block">
          <IonTitle size="small" class="tab-header header-font">
            My Profile
          </IonTitle>
          <IonFab vertical="top" horizontal="end">
            <IonFabButton id="settings-button">
              <IonIcon class="settings-tray-icon" icon={settings} />
            </IonFabButton>
            <IonFabList side="bottom" id="profile-settings-tray">
              <IonFabButton
                class="settings-tray-button"
                id="favorites-button"
                onClick={() => {
                  this.setState({ showFavoritesModal: true });
                }}
              >
                <IonIcon
                  class="settings-tray-icon favorites-icon"
                  icon={heart}
                />
              </IonFabButton>
              <IonFabButton
                class="settings-tray-button"
                id="edit-button"
                onClick={() => {
                  this.setState({ showEditAccountModal: true });
                }}
              >
                <IonIcon class="settings-tray-icon" icon={create} />
              </IonFabButton>
              <IonFabButton
                class="settings-tray-button"
                id="logout-button"
                onClick={this.signOut}
              >
                <IonIcon class="settings-tray-icon" icon={logOut} />
              </IonFabButton>
            </IonFabList>
          </IonFab>
        </IonHeader>
        <IonContent className="beancontent">
          <IonCard class="profile-card">
            <IonImg
              id="profile-photo"
              src={this.props.user.photoURL || "assets/icon/bean-profile.png"}
            />

            <IonCardTitle id="profile-text">
              Welcome, {this.props.user.displayName || this.props.user.email}!
            </IonCardTitle>
          </IonCard>
          <IonCard id="string-bean-title-card">
            <IonCardTitle className="string-bean-title">
              My Stringbeans
            </IonCardTitle>
          </IonCard>
          {this.state.tours.map((tour, i) => (
            <IonCard className="stringbean-card" key={i}>
              <IonItem lines="none" class="stringbean-header-container">
                <IonGrid class="checkpoint-row stringbean-header">
                  <IonCol class="list-checkpoint-col">
                    <IonRow>{tour.name}</IonRow>
                  </IonCol>
                  <IonCol class="list-favorites-col">
                    <Link
                      className="stringbean-link"
                      to={{
                        pathname: "/map",
                        state: { checkpoints: tour.checkpoints }
                      }}
                    >
                      <IonIcon
                        class="list-favorites-icon"
                        icon={arrowDroprightCircle}
                      ></IonIcon>
                    </Link>
                  </IonCol>
                </IonGrid>
              </IonItem>

              <IonCardContent class="stringbean-card-content">
                {tour.checkpoints.map((checkpoint, i) => {
                  if (checkpoint) {
                    return (
                      <IonItem lines="none" key={i}>
                        {checkpoint.name}
                      </IonItem>
                    );
                  }
                })}
              </IonCardContent>
            </IonCard>
          ))}

          <IonModal isOpen={this.state.showFavoritesModal}>
            <IonHeader>
              <IonTitle
                size="small"
                class="tab-header header-font"
                id="favorites-header"
              >
                My Favorites
              </IonTitle>
            </IonHeader>

            <IonContent class="modal-content">
              <IonList>
                {this.props.favoritesArray.map(favorite => {
                  return (
                    <IonItemSliding key={favorite.id}>
                      <IonItem
                        class="favorites-list-name"
                        lines="none"
                        onClick={() => {
                          this.setState({ addCheckpointModal: favorite.id });
                          this.getBusinessFromFirestore(favorite.id);
                        }}
                      >
                        {favorite.name}
                      </IonItem>
                      <IonItemOptions side="end">
                        <IonItemOption
                          color="danger"
                          onClick={() => {
                            this.props.toggleFavorite(favorite.id);
                          }}
                        >
                          <IonIcon slot="icon-only" icon={trash}></IonIcon>
                        </IonItemOption>
                      </IonItemOptions>
                      <IonModal
                        isOpen={favorite.id === this.state.addCheckpointModal}
                      >
                        <IonGrid class="modal-grid">
                          <IonRow class="modal-info">
                            {this.state.showSkeleton ? (
                              <IonGrid class="modal-info-grid">
                                <IonRow class="modal-info-text modal-name">
                                  <IonSkeletonText
                                    animated
                                    width="70vw"
                                    class="skeleton-name"
                                  ></IonSkeletonText>
                                </IonRow>
                                <IonRow class="modal-info-text">
                                  <IonSkeletonText
                                    animated
                                    width="50vw"
                                    class="skeleton-location"
                                  ></IonSkeletonText>
                                </IonRow>
                                <IonRow>
                                  <IonSkeletonText
                                    animated
                                    width="60vw"
                                    class="skeleton-image"
                                  ></IonSkeletonText>
                                </IonRow>
                                <IonRow class="modal-info-text">
                                  <IonSkeletonText
                                    animated
                                    width="35vw"
                                    class="skeleton-rating-price"
                                  ></IonSkeletonText>
                                </IonRow>
                                <IonRow class="modal-info-text">
                                  <IonSkeletonText
                                    animated
                                    width="30vw"
                                    class="skeleton-rating-price"
                                  ></IonSkeletonText>
                                </IonRow>
                              </IonGrid>
                            ) : (
                              <IonGrid class="modal-info-grid">
                                <IonRow class="modal-info-text modal-name">
                                  {this.state.currentFavoriteData.name}
                                </IonRow>
                                <IonRow class="modal-info-text">
                                  {this.state.currentFavoriteData.location}
                                </IonRow>
                                <IonRow>
                                  <IonImg
                                    class="modal-image"
                                    src={
                                      this.state.currentFavoriteData.imageUrl ||
                                      "assets/icon/bean-profile.png"
                                    }
                                  ></IonImg>
                                </IonRow>
                                <IonRow class="modal-info-text">
                                  Rating:{" "}
                                  {this.state.currentFavoriteData.rating}
                                  /5
                                </IonRow>
                                <IonRow class="modal-info-text">
                                  Price:&nbsp;
                                  <IonText class="modal-price-dollars">
                                    {this.state.currentFavoriteData.price ||
                                      "N/A"}
                                  </IonText>
                                </IonRow>
                              </IonGrid>
                            )}
                          </IonRow>
                          <IonRow class="modal-buttons-row">
                            <IonButton
                              class="modal-button modal-button-add"
                              size="small"
                              onClick={() => {
                                this.props.addToStringBean(
                                  this.state.currentFavoriteData
                                );
                                this.setState({ addCheckpointModal: "" });
                              }}
                              disabled={this.state.showSkeleton}
                            >
                              Add To Stringbean
                            </IonButton>
                            <IonButton
                              class="modal-button  modal-button-back"
                              onClick={() => {
                                this.setState({ addCheckpointModal: "" });
                              }}
                            >
                              Back
                            </IonButton>
                          </IonRow>
                        </IonGrid>
                      </IonModal>
                    </IonItemSliding>
                  );
                })}
              </IonList>
            </IonContent>

            <IonButton
              class="modal-button"
              id="favorites-modal-button-back"
              onClick={() => {
                this.setState({ showFavoritesModal: false });
              }}
            >
              Back To My Profile
            </IonButton>
          </IonModal>
          <IonModal isOpen={this.state.showEditAccountModal}>
            <IonHeader>
              <IonTitle
                size="small"
                class="tab-header header-font"
                id="favorites-header"
              >
                Edit Account
              </IonTitle>
            </IonHeader>
            <IonItem>USERNAME</IonItem>
            <IonInput
              class={
                "login-signup-input-field " +
                this.state.editAccountData.displayNameColor
              }
              clearInput
              type="text"
              value={this.state.editAccountData.displayName}
              placeholder="displayName"
              name="displayName"
              onIonChange={e =>
                this.handleEditAccountField(e.target as HTMLInputElement)
              }
            ></IonInput>
            <IonItem>EMAIL</IonItem>
            <IonInput
              class="login-signup-input-field"
              clearInput
              type="email"
              value={this.state.editAccountData.email}
              placeholder="Email"
              name="email"
              onIonChange={e =>
                this.handleEditAccountField(e.target as HTMLInputElement)
              }
            ></IonInput>
            <IonItem>PASSWORD</IonItem>
            <IonItem
              lines="none"
              class="login-signup-input-nestedcontainer login-ionitem"
            >
              <IonInput
                class={
                  "login-signup-input-field " +
                  this.state.editAccountData.passwordColor
                }
                clearInput
                clearOnEdit={false}
                type={
                  this.state.editAccountData.passwordVisibility === false
                    ? PasswordVisibility.Password
                    : PasswordVisibility.Text
                }
                value={this.state.editAccountData.password}
                placeholder="New Password"
                name="password"
                onIonChange={e =>
                  this.handleEditAccountField(e.target as HTMLInputElement)
                }
              ></IonInput>
              {this.state.editAccountData.password ? (
                <IonIcon
                  class="password-icon"
                  icon={
                    this.state.editAccountData.passwordVisibility ? eyeOff : eye
                  }
                  onClick={this.togglePasswordVisibility}
                />
              ) : null}
            </IonItem>
            <IonItem
              lines="none"
              class="login-signup-input-nestedcontainer login-ionitem"
            >
              <IonInput
                class={
                  "login-signup-input-field " +
                  this.state.editAccountData.passwordConfirmColor
                }
                clearInput
                clearOnEdit={false}
                type={
                  this.state.editAccountData.passwordConfirmVisibility === false
                    ? PasswordVisibility.Password
                    : PasswordVisibility.Text
                }
                value={this.state.editAccountData.passwordConfirm}
                placeholder="Confirm Password"
                name="passwordConfirm"
                onIonChange={e =>
                  this.handleEditAccountField(e.target as HTMLInputElement)
                }
              ></IonInput>
              {this.state.editAccountData.passwordConfirm ? (
                <IonIcon
                  class="password-icon"
                  icon={
                    this.state.editAccountData.passwordConfirmVisibility
                      ? eyeOff
                      : eye
                  }
                  onClick={this.togglePasswordConfirmVisibility}
                />
              ) : null}
            </IonItem>
            <IonItem>
              Passwords must be at least 6 characters long and contain an
              uppercase letter, a lowercase letter, and a number.
            </IonItem>
            <IonButton
              class="modal-button modal-button-add"
              size="small"
              onClick={() => {
                this.updateUserOnFirestore();
              }}
            >
              Submit
            </IonButton>
            <IonButton
              class="modal-button modal-button-add"
              size="small"
              onClick={() => {
                this.setState({ showEditAccountModal: false });
              }}
            >
              Back
            </IonButton>
            <IonToast
              cssClass="login-signup-toast"
              isOpen={this.state.showErrorToast}
              message={this.state.toastMessage}
              duration={2000}
              onDidDismiss={() => {
                this.resetErrorToast();
              }}
            />
          </IonModal>
        </IonContent>
      </IonPage>
    );
  }
}

export default Profile;
