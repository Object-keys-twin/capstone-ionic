import React, { Component } from "react";

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

interface DirectionsData {
	origin: any;
	destination: any;
	travelMode: any;
	waypoints: any;
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

	showMap() {
		const directionsRenderer = new google.maps.DirectionsRenderer({suppressMarkers: true});
		this.map = new google.maps.Map(this.mapEle.current, {
			center: {
				lat: this.props.lat,
				lng: this.props.long
			},
			zoom: 15
		});
		if(this.props.checkpoints){
		directionsRenderer.setMap(this.map);
		let checkpointArray: Array <any> = [];
		for(let i = 0; i < this.props.checkpoints.length; i++) {
			checkpointArray.push({location: new google.maps.LatLng(this.props.checkpoints[i].latitude, this.props.checkpoints[i].longitude)})
		}
		const directionsService = new google.maps.DirectionsService();
		const start = new google.maps.LatLng(this.props.lat, this.props.long);
		const end = checkpointArray[checkpointArray.length-1].location
  	const request: DirectionsData = {
    origin: start,
    destination: end,
		travelMode: 'WALKING',
		waypoints: checkpointArray.slice(0,-1)
  };
  directionsService.route(request, function(result, status) {
    if (status == 'OK') {
      directionsRenderer.setDirections(result);
    }
  });
}
		google.maps.event.addListenerOnce(this.map, "idle", () => {
			if (this.mapEle.current) {
				this.mapEle.current.classList.add("show-map");
			}
		});

		let marker = new google.maps.Marker({
			position: new google.maps.LatLng(this.props.lat, this.props.long),
			map: this.map,
			title: "current location",
			icon: {
				url: "http://maps.google.com/mapfiles/ms/icons/green-dot.png"
			}
		});

		let infoWindow = new google.maps.InfoWindow({
			content: "<h5>Current Location</h5>"
		});

		marker.addListener("click", () => {
			infoWindow.open(this.map, marker);
		});

		this.addMarkers();
	}

	addMarkers = () => {
		if (this.props.checkpoints)
			this.props.checkpoints.forEach((markerData, index) => {
				let infoWindow = new google.maps.InfoWindow({
					content: `<h5>${markerData.name}</h5><p>${markerData.location}</p>`
				});

				let marker = new google.maps.Marker({
					position: new google.maps.LatLng(
						markerData.latitude,
						markerData.longitude
					),
					map: this.map,
					title: markerData.name,
					label: {
						text: (index+1).toString(),
						color: 'white'
					}
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

	addDirections = () => {

	}

	render() {
		if (
			this.props.lat !== 0 &&
			this.props.long !== 0 &&
			this.mapEle.current !== null
		) {
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
