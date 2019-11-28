import React, { Component } from "react";
import {
	IonHeader,
	IonToolbar,
	IonPage,
	IonTitle,
	IonContent,
} from "@ionic/react";
import { Plugins } from "@capacitor/core";
import axios from "axios";

const { Geolocation } = Plugins;

// const YELP_API_KEY =
// 	"zbczWecavwX-PEqu2ZY9Nji3l8hmfiBgSBgaOElh8q_XS-izyIPL1IWRiI77e-z6PXvZIWq6WI3oujk8_cui6_2Xs2IP4sksuRv9zow3ynMHGZBWcywWbOPs3XvNXXYx";

// const api = axios.create({
// 	baseURL: "https://api.yelp.com/v3",
// 	headers: {
// 		Authorization: `Bearer ${YELP_API_KEY}`
// 	}
// });

interface BusinessData {
	name: string;
	location: object;
	imageUrl: string;
	categories: Array<object>;
	rating: number;
}

type State = {
	latitude: number;
	longitude: number;
	businesses: Array<BusinessData>;
};

class CreateStory extends Component<{}, State> {
	state = { latitude: 0, longitude: 0, businesses: Array<BusinessData>() };

	componentDidMount() {
		this.getCurrentPosition();
	}

	async getYelp(latitude: number, longitude: number) {
		const YELP_API_KEY =
			"zbczWecavwX-PEqu2ZY9Nji3l8hmfiBgSBgaOElh8q_XS-izyIPL1IWRiI77e-z6PXvZIWq6WI3oujk8_cui6_2Xs2IP4sksuRv9zow3ynMHGZBWcywWbOPs3XvNXXYx";

		const api = axios.create({
			baseURL: "https://api.yelp.com/v3",
			headers: {
				Authorization: `Bearer ${YELP_API_KEY}`,
				"Access-Control-Allow-Origin": "*"
			}
		});
		const { data } = await api.get("/businesses/search", {
			params: {
				limit: 20,
				latitude: latitude,
				longitude: longitude
			}
		});

		const info = data.businesses.map((business: any) => ({
			name: business.name,
			location: business.location,
			imageUrl: business.image_url,
			categories: business.categories,
			rating: business.rating
		}));

		this.setState({ businesses: info });
	}

	async getCurrentPosition() {
		const coordinates = await Geolocation.getCurrentPosition();
		this.setState(
			{
				latitude: coordinates.coords.latitude,
				longitude: coordinates.coords.longitude
			},
			() => {
				this.getYelp(this.state.latitude, this.state.longitude);
			}
		);
	}

	// handleChange(e: HTMLInputElement);
	render() {
		const { businesses } = this.state;
		if (businesses.length) {
			return (
				<IonPage>
					<IonHeader>
						<IonToolbar>
							{!this.state.latitude ? (
								<IonTitle>Locating...</IonTitle>
							) : (
								<IonTitle>
									Lat: {this.state.latitude}, Long: {this.state.longitude}
								</IonTitle>
							)}
						</IonToolbar>
					</IonHeader>
					{/* <IonSearchbar onIonChange={}></IonSearchbar> */}
					<IonContent>
						{businesses.map(business => (
							<IonContent>{business.name}</IonContent>
						))}
					</IonContent>
				</IonPage>
			);
		}
		return <IonPage></IonPage>;
	}
}

export default CreateStory;
