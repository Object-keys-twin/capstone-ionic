import React, { Component } from 'react'
import {
	IonHeader,
	IonToolbar,
	IonPage,
	IonTitle,
	IonContent,
	IonItem,
	IonButton,
	IonModal,
	IonSpinner,
	IonCard,
	IonInput,
	IonIcon
} from '@ionic/react'
import { search } from 'ionicons/icons'
import { Plugins } from '@capacitor/core'
import axios from 'axios'
import BeanMenu from './BeanMenu'
import { yelpApiKey } from '../secrets'
import './Tab3.css'

const { Geolocation, Storage } = Plugins

interface BusinessData {
	id: string
	name: string
	location: object
	imageUrl: string
	categories: Array<object>
	rating?: number
	latitude: number
	longitude: number
	price?: string | undefined
}

type State = {
	latitude: number
	longitude: number
	businesses: Array<BusinessData>
	search: string
	showModal: number
	stringbean: Array<BusinessData>
}

class CreateStory extends Component<{}, State> {
	state = {
		latitude: 0,
		longitude: 0,
		businesses: Array<BusinessData>(),
		search: '',
		showModal: Infinity,
		stringbean: Array<BusinessData>()
	}

	componentDidMount() {
		this.getCurrentPosition()
		this.getStringBeanOnMount()
	}

	getCurrentPosition = async () => {
		const coordinates = await Geolocation.getCurrentPosition()
		this.setState(
			{
				latitude: coordinates.coords.latitude,
				longitude: coordinates.coords.longitude
			},
			() => {
				this.getYelp(this.state.latitude, this.state.longitude)
			}
		)
	}

	getStringBeanOnMount = async () => {
		const data = await Storage.get({ key: 'stringbean' })
		if (data.value) {
			this.setState({ stringbean: JSON.parse(data.value) })
		}
	}

	keyUpHandler = (e: any) => {
		if (e.key === 'Enter') {
			this.getYelp(this.state.latitude, this.state.longitude, this.state.search)
		}
	}

	removeFromStringBean = async (id: string) => {
		let storage: any
		let parsedStorage: any
		storage = await Storage.get({
			key: 'stringbean'
		})
		parsedStorage = JSON.parse(storage.value)
		const removedBean = parsedStorage.filter(
			(item: BusinessData) => item.id !== id
		)
		this.setState({
			stringbean: removedBean
		})
		await Storage.set({
			key: 'stringbean',
			value: JSON.stringify(removedBean)
		})
	}

	getYelp = async (latitude: number, longitude: number, term?: string) => {
		const api = axios.create({
			baseURL: 'https://cors-anywhere.herokuapp.com/https://api.yelp.com/v3',
			headers: {
				Authorization: `Bearer ${yelpApiKey}`
			}
		})
		const { data } = await api.get('/businesses/search', {
			params: {
				limit: 20,
				latitude: latitude,
				longitude: longitude,
				term: term
			}
		})

		const info = data.businesses.map((business: any) => ({
			id: business.id,
			name: business.name,
			location:
				business.location.display_address[0] +
				', ' +
				business.location.display_address[1],
			latitude: business.coordinates.latitude,
			longitude: business.coordinates.longitude,
			price: business.price,
			imageUrl: business.image_url,
			categories: business.categories,
			rating: business.rating
		}))

		this.setState({ businesses: info })
	}

	handleChange = (e: string) => {
		this.setState({ search: e })
	}

	addToStringBean = async (business: object) => {
		let stringBeanArray = []
		const localStorage = await Storage.get({ key: 'stringbean' })
		if (localStorage.value) {
			stringBeanArray = JSON.parse(localStorage.value)
		}
		stringBeanArray.push(business)
		this.setState({ stringbean: stringBeanArray })
		await Storage.set({
			key: 'stringbean',
			value: JSON.stringify(stringBeanArray)
		})
	}

	//write function to publish story. loops through the checkpoints, checks if they exist in the database. if not, adds it to the database. grabs the checkpoint's firestore ID. holds the checkpoints' firestore IDs in an array.
	//then build the tour object. use the array of checkpoint firestore IDs.

	render() {
		const { businesses } = this.state

		return (
			<IonPage className="beanpage" onKeyUp={(e: any) => this.keyUpHandler(e)}>
				<IonHeader>
					<IonTitle className="tabheader">Beans</IonTitle>
				</IonHeader>
				<BeanMenu
					stringbean={this.state.stringbean}
					removeFromStringBean={this.removeFromStringBean}
				/>
				<IonCard id="search-bar">
					<IonInput
						clearInput
						onIonChange={e =>
							this.handleChange((e.target as HTMLInputElement).value)
						}
						placeholder="Search for beans!"
					></IonInput>
					<IonButton
						id="search-button"
						onClick={() =>
							this.getYelp(
								this.state.latitude,
								this.state.longitude,
								this.state.search
							)
						}
					>
						<IonIcon icon={search} />
					</IonButton>
				</IonCard>

				{businesses.length ? (
					<IonContent className="beancontent">
						{businesses.map((business, idx) => (
							<IonCard className="beancard" key={idx}>
								<IonItem
									className="beanitem"
									onClick={() => this.setState({ showModal: idx })}
								>
									{business.name} <br></br>
									{business.location}
								</IonItem>

								<IonModal isOpen={idx === this.state.showModal}>
									<h1>{business.name}</h1>
									<p>{business.location}</p>
									<IonButton
										onClick={() => {
											this.addToStringBean(business)
											this.setState({ showModal: Infinity })
										}}
									>
										Add To Stringbean
									</IonButton>
									<IonButton
										onClick={() => {
											this.setState({ showModal: Infinity })
										}}
									>
										Back
									</IonButton>
								</IonModal>
							</IonCard>
						))}
					</IonContent>
				) : (
					<IonContent>
						<IonSpinner class="spinner"></IonSpinner>
					</IonContent>
				)}
			</IonPage>
		)
	}
}

export default CreateStory

// onSubmit?: ((event: React.FormEvent<HTMLIonSearchbarElement>) => void)
