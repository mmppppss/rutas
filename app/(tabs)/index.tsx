import React, { useEffect, useState, useRef } from "react";
import { StyleSheet, View, ActivityIndicator, Alert } from "react-native";
import GenericCard from '@/components/GenericCard'
import MapView, { Marker, Circle, Polyline } from "react-native-maps";
import * as Location from "expo-location";
import { useRouter } from 'expo-router';

export default function App() {
	const [location, setLocation] = useState(null);
	const [locations, setLocations] = useState([]);
	const mapRef = useRef(null);
	const router = useRouter(); // Inicializa el router
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
	const logoRN = require('../../assets/images/react-logo.png');

	const handlePress = (name) => {
		const path = name;
		if (path) {
			router.push(path);
		} else {
			console.log(`Clicado, pero no hay ruta definida para: ${name}`);
		}



		Alert.alert('Acción Personalizada', `Has hecho clic en el elemento: ${name}`);
	};
	return (
		<View style={styles.container}>

			<GenericCard
				nombre="Configuración del Sistema"
				info="Ajustes de privacidad y perfil."
				imagenSource={logoRN}
				onPress={() => handlePress("explore")}
			/>

			<GenericCard
				nombre="Solo Texto Aquí"
				info="Esta tarjeta no tiene icono lateral."
			// imagenSource se omite
			/>
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

				<Circle
					center={location}
					radius={50}
					strokeWidth={2}
					strokeColor="green"
					fillColor="rgba(0,255,255,0.2)"
				/>

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
