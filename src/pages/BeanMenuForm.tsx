import React, { Component } from "react";

import { IonAlert } from "@ionic/react";
import { menuController } from "@ionic/core";

import "./BeanMenuForm.css";

type Props = {
  showAlert: boolean;
  toggleAlert: () => void;
  publishTour: (name: string, description: string) => void;
};

export default class BeanMenuForm extends Component<Props> {
  render() {
    return (
      <IonAlert
        cssClass="bean-alert"
        isOpen={this.props.showAlert}
        onDidDismiss={() => this.props.toggleAlert()}
        header={"Details"}
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
            cssClass: "secondary"
          },
          {
            text: "Publish",
            handler: data => {
              this.props.publishTour(data.name, data.description);
              menuController.close();
            }
          }
        ]}
      />
    );
  }
}
