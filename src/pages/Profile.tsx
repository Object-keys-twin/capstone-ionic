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
  IonToast,
  IonSpinner
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

enum PasswordOrConfirm {
  CurrentPassword = "currentPasswordVisibility",
  Password = "passwordVisibility",
  Confirm = "passwordConfirmVisibility"
}

enum PasswordVisibility {
  Password = "password",
  Text = "text"
}

interface FavoriteObj {
  id: string;
  name: string;
}

interface AccountData {
  displayName: string;
  displayNameColor: string;
  email: string;
  currentPassword: string;
  currentPasswordColor: string;
  currentPasswordVisibility: boolean;
  password: string;
  passwordColor: string;
  passwordVisibility: boolean;
  passwordConfirm: string;
  passwordConfirmColor: string;
  passwordConfirmVisibility: boolean;
  spinnerVisibility: string;
}

interface DbData {
  checkpoints: Array<CheckpointData>;
  description: string;
  name: string;
  created: Date;
  upvotes: number;
  user: string;
}

interface CheckpointData {
  id: string;
  name: string;
  location: string;
  imageUrl: string;
  categories: Array<object>;
  rating?: number;
  latitude: number;
  longitude: number;
  price?: string | undefined;
}

interface UserData {
  email: string;
  uid: string;
  displayName: string;
  photoURL: string;
}

type Props = {
  user: UserData;
  toggleFavorite: (checkpointId: string) => void;
  favoritesArray: Array<FavoriteObj>;
  addToStringBean: (business: object) => void;
  updateDisplayNameOrEmail: (displayNameOrEmail: string, type: string) => void;
  mapErrorToastMessage: string;
  showMapErrorToast: boolean;
};

