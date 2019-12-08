import React, { Component } from "react";
// import { alertController } from "@ionic/core";
import { IonAlert } from "@ionic/react";
import { menuController } from "@ionic/core";

// import { menuController } from "@ionic/core";
// import { Plugins } from "@capacitor/core";
// import db from "../firebase/firebase";
// import { getBusinesses } from "../store";
// const { Storage } = Plugins;

type Props = {
  showAlert: boolean;
  toggleAlert: () => void;
  publishTour: (name: string, description: string) => void;
};

export default class BeanMenuForm extends Component<Props> {
  // customAlertOptions = {
  // 	isOpen: this.props.showAlert,
  // 	onDidDismiss: () => this.props.toggleAlert(),
  // 	header: "I have Bean!",
  // 	inputs: [
  // 		{
  // 			name: "stringbeanname",
  // 			type: "text",
  // 			// id: "name2-",
  // 			placeholder: "Enter Title"
  // 		},
  // 		{
  // 			name: "description",
  // 			type: "text",
  // 			placeholder: "Enter Description"
  // 		}
  // 	],
  // 	buttons: [
  // 		{
  // 			text: "Cancel",
  // 			role: "cancel",
  // 			cssClass: "secondary",
  // 			handler: () => {
  // 				console.log("Confirm Cancel");
  // 			}
  // 		},
  // 		{
  // 			text: "Ok",
  // 			handler: () => {
  // 				console.log("Confirm Ok");
  // 			}
  // 		}
  // 	]
  // };
  render() {
    return (
      // <IonItem>
      // 	<IonLabel>Alert</IonLabel>
      // 	<IonSelect
      // 		interfaceOptions={this.customAlertOptions}
      // 		interface="alert"
      // 		multiple={true}
      // 		placeholder="Select One"
      // 	>
      // 		<IonSelectOption value="bacon">Bacon</IonSelectOption>
      // 		<IonSelectOption value="olives">Black Olives</IonSelectOption>
      // 	</IonSelect>
      // </IonItem>
      <IonAlert
        isOpen={this.props.showAlert}
        onDidDismiss={() => this.props.toggleAlert()}
        header={"Give It A Name!"}
        inputs={[
          {
            name: "name",
            type: "text",
            placeholder: "Title"
          },
          {
            name: "description",
            type: "text",
            placeholder: "Description"
          }
        ]}
        buttons={[
          {
            text: "Cancel",
            role: "cancel",
            cssClass: "secondary",
            handler: () => {
              console.log("Confirm Cancel");
            }
          },
          {
            text: "Ok",
            handler: data => {
              console.log("Confirm Ok");
              this.props.publishTour(data.name, data.description);
              menuController.close();
            }
          }
        ]}
      />
    );
  }
}
