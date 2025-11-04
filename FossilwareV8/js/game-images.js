/**
 * game-images.js
 * Configuración de imágenes para Draftosaurus
 * RUTAS CORREGIDAS - SIN ../
 */

const GAME_IMAGES = {
    // Imágenes de Dinosaurios
    dinos: {
        'trex': 'img/dinos/trex.png',                    
        'triceratops': 'img/dinos/triceratops.png',      
        'stegosaurus': 'img/dinos/stegosaurus.png',      
        'brachiosaurus': 'img/dinos/brachiosaurus.png',  
        'spinosaurus': 'img/dinos/spinosaurus.png',      
        'parasaurolophus': 'img/dinos/parasaurolophus.png'
    },
    
    // Imágenes de los Dados
    dice: {
        'none': 'img/dice/none.png',
        'bosque': 'img/dice/bosque.png',
        'prado': 'img/dice/prado.png',
        'izquierda': 'img/dice/izquierda.png',
        'derecha': 'img/dice/derecha.png',
        'vacio': 'img/dice/vacio.png',
        'notrex': 'img/dice/notrex.png',
        'question': 'img/dice/question.png'
    }
};

function getDinoImage(dinoType) {
    return GAME_IMAGES.dinos[dinoType] || null;
}

function getDiceImage(diceFace) {
    return GAME_IMAGES.dice[diceFace] || GAME_IMAGES.dice['question'];
}

console.log('✅ game-images.js cargado con rutas SIN ../');