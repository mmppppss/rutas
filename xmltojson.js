const xml2js = require('xml2js');
const fs = require('fs'); // Módulo para leer archivos (si lo ejecutas en Node.js)

/**
 * Función que convierte el contenido de un archivo GPX (formato XML)
 * al formato JSON compatible con tu API.
 * * @param {string} gpxXmlContent - La cadena de texto completa del archivo GPX.
 * @returns {object} Un objeto JSON con el formato de tu API.
 */
function convertGpxToApiFormat(gpxXmlContent, routeName = "Ruta Convertida") {
    let routeData = {
        nombre: routeName,
        descripcion: "",
        distancia: 0.0, // Estos campos deberían calcularse, aquí son placeholders
        duracion: "00:00:00",
        id: Date.now(),
        ruta: []
    };

    const parser = new xml2js.Parser({
        explicitArray: false, // Asegura que los elementos con solo un hijo no sean arrays
        attrkey: "attr", // Mueve los atributos (lat, lon) a una clave separada
    });

    return new Promise((resolve, reject) => {
        parser.parseString(gpxXmlContent, (err, result) => {
            if (err) {
                console.error("Error al parsear el XML GPX:", err);
                return reject(err);
            }

            try {
                // Navegamos a los puntos del track (trkpt)
                const track = result.gpx.trk;
                let trackPoints = [];

                if (track && track.trkseg && track.trkseg.trkpt) {
                    trackPoints = Array.isArray(track.trkseg.trkpt) 
                                ? track.trkseg.trkpt 
                                : [track.trkseg.trkpt];
                } else {
                    console.warn("No se encontraron puntos de track (<trkpt>) en el archivo GPX.");
                    return resolve(routeData); // Devuelve estructura vacía si no hay puntos
                }

                // Mapeamos los puntos al formato de tu API
                routeData.ruta = trackPoints.map(point => ({
                    latitude: parseFloat(point.attr.lat),
                    longitude: parseFloat(point.attr.lon),
                }));

                // Opcional: Asignar el nombre del track si existe
                if (track.name) {
                    routeData.nombre = track.name;
                }

                resolve(routeData);

            } catch (e) {
                console.error("Error al procesar la estructura GPX:", e);
                reject(new Error("Estructura GPX no reconocida o incompleta."));
            }
        });
    });
}

// -------------------------------------------------------------------
// --- EJEMPLO DE USO ---
// -------------------------------------------------------------------

// 1. Contenido de prueba (ejemplo mínimo de un archivo GPX)
const sampleGpxXml = `
<gpx version="1.1" creator="Test App">
  <trk>
    <name>Mi Ruta de Prueba GPX</name>
    <trkseg>
      <trkpt lat="43.146139" lon="-4.777402">
        <ele>1228.420</ele>
        <time>2018-10-13T14:15:24Z</time>
      </trkpt>
      <trkpt lat="43.145800" lon="-4.776900">
        <ele>1225.100</ele>
        <time>2018-10-13T14:15:30Z</time>
      </trkpt>
      <trkpt lat="43.145500" lon="-4.776500">
        <ele>1223.500</ele>
        <time>2018-10-13T14:15:36Z</time>
      </trkpt>
    </trkseg>
  </trk>
</gpx>
`;

async function main() {
    try {
        const apiJson = await convertGpxToApiFormat(sampleGpxXml);
        
        console.log("--- RESULTADO JSON PARA LA API ---");
        console.log(JSON.stringify(apiJson, null, 2));

        // Puedes usar este objeto 'apiJson' para enviarlo a tu endpoint POST
        // const response = await fetch('http://localhost:5000/ruta', {
        //     method: 'POST',
        //     headers: { 'Content-Type': 'application/json' },
        //     body: JSON.stringify(apiJson)
        // });

    } catch (e) {
        console.error("Fallo la conversión o el proceso:", e.message);
    }
}


// -------------------------------------------------------------------
// Opcional: Si quieres leer desde un archivo:
async function readFromFileAndConvert(filePath) {
    try {
        const gpxXml = fs.readFileSync(filePath, 'utf8');
        const apiJson = await convertGpxToApiFormat(gpxXml);
        console.log(JSON.stringify(apiJson, null, 2));
    } catch (e) {
        console.error("Error al leer o convertir el archivo:", e);
    }
}
readFromFileAndConvert('/home/mps/Downloads/fuente-de-puertos-de-aliva-picos-de-europa.gpx'); 

