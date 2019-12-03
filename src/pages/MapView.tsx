import React, { Component } from "react";
import { IonPage } from "@ionic/react";

type Props = {
	lat: number;
	long: number;
	checkpoints: Array<BusinessData>;
};

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

export default class Map extends Component<Props> {
	mapEle: React.RefObject<HTMLDivElement>;
	map?: google.maps.Map;
	markers: any[];
	checkpoints: Array<BusinessData>;

	constructor(props: Props) {
		super(props);
		this.mapEle = React.createRef();
		this.markers = [];
		this.checkpoints = Array<BusinessData>();
	}

	// componentDidMount = () => {
	// 	this.checkpoints = this.props.checkpoints;
	// };

	showMap() {
		this.map = new google.maps.Map(this.mapEle.current, {
			center: {
				lat: this.props.lat,
				lng: this.props.long
			},
			zoom: 15
		});
		console.log("THIS IS NEW GOOGLE.MAPS.MAP");

		google.maps.event.addListenerOnce(this.map, "idle", () => {
			if (this.mapEle.current) {
				this.mapEle.current.classList.add("show-map");
			}
		});

		console.log("THIS IS GOOGLE.MAPS.EVENT");

		let marker = new google.maps.Marker({
			position: new google.maps.LatLng(this.props.lat, this.props.long),
			map: this.map,
			title: "current location"
		});

		console.log("THIS IS GOOGLE.MAPS.MARKER");

		let infoWindow = new google.maps.InfoWindow({
			content: "<h5>Current Location</h5>"
		});

		console.log("THIS IS GOOGLE.MAPS.INFOWINDOW");

		marker.addListener("click", () => {
			infoWindow.open(this.map, marker);
		});

		console.log("MARKER.ADDLISTENER");
		this.addMarkers();
	}

	// componentDidUpdate(prevProps: Props) {
	// 	this.addMarkers();
	// }

	addMarkers = () => {
		if (this.props.checkpoints)
			this.props.checkpoints.forEach(markerData => {
				let infoWindow = new google.maps.InfoWindow({
					content: `<h5>${markerData.name}</h5><p>${markerData.location}</p>`
				});

				let marker = new google.maps.Marker({
					position: new google.maps.LatLng(
						markerData.latitude,
						markerData.longitude
					),
					map: this.map,
					title: markerData.name
				});

				marker.addListener("click", () => {
					infoWindow.open(this.map, marker);
				});

				this.markers.push(marker);
			});

		if (this.map && this.markers.length) {
			const bounds = new google.maps.LatLngBounds();
			for (let i = 0; i < this.markers.length; i++) {
				bounds.extend(this.markers[i].getPosition());
			}
			this.map.fitBounds(bounds);
		}
	};

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
		console.log("REF: ", this.mapEle.current);
		if (
			this.props.lat !== 0 &&
			this.props.long !== 0 &&
			this.mapEle.current !== null
		) {
			this.showMap();
		}
		// return null;
		return (
			<div
				ref={this.mapEle}
				style={{ height: "100%", width: "100%" }}
				id="map_canvas"
			></div>
		);
	}
}
