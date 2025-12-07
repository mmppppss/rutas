import React from 'react';
import { View, Text, Image, StyleSheet, Pressable, Alert } from 'react-native';

/**
 * Componente de tarjeta genérica y clickable
 * @param {object} props
 * @param {string} props.nombre - La línea de texto principal (obligatorio)
 * @param {string} props.info - La línea de texto secundaria (obligatorio)
 * @param {object | number} [props.imagenSource] - Fuente de la imagen (opcional)
 * @param {Function} [props.onPress] - Función a ejecutar al hacer clic (opcional)
 */
const GenericCard = ({ nombre, info, imagenSource, onPress }) => {
  return (
    <Pressable
      style={({ pressed }) => [
        styles.card,
        // Aplica un estilo de opacidad cuando se presiona la tarjeta (feedback visual)
        pressed ? styles.cardPressed : {},
      ]}
      onPress={onPress || (() => Alert.alert('Tarjeta Clicada', `Has pulsado la tarjeta: ${nombre}`))}
    >
      {/* Contenedor principal para la disposición en fila */}
      <View style={styles.contentContainer}>
        {/* Contenedor para el texto */}
        <View style={styles.textContainer}>
          <Text style={styles.nombre}>{nombre}</Text>
          <Text style={styles.info}>{info}</Text>
        </View>
        
        {/* Imagen a la derecha: solo se renderiza si se proporciona imagenSource */}
        {imagenSource && (
          <Image 
            source={imagenSource} 
            style={styles.image} 
          />
        )}
      </View>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    padding: 15,
    marginVertical: 10,
    marginHorizontal: 16,
    borderRadius: 15, // Bordes redondeados para toda la tarjeta
    elevation: 4, // Sombra para Android
    shadowColor: '#000', // Sombra para iOS
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  cardPressed: {
    opacity: 0.75, // Estilo visual cuando se presiona
  },
  contentContainer: {
    flexDirection: 'row', // Organiza los elementos horizontalmente
    justifyContent: 'space-between', // Separa el texto y la imagen a los extremos
    alignItems: 'center', // Alinea verticalmente en el centro
  },
  textContainer: {
    // Si hay imagen, ocupa el espacio restante. Si no, ocupa todo el ancho.
    flex: 1, 
    marginRight: 10,
  },
  nombre: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  info: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  image: {
    width: 50,
    height: 50,
    borderRadius: 8, // Borde cuadrado con esquinas suaves
    marginLeft: 10, // Espacio si existe texto largo
  },
});

export default GenericCard;
