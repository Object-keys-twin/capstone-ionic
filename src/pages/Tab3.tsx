import React, { Component } from "react";
import {
  IonHeader,
  IonPage,
  IonTitle,
  IonContent,
  IonItem,
  IonButton,
  IonModal,
  IonSpinner,
  IonCard,
  IonInput,
  IonIcon,
  IonGrid,
  IonRow,
  IonImg,
  IonText,
  IonCol,
  IonSkeletonText
} from "@ionic/react";
import { heart, heartEmpty, search } from "ionicons/icons";
import { Plugins } from "@capacitor/core";
import axios from "axios";
import BeanMenu from "./BeanMenu";
import { yelpApiKey } from "../secrets";
import db from "../firebase/firebase";
import "./Tab3.css";

const { Geolocation } = Plugins;

type Props = {
  favorites: { [key: string]: any };
  stringbean: Array<BusinessData>;
  toggleFavorite: (checkpointId: string) => void;
  addToStringBean: (business: object) => void;
  removeFromStringBean: (id: string) => void;
  clearStorageOnPublish: () => void;
};

interface BusinessData {
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

type State = {
  latitude: number;
  longitude: number;
  businesses: Array<BusinessData>;
  search: string;
  showModal: number;
  searchSpinner: boolean;
};

class CreateStory extends Component<Props, State> {
  state = {
    latitude: 0,
    longitude: 0,
    businesses: Array<BusinessData>(),
    search: "",
    showModal: Infinity,
    searchSpinner: false
  };

  componentDidMount() {
    this.getCurrentPosition();
  }

  getCurrentPosition = async () => {
    const coordinates = await Geolocation.getCurrentPosition();
    this.setState({
      latitude: coordinates.coords.latitude,
      longitude: coordinates.coords.longitude
    });
    this.getYelpBusinesses(this.state.latitude, this.state.longitude);
  };

  keyUpHandler = (e: any) => {
    if (e.key === "Enter") {
      this.getYelpBusinesses(
        this.state.latitude,
        this.state.longitude,
        this.state.search
      );
      this.setState({ searchSpinner: true });
    }
  };

  getYelpBusinesses = async (
    latitude: number,
    longitude: number,
    term?: string
  ) => {
    const api = axios.create({
      baseURL: "https://cors-anywhere.herokuapp.com/https://api.yelp.com/v3",
      headers: {
        Authorization: `Bearer ${yelpApiKey}`
      }
    });
    const { data } = await api.get("/businesses/search", {
      params: {
        limit: 20,
        latitude: latitude,
        longitude: longitude,
        term: term
      }
    });

    const info = data.businesses.map((business: any) => ({
      id: business.id,
      name: business.name,
      location:
        business.location.display_address[0] +
        ", " +
        business.location.display_address[1],
      latitude: business.coordinates.latitude,
      longitude: business.coordinates.longitude,
      price: business.price,
      imageUrl: business.image_url,
      categories: business.categories,
      rating: business.rating
    }));

    this.setState({ businesses: info, searchSpinner: false });
  };

  handleChange = (e: string) => {
    this.setState({ search: e });
  };

  createOrUpdateCheckpoint = async (bean: BusinessData) => {
    let beanRef = db.collection("checkpoints").doc(bean.id);
    let getBean = await beanRef.get();
    if (!getBean.data()) {
      if (bean.price === undefined) {
        bean.price = "not available";
      }
      await beanRef.set(bean);
      console.log("Created checkpoint in Firestore:", bean.name);
    }
    //this only creates. need to add update functionality, so as yelp data update in the future, firestore will also be updated
  };

  renderHeart = (checkpointId: string) => {
    let favorites = this.props.favorites;
    if (favorites[checkpointId]) return heart;
    else return heartEmpty;
  };

