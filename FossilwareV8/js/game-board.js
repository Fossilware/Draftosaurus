// game-board.js - VERSION FINAL CORREGIDA CON DINOSAURIOS OFICIALES
// Draftosaurus - Especies del juego de mesa real
// Usa el archivo game-images.js y game-constants.js

console.log(' Iniciando Draftosaurus con dinosaurios oficiales...');

// ==================== CONFIGURACION (DINOSAURIOS REALES) ====================
const DINO_TYPES = ['trex', 'triceratops', 'stegosaurus', 'brachiosaurus', 'spinosaurus', 'parasaurolophus'];

const DINO_COLORS = {
    'trex': '#E74C3C',            // Rojo
    'triceratops': '#E67E22',     // Naranja
    'stegosaurus': '#F39C12',     // Amarillo
    'brachiosaurus': '#27AE60',   // Verde
    'spinosaurus': '#3498DB',     // Azul
    'parasaurolophus': '#9B59B6'  // Morado
};

const DINO_NAMES = {
    'trex': 'T-Rex',
    'triceratops': 'Triceratops',
    'stegosaurus': 'Stegosaurus',
    'brachiosaurus': 'Brachiosaurus',
    'spinosaurus': 'Spinosaurus',
    'parasaurolophus': 'Parasaurolophus'
};

const DINO_LETTERS = {
    'trex': 'T',
    'triceratops': 'Tr',
    'stegosaurus': 'S',
    'brachiosaurus': 'B',
    'spinosaurus': 'Sp',
    'parasaurolophus': 'P'
};

// Dados oficiales del juego
const DICE_FACES = ['bosque', 'prado', 'izquierda', 'derecha', 'vacio', 'notrex'];

const DICE_NAMES = {
    'none': 'Sin restriccion',
    'bosque': 'Solo Bosque (Verde)',
    'prado': 'Solo Prado (Marron)',
    'izquierda': 'Lado Izquierdo',
    'derecha': 'Lado Derecho',
    'vacio': 'Recinto Vaci­o',
    'notrex': 'Sin T-Rex'
};

const ENCLOSURES = ['bosque', 'trio', 'pradera', 'rey', 'prado', 'isla', 'rio'];

const ENCLOSURE_NAMES = {
    'bosque': 'Bosque de la Semejanza',
    'prado': 'Prado de la Diferencia',
    'pradera': 'Pradera del Amor',
    'trio': 'Tri­o Frondoso',
    'rey': 'Rey de la Selva',
    'isla': 'Isla Solitaria',
    'rio': 'Ri­o'
};

// ==================== ESTADO DEL JUEGO ====================
let gameState = {
    sessionId: null,
    currentRound: 1,
    currentTurn: 1,
    currentPlayer: 0,
    diceResult: null,
    diceRoller: 0, // Jugador que lanza el dado este turno
    selectedDino: null,
    selectedEnclosure: null,
    players: [],
    dinoPool: [],
    turnPhase: 'roll_dice',
    timerEnabled: false,
    timerSeconds: 60,
    timerInterval: null
};

// ==================== INICIALIZACION ====================
document.addEventListener('DOMContentLoaded', function() {
    console.log('ðŸ“‹ DOM cargado');
    
    if (typeof GAME_DATA === 'undefined') {
        console.error(' GAME_DATA no definido');
        alert('Error: Datos del juego no disponibles');
        return;
    }
    
    if (typeof GAME_IMAGES === 'undefined') {
        console.warn(' game-images.js no cargado - usando fallbacks de colores');
    }
    
    console.log(' Iniciando juego con 6 especies oficiales...');
    console.log(' Especies: T-Rex, Triceratops, Stegosaurus, Brachiosaurus, Spinosaurus, Parasaurolophus');
    initializeGame();
});

