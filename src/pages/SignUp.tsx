import React, { Component } from 'react'
import {
	IonContent,
	IonHeader,
	IonPage,
	IonTitle,
	IonToolbar,
	IonButton,
	IonItem,
	IonLabel,
	IonInput,
	IonIcon
} from '@ionic/react'
import { eye, eyeOff } from 'ionicons/icons'

enum PasswordVisibility {
	Password = 'password',
	Text = 'text'
}

interface userData {
	email: string | null
	uid?: string | null
	displayName: string | null
	photoURL: string | null
	password: string
}

type Props = {
	handleSubmit: (user: userData, type?: string) => void
	showSignUp: () => void
	signUpError: boolean
}

type State = {
	passwordVisibility: boolean
	displayName: string
	email: string
	password: string
	showSignUp: boolean
}

export default class SignUp extends Component<Props, State> {
	state = {
		passwordVisibility: false,
		displayName: '',
		email: '',
		password: '',
		showSignUp: false
	}

	handleEmail = (e: string) => {
		this.setState({ email: e })
	}

	handlePassword = (e: string) => {
		this.setState({ password: e })
	}

	handleDisplayName = (e: string) => {
		this.setState({ displayName: e })
	}

	togglePassword = () => {
		this.setState({
			passwordVisibility: !this.state.passwordVisibility
		})
	}

	createAccount = () => {
		let newUser = {
			email: this.state.email,
			uid: '',
			displayName: this.state.displayName,
			photoURL: '',
			password: this.state.password
		}
		this.props.handleSubmit(newUser, 'signup')
	}

	render() {
		return (
			<IonPage>
				<IonHeader>
					<IonToolbar>
						<IonTitle className="header">Sign Up</IonTitle>
					</IonToolbar>
				</IonHeader>
				<IonContent>
					<IonItem>
						<IonLabel>Username</IonLabel>
						<IonInput
							required
							clearInput
							class="input"
							name="displayName"
							placeholder="mrbean123"
							onIonChange={e =>
								this.handleDisplayName((e.target as HTMLInputElement).value)
							}
						></IonInput>
					</IonItem>
					<IonItem>
						<IonLabel>Email</IonLabel>
						<IonInput
							required
							clearInput
							type="email"
							placeholder="mrbean123@email.com"
							name="email"
							onIonChange={e =>
								this.handleEmail((e.target as HTMLInputElement).value)
							}
						></IonInput>
					</IonItem>
					<IonItem>
						<IonLabel>Password</IonLabel>
						<IonInput
							required
							clearInput
							onIonChange={e =>
								this.handlePassword((e.target as HTMLInputElement).value)
							}
							type={
								this.state.passwordVisibility === false
									? PasswordVisibility.Password
									: PasswordVisibility.Text
							}
							placeholder="123123123"
							name="password"
						></IonInput>

						{this.state.password ? (
							<IonIcon
								icon={this.state.passwordVisibility ? eyeOff : eye}
								onClick={this.togglePassword}
							/>
						) : (
							<IonItem />
						)}
					</IonItem>
					{this.props.signUpError ? (
						<IonItem>password must be at least six characters!</IonItem>
					) : null}
					<IonButton onClick={this.createAccount}>Create Account</IonButton>
					<IonButton onClick={this.props.showSignUp}>Back</IonButton>
				</IonContent>
			</IonPage>
		)
	}
}
