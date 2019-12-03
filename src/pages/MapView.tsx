import React, { Component } from "react";
import { IonPage } from "@ionic/react";

type Props = {
	lat: number;
	long: number;
};

export default class Map extends Component<Props> {
	mapEle: React.RefObject<HTMLDivElement>;
	map?: google.maps.Map;
	markers: any[];

	constructor(props: Props) {
		super(props);
		this.mapEle = React.createRef();
		this.markers = [];
	}

	showMap() {
		this.map = new google.maps.Map(this.mapEle.current, {
			center: {
				lat: this.props.lat,
				lng: this.props.long
			},
			zoom: 15
		});

		google.maps.event.addListenerOnce(this.map, "idle", () => {
			if (this.mapEle.current) {
				this.mapEle.current.classList.add("show-map");
			}
		});

		let marker = new google.maps.Marker({
			position: new google.maps.LatLng(this.props.lat, this.props.long),
			map: this.map,
			title: "current location"
		});

		let infoWindow = new google.maps.InfoWindow({
			content: "<h5>Current Location</h5>"
		});

		marker.addListener("click", () => {
			infoWindow.open(this.map, marker);
		});
	}

	// componentDidUpdate(prevProps: Props) {
	//     // this.addMarkers();
	// }

	// addMarkers() {
	//     this.props.locations.forEach((markerData) => {
	//         let infoWindow = new google.maps.InfoWindow({
	//             content: `<h5>${markerData.name}</h5>`
	//         });

	//         let marker = new google.maps.Marker({
	//             position: new google.maps.LatLng(markerData.lat, markerData.lng),
	//             map: this.map,
	//             title: markerData.name
	//         });

	//         marker.addListener('click', () => {
	//             infoWindow.open(this.map, marker);
	//         });

	//         this.markers.push(marker);
	//     });

	//     // zoom and center the map around the markers
	//     if (this.map && this.markers.length) {

	//         const bounds = new google.maps.LatLngBounds();
	//         for (let i = 0; i < this.markers.length; i++) {
	//             bounds.extend(this.markers[i].getPosition());
	//         }
	//         this.map.fitBounds(bounds);
	//     }

	// }

	render() {
		// console.log("LATITUDE: ", this.props.lat, " LONGITUDE: ", this.props.long);
		if (this.props.lat !== 0 && this.props.long !== 0) {
			this.showMap();
		}

		return (
			<div
				ref={this.mapEle}
				style={{ height: "100%", width: "100%" }}
				id="map_canvas"
			></div>
		);
	}
}