function initializeGame() {
    gameState.sessionId = GAME_DATA.sessionId;
    gameState.timerEnabled = GAME_DATA.timerEnabled;
    
    gameState.players = GAME_DATA.players.map(p => ({
        ...p,
        hand: [],
        board: {
            bosque: [],
            prado: [],
            pradera: [],
            trio: [],
            rey: [],
            isla: [],
            rio: []
        },
        score: 0
    }));
    
    console.log(`ðŸ‘¥ ${gameState.players.length} jugadores`);
    
    if (gameState.timerEnabled) {
        document.getElementById('timerBadge').style.display = 'inline-block';
    }
    
    // Crear pool de dinosaurios - 10 de cada especie
    gameState.dinoPool = [];
    DINO_TYPES.forEach(type => {
        for (let i = 0; i < 10; i++) {
            gameState.dinoPool.push(type);
        }
    });
    shuffleArray(gameState.dinoPool);
    
    console.log(`ðŸ¦– Pool: ${gameState.dinoPool.length} dinosaurios (10 de cada especie)`);
    
    renderBoard();
    renderScoreboard();
    updateGameInfo();
    startRound();
}

function startRound() {
    console.log(`\n========== RONDA ${gameState.currentRound} ==========`);
    gameState.currentTurn = 1;
    gameState.currentPlayer = 0;
    
    // Repartir 6 dinosaurios a cada jugador
    gameState.players.forEach((player, index) => {
        player.hand = [];
        for (let i = 0; i < 6; i++) {
            if (gameState.dinoPool.length > 0) {
                player.hand.push(gameState.dinoPool.pop());
            }
        }
        console.log(`Jugador ${index + 1} recibe: ${player.hand.join(', ')}`);
    });
    
    startTurn();
}

function startTurn() {
    console.log(`\n--- Turno ${gameState.currentTurn} ---`);
    console.log(`ðŸŽ² Lanzador del dado: Jugador ${gameState.diceRoller + 1}`);
    console.log(`ðŸ‘¤ Turno de: Jugador ${gameState.currentPlayer + 1}`);
    
    // âœ… Si es el primer jugador del turno, resetear el dado
    if (gameState.currentPlayer === 0) {
        gameState.diceResult = null;
        gameState.turnPhase = 'roll_dice';
        console.log('🔄 Nuevo turno - lanzando dado automáticamente...');
        
        // Lanzar el dado automáticamente al inicio del turno
        setTimeout(() => {
            rollDice();
        }, 500);
    } else {
        // Los demas jugadores esperan o usan el resultado ya lanzado
        gameState.turnPhase = gameState.diceResult ? 'select_dino' : 'wait_dice';
    }
    
    gameState.selectedDino = null;
    gameState.selectedEnclosure = null;
    
    stopTimer();
    
    updateGameInfo();
    renderHand();
    renderBoard();
    renderScoreboard();
    
    const currentPlayer = gameState.players[gameState.currentPlayer];
    document.getElementById('boardPlayerName').textContent = currentPlayer.player_name;
    
    // âœ… Solo el diceRoller puede lanzar el dado
    if (gameState.currentPlayer === gameState.diceRoller && !gameState.diceResult) {
        document.getElementById('rollDiceBtn').disabled = false;
        document.getElementById('diceResultText').textContent = '¡Lanza el dado!';
        console.log('Puedes lanzar el dado - sin restriccion');
    } else if (gameState.diceResult) {
        document.getElementById('rollDiceBtn').disabled = true;
        if (gameState.currentPlayer === gameState.diceRoller) {
            document.getElementById('diceResultText').textContent = `${DICE_NAMES[gameState.diceResult]} (Sin restriccion para ti)`;
        } else {
            document.getElementById('diceResultText').textContent = `${DICE_NAMES[gameState.diceResult]} (Restriccion activa)`;
        }
        console.log(` Dado ya lanzado: ${gameState.diceResult} - ${gameState.currentPlayer === gameState.diceRoller ? 'SIN restriccion' : 'CON restriccion'}`);
    } else {
        document.getElementById('rollDiceBtn').disabled = true;
        document.getElementById('diceResultText').textContent = 'Esperando que se lance el dado...';
        console.log('Esperando tirada del dado');
    }
    
    document.getElementById('confirmPlacementBtn').disabled = true;
    document.getElementById('nextTurnBtn').disabled = true;
    
    // âœ… Si ya se lanza el dado y puedo jugar, habilitar seleccion
    if (gameState.diceResult && gameState.currentPlayer !== gameState.diceRoller) {
        gameState.turnPhase = 'select_dino';
        if (gameState.timerEnabled) {
            startTimer();
        }
    }
}

