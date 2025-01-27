/// <reference path=".config/sa.d.ts" />
/// <reference path=".config/sa.json" />
/// <reference no-default-lib="true" />

log("Script de enfrentamiento de bandas cargado.");

// Configuración general
const NUM_MIEMBROS_BANDA = 4; // Número de miembros por banda
const INTERVALO_EVENTOS = 100000; // Intervalo de 60 segundos entre eventos
const DISTANCIA_SPAWN = 20; // Distancia para generar las bandas respecto al jugador
const ARMAS_DISPONIBLES = [22, 24, 28, 30, 32]; // IDs de armas para las bandas

// Modelos de bandas
const BANDAS = [
    { nombre: "Ballaz", modelo: 102 },
    { nombre: "Grove Street", modelo: 107 },
];

// Función principal
(function main() {
    log("Iniciando script de enfrentamiento de bandas...");
    iniciarIntervalo(generarEnfrentamientoBandas, INTERVALO_EVENTOS);
})();

// Genera un evento de enfrentamiento de bandas
function generarEnfrentamientoBandas() {
    const player = new Player(0);
    const playerCoords = player.getChar().getCoordinates();

    // Generar posiciones cercanas al jugador
    const banda1Pos = {
        x: playerCoords.x + Math.random() * DISTANCIA_SPAWN - DISTANCIA_SPAWN / 2,
        y: playerCoords.y + Math.random() * DISTANCIA_SPAWN - DISTANCIA_SPAWN / 2,
        z: playerCoords.z,
    };

    const banda2Pos = {
        x: playerCoords.x - Math.random() * DISTANCIA_SPAWN,
        y: playerCoords.y - Math.random() * DISTANCIA_SPAWN,
        z: playerCoords.z,
    };

    // Crear bandas y desencadenar el enfrentamiento
    const banda1 = crearBanda(BANDAS[0].modelo, banda1Pos);
    const banda2 = crearBanda(BANDAS[1].modelo, banda2Pos);
    if (banda1.length > 0 && banda2.length > 0) {
        iniciarEnfrentamiento(banda1, banda2);
    } else {
        log("Error: Una de las bandas no pudo generarse correctamente.");
    }
}

function crearBanda(modelo, posicion) {
    // Solicitar el modelo del NPC
    Streaming.RequestModel(modelo);
    while (!Streaming.HasModelLoaded(modelo)) {
        wait(0); // Esperar a que el modelo esté cargado
    }

    const miembros = [];
    for (var i = 0; i < NUM_MIEMBROS_BANDA; i++) {
        const xOffset = Math.random() * 2 - 1; // Pequeño desplazamiento en X
        const yOffset = Math.random() * 2 - 1; // Pequeño desplazamiento en Y
        const spawnX = posicion.x + xOffset;
        const spawnY = posicion.y + yOffset;
        const spawnZ = posicion.z; // Usamos directamente la Z del jugador como referencia

        try {
            // Crear un NPC en la posición generada
            const npc = new Char(modelo);
            // Verificar si el NPC fue creado correctamente
            if (Char.Create(7, npc, spawnX, spawnY, spawnZ) && Char.Create(8, npc, spawnX, spawnY, spawnZ)) {
                
                miembros.push(npc); // Añadir el NPC válido al grupo
                log(
                "Miembro de banda generado en (" + spawnX.toFixed(2) +", " +spawnY.toFixed(2)+", " +spawnZ.toFixed(2) + ")"
                );
            } else {
                log(
                    "Error: NPC no válido al generar la banda en (" +spawnX.toFixed(2) +", " +spawnY.toFixed(2) +", " +spawnZ.toFixed(2) +")"
                );
            }
        } catch (e) {
            log("Error generando NPC: " + e);
        }
    }

    Streaming.MarkModelAsNoLongerNeeded(modelo); // Liberar el modelo para optimizar memoria
    return miembros;
}



function iniciarEnfrentamiento(banda1, banda2) {
    log("Enfrentamiento iniciado entre las bandas.");

    // Iterar sobre los miembros de la banda 1 y hacer que ataquen a los miembros de la banda 2
    banda1.forEach(function () {
        banda2.forEach(function (posicion) {
            try {
                const xOffset = Math.random() * 2 - 1; // Pequeño desplazamiento en X
                const yOffset = Math.random() * 1 - 1; // Pequeño desplazamiento en Y
                const spawnX = posicion.x + xOffset;
                const spawnY = posicion.y + yOffset;
                const spawnZ = posicion.z;
               const miembro = Char.Create(8, 102,  spawnX, spawnY, spawnZ);
               const objectivo = Char.Create(7, 107, spawnX, spawnY, spawnZ);
                if (miembro && objectivo) {
                    Task.KillCharOnFoot(objectivo, miembro); // Ordena al miembro de la banda 1 atacar al objetivo de la banda 2
                    log("Miembro de banda 1 atacando a un objetivo de la banda 2.");
                } else {
                    log("Miembro o objetivo no válido en banda 1.");
                }
            } catch (e) {
                log("Error en ataque de banda 1: " + e);
            }
        });
    });

    // Iterar sobre los miembros de la banda 2 y hacer que ataquen a los miembros de la banda 1
    banda2.forEach(function () {
        banda1.forEach(function (posicion) {
            try {
                const xOffset = Math.random() * 2 - 1; // Pequeño desplazamiento en X
                const yOffset = Math.random() * 1 - 1; // Pequeño desplazamiento en Y
                const spawnX = posicion.x + xOffset;
                const spawnY = posicion.y + yOffset;
                const spawnZ = posicion.z; 
                const miembro = Char.Create(7, 107,  spawnX, spawnY, spawnZ);
                const objectivo = Char.Create(8, 102, spawnX, spawnY, spawnZ);
                if (miembro && objectivo) {
                    Task.KillCharOnFoot(objectivo, miembro); // Ordena al miembro de la banda 2 atacar al objetivo de la banda 1
                    log("Miembro de banda 2 atacando a un objetivo de la banda 1.");
                } else {
                    log("Miembro o objetivo no válido en banda 2.");
                }
            } catch (e) {
                log("Error en ataque de banda 2: " + e);
            }
        });
    });
}
function obtenerArmaAleatoria() {
    var indice = Math.floor(Math.random() * ARMAS_DISPONIBLES.length);
    return ARMAS_DISPONIBLES[indice];
}
// Implementación de setInterval personalizado
function iniciarIntervalo(callback, intervalo) {
    while (true) {
        callback();
        wait(intervalo); // Pausa por el intervalo especificado
    }
}