  render() {
    const { businesses } = this.state;

    return (
      <IonPage
        className="beancontent"
        onKeyUp={(e: any) => this.keyUpHandler(e)}
      >
        <IonHeader class="tab-header-block">
          <IonTitle size="small" class="tab-header header-font">
            Beans
          </IonTitle>
        </IonHeader>
        <BeanMenu
          stringbean={this.props.stringbean}
          removeFromStringBean={this.props.removeFromStringBean}
          clearStorageOnPublish={this.props.clearStorageOnPublish}
        />
        <IonCard id="search-bar">
          <IonInput
            id="search-box"
            clearInput
            onIonChange={e =>
              this.handleChange((e.target as HTMLInputElement).value)
            }
            placeholder="Search for beans!"
          ></IonInput>
          <IonButton
            id="search-button"
            size="small"
            onClick={() => {
              this.getYelpBusinesses(
                this.state.latitude,
                this.state.longitude,
                this.state.search
              );
              this.setState({ searchSpinner: true });
            }}
          >
            {this.state.searchSpinner ? (
              <IonSpinner id="search-spinner"></IonSpinner>
            ) : (
              <IonIcon icon={search} />
            )}
          </IonButton>
        </IonCard>
        <IonContent className="beancontent">
          {businesses.length ? (
            <>
              {businesses.map((business, idx) => (
                <IonCard className="beancard" key={idx}>
                  <IonGrid item-content class="checkpoint-row">
                    <IonCol class="list-checkpoint-col">
                      <IonItem
                        lines="none"
                        className="beanitem"
                        onClick={() => this.setState({ showModal: idx })}
                      >
                        {business.name} <br></br>
                        {business.location}
                      </IonItem>
                    </IonCol>
                    <IonCol class="list-favorites-col">
                      <IonIcon
                        class="favorites-icon list-favorites-icon"
                        onClick={() => {
                          this.createOrUpdateCheckpoint(business);
                          this.props.toggleFavorite(business.id);
                        }}
                        icon={this.renderHeart(business.id)}
                      />
                    </IonCol>
                  </IonGrid>

                  <IonModal isOpen={idx === this.state.showModal}>
                    <IonGrid class="modal-grid">
                      <IonRow class="modal-info">
                        <IonGrid class="modal-info-grid">
                          <IonRow class="modal-info-text modal-name">
                            {business.name}
                          </IonRow>
                          <IonRow class="modal-info-text">
                            {business.location}
                          </IonRow>
                          <IonRow>
                            <IonImg
                              class="modal-image"
                              src={
                                business.imageUrl ||
                                "assets/icon/bean-profile.png"
                              }
                            ></IonImg>
                          </IonRow>
                          <IonRow class="modal-info-text">
                            Rating: {business.rating}/5
                          </IonRow>
                          <IonRow class="modal-info-text">
                            Price:&nbsp;
                            <IonText class="modal-price-dollars">
                              {business.price || "N/A"}
                            </IonText>
                          </IonRow>
                        </IonGrid>
                      </IonRow>

                      <IonRow class="modal-buttons-row">
                        <IonButton
                          class="modal-button modal-button-add"
                          size="small"
                          onClick={() => {
                            this.props.addToStringBean(business);
                            this.setState({ showModal: Infinity });
                          }}
                        >
                          Add To Stringbean
                        </IonButton>
                        <IonButton
                          class="modal-button modal-button-back"
                          onClick={() => {
                            this.setState({ showModal: Infinity });
                          }}
                        >
                          Back
                        </IonButton>
                      </IonRow>
                    </IonGrid>
                  </IonModal>
                </IonCard>
              ))}
            </>
          ) : (
            <>
              {[...Array(20)].map((placeholder, idx) => (
                <IonCard className="beancard" key={idx}>
                  <IonGrid item-content class="checkpoint-row">
                    <IonCol class="list-checkpoint-col">
                      <IonItem lines="none" className="beanitem">
                        <IonGrid>
                          <IonRow>
                            <IonSkeletonText
                              animated
                              width="50vw"
                              class="skeleton-text"
                            ></IonSkeletonText>
                          </IonRow>
                          <IonRow>
                            <IonSkeletonText
                              animated
                              width="70vw"
                              class="skeleton-text"
                            ></IonSkeletonText>
                          </IonRow>
                        </IonGrid>
                      </IonItem>
                    </IonCol>
                    <IonCol class="list-favorites-col">
                      <IonIcon
                        class="skeleton-heart list-favorites-icon"
                        icon={heart}
                      />
                    </IonCol>
                  </IonGrid>
                </IonCard>
              ))}
            </>
          )}
        </IonContent>
      </IonPage>
    );
  }
}

export default CreateStory;