// ==================== TIMER ====================
function startTimer() {
    if (!gameState.timerEnabled) return;
    
    gameState.timerSeconds = 60;
    updateTimerDisplay();
    
    gameState.timerInterval = setInterval(() => {
        gameState.timerSeconds--;
        updateTimerDisplay();
        
        if (gameState.timerSeconds <= 0) {
            stopTimer();
            alert('â° Tiempo agotado! Jugada automatica.');
            autoPlay();
        }
    }, 1000);
}

function stopTimer() {
    if (gameState.timerInterval) {
        clearInterval(gameState.timerInterval);
        gameState.timerInterval = null;
    }
}

function updateTimerDisplay() {
    document.getElementById('timerDisplay').textContent = gameState.timerSeconds;
    
    const timerBadge = document.getElementById('timerBadge');
    if (gameState.timerSeconds <= 10) {
        timerBadge.classList.add('timer-warning');
    } else {
        timerBadge.classList.remove('timer-warning');
    }
}

function autoPlay() {
    const currentPlayer = gameState.players[gameState.currentPlayer];
    
    if (currentPlayer.hand.length === 0) {
        nextTurn();
        return;
    }
    
    // Buscar dinosaurio valido
    let validDino = null;
    for (let i = 0; i < currentPlayer.hand.length; i++) {
        const dino = currentPlayer.hand[i];
        if (!(dino === 'trex' && gameState.diceResult === 'notrex')) {
            validDino = i;
            break;
        }
    }
    
    if (validDino === null) validDino = 0;
    
    selectDino(validDino);
    
    // Buscar recinto valido
    const dinoType = currentPlayer.hand[validDino];
    for (let enclosure of ENCLOSURES) {
        if (checkDiceRestriction(enclosure) && checkEnclosureRule(enclosure, dinoType, currentPlayer.board)) {
            selectEnclosure(enclosure);
            setTimeout(() => confirmPlacement(), 500);
            break;
        }
    }
}

// ==================== DADO ====================
function rollDice() {
    console.log('Lanzando dado...');
    const diceBtn = document.getElementById('rollDiceBtn');
    diceBtn.disabled = true;
    
    const diceImg = document.getElementById('diceImage');
    const diceFallback = diceImg.nextElementSibling;
    
    let counter = 0;
    const interval = setInterval(() => {
        const randomFace = DICE_FACES[Math.floor(Math.random() * DICE_FACES.length)];
        
        const imgUrl = getDiceImage(randomFace);
        if (imgUrl) {
            diceImg.src = imgUrl;
            diceImg.style.display = 'block';
            diceFallback.style.display = 'none';
        } else {
            diceImg.style.display = 'none';
            diceFallback.style.display = 'flex';
            diceFallback.textContent = randomFace === 'none' ? '✓' : '?';
        }
        
        counter++;
        if (counter >= 10) {
            clearInterval(interval);
            
            // Resultado final
            const result = DICE_FACES[Math.floor(Math.random() * DICE_FACES.length)];
            gameState.diceResult = result;
            
            console.log(` Resultado: ${result} (${DICE_NAMES[result]})`);
            console.log(`✓ Jugador ${gameState.diceRoller + 1} (lanzador) NO tiene restriccion`);
            console.log(`🛑 Los demas jugadores SÍ tienen restriccion: ${DICE_NAMES[result]}`);

            const finalImgUrl = getDiceImage(result);
            if (finalImgUrl) {
                diceImg.src = finalImgUrl;
                diceImg.style.display = 'block';
                diceFallback.style.display = 'none';
            } else {
                diceImg.style.display = 'none';
                diceFallback.style.display = 'flex';
                diceFallback.textContent = result === 'none' ? '✓' : result.substring(0, 2).toUpperCase();
            }
            
            // ✓ Mostrar mensaje según quien sea
            if (gameState.currentPlayer === gameState.diceRoller) {
                document.getElementById('diceResultText').textContent = `${DICE_NAMES[result]} (Sin restriccion para ti)`;
            } else {
                document.getElementById('diceResultText').textContent = `${DICE_NAMES[result]}`;
            }
            
            gameState.turnPhase = 'select_dino';
            renderHand();
            
            if (gameState.timerEnabled) {
                startTimer();
            }
        }
    }, 100);
}

