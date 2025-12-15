import React, { useState, useEffect, useMemo } from 'react';
import {
	View,
	Text,
	ActivityIndicator,
	StyleSheet,
	FlatList,
	TextInput,
	Keyboard,
	TouchableWithoutFeedback,
	Platform,
	StatusBar
} from 'react-native';
import GenericCard from '@/components/GenericCard';
import { useRouter } from 'expo-router';
import { useApi } from '@/hooks/useApi';

export default function RutaCardListScreen() {
	const [searchText, setSearchText] = useState('');
	const router = useRouter();

	const { data, loading, error, fetchData } = useApi();

	const rutas = data || [];

	const fetchRutas = () => {
		fetchData('/rutas', 'GET');
	};

	useEffect(() => {
		if (Platform.OS === 'android') {
			StatusBar.setBarStyle('dark-content');
			StatusBar.setBackgroundColor('#f8f8f8');
		}
		fetchRutas();
	}, []);

	const logoRN = require('../../assets/images/react-logo.png');

	const handleCardPress = (id) => {
		console.log(`Navegando a la ruta con ID: ${id} `);
		router.push(`/ruta/${id}`);
	};

	const filteredRutas = useMemo(() => {
		if (!searchText) {
			return rutas;
		}

		const lowerCaseSearch = searchText.toLowerCase();

		return rutas.filter(ruta =>
			(ruta.nombre && ruta.nombre.toLowerCase().includes(lowerCaseSearch)) ||
			(ruta.descripcion && ruta.descripcion.toLowerCase().includes(lowerCaseSearch))
		);
	}, [searchText, rutas]); // Depende de searchText Y de los datos de la API (rutas)

	// Función que renderiza cada elemento de la lista
	const renderItem = ({ item }) => (
		<View style={styles.cardWrapper}>
			<GenericCard
				nombre={item.nombre}
				// Asegúrate de tener los campos 'duracion' y 'distancia' en la respuesta de la API
				info={`${item.duracion} - ${item.distancia} km`}
				imagenSource={logoRN}
				onPress={() => handleCardPress(item.id)}
			/>
		</View>
	);

	// --- Renderizado Condicional ---

	if (loading) {
		return <ActivityIndicator size="large" color="#0000ff" style={styles.centered} />;
	}

	if (error) {
		return <Text style={styles.errorText}>Error al cargar rutas: {error}</Text>;
	}

	return (
		<TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
			<View style={styles.container}>
				{/* Opcional: Controla el estilo del contenido de la barra de estado 
                */}
				<StatusBar
					barStyle={Platform.OS === 'ios' ? 'dark-content' : 'default'}
					backgroundColor="#f8f8f8"
				/>

				{/* Barra de Búsqueda */}
				<TextInput
					style={styles.searchInput}
					placeholder="Buscar ruta por nombre o descripción..."
					value={searchText}
					onChangeText={setSearchText}
					placeholderTextColor="#999"
				/>

				{/* Lista de Cards Scrollable */}
				<FlatList
					// Usa el arreglo FILTRADO
					data={filteredRutas}
					renderItem={renderItem}
					// Usa 'id' de la ruta como key
					keyExtractor={(item) => item.id.toString()}
					contentContainerStyle={styles.listContent}
					ListEmptyComponent={() => (
						<View style={styles.emptyContainer}>
							{/* Reemplazado ThemedText por Text, ya que no estaba importado */}
							<Text style={styles.emptyText}>
								No se encontraron rutas que coincidan con "{searchText}".
							</Text>
						</View>
					)}
				/>
			</View>
		</TouchableWithoutFeedback>
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: '#f8f8f8',
		// Asegura el espacio para la barra de estado en Android
		paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
	},
	centered: {
		flex: 1,
		justifyContent: 'center',
		alignItems: 'center'
	},
	errorText: {
		color: 'red',
		padding: 20,
		textAlign: 'center'
	},
	searchInput: {
		height: 50,
		backgroundColor: '#fff',
		margin: 10,
		paddingHorizontal: 15,
		borderRadius: 25,
		borderColor: '#ddd',
		borderWidth: 1,
		fontSize: 16,
		shadowColor: '#000',
		shadowOffset: { width: 0, height: 2 },
		shadowOpacity: 0.1,
		shadowRadius: 3,
		elevation: 2,
	},
	listContent: {
		paddingHorizontal: 10,
		paddingBottom: 20,
	},
	cardWrapper: {
		marginBottom: 10,
	},
	emptyContainer: {
		flex: 1,
		justifyContent: 'center',
		alignItems: 'center',
		padding: 20,
	},
	emptyText: {
		color: '#666',
		fontSize: 16,
		textAlign: 'center',
	}
});
