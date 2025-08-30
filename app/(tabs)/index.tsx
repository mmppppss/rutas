import React, { useEffect, useState, useRef } from "react";
import { StyleSheet, View, ActivityIndicator } from "react-native";
import MapView, { Marker, Circle, Polyline } from "react-native-maps";
import * as Location from "expo-location";

export default function App() {
    const [location, setLocation] = useState(null);
    const [locations, setLocations] = useState([]);
    const mapRef = useRef(null);

    useEffect(() => {
        let subscription;

        (async () => {
            const { status } = await Location.requestForegroundPermissionsAsync();
            if (status !== "granted") {
                alert("Permiso de ubicación denegado");
                return;
            }

            subscription = await Location.watchPositionAsync(
                {
                    accuracy: Location.Accuracy.Highest,
                    timeInterval: 3000,      // cada 3 segundos
                    distanceInterval: 1,     // cada 1 metro
                },
                (loc) => {
                    setLocation(loc.coords);
                    setLocations(prev => [...prev, loc.coords]);

                    if (mapRef.current) {
                        mapRef.current.animateToRegion({
                            latitude: loc.coords.latitude,
                            longitude: loc.coords.longitude,
                            latitudeDelta: 0.01,
                            longitudeDelta: 0.01,
                        });
                    }
                }
            );
        })();

        return () => {
            if (subscription) subscription.remove();
        };
    }, []);

    if (!location) {
        return (
            <View style={styles.container}>
                <ActivityIndicator size="large" color="#0000ff" />
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <MapView
                ref={mapRef}
                style={styles.map}
                initialRegion={{
                    latitude: location.latitude,
                    longitude: location.longitude,
                    latitudeDelta: 0.002,
                    longitudeDelta: 0.002,
                }}
				minZoomLevel={20}
                showsUserLocation
                followsUserLocation
            >

                {/* Círculo de referencia */}
                <Circle
                    center={location}
                    radius={50}
                    strokeWidth={2}
                    strokeColor="green"
                    fillColor="rgba(0,255,255,0.2)"
                />

                {/* Ruta de tracking */}
                {locations.length > 1 && (
                    <Polyline
                        coordinates={locations}
                        strokeColor="blue"
                        strokeWidth={3}
                    />
                )}
            </MapView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    map: { flex: 1 },
});