// ==================== MANO ====================
function renderHand() {
    const handContainer = document.getElementById('dinoHand');
    const currentPlayer = gameState.players[gameState.currentPlayer];
    
    if (!currentPlayer || !currentPlayer.hand || currentPlayer.hand.length === 0) {
        handContainer.innerHTML = '<p class="text-muted text-center small">Sin dinosaurios</p>';
        document.getElementById('handCount').textContent = '0';
        return;
    }
    
    document.getElementById('handCount').textContent = currentPlayer.hand.length;
    
    handContainer.innerHTML = '';
    currentPlayer.hand.forEach((dino, index) => {
        const card = document.createElement('div');
        card.className = 'dino-hand-card';
        card.dataset.index = index;
        card.dataset.dino = dino;

        // Verificar si el dino es válido (no T-Rex si el dado dice notrex)
        const isValid = !(dino === 'trex' && gameState.diceResult === 'notrex');
        
        if (!isValid) {
            card.classList.add('disabled');
        }
        
        if (gameState.selectedDino === index) {
            card.classList.add('selected');
        }
        
        if (gameState.turnPhase === 'select_dino' && isValid) {
            card.onclick = () => selectDino(index);
        }
        
        // Intentar usar imagen
        const imgUrl = getDinoImage(dino);
        if (imgUrl) {
            const img = document.createElement('img');
            img.src = imgUrl;
            img.alt = DINO_NAMES[dino];
            img.className = 'dino-hand-img';
            img.onerror = function() {
                // Si falla la imagen, usar fallback
                this.style.display = 'none';
                const fallback = document.createElement('div');
                fallback.className = 'dino-fallback';
                fallback.style.backgroundColor = DINO_COLORS[dino];
                fallback.textContent = DINO_LETTERS[dino];
                card.appendChild(fallback);
            };
            card.appendChild(img);
        } else {
            // Usar fallback directamente
            const fallback = document.createElement('div');
            fallback.className = 'dino-fallback';
            fallback.style.backgroundColor = DINO_COLORS[dino];
            fallback.textContent = DINO_LETTERS[dino];
            card.appendChild(fallback);
        }
        
        handContainer.appendChild(card);
    });
}

function selectDino(index) {
    console.log(`ðŸ¦– Seleccionado: ${gameState.players[gameState.currentPlayer].hand[index]}`);
    gameState.selectedDino = index;
    
    renderHand();
    highlightValidEnclosures();
}