type State = {
  tours: Array<DbData>;
  showFavoritesModal: boolean;
  addCheckpointModal: string;
  currentFavoriteData: object;
  showSkeleton: boolean;
  showEditAccountModal: boolean;
  accountData: AccountData;
  showErrorToast: boolean;
  toastMessage: string;
  removePersonalToursListener: () => void;
};

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
    accountData: {
      displayName: "",
      displayNameColor: "",
      email: "",
      currentPassword: "",
      currentPasswordColor: "",
      currentPasswordVisibility: false,
      password: "",
      passwordColor: "",
      passwordVisibility: false,
      passwordConfirm: "",
      passwordConfirmColor: "",
      passwordConfirmVisibility: false,
      spinnerVisibility: "hidden"
    },
    showErrorToast: false,
    toastMessage: "",
    removePersonalToursListener: () => {}
  };

  componentDidMount() {
    this.getUserTours();
    this.setState({
      accountData: {
        ...this.state.accountData,
        displayName: this.props.user.displayName,
        email: this.props.user.email
      }
    });
  }

  getUserTours = () => {
    const removePersonalToursListener = db
      .collection("tours")
      .where("user", "==", this.props.user.displayName || this.props.user.email)
      .onSnapshot(querySnapshot => {
        let tours = Array<DbData>();
        querySnapshot.forEach(doc => {
          tours.push({
            checkpoints: doc.data().checkpoints,
            description: doc.data().description,
            name: doc.data().name,
            created: doc.data().created,
            upvotes: doc.data().upvotes,
            user: doc.data().user
          });
        });

        this.setState({ tours });

        tours.forEach((tour, idx) => {
          this.getCheckpointsData(tour, idx);
        });
      });
    this.setState({ removePersonalToursListener });
  };

  getCheckpointsData = async (tour: DbData, idx: number) => {
    let checkpointsWithData: Array<CheckpointData> = [];
    for (let i = 0; i < tour.checkpoints.length; i++) {
      const checkpoint = await db
        .collection("checkpoints")
        .doc(`${tour.checkpoints[i]}`)
        .get();
      const checkpointData = checkpoint.data();
      if (checkpointData) {
        const checkpointObj = {
          id: checkpointData.id,
          name: checkpointData.name,
          location: checkpointData.location,
          imageUrl: checkpointData.imageUrl,
          categories: checkpointData.categories,
          rating: checkpointData.rating,
          latitude: checkpointData.latitude,
          longitude: checkpointData.longitude,
          price: checkpointData.price
        };
        checkpointsWithData.push(checkpointObj);
      }
    }

    let tours = this.state.tours;
    tours[idx].checkpoints = checkpointsWithData;
    this.setState({ tours });
  };

  signOut = () => {
    this.state.removePersonalToursListener();
    firebase
      .auth()
      .signOut()
      .catch(error => {
        console.log("Sign-out failed.");
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
      accountData: {
        ...this.state.accountData,
        [event.name]: event.value
      }
    });

    if (event.name === "password" || event.name === "passwordConfirm") {
      this.togglePasswordConfirmColor();
      if (event.name === "password") {
        this.togglePasswordColor();
        this.toggleCurrentPasswordColor();
      }
    } else if (event.name === "displayName") {
      this.toggleDisplayNameColor();
    } else {
      //only other option is changing the email or currentpassword fields
      this.toggleCurrentPasswordColor();
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
    this.setState({
      accountData: {
        ...this.state.accountData,
        spinnerVisibility: ""
      }
    });
    let duplicate = await this.checkForDuplicateDisplayName();
    if (duplicate) {
      this.setState({
        accountData: {
          ...this.state.accountData,
          displayNameColor: "input-error",
          spinnerVisibility: "hidden"
        }
      });
    } else {
      this.setState({
        accountData: {
          ...this.state.accountData,
          displayNameColor: "",
          spinnerVisibility: "hidden"
        }
      });
    }
  };

  //helper function for toggleDisplayNameColor
  checkForDuplicateDisplayName = async () => {
    let displayName = this.state.accountData.displayName;
    if (displayName === this.props.user.displayName || !displayName) {
      return false;
    }

    const duplicateName = await db
      .collection("users")
      .where("displayName", "==", `${displayName}`)
      .get();

    return duplicateName.empty === false;
  };

  toggleCurrentPasswordColor = () => {
    if (
      (this.state.accountData.email !== this.props.user.email ||
        this.state.accountData.password) &&
      !this.state.accountData.currentPassword //can't really verify if the typed password matches the one in firebase auth
    ) {
      this.setState({
        accountData: {
          ...this.state.accountData,
          currentPasswordColor: "input-error"
        }
      });
    } else {
      this.setState({
        accountData: {
          ...this.state.accountData,
          currentPasswordColor: ""
        }
      });
    }
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

  //-----FINAL VALIDATIONS BEFORE UPDATING FIRESTORE---------------
  checkPasswordComplexityStatus = () => {
    if (this.state.accountData.passwordColor === "input-error") {
      this.setState({
        showErrorToast: true,
        toastMessage:
          "Passwords must contain at least 6 characters, a lowercase, an uppercase, and a number."
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

  checkCurrentPasswordStatus = () => {
    if (this.state.accountData.currentPasswordColor === "input-error") {
      this.setState({
        showErrorToast: true,
        toastMessage: "Current password required to make these changes."
      });
      return true;
    }
    return false;
  };

  //----------------------------------------------------------------

  //--------UPDATE FIREBASE AND FIRESTORE--------------------------
  attemptUpdateUser = async () => {
    let error =
      this.checkPasswordComplexityStatus() ||
      this.checkPasswordMatchStatus() ||
      this.checkDisplayNameStatus() ||
      this.checkCurrentPasswordStatus();
    if (error) return;

    this.updateFirebaseAndFirestore();
    console.log("Updated user on Firebase and Firestore.");
    this.setState({
      showEditAccountModal: false
    });
  };

  updateFirebaseAndFirestore = async () => {
    const user = firebase.auth().currentUser;
    const userRef = db.collection("users").doc(this.props.user.uid);
    const { displayName, email, password } = this.state.accountData;
    if (user) {
      await this.updateDisplayName(user, userRef, displayName);
      await this.updateEmail(user, userRef, email);
      this.updatePassword(user, password);
      this.getUserTours();
    }
  };

  updateDisplayName = async (
    user: firebase.User,
    userRef: firebase.firestore.DocumentReference,
    displayName: string
  ) => {
    if (displayName !== user.displayName) {
      user.updateProfile({
        displayName
      });
      userRef.update({ displayName });

      await this.updateDisplayNameOnTours(displayName);

      this.props.updateDisplayNameOrEmail(displayName, "displayName");
    }
  };

  updateDisplayNameOnTours = async (displayName: string) => {
    await db
      .collection("tours")
      .where("user", "==", this.props.user.displayName || this.props.user.email)
      .get()
      .then(response => {
        let batch = db.batch();
        response.docs.forEach(doc => {
          const ref = db.collection("tours").doc(doc.id);
          displayName
            ? batch.update(ref, { user: displayName })
            : batch.update(ref, { user: this.state.accountData.email });
        });
        batch.commit().then(() => {
          console.log(`Updated all associated stringbeans with new username.`);
        });
      });
  };

  updateEmail = async (
    user: firebase.User,
    userRef: firebase.firestore.DocumentReference,
    email: string
  ) => {
    if (email !== user.email && user.email) {
      user
        .reauthenticateWithCredential(
          firebase.auth.EmailAuthProvider.credential(
            user.email,
            this.state.accountData.currentPassword
          )
        )
        .then(() => {
          user.updateEmail(email);
        });
      userRef.update({ email });

      await this.updateEmailOnTours(email);

      this.props.updateDisplayNameOrEmail(email, "email");
    }
  };

  updateEmailOnTours = async (email: string) => {
    await db
      .collection("tours")
      .where("user", "==", this.props.user.email)
      .get()
      .then(response => {
        let batch = db.batch();
        response.docs.forEach(doc => {
          const ref = db.collection("tours").doc(doc.id);
          batch.update(ref, { user: email });
        });
        batch.commit().then(() => {
          console.log(
            `Updated all associated stringbeans with new email if no username exists.`
          );
        });
      });
  };

  updatePassword = (user: firebase.User, password: string) => {
    if (password && user.email) {
      user
        .reauthenticateWithCredential(
          firebase.auth.EmailAuthProvider.credential(
            user.email,
            this.state.accountData.currentPassword
          )
        )
        .then(() => {
          user.updatePassword(password);
        });

      this.setState({
        accountData: {
          ...this.state.accountData,
          currentPassword: "",
          password: "",
          passwordConfirm: ""
        }
      });
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
            Profile
          </IonTitle>
          {/* -------------------------OPTIONS TRAY------------------------- */}
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
                  this.setState({
                    accountData: {
                      ...this.state.accountData,
                      displayName: this.props.user.displayName,
                      email: this.props.user.email,
                      currentPassword: "",
                      password: "",
                      passwordConfirm: ""
                    },
                    showEditAccountModal: true
                  });
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
        {/* -----------------------PIC & USERNAME CARD---------------------- */}
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
          {/* -----------------------STRINGBEAN CARDS------------------------ */}
          {this.state.tours.map((tour, idx) => (
            <IonCard className="stringbean-card" key={idx}>
              <IonItem lines="none" class="stringbean-header-container">
                <IonGrid class="checkpoint-row stringbean-header">
                  <IonCol class="list-checkpoint-col">
                    <IonRow>{tour.name}</IonRow>
                  </IonCol>
                  <IonCol class="list-favorites-col">
                    <Link
                      className="stringbean-link"
                      to={
                        tour.checkpoints[tour.checkpoints.length - 1].name
                          ? {
                              pathname: "/map",
                              state: { checkpoints: tour.checkpoints }
                            }
                          : { pathname: "/profile" }
                      }
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
                {tour.checkpoints.map((checkpoint, idx) => {
                  if (checkpoint.name) {
                    return (
                      <IonItem lines="none" key={idx}>
                        {checkpoint.name}
                      </IonItem>
                    );
                  } else {
                    return (
                      <IonItem lines="none" key={idx}>
                        <IonSkeletonText
                          animated
                          width="70vw"
                          class="profile-skeleton-text"
                        />
                      </IonItem>
                    );
                  }
                })}
              </IonCardContent>
            </IonCard>
          ))}
          {/*------------------------FAVORITES MODAL------------------------*/}
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
          {/* -------------------EDIT ACCOUNT MODAL------------------------ */}
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

            <IonCard id="edit-modal-username-container">
              <IonItem
                class="edit-modal-headers"
                lines="none"
                id="edit-modal-username-header"
              >
                Username
                <IonSpinner
                  id="username-spinner"
                  class={this.state.accountData.spinnerVisibility}
                ></IonSpinner>
              </IonItem>
              <IonItem
                lines="none"
                class={this.state.accountData.displayNameColor}
              >
                <IonInput
                  class="login-signup-input-field "
                  clearInput
                  type="text"
                  value={this.state.accountData.displayName}
                  placeholder="Enter Username"
                  name="displayName"
                  onIonChange={e =>
                    this.handleEditAccountField(e.target as HTMLInputElement)
                  }
                ></IonInput>
              </IonItem>
            </IonCard>
            <IonCard id="edit-modal-password-required-container">
              <IonItem
                class="edit-modal-headers"
                id="edit-modal-password-required-header"
                lines="none"
              >
                Password-Locked Changes
              </IonItem>
              <IonItem
                lines="none"
                class={this.state.accountData.currentPasswordColor}
              >
                <IonInput
                  class="login-signup-input-field ahhh"
                  clearInput
                  clearOnEdit={false}
                  type={
                    this.state.accountData.currentPasswordVisibility === false
                      ? PasswordVisibility.Password
                      : PasswordVisibility.Text
                  }
                  value={this.state.accountData.currentPassword}
                  placeholder="Current Password Required"
                  name="currentPassword"
                  onIonChange={e =>
                    this.handleEditAccountField(e.target as HTMLInputElement)
                  }
                ></IonInput>
                {this.state.accountData.currentPassword ? (
                  <IonIcon
                    class="password-icon"
                    icon={
                      this.state.accountData.currentPasswordVisibility
                        ? eyeOff
                        : eye
                    }
                    onClick={() =>
                      this.toggleVisibility(PasswordOrConfirm.CurrentPassword)
                    }
                  />
                ) : null}
              </IonItem>
              <IonCard>
                <IonItem class="edit-modal-headers" lines="none">
                  Email
                </IonItem>
                <IonItem lines="none">
                  <IonInput
                    class="login-signup-input-field"
                    clearInput
                    type="email"
                    value={this.state.accountData.email}
                    placeholder="Enter Email"
                    name="email"
                    onIonChange={e =>
                      this.handleEditAccountField(e.target as HTMLInputElement)
                    }
                  ></IonInput>
                </IonItem>

                <IonItem class="edit-modal-headers" lines="none">
                  Password
                </IonItem>
                <IonItem
                  lines="none"
                  class={this.state.accountData.passwordColor}
                >
                  <IonInput
                    class="login-signup-input-field"
                    clearInput
                    clearOnEdit={false}
                    type={
                      this.state.accountData.passwordVisibility === false
                        ? PasswordVisibility.Password
                        : PasswordVisibility.Text
                    }
                    value={this.state.accountData.password}
                    placeholder="New Password"
                    name="password"
                    onIonChange={e =>
                      this.handleEditAccountField(e.target as HTMLInputElement)
                    }
                  ></IonInput>
                  {this.state.accountData.password ? (
                    <IonIcon
                      class="password-icon"
                      icon={
                        this.state.accountData.passwordVisibility ? eyeOff : eye
                      }
                      onClick={() =>
                        this.toggleVisibility(PasswordOrConfirm.Password)
                      }
                    />
                  ) : null}
                </IonItem>
                <IonItem
                  lines="none"
                  class={this.state.accountData.passwordConfirmColor}
                >
                  <IonInput
                    class="login-signup-input-field"
                    clearInput
                    clearOnEdit={false}
                    type={
                      this.state.accountData.passwordConfirmVisibility === false
                        ? PasswordVisibility.Password
                        : PasswordVisibility.Text
                    }
                    value={this.state.accountData.passwordConfirm}
                    placeholder="Confirm Password"
                    name="passwordConfirm"
                    onIonChange={e =>
                      this.handleEditAccountField(e.target as HTMLInputElement)
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
                      onClick={() =>
                        this.toggleVisibility(PasswordOrConfirm.Confirm)
                      }
                    />
                  ) : null}
                </IonItem>
              </IonCard>
              <IonItem id="edit-modal-password-rules" lines="none">
                Passwords must contain at least 6 characters, an uppercase
                letter, a lowercase letter, and a number.
              </IonItem>
            </IonCard>
            <IonRow id="edit-modal-button-row">
              <IonButton
                class="modal-button edit-modal-button"
                id="edit-modal-button-back"
                size="small"
                onClick={() => {
                  this.setState({
                    showEditAccountModal: false
                  });
                }}
              >
                Back
              </IonButton>
              <IonButton
                class="modal-button edit-modal-button"
                id="edit-modal-button-submit"
                size="small"
                onClick={() => {
                  this.attemptUpdateUser();
                }}
              >
                Submit
              </IonButton>
            </IonRow>

            {/* ------------------------ERROR TOAST-------------------------- */}
            <IonToast
              cssClass="login-signup-toast"
              isOpen={this.state.showErrorToast || this.props.showMapErrorToast}
              message={
                this.state.toastMessage || this.props.mapErrorToastMessage
              }
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
