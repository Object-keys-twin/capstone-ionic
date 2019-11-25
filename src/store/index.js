import axios from "axios";
import { createStore, applyMiddleware } from "redux";
import thunkMiddleware from "redux-thunk";
import { composeWithDevTools } from "redux-devtools-extension";

const YELP_API_KEY =
	"zbczWecavwX-PEqu2ZY9Nji3l8hmfiBgSBgaOElh8q_XS-izyIPL1IWRiI77e-z6PXvZIWq6WI3oujk8_cui6_2Xs2IP4sksuRv9zow3ynMHGZBWcywWbOPs3XvNXXYx";

const api = axios.create({
	baseURL: "https://api.yelp.com/v3",
	headers: {
		Authorization: `Bearer ${YELP_API_KEY}`
	}
});

//ACTION TYPES
const GOT_BUSINESSES = "GOT_BUSINESSES";
const SET_CHECKIN = "SET_CHECKIN";

//ACTION CREATORS
export const gotBusinesses = businesses => ({
	type: GOT_BUSINESSES,
	businesses
});

export const setCheckin = business => ({
	type: SET_CHECKIN,
	business
});

//THUNKS
export const getBusinesses = (latitude, longitude) => async dispatch => {
	try {
		console.log("I AM IN THE THUNK");
		const { data } = await api.get("/businesses/search", {
			params: {
				limit: 20,
				latitude,
				longitude
			}
		});

		const info = data.businesses.map(business => ({
			name: business.name,
			location: business.location,
			imageUrl: business.image_url,
			categories: business.categories,
			rating: business.rating
		}));
		dispatch(gotBusinesses(info));
	} catch (error) {
		console.log("error getting businesses", error);
	}
};

const initialState = {
	businesses: [],
	checkin: []
};

const reducer = (state = initialState, action) => {
	switch (action.type) {
		case GOT_BUSINESSES:
			return { ...state, businesses: action.businesses };
		case SET_CHECKIN:
			return { ...state, checkin: [...state.checkin, action.business] };
		default:
			return state;
	}
};

const middleware = composeWithDevTools(applyMiddleware(thunkMiddleware));

const store = createStore(reducer, middleware);

export default store;