// ==================== TABLERO - 3 COLUMNAS ====================
function renderBoard() {
    const boardGrid = document.getElementById('boardGrid');
    const currentPlayer = gameState.players[gameState.currentPlayer];
    
    if (!currentPlayer) return;
    
    boardGrid.innerHTML = '';
    
    // ✓ ORDEN CORRECTO según distribución oficial del tablero
    const leftColumn = ['bosque', 'trio', 'pradera'];    // Izquierda (Cafetería)
    const centerColumn = ['rio'];                         // Centro (Río)
    const rightColumn = ['rey', 'prado', 'isla'];        // Derecha (Baños)
    
    // Crear columna izquierda
    const leftCol = document.createElement('div');
    leftCol.className = 'board-column left';
    leftColumn.forEach(enclosure => {
        leftCol.appendChild(createEnclosureCard(enclosure, currentPlayer));
    });
    
    // Crear columna centro (río)
    const centerCol = document.createElement('div');
    centerCol.className = 'board-column center';
    centerColumn.forEach(enclosure => {
        const card = createEnclosureCard(enclosure, currentPlayer);
        card.classList.add('rio-card');
        centerCol.appendChild(card);
    });
    
    // Crear columna derecha
    const rightCol = document.createElement('div');
    rightCol.className = 'board-column right';
    rightColumn.forEach(enclosure => {
        rightCol.appendChild(createEnclosureCard(enclosure, currentPlayer));
    });
    
    boardGrid.appendChild(leftCol);
    boardGrid.appendChild(centerCol);
    boardGrid.appendChild(rightCol);
}

// Función auxiliar para crear card de recinto con IMÁGENES
function createEnclosureCard(enclosure, currentPlayer) {
    const card = document.createElement('div');
    card.className = 'enclosure-card';
    card.dataset.enclosure = enclosure;
    
    const header = document.createElement('div');
    header.className = 'enclosure-header';
    
    const title = document.createElement('div');
    title.className = 'enclosure-title';
    title.textContent = ENCLOSURE_NAMES[enclosure];
    
    const count = document.createElement('div');
    count.className = 'enclosure-count';
    const dinoCount = currentPlayer.board[enclosure].length;
    count.textContent = `${dinoCount}/${enclosure === 'rio' ? 'âˆž' : enclosure === 'trio' ? '3' : enclosure === 'rey' || enclosure === 'isla' ? '1' : '6'}`;
    
    header.appendChild(title);
    header.appendChild(count);
    
    const content = document.createElement('div');
    content.className = 'enclosure-content';

    // Agregar dinosaurios como IMÁGENES
    currentPlayer.board[enclosure].forEach(dino => {
        const imgUrl = getDinoImage(dino);
        if (imgUrl) {
            const img = document.createElement('img');
            img.src = imgUrl;
            img.alt = DINO_NAMES[dino];
            img.className = 'enclosure-dino-img';
            img.title = DINO_NAMES[dino];
            
            img.onerror = function() {
                console.warn(`âš ï¸ No se pudo cargar: ${imgUrl}`);
                this.style.display = 'none';
                const fallback = document.createElement('div');
                fallback.className = 'dino-token-fallback';
                fallback.style.backgroundColor = DINO_COLORS[dino];
                fallback.textContent = DINO_LETTERS[dino];
                fallback.title = DINO_NAMES[dino];
                content.appendChild(fallback);
            };
            content.appendChild(img);
        } else {
            const fallback = document.createElement('div');
            fallback.className = 'dino-token-fallback';
            fallback.style.backgroundColor = DINO_COLORS[dino];
            fallback.textContent = DINO_LETTERS[dino];
            fallback.title = DINO_NAMES[dino];
            content.appendChild(fallback);
        }
    });
    
    card.appendChild(header);
    card.appendChild(content);
    
    return card;
}

function highlightValidEnclosures() {
    const currentPlayer = gameState.players[gameState.currentPlayer];
    const dinoType = currentPlayer.hand[gameState.selectedDino];
    
    ENCLOSURES.forEach(enclosure => {
        const enclosureCard = document.querySelector(`.enclosure-card[data-enclosure="${enclosure}"]`);
        if (!enclosureCard) return;
        
        enclosureCard.classList.remove('can-place', 'cannot-place', 'selected');
        enclosureCard.onclick = null;
        
        const canPlaceByDice = checkDiceRestriction(enclosure);
        const canPlaceByRule = checkEnclosureRule(enclosure, dinoType, currentPlayer.board);
        
        if (canPlaceByDice && canPlaceByRule) {
            enclosureCard.classList.add('can-place');
            enclosureCard.onclick = () => selectEnclosure(enclosure);
        } else {
            enclosureCard.classList.add('cannot-place');
        }
    });
}

