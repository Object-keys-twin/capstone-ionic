import React, { Component } from "react";
import {
	IonHeader,
	IonToolbar,
	IonPage,
	IonTitle,
	IonContent,
<<<<<<< HEAD
=======
	IonSearchbar,
	IonItem,
	IonButton,
	IonModal
>>>>>>> master
} from "@ionic/react";
import { Plugins } from "@capacitor/core";
import axios from "axios";
import { SearchbarChangeEventDetail } from "@ionic/core";
import BeanMenu from "./BeanMenu";

const { Geolocation, Storage } = Plugins;

// const YELP_API_KEY =
// 	"zbczWecavwX-PEqu2ZY9Nji3l8hmfiBgSBgaOElh8q_XS-izyIPL1IWRiI77e-z6PXvZIWq6WI3oujk8_cui6_2Xs2IP4sksuRv9zow3ynMHGZBWcywWbOPs3XvNXXYx";

// const api = axios.create({
// 	baseURL: "https://api.yelp.com/v3",
// 	headers: {
// 		Authorization: `Bearer ${YELP_API_KEY}`
// 	}
// });

interface BusinessData {
	id: string;
	name: string;
	location: object;
	imageUrl: string;
	categories: Array<object>;
	rating: number;
	latitude: number;
	longitude: number;
	price: string;
}

type State = {
	latitude: number;
	longitude: number;
	businesses: Array<BusinessData>;
	search: string;
	showModal: number;
	stringbean: Array<BusinessData>;
};

class CreateStory extends Component<{}, State> {
	state = {
		latitude: 0,
		longitude: 0,
		businesses: Array<BusinessData>(),
		search: "",
		showModal: Infinity,
		stringbean: Array<BusinessData>()
	};

	componentDidMount() {
		this.getCurrentPosition();
		this.getStringBeanOnMount();
	}

	getCurrentPosition = async () => {
		const coordinates = await Geolocation.getCurrentPosition();
		this.setState(
			{
				latitude: coordinates.coords.latitude,
				longitude: coordinates.coords.longitude
			},
			() => {
				//CHECK THIS IN A SEC ---> TERM FIELD
				this.getYelp(this.state.latitude, this.state.longitude);
			}
		);
	};

	getStringBeanOnMount = async () => {
		const data = await Storage.get({ key: "stringbean" });
		if (data.value) {
			this.setState({ stringbean: JSON.parse(data.value) });
		}
	};

	getYelp = async (latitude: number, longitude: number, term?: string) => {
		const YELP_API_KEY =
			"zbczWecavwX-PEqu2ZY9Nji3l8hmfiBgSBgaOElh8q_XS-izyIPL1IWRiI77e-z6PXvZIWq6WI3oujk8_cui6_2Xs2IP4sksuRv9zow3ynMHGZBWcywWbOPs3XvNXXYx";

		const api = axios.create({
			baseURL: "https://cors-anywhere.herokuapp.com/https://api.yelp.com/v3",
			headers: {
				Authorization: `Bearer ${YELP_API_KEY}`
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

		this.setState({ businesses: info });
	};

	handleChange = (e: string) => {
		this.setState({ search: e });
	};

	addToStringBean = async (business: object) => {
		let stringBeanArray = [];
		const localStorage = await Storage.get({ key: "stringbean" });
		if (localStorage.value) {
			stringBeanArray = JSON.parse(localStorage.value);
		}
		stringBeanArray.push(business);
		this.setState({ stringbean: stringBeanArray });
		await Storage.set({
			key: "stringbean",
			value: JSON.stringify(stringBeanArray)
		});
		// console.log(await Storage.get({ key: "stringbean" }));
		console.log(localStorage);
	};

	//write function to publish story. loops through the checkpoints, checks if they exist in the database. if not, adds it to the database. grabs the checkpoint's firestore ID. holds the checkpoints' firestore IDs in an array.
	//then build the tour object. use the array of checkpoint firestore IDs.

	render() {
		const { businesses } = this.state;
		// console.log(Storage.get({ key: "stringbean" }));
		if (businesses.length) {
			return (
				<IonPage>
					<IonHeader>
						<IonToolbar>
							<IonTitle>Beans</IonTitle>
						</IonToolbar>
					</IonHeader>
					<BeanMenu stringbean={this.state.stringbean} />
					<IonSearchbar
						onIonChange={e =>
							this.handleChange((e.target as HTMLInputElement).value)
						}
					>
						<IonButton
							size="small"
							onClick={() =>
								this.getYelp(
									this.state.latitude,
									this.state.longitude,
									this.state.search
								)
							}
						>
							Search
						</IonButton>
					</IonSearchbar>

					<IonContent>
						{businesses.map((business, idx) => (
							<IonItem key={idx}>
								<IonItem onClick={() => this.setState({ showModal: idx })}>
									{business.name} <br></br>
									{business.location}
								</IonItem>

								<IonModal isOpen={idx === this.state.showModal}>
									<h1>{business.name}</h1>
									<p>{business.location}</p>
									<IonButton
										onClick={() => {
											this.addToStringBean(business);
										}}
									>
										Add To Stringbean
									</IonButton>
									<IonButton
										onClick={() => {
											this.setState({ showModal: Infinity });
										}}
									>
										Back
									</IonButton>
								</IonModal>
							</IonItem>
						))}
					</IonContent>
				</IonPage>
			);
		}
		return <IonPage></IonPage>;
	}
}

export default CreateStory;

// onSubmit?: ((event: React.FormEvent<HTMLIonSearchbarElement>) => void)
