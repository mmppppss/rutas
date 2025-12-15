import React, { useEffect, useState, useRef } from "react";
import {
	StyleSheet,
	View,
	ActivityIndicator,
	Alert,
	Modal,
	Text,
	TextInput,
	TouchableOpacity,
	Platform,
	StatusBar
} from "react-native";
import MapView, { Circle, Polyline } from "react-native-maps";
import * as Location from "expo-location";
import { useRouter } from "expo-router";
import GenericCard from "@/components/GenericCard";

const API_URL = process.env.EXPO_PUBLIC_API_URL;

export default function App() {
	const [location, setLocation] = useState(null);
	const [recording, setRecording] = useState(false);
	const [routePoints, setRoutePoints] = useState([]);
	const [saving, setSaving] = useState(false);

	const [modalVisible, setModalVisible] = useState(false);
	const [routeName, setRouteName] = useState("");

	const mapRef = useRef(null);
	const router = useRouter();

	useEffect(() => {
		let subscription;

		(async () => {
			const { status } = await Location.requestForegroundPermissionsAsync();
			if (status !== "granted") {
				Alert.alert("Permiso denegado", "Se requiere acceso a la ubicación");
				return;
			}

			subscription = await Location.watchPositionAsync(
				{
					accuracy: Location.Accuracy.Highest,
					timeInterval: 3000,
					distanceInterval: 1,
				},
				(loc) => {
					setLocation(loc.coords);

					if (recording) {
						setRoutePoints((prev) => [
							...prev,
							{
								latitude: loc.coords.latitude,
								longitude: loc.coords.longitude,
							},
						]);
					}

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
	}, [recording]);

	if (!location) {
		return (
			<View style={styles.center}>
				<ActivityIndicator size="large" />
			</View>
		);
	}

	const startRecording = () => {
		setRoutePoints([]);
		setRecording(true);
		Alert.alert("Grabación iniciada", "Se está grabando la ruta");
	};

	const openSaveModal = () => {
		if (routePoints.length < 2) {
			Alert.alert("Ruta inválida", "No hay suficientes puntos");
			return;
		}
		setModalVisible(true);
	};

	const saveRoute = async () => {
		if (!routeName.trim()) {
			Alert.alert("Nombre requerido", "Ingresa un nombre para la ruta");
			return;
		}

		setSaving(true);

		const payload = {
			nombre: routeName,
			puntos: routePoints,
		};

		try {
			const response = await fetch(`${API_URL}/ruta`, {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify(payload),
			});

			if (!response.ok) {
				throw new Error("Error al guardar la ruta");
			}

			Alert.alert("Ruta guardada", "La ruta se guardó correctamente");
			setRecording(false);
			setRoutePoints([]);
			setRouteName("");
			setModalVisible(false);
		} catch (error) {
			Alert.alert("Error", error.message);
		} finally {
			setSaving(false);
		}
	};

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
				minZoomLevel={18}
				showsUserLocation
				followsUserLocation
			>


				{routePoints.length > 1 && (
					<Polyline
						coordinates={routePoints}
						strokeWidth={4}
						strokeColor="red"
					/>
				)}
			</MapView>

			{/* Modal guardar */}
			<Modal visible={modalVisible} transparent animationType="slide">
				<View style={styles.modalOverlay}>
					<View style={styles.modalContent}>
						<Text style={styles.modalTitle}>Guardar ruta</Text>

						<TextInput
							placeholder="Nombre de la ruta"
							value={routeName}
							onChangeText={setRouteName}
							style={styles.input}
						/>

						<View style={styles.modalButtons}>
							<TouchableOpacity
								style={styles.cancelButton}
								onPress={() => setModalVisible(false)}
							>
								<Text style={styles.buttonText}>Cancelar</Text>
							</TouchableOpacity>

							<TouchableOpacity
								style={styles.saveButton}
								onPress={saveRoute}
								disabled={saving}
							>
								<Text style={styles.buttonText}>
									{saving ? "Guardando..." : "Guardar"}
								</Text>
							</TouchableOpacity>
						</View>
					</View>
				</View>
			</Modal>
			{/* Botón Grabar / Guardar */}
			<View style={styles.topControls}>
				{!recording ? (
					<GenericCard
						nombre="Grabar ruta"
						info="Iniciar grabación del recorrido"
						onPress={startRecording}
					/>
				) : (
					<GenericCard
						nombre="Guardar ruta"
						info="Finalizar y guardar recorrido"
						onPress={openSaveModal}
					/>
				)}
			</View>
		</View>
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
	},
	center: {
		flex: 1,
		justifyContent: "center",
		alignItems: "center",
	},
	map: {
		flex: 1,
	},

	topControls: {
		position: "absolute",
		bottom: 30,      // distancia desde abajo
		left: 10,
		right: 10,
		zIndex: 10,
	},

	modalOverlay: {
		flex: 1,
		backgroundColor: "rgba(0,0,0,0.5)",
		justifyContent: "center",
		padding: 20,
	},
	modalContent: {
		backgroundColor: "#fff",
		borderRadius: 10,
		padding: 20,
	},
	modalTitle: {
		fontSize: 18,
		fontWeight: "bold",
		marginBottom: 10,
	},
	input: {
		borderWidth: 1,
		borderColor: "#ccc",
		borderRadius: 6,
		padding: 10,
		marginBottom: 15,
	},
	modalButtons: {
		flexDirection: "row",
		justifyContent: "space-between",
	},
	cancelButton: {
		backgroundColor: "#999",
		padding: 10,
		borderRadius: 6,
		flex: 1,
		marginRight: 5,
		alignItems: "center",
	},
	saveButton: {
		backgroundColor: "#007bff",
		padding: 10,
		borderRadius: 6,
		flex: 1,
		marginLeft: 5,
		alignItems: "center",
	},
	buttonText: {
		color: "#fff",
		fontWeight: "bold",
	},
});