function checkDiceRestriction(enclosure) {
    // ✓ El jugador que lanzó el dado NO tiene restricción
    if (gameState.currentPlayer === gameState.diceRoller) {
        return true; // Sin restricción - puede colocar en cualquier recinto válido
    }

    // ✓ Los demás jugadores SÍ tienen restricción
    if (!gameState.diceResult) return false; // Esperando dado

    // El río siempre disponible excepto para Cafetería/Baños que lo excluyen
    if (enclosure === 'rio') {
        return !['izquierda', 'derecha'].includes(gameState.diceResult);
    }
    
    switch(gameState.diceResult) {
        case 'bosque':  // 🌳 Áreas VERDES
            return ['bosque', 'trio', 'rey'].includes(enclosure);
        case 'prado':  // 🌾 Áreas MARRONES
            return ['pradera', 'prado', 'isla'].includes(enclosure);
        case 'izquierda':  // ⬅️ LADO IZQUIERDO (Cafetería)
            return ['bosque', 'trio', 'pradera'].includes(enclosure);
        case 'derecha':  // ➡️ LADO DERECHO (Baños)
            return ['rey', 'prado', 'isla'].includes(enclosure);
        case 'vacio':
            const currentPlayer = gameState.players[gameState.currentPlayer];
            return currentPlayer.board[enclosure].length === 0;
        case 'notrex':
            return true; // Se valida en la selección de dino
        default:
            return false;
    }
}

function checkEnclosureRule(enclosure, dinoType, board) {
    const enclosureDinos = board[enclosure];
    
    switch(enclosure) {
        case 'bosque':
            if (enclosureDinos.length === 0) return true;
            if (enclosureDinos.length >= 6) return false;
            return enclosureDinos.every(d => d === dinoType);
        case 'prado':
            if (enclosureDinos.length >= 6) return false;
            return !enclosureDinos.includes(dinoType);
        case 'pradera':
            return enclosureDinos.length < 6;
        case 'trio':
            return enclosureDinos.length < 3;
        case 'rey':
            return enclosureDinos.length === 0;
        case 'isla':
            if (enclosureDinos.length > 0) return false;
            for (let enc in board) {
                if (enc !== 'isla' && board[enc].includes(dinoType)) return false;
            }
            return true;
        case 'rio':
            return true;
        default:
            return false;
    }
}

function selectEnclosure(enclosure) {
    console.log(`🦖 Recinto: ${enclosure}`);
    gameState.selectedEnclosure = enclosure;
    
    document.querySelectorAll('.enclosure-card').forEach(card => {
        card.classList.remove('selected');
    });
    
    const selected = document.querySelector(`.enclosure-card[data-enclosure="${enclosure}"]`);
    if (selected) selected.classList.add('selected');
    
    document.getElementById('confirmPlacementBtn').disabled = false;
}

function confirmPlacement() {
    if (gameState.selectedDino === null || gameState.selectedEnclosure === null) {
        alert('🦖 Selecciona dinosaurio y recinto');
        return;
    }

    console.log('✅ Confirmando colocación...');
    stopTimer();
    
    const currentPlayer = gameState.players[gameState.currentPlayer];
    const dino = currentPlayer.hand[gameState.selectedDino];
    
    currentPlayer.board[gameState.selectedEnclosure].push(dino);
    currentPlayer.hand.splice(gameState.selectedDino, 1);

    console.log(`✅ ${DINO_NAMES[dino]} colocado en ${gameState.selectedEnclosure}`);

    calculateScore(gameState.currentPlayer);
    
    gameState.turnPhase = 'confirmed';
    renderHand();
    renderBoard();
    renderScoreboard();
    
    gameState.selectedDino = null;
    gameState.selectedEnclosure = null;
    
    document.getElementById('confirmPlacementBtn').disabled = true;
    document.getElementById('nextTurnBtn').disabled = false;
}

