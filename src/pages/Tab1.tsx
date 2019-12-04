import {
	IonCard,
	IonCardContent,
	IonCardHeader,
	IonCardSubtitle,
	IonCardTitle,
	IonContent,
	IonHeader,
	IonIcon,
	IonItem,
	IonLabel,
	IonList,
	IonListHeader,
	IonPage,
	IonTitle,
	IonToolbar
} from '@ionic/react'
import React, { Component } from 'react'
import { Plugins } from '@capacitor/core'
import { book, build, colorFill, grid } from 'ionicons/icons'
import './Tab1.css'
import db from '../firebase/firebase'
const { Storage } = Plugins

// import { Plugins } from "@capacitor/core";
// const { Geolocation } = Plugins;
type Props = {
	user: userData
}

type State = {
	tours: Array<DbData>
}

interface DbData {
	checkpoints: Array<any>
	description: string
	name: string
	created: object
	upvotes: number
	user: string
}

interface userData {
	email: string
	uid: string
	displayName: string
	photoURL: string
}

class Profile extends Component<Props, State> {
	state = { tours: Array<DbData>() }

	componentDidMount() {
		this.getTours()
	}
	getTours = () => {
		db.collection('tours')
			.where('user', '==', this.props.user.email)
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
					})
				})
				this.state.tours.forEach((tour, id) => {
					this.getCheckpoints(tour, id)
				})
			})
	}

	getCheckpoints = async (tour: any, idx: number) => {
		let checkpointsWithData: any = []
		for (let i = 0; i < tour.checkpoints.length; i++) {
			const checkpoints = await db
				.collection('checkpoints')
				.doc(`${tour.checkpoints[i]}`)
				.get()
			checkpointsWithData.push(checkpoints.data())
		}
		let tours = this.state.tours
		tours.forEach((el, i) => {
			if (i === idx) el.checkpoints = checkpointsWithData
		})
		this.setState({ tours })
	}

	render() {
		console.log(this.state.tours)
		return (
			<IonPage>
				<IonHeader>
					<IonToolbar>
						<IonTitle>Profile</IonTitle>
					</IonToolbar>
				</IonHeader>
				<IonContent>
					<IonCard className="welcome-card">
						<img src={this.props.user.photoURL} />
						<IonCardHeader>
							<IonCardTitle>
								Welcome, {this.props.user.displayName}
							</IonCardTitle>
						</IonCardHeader>
						<IonCardContent></IonCardContent>
					</IonCard>

					{this.state.tours.map((tour, i) => (
						<IonCard className="welcome-card" key={i}>
							<IonCardHeader>
								<IonCardTitle>{tour.name}</IonCardTitle>
							</IonCardHeader>
							<IonCardContent>
								{tour.checkpoints.map((checkpoint, i) => {
									if (checkpoint) {
										return <IonItem key={i}>{checkpoint.name}</IonItem>
									}
								})}
							</IonCardContent>
						</IonCard>
					))}

					{/* <IonList lines="none">
						<IonListHeader>
							<IonLabel>Resources</IonLabel>
						</IonListHeader>
						<IonItem href="https://ionicframework.com/docs/" target="_blank">
							<IonIcon slot="start" color="medium" icon={book} />
							<IonLabel>Ionic Documentation</IonLabel>
						</IonItem>
						<IonItem
							href="https://ionicframework.com/docs/building/scaffolding"
							target="_blank"
						>
							<IonIcon slot="start" color="medium" icon={build} />
							<IonLabel>Scaffold Out Your App</IonLabel>
						</IonItem>
						<IonItem
							href="https://ionicframework.com/docs/layout/structure"
							target="_blank"
						>
							<IonIcon slot="start" color="medium" icon={grid} />
							<IonLabel>Change Your App Layout</IonLabel>
						</IonItem>
						<IonItem
							href="https://ionicframework.com/docs/theming/basics"
							target="_blank"
						>
							<IonIcon slot="start" color="medium" icon={colorFill} />
							<IonLabel>Theme Your App</IonLabel>
						</IonItem>
					</IonList> */}
				</IonContent>
			</IonPage>
		)
	}
}

export default Profile
