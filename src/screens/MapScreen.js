import React, { Component } from "react";
import {
  StyleSheet,
  Text,
  View,
  Platform,
} from "react-native";

import loadGoogleMapsAPI from "./webMapComponent"; // Import the function
import fetchRouteData from "../api/GetCoords";

let MapViewMob, MarkerMob, MapViewDirectionsMob;

if (Platform.OS === "android" || Platform.OS === "ios") {
  MapViewMob = require("react-native-maps").default;
  MarkerMob = require("react-native-maps").Marker;
  MapViewDirectionsMob = require("react-native-maps-directions").default;
}
let MapView;

if (Platform.OS === "web") {
  MapView = require("@preflower/react-native-web-maps").default;
}

// Create the debounce function responsible for zoom actions
const debounce = (func, delay) => {
  let timer;
  return function (...args) {
    try {
      clearTimeout(timer);
      timer = setTimeout(() => {
        if (typeof func == "function") {
          func(...args);
        }
      }, delay);
    } catch (error) {
      console.log("Error in debounce", error);
    }
  };
};

export default class MapScreen extends Component {
  constructor(props) {
    super(props);
    this.debouncedOnRegionChange = debounce(this.onRegionChange, 10);
    this.state = {
      coords: [],
      googleMapsLoaded: false,
      origin: { latitude: 33.843663, longitude: -117.945171 },
      destination: { latitude: 33.8252956, longitude: -117.8307728 },
      region: {
        latitude: 33.8252956,
        longitude: -117.8307728,
        latitudeDelta: 0.05, // Adjust this value for zoom level
        longitudeDelta: 0.045, // Adjust this value for zoom level
      },
      waypoint: { latitude: 33.8589565, longitude: -117.9589782 },
    };
  }
  async componentDidMount() {
    if (Platform.OS === "web") {
      loadGoogleMapsAPI(() => {
        this.setState({ googleMapsLoaded: true });
      });
    }

    try {
      const newcoords = await fetchRouteData(
        this.state.origin,
        this.state.waypoint,
        this.state.destination
      );
      this.setState({ coords: newcoords });
    } catch (error) {
      console.error("Error fetching COORDS", error);
    }
  }

  //  Create a debounced version of onRegionChange
  debouncedOnRegionChange = debounce((newRegion) => {
    // Check if the new region has valid latitude and longitude
    if (
      !isNaN(newRegion.latitude) &&
      !isNaN(newRegion.longitude) &&
      isFinite(newRegion.latitude) &&
      isFinite(newRegion.longitude)
    ) {
      // Update the state only if the new region has valid coordinates
      this.setState({ region: newRegion });
    }
  }, 10);

  onRegionChangeComplete = (region) => {
    console.log("Region changed:", region);
  };

  onPress = (event) => {
    console.log("Map pressed:", event.nativeEvent.coordinate);
  };

  onDoublePress = (event) => {
    console.log("Map double pressed:", event.nativeEvent.coordinate);
  };

  onPanDrag = () => {
    console.log("Map panned or dragged");
  };

  render() {
    const { origin, destination, googleMapsLoaded, coords } = this.state;

    return (
      <View style={styles.container}>
        {googleMapsLoaded && Platform.OS === "web" ? (
          <View style={styles.container}>
            <MapView
              style={styles.map}
              initialRegion={this.state.region}
              onRegionChange={(new_region) => {
                this.debouncedOnRegionChange(new_region);
              }}
              onRegionChangeComplete={this.onRegionChangeComplete}
              onPress={this.onPress}
              onDoublePress={this.onDoublePress}
              onPanDrag={this.onPanDrag}
              zoomEnabled={true}
              zoomControlEnabled={true}
              mapType="terrain"
              showsPointsOfInterest={false}
            >
              <MapView.Marker coordinate={origin} title="Origin">
                <View style={styles.markerContainer}></View>
              </MapView.Marker>

              <MapView.Marker coordinate={destination} title="Destination">
                <View style={styles.markerContainer}></View>
              </MapView.Marker>

              {coords && (
                <MapView.Polyline
                  coordinates={coords.map((coord) => ({
                    latitude: coord[0],
                    longitude: coord[1],
                  }))}
                  strokeWidth={8}
                  strokeColor="royalblue"
                  tappable={true}
                  onClick={() => {
                    this.onPolylineClicked();
                  }}
                />
              )}
            </MapView>
          </View>
        ) : Platform.OS === "android" || Platform.OS === "ios" ? (
          <View style={styles.container}>
            <MapViewMob
              style={styles.map}
              onRegionChange={(new_region) => {
                this.debouncedOnRegionChange(new_region);
              }}
            >
              <MarkerMob coordinate={origin} title="Origin">
                <View style={styles.markerContainer}></View>
              </MarkerMob>

              <MarkerMob coordinate={destination} title="Destination">
                <View style={styles.markerContainer}></View>
              </MarkerMob>

              {markers &&
                markers.map((marker, index) => (
                  <MarkerMob
                    key={index}
                    coordinate={marker.latlng}
                    title={marker.title}
                    description={marker.description}
                  />
                ))}

              {plot.draw && (
                <MapViewDirectionsMob
                  origin={origin}
                  destination={destination}
                  waypoint={plot.waypoint}
                  strokeColor={showIcon ? "red" : "royalblue"}
                  tappable={true}
                  onPress={() => {
                    this.onPolylineClicked();
                  }}
                  apikey={apiKey}
                  strokeWidth={14}
                />
              )}
            </MapViewMob>
          </View>
        ) : (
          <Text>LOADING....</Text>
        )}
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
  },
  map: {
    ...StyleSheet.absoluteFillObject,
    borderColor: "white",
    borderWidth: 8,
    borderTopWidth: 4,
    borderBottomWidth: 4,
  },
  markerContainer: {
    width: 40,
    height: 40,
  },
  markerImage: {
    flex: 1,
    width: undefined,
    height: undefined,
  },

  rgnText: {
    fontSize: 12,
    color: "#666666",
  },
  rgnView: { flexDirection: "row", alignItems: "flex-end" },
  button: {
    backgroundColor: "orange",
    padding: 8,
    margin: 5,
    borderRadius: 5,
    alignItems: "center",
    height: 35,
  },
  buttonText: {
    color: "white",
    textAlign: "center",
    fontWeight: "bold",
  },
});
