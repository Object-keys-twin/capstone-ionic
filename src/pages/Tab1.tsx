import {
	IonCard,
	IonCardContent,
	IonCardHeader,
	IonCardTitle,
	IonContent,
	IonHeader,
	IonItem,
	IonPage,
	IonTitle,
	IonToolbar,
	IonIcon
} from '@ionic/react'
import React, { Component } from 'react'
import { Plugins } from '@capacitor/core'
import { walk } from 'ionicons/icons'
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
					<IonCard>
						<IonCardTitle className="string-bean-title">
							My Stringbeans
						</IonCardTitle>
					</IonCard>
					{this.state.tours.map((tour, i) => (
						<IonCard className="welcome-card" key={i}>
							<IonItem>
								<IonIcon slot="start" color="medium" icon={walk} />
								<IonCardTitle>{tour.name}</IonCardTitle>
							</IonItem>
							<IonCardContent>
								{tour.checkpoints.map((checkpoint, i) => {
									if (checkpoint) {
										return <IonItem key={i}>{checkpoint.name}</IonItem>
									}
								})}
							</IonCardContent>
						</IonCard>
					))}
				</IonContent>
			</IonPage>
		)
	}
}

export default Profile
