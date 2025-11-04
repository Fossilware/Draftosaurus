/**
 * game-constants.js
 * Constantes del juego Draftosaurus
 * Basado en el juego de mesa oficial
 */

// ==================== DINOSAURIOS OFICIALES ====================
const DINO_TYPES = [
    'trex',            // Tyrannosaurus Rex
    'triceratops',     // Triceratops
    'stegosaurus',     // Stegosaurus
    'brachiosaurus',   // Brachiosaurus
    'spinosaurus',     // Spinosaurus
    'parasaurolophus'  // Parasaurolophus
];

// Colores oficiales de cada especie (aproximados del juego real)
const DINO_COLORS = {
    'trex': '#E74C3C',            // Rojo
    'triceratops': '#E67E22',     // Naranja
    'stegosaurus': '#F39C12',     // Amarillo
    'brachiosaurus': '#27AE60',   // Verde
    'spinosaurus': '#3498DB',     // Azul
    'parasaurolophus': '#9B59B6'  // Morado
};

// Nombres en español
const DINO_NAMES = {
    'trex': 'T-Rex',
    'triceratops': 'Triceratops',
    'stegosaurus': 'Stegosaurus',
    'brachiosaurus': 'Brachiosaurus',
    'spinosaurus': 'Spinosaurus',
    'parasaurolophus': 'Parasaurolophus'
};

// Letras para fallback visual
const DINO_LETTERS = {
    'trex': 'T',
    'triceratops': 'Tr',
    'stegosaurus': 'S',
    'brachiosaurus': 'B',
    'spinosaurus': 'Sp',
    'parasaurolophus': 'P'
};

// ==================== CARAS DEL DADO OFICIALES ====================
// Basado en el juego de mesa real
const DICE_FACES = [
    'none',       // Sin restricción (cara en blanco)
    'bosque',     // Woodlands - Solo áreas verdes
    'prado',      // Grasslands - Solo áreas marrones
    'izquierda',  // Food Court - Solo lado izquierdo
    'derecha',    // Restrooms - Solo lado derecho
    'vacio',      // Empty Pen - Solo recintos vacíos
    'notrex'      // Watch Out for T-Rex - Sin T-Rex
];

const DICE_NAMES = {
    'none': 'Sin restricción',
    'bosque': 'Solo Bosque (Verde)',
    'prado': 'Solo Prado (Marrón)',
    'izquierda': 'Lado Izquierdo',
    'derecha': 'Lado Derecho',
    'vacio': 'Recinto Vacío',
    'notrex': 'Sin T-Rex'
};

// ==================== RECINTOS OFICIALES ====================
// Lado VERANO (Summer) del tablero
const ENCLOSURES = [
    'bosque',    // Forest of Sameness - Mismo tipo
    'prado',     // Meadow of Differences - Distintos
    'pradera',   // Prairie of Love - Parejas
    'trio',      // Woody Trio - Exactamente 3
    'rey',       // King of the Jungle - Mayoría
    'isla',      // Solitary Island - Único
    'rio'        // River - 1 punto cada uno
];

const ENCLOSURE_NAMES = {
    'bosque': 'Bosque de la Semejanza',
    'prado': 'Prado de la Diferencia',
    'pradera': 'Pradera del Amor',
    'trio': 'Trío Frondoso',
    'rey': 'Rey de la Selva',
    'isla': 'Isla Solitaria',
    'rio': 'Río'
};

// Descripción de reglas de cada recinto
const ENCLOSURE_RULES = {
    'bosque': 'Solo dinosaurios del mismo tipo. Puntos: 1,2,4,8,12,18',
    'prado': 'Solo dinosaurios diferentes. Puntos: 1,3,6,10,15,21',
    'pradera': '5 puntos por cada pareja del mismo tipo',
    'trio': '7 puntos si hay exactamente 3 dinosaurios',
    'rey': '7 puntos si tienes la mayoría de ese tipo',
    'isla': '7 puntos si es el único de su tipo en tu parque',
    'rio': '1 punto por cada dinosaurio'
};

// Máximo de dinosaurios por recinto
const ENCLOSURE_CAPACITY = {
    'bosque': 6,
    'prado': 6,
    'pradera': 6,
    'trio': 3,
    'rey': 1,
    'isla': 1,
    'rio': Infinity
};

// ==================== REGLAS DEL JUEGO ====================
const GAME_RULES = {
    ROUNDS: 2,              // 2 rondas
    TURNS_PER_ROUND: 6,     // 6 turnos por ronda
    DINOS_PER_PLAYER: 10,   // 10 de cada especie
    STARTING_HAND: 6        // 6 dinosaurios por ronda
};

// ==================== PUNTUACIÓN ====================
const SCORING = {
    // Bosque de la Semejanza (Forest of Sameness)
    bosque: [0, 1, 2, 4, 8, 12, 18],
    
    // Prado de la Diferencia (Meadow of Differences)
    prado: [0, 1, 3, 6, 10, 15, 21],
    
    // Pradera del Amor (Prairie of Love)
    pradera: 5, // Por pareja
    
    // Trío Frondoso (Woody Trio)
    trio: 7, // Si hay exactamente 3
    
    // Rey de la Selva (King of the Jungle)
    rey: 7, // Si tienes mayoría
    
    // Isla Solitaria (Solitary Island)
    isla: 7, // Si es único en tu parque
    
    // Río (River)
    rio: 1, // Por dinosaurio
    
    // Bonus T-Rex
    trex_bonus: 1 // +1 punto por recinto con al menos 1 T-Rex
};

console.log('✅ game-constants.js cargado - Reglas oficiales de Draftosaurus');