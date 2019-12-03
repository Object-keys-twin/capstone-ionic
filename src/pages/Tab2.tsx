import {
	IonContent,
	IonHeader,
	IonPage,
	IonList,
	IonItem,
	IonLabel,
	IonCol,
	IonGrid
} from "@ionic/react";
import React, { Component } from "react";
import { Link } from "react-router-dom";
import db from "../firebase/firebase";
import "./Tab2.css";

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

	componentWillUnmount() {
		console.log("I UNMOUNTED");
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
		tours.forEach((el, i) => {
			if (i === idx) el.checkpoints = checkpointsWithData;
		});
		this.setState({ tours });
	};

	render() {
		console.log("in the render");
		const { tours } = this.state;

		return (
			<IonPage>
				<IonHeader>PUBLIC TOURS</IonHeader>
				<IonContent className="ion-padding">
					<IonList>
						{tours.map((tour, idx) => (
							<IonItem key={idx} className="mainListRow">
								<IonGrid>
									<IonCol>
										<IonLabel>
											<Link
												to={{
													pathname: "/map",
													state: { checkpoints: tour.checkpoints }
												}}
											>
												{tour.name}
											</Link>
										</IonLabel>
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
