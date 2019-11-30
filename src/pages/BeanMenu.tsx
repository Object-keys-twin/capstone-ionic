import React, { Component } from "react";
import {
	IonMenu,
	IonHeader,
	IonToolbar,
	IonTitle,
	IonContent,
	IonList,
	IonItem,
	IonRouterOutlet,
	IonButtons,
	IonButton,
	IonMenuButton,
	IonPage
} from "@ionic/react";

import { menuController } from "@ionic/core";
import { Plugins } from "@capacitor/core";
import db from "../firebase/firebase";
import { getBusinesses } from "../store";
const { Storage } = Plugins;

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
type Tour = {
	checkpoints: Array<string>;
};

type State = {
	stringbean: Array<BusinessData>;
};

type Props = {
	stringbean: Array<BusinessData>;
};

export default class BeanMenu extends Component<Props, State> {
	createOrUpdateCheckpoint = async (bean: BusinessData) => {
		let beanRef = db.collection("checkpoints").doc(bean.id);
		let getBean = await beanRef.get();
		if (!getBean.data()) {
			await beanRef.set(bean);
		}
	};

	publishTour = async () => {
		let checkpoints = Array<string>();

		this.props.stringbean.forEach(async bean => {
			await this.createOrUpdateCheckpoint(bean);
		});

		this.props.stringbean.forEach(bean => {
			checkpoints.push(bean.id);
		});

		let tour = {
			checkpoints
		};

		await db
			.collection("tours")
			.add(tour)
			.then(ref => {
				console.log("Added document with ID: ", ref.id);
			});
	};

	render() {
		return (
			<>
				<IonMenu side="end" contentId="main" type="push" swipeGesture={true}>
					<IonHeader>
						<IonToolbar color="primary">
							<IonTitle>My Beans</IonTitle>
						</IonToolbar>
					</IonHeader>
					<IonContent>
						<IonList>
							{this.props.stringbean.map((bean, idx) => (
								<IonItem key={idx}>{bean.name}</IonItem>
							))}
						</IonList>
					</IonContent>
					<IonButton
						onClick={() => {
							this.publishTour();
						}}
					>
						Publish Stringbean
					</IonButton>
				</IonMenu>
				<IonHeader>
					<IonToolbar>
						<IonButtons slot="end">
							<IonMenuButton
								autoHide={false}
								onClick={() => menuController.open}
							></IonMenuButton>
						</IonButtons>
					</IonToolbar>
				</IonHeader>
				<IonRouterOutlet id="main"></IonRouterOutlet>
			</>
		);
	}
}
