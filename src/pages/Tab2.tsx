import {
	IonContent,
	IonHeader,
	IonPage,
	IonTitle,
	IonToolbar,
	IonImg,
	IonFab,
	IonInput,
	IonList,
	IonItem,
	IonLabel,
	IonRow,
	IonCol,
	IonGrid
} from "@ionic/react";
import React, { Component } from "react";
import { Plugins } from "@capacitor/core";
import db from "../firebase/firebase";
import "./Tab2.css";
const { Geolocation } = Plugins;
interface DbData {
	checkpoints: Array<any>;
	description: string;
	name: string;
	created: object;
	upvotes: number;
	user: string;
}

type State = {
	tours: Array<DbData>;
};
class PublicTours extends Component<{}, State> {
	state = { tours: Array<DbData>() };
	componentDidMount() {
		this.getTours();
	}
	getTours = () => {
		db.collection("tours")
			.get()
			.then(docs => {
				docs.forEach(doc => {
					this.setState({
						tours: [
							...this.state.tours,
							{
								checkpoints: doc.data().checkpoints,
								description: doc.data().description,
								name: doc.data().name,
								created: doc.data().timestamp,
								upvotes: doc.data().upvotes,
								user: doc.data().user
							}
						]
					});
				});
				this.state.tours.forEach((tour, id) => {
					this.getCheckpoints(tour, id);
				});
			});
	};
	getCheckpoints = async (tour: any, idx: number) => {
		let checkpointsWithData: any = [];
		for (let i = 0; i < tour.checkpoints.length; i++) {
			const checkpoints = await db
				.collection("checkpoints")
				.doc(`${tour.checkpoints[i]}`)
				.get();
			checkpointsWithData.push(checkpoints.data());
		}
		let tours = this.state.tours;
		tours.map((el, i) => {
			if (i === idx) el.checkpoints = checkpointsWithData;
		});
		this.setState({ tours });
	};

	render() {
		const { tours } = this.state;
		console.log(tours);
		return (
			<IonPage>
				<IonHeader>PUBLIC TOURS</IonHeader>
				<IonContent className="ion-padding">
					<IonList>
						{tours.map((tour, idx) => (
							<IonItem key={idx} onClick={() => {}} className="mainListRow">
								<IonGrid>
									<IonCol>
										<IonLabel>{tour.name}</IonLabel>
										<IonList>
											{tour.checkpoints.map((checkpoint, idx) => {
												if (checkpoint)
													return <IonItem key={idx}>{checkpoint.name}</IonItem>;
											})}
										</IonList>
									</IonCol>
								</IonGrid>
							</IonItem>
						))}
					</IonList>
				</IonContent>
			</IonPage>
		);
	}
}
export default PublicTours;