function nextTurn() {
    console.log('🦖 Siguiente turno...');
    stopTimer();
    
    gameState.currentPlayer++;
    
    if (gameState.currentPlayer >= gameState.players.length) {
        // âœ… FIN DEL TURNO COMPLETO
        gameState.currentPlayer = 0;
        gameState.currentTurn++;
        
        // âœ… ROTAR LANZADOR DEL DADO A LA IZQUIERDA
        gameState.diceRoller = (gameState.diceRoller + 1) % gameState.players.length;
        console.log(`🎲 Nuevo lanzador del dado para Turno ${gameState.currentTurn}: Jugador ${gameState.diceRoller + 1}`);
        
        // ✅ INTERCAMBIAR MANOS AL FINAL DE CADA TURNO (excepto el último)
        if (gameState.currentTurn <= 6) {
            passHands();
        }
        
        if (gameState.currentTurn > 6) {
            endRound();
            return;
        }
    }

    if (nextTurn === 'rollDice') {
        rollDice();
    }

    const currentPlayer = gameState.players[gameState.currentPlayer];
    if (currentPlayer.hand.length === 0) {
        nextTurn();
        return;
    }
    
    startTurn();
}

// ==================== INTERCAMBIO DE MANOS ====================
function passHands() {
    console.log('Intercambiando manos a la izquierda...');
    
    // Guardar la mano del primer jugador
    const firstPlayerHand = [...gameState.players[0].hand];
    
    // Pasar manos a la izquierda (cada jugador recibe la mano del de su derecha)
    for (let i = 0; i < gameState.players.length - 1; i++) {
        gameState.players[i].hand = [...gameState.players[i + 1].hand];
    }

    // El último jugador recibe la mano del primero
    gameState.players[gameState.players.length - 1].hand = firstPlayerHand;
    
    console.log('âœ… Manos intercambiadas');
}

function endRound() {
    console.log(`\n========== FIN RONDA ${gameState.currentRound} ==========`);
    stopTimer();
    
    gameState.currentRound++;
    
    if (gameState.currentRound > 2) {
        endGame();
    } else {
        setTimeout(() => {
            alert(`âœ… Ronda ${gameState.currentRound - 1} completada!\n\nIniciando Ronda ${gameState.currentRound}...`);
            startRound();
        }, 1000);
    }
}

