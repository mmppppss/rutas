import React, { useEffect, useState, useRef, useMemo } from "react";
import { 
    StyleSheet, 
    View, 
    ActivityIndicator, 
    Alert, 
    Text,
    Platform,
    StatusBar 
} from "react-native";
import MapView, { Marker, Circle, Polyline } from "react-native-maps";
import * as Location from "expo-location";
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useApi } from '@/hooks/useApi';

export default function RouteMapScreen() {
    const [userLocation, setUserLocation] = useState(null); 
    const [userLocationsHistory, setUserLocationsHistory] = useState([]); 
    const mapRef = useRef(null);
    const router = useRouter(); 
    
    const { id } = useLocalSearchParams(); 
    const routeId = id || '1'; 

    const { data: routeData, loading: apiLoading, error: apiError, fetchData } = useApi();

    useEffect(() => {
        if (routeId) {
            fetchData(`/rutas/${routeId}`, 'GET');
        }
    }, [routeId]);

    useEffect(() => {
        let subscription;

        (async () => {
            const { status } = await Location.requestForegroundPermissionsAsync();
            if (status !== "granted") {
                Alert.alert("Permiso Denegado", "El acceso a la ubicación es necesario para mostrar el mapa.");
                return;
            }

            subscription = await Location.watchPositionAsync(
                {
                    accuracy: Location.Accuracy.Highest,
                    timeInterval: 3000,     
                    distanceInterval: 5,    
                },
                (loc) => {
                    const coords = { 
                        latitude: loc.coords.latitude, 
                        longitude: loc.coords.longitude 
                    };
                    setUserLocation(coords);
                    setUserLocationsHistory(prev => [...prev, coords]);

                    if (mapRef.current) {
                        mapRef.current.animateToRegion({
                            latitude: coords.latitude,
                            longitude: coords.longitude,
                            latitudeDelta: 0.005, // Zoom
                            longitudeDelta: 0.005,
                        });
                    }
                }
            );
        })();

        return () => {
            if (subscription) subscription.remove();
        };
    }, []);

    const routeCoordinates = useMemo(() => {
        if (routeData && routeData.ruta && Array.isArray(routeData.ruta)) {
            return routeData.ruta.map(point => ({
                latitude: point.latitud,
                longitude: point.longitud,
            }));
        }
        return [];
    }, [routeData]);

    if (!userLocation || apiLoading) {
        return (
            <View style={styles.centeredContainer}>
                <ActivityIndicator size="large" color="#0000ff" />
                <Text style={styles.loadingText}>
                    Cargando ubicación y detalles de la ruta...
                </Text>
            </View>
        );
    }
    
    if (apiError) {
        return (
            <View style={styles.centeredContainer}>
                <Text style={styles.errorText}>
                    Error al cargar la ruta {routeId}: {apiError}
                </Text>
            </View>
        );
    }

    const initialRegion =  routeData ?
		{
        latitude: routeData.ruta[0].latitud,
        longitude: routeData.ruta[0].longitud,
        latitudeDelta: 0.005,
        longitudeDelta: 0.005,
    	}:{
        latitude: userLocation.latitude,
        longitude: userLocation.longitude,
        latitudeDelta: 0.005,
        longitudeDelta: 0.005,
    };

    return (
        <View style={styles.container}>
            <MapView
                ref={mapRef}
                style={styles.map}
                initialRegion={initialRegion}
                showsUserLocation={true}
                followsUserLocation={true}
                // minZoomLevel={20} // Un minZoomLevel muy alto puede ser restrictivo, se sugiere usar zoom inicial.
            >
                {/* Dibuja la ruta obtenida de la API */}
                {routeCoordinates.length > 0 && (
                    <Polyline
                        coordinates={routeCoordinates}
                        strokeColor="#FF0000"
                        strokeWidth={5}
                        lineCap="round"
                    />
                )}
                
                {/* Dibuja el rastro recorrido por el usuario */}
                {userLocationsHistory.length > 1 && (
                    <Polyline
                        coordinates={userLocationsHistory}
                        strokeColor="blue" 
                        strokeWidth={3}
                        lineCap="round"
                    />
                )}

                {/* Círculo de precisión para la ubicación actual */}
                {userLocation && (
                    <Circle
                        center={userLocation}
                        radius={50}
                        strokeWidth={2}
                        strokeColor="green"
                        fillColor="rgba(0, 255, 0, 0.1)"
                    />
                )}
            </MapView>
            
            <View style={styles.overlay}>
                <Text style={styles.routeTitle}>
                    Ruta: {routeData?.nombre || `ID ${routeId}`}
                </Text>
                <Text style={styles.routeDetails}>
                    Distancia: {routeData?.distancia || 'N/A'} km | 
                    Duración Estimada: {routeData?.duracion || 'N/A'}
                </Text>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { 
        flex: 1,
        paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0, 
    },
    centeredContainer: { 
        flex: 1, 
        justifyContent: 'center', 
        alignItems: 'center',
        backgroundColor: '#fff'
    },
    map: { 
        flex: 1 
    },
    errorText: {
        color: 'red',
        fontSize: 16,
        padding: 20,
        textAlign: 'center'
    },
    loadingText: {
        marginTop: 10,
        color: '#666'
    },
    overlay: {
        position: 'absolute',
        top: Platform.OS === 'android' ? StatusBar.currentHeight + 10 : 10,
        left: 10,
        right: 10,
        backgroundColor: 'white',
        padding: 10,
        borderRadius: 8,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,
    },
    routeTitle: {
        fontSize: 18,
        fontWeight: 'bold',
    },
    routeDetails: {
        fontSize: 14,
        color: '#666'
    }
});