function endGame() {
    console.log('\n FIN DEL JUEGO');
    stopTimer();
    
    gameState.players.forEach((player, index) => {
        calculateScore(index);
    });
    
    const sorted = [...gameState.players].sort((a, b) => b.score - a.score);
    
    const resultsHTML = `
        <div class="text-center">
            <h2 class="mb-4">🦖 ${sorted[0].player_name} Gana!</h2>
            <h5 class="text-muted">Puntuación Final</h5>
            <table class="table table-striped mt-3">
                <thead>
                    <tr>
                        <th>Posición</th>
                        <th>Jugador</th>
                        <th>Puntos</th>
                    </tr>
                </thead>
                <tbody>
                    ${sorted.map((player, index) => `
                        <tr ${index === 0 ? 'class="table-success"' : ''}>
                            <td><strong>${index + 1}</strong></td>
                            <td>
                                <span class="player-color-dot" style="background-color: ${player.player_color}"></span>
                                ${player.player_name}
                            </td>
                            <td><strong>${player.score}</strong></td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        </div>
    `;
    
    document.getElementById('finalResults').innerHTML = resultsHTML;
    const modal = new bootstrap.Modal(document.getElementById('endGameModal'));
    modal.show();
}

function calculateScore(playerIndex) {
    const player = gameState.players[playerIndex];
    const board = player.board;
    let totalScore = 0;
    
    // Bosque: 1,2,4,8,12,18
    const bosqueScores = [0, 1, 2, 4, 8, 12, 18];
    totalScore += bosqueScores[Math.min(board.bosque.length, 6)] || 0;
    
    // Prado: 1,3,6,10,15,21
    const pradoScores = [0, 1, 3, 6, 10, 15, 21];
    totalScore += pradoScores[Math.min(board.prado.length, 6)] || 0;
    
    // Pradera: 5 puntos por pareja
    const praderaCount = {};
    board.pradera.forEach(dino => {
        praderaCount[dino] = (praderaCount[dino] || 0) + 1;
    });
    Object.values(praderaCount).forEach(count => {
        totalScore += Math.floor(count / 2) * 5;
    });
    
    // Trío: 7 puntos si hay exactamente 3
    if (board.trio.length === 3) totalScore += 7;
    
    // Rey: 7 puntos si tienes la mayoría
    if (board.rey.length === 1) {
        const reyType = board.rey[0];
        let myCount = 1;
        Object.keys(board).forEach(enc => {
            if (enc !== 'rey') {
                myCount += board[enc].filter(d => d === reyType).length;
            }
        });
        
        let hasMoreThanOpponents = true;
        gameState.players.forEach((opponent, oppIndex) => {
            if (oppIndex !== playerIndex) {
                let oppCount = 0;
                Object.values(opponent.board).forEach(encDinos => {
                    oppCount += encDinos.filter(d => d === reyType).length;
                });
                if (oppCount > myCount) hasMoreThanOpponents = false;
            }
        });
        
        if (hasMoreThanOpponents) totalScore += 7;
    }

    // Isla: 7 puntos si es único
    if (board.isla.length === 1) {
        const islaType = board.isla[0];
        let countInPark = 1;
        Object.keys(board).forEach(enc => {
            if (enc !== 'isla') {
                countInPark += board[enc].filter(d => d === islaType).length;
            }
        });
        if (countInPark === 1) totalScore += 7;
    }

    // Río: 1 punto cada uno
    totalScore += board.rio.length;
    
    // Bonus T-Rex: +1 por recinto con al menos 1 T-Rex
    ENCLOSURES.forEach(enc => {
        if (board[enc].includes('trex')) {
            totalScore += 1;
        }
    });
    
    player.score = totalScore;
}

function renderScoreboard() {
    const scoresList = document.getElementById('scoresList');
    const sorted = [...gameState.players].sort((a, b) => b.score - a.score);
    
    scoresList.innerHTML = sorted.map((player, index) => `
        <div class="score-item ${index === 0 ? 'first-place' : ''}">
            <div class="d-flex align-items-center">
                <div class="player-color-dot" style="background-color: ${player.player_color}"></div>
                <span class="player-name-score">${player.player_name}</span>
            </div>
            <span class="score-points">${player.score}</span>
        </div>
    `).join('');
}

function updateGameInfo() {
    document.getElementById('roundNumber').textContent = gameState.currentRound;
    document.getElementById('turnNumber').textContent = gameState.currentTurn;
    
    const currentPlayer = gameState.players[gameState.currentPlayer];
    document.getElementById('currentPlayerName').textContent = currentPlayer.player_name;
    document.getElementById('currentPlayerColorBar').style.backgroundColor = currentPlayer.player_color;
}

function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}

function toggleRules() {
    const modal = new bootstrap.Modal(document.getElementById('rulesModal'));
    modal.show();
}

function confirmExit() {
    if (confirm('¿Salir de la partida? Se perdera el progreso.')) {
        stopTimer();
        window.location.href = 'dashboard.php';
    }
}

console.log('game-board.js cargado con dinosaurios oficiales de Draftosaurus');