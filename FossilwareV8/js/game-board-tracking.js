// game-board-tracking.js - MODO SEGUIMIENTO CON IMÁGENES
// Draftosaurus - Sistema de registro manual con imágenes
// Sin dado, sin restricciones, sin temporizador - PERO CON IMÁGENES

console.log('📊 Iniciando Draftosaurus - Modo Seguimiento con imágenes...');

// ==================== CONFIGURACIÓN ====================
const DINO_TYPES = ['trex', 'triceratops', 'stegosaurus', 'brachiosaurus', 'spinosaurus', 'parasaurolophus'];

const DINO_COLORS = {
    'trex': '#E74C3C',
    'triceratops': '#E67E22',
    'stegosaurus': '#F39C12',
    'brachiosaurus': '#27AE60',
    'spinosaurus': '#3498DB',
    'parasaurolophus': '#9B59B6'
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

const ENCLOSURES = ['bosque', 'trio', 'pradera', 'rey', 'prado', 'isla', 'rio'];

const ENCLOSURE_NAMES = {
    'bosque': 'Bosque de la Semejanza',
    'prado': 'Prado de la Diferencia',
    'pradera': 'Pradera del Amor',
    'trio': 'Trío Frondoso',
    'rey': 'Rey de la Selva',
    'isla': 'Isla Solitaria',
    'rio': 'Río'
};

// ==================== FUNCIÓN PARA OBTENER IMAGEN ====================
function getDinoImage(dinoType) {
    if (typeof GAME_IMAGES !== 'undefined' && GAME_IMAGES.dinos && GAME_IMAGES.dinos[dinoType]) {
        return GAME_IMAGES.dinos[dinoType];
    }
    return null;
}

// ==================== ESTADO DEL JUEGO ====================
let gameState = {
    sessionId: null,
    currentRound: 1,
    currentTurn: 1,
    currentPlayer: 0,
    selectedDino: null,
    selectedEnclosure: null,
    players: [],
    turnPhase: 'select_dino',
    mode: 'tracking'
};

// ==================== INICIALIZACIÓN ====================
document.addEventListener('DOMContentLoaded', function() {
    console.log('📋 DOM cargado - Modo Seguimiento');
    
    if (typeof GAME_DATA === 'undefined') {
        console.error('❌ GAME_DATA no definido');
        alert('Error: Datos del juego no disponibles');
        return;
    }
    
    if (typeof GAME_IMAGES === 'undefined') {
        console.warn('⚠️ game-images.js no cargado - usando fallbacks de colores');
    }
    
    console.log('✅ Iniciando modo seguimiento con imágenes...');
    initializeGame();
});

function initializeGame() {
    gameState.sessionId = GAME_DATA.sessionId;
    gameState.mode = 'tracking';
    
    gameState.players = GAME_DATA.players.map(p => ({
        ...p,
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
    
    console.log(`👥 ${gameState.players.length} jugadores en modo seguimiento`);
    
    renderBoard();
    renderScoreboard();
    updateGameInfo();
    startTurn();
}

function startTurn() {
    console.log(`\n--- Turno ${gameState.currentTurn} - Ronda ${gameState.currentRound} ---`);
    console.log(`👤 Turno de: Jugador ${gameState.currentPlayer + 1}`);
    
    gameState.selectedDino = null;
    gameState.selectedEnclosure = null;
    gameState.turnPhase = 'select_dino';
    
    // Resetear selección de dinosaurio
    const dinoSelect = document.getElementById('dinoTypeSelect');
    if (dinoSelect) dinoSelect.value = '';
    
    updateGameInfo();
    renderBoard();
    renderScoreboard();
    
    const currentPlayer = gameState.players[gameState.currentPlayer];
    document.getElementById('boardPlayerName').textContent = currentPlayer.player_name;
    
    document.getElementById('confirmPlacementBtn').disabled = true;
    document.getElementById('nextTurnBtn').disabled = true;
}

// ==================== SELECCIÓN DE DINOSAURIO ====================
document.addEventListener('DOMContentLoaded', function() {
    const dinoSelect = document.getElementById('dinoTypeSelect');
    if (dinoSelect) {
        dinoSelect.addEventListener('change', function() {
            const dinoType = this.value;
            if (dinoType) {
                gameState.selectedDino = dinoType;
                console.log(`🦕 Dinosaurio seleccionado: ${DINO_NAMES[dinoType]}`);
                
                // Highlight - hacer todos los recintos clickeables
                document.querySelectorAll('.enclosure-card').forEach(card => {
                    card.classList.add('clickable');
                });
            } else {
                gameState.selectedDino = null;
                document.querySelectorAll('.enclosure-card').forEach(card => {
                    card.classList.remove('clickable');
                });
            }
        });
    }
});

// ==================== RENDERIZADO DEL TABLERO CON IMÁGENES ====================
function renderBoard() {
    const boardGrid = document.getElementById('boardGrid');
    if (!boardGrid) return;
    
    const currentPlayer = gameState.players[gameState.currentPlayer];
    const board = currentPlayer.board;
    
    boardGrid.innerHTML = '';
    
    // ✅ MISMO LAYOUT QUE MODO REGULAR: Izquierda, Centro, Derecha
    const leftColumn = ['bosque', 'trio', 'pradera'];
    const centerColumn = ['rio'];
    const rightColumn = ['rey', 'prado', 'isla'];
    
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

// ==================== CREAR CARD DE RECINTO CON IMÁGENES ====================
function createEnclosureCard(enclosure, currentPlayer) {
    const card = document.createElement('div');
    card.className = 'enclosure-card';
    card.dataset.enclosure = enclosure;
    
    // Header del recinto
    const header = document.createElement('div');
    header.className = 'enclosure-header';
    
    const title = document.createElement('div');
    title.className = 'enclosure-title';
    title.textContent = ENCLOSURE_NAMES[enclosure];
    
    const count = document.createElement('div');
    count.className = 'enclosure-count';
    const dinoCount = currentPlayer.board[enclosure].length;
    count.textContent = `${dinoCount}/${enclosure === 'rio' ? '∞' : enclosure === 'trio' ? '3' : enclosure === 'rey' || enclosure === 'isla' ? '1' : '6'}`;
    
    header.appendChild(title);
    header.appendChild(count);
    
    // Contenido con dinosaurios
    const content = document.createElement('div');
    content.className = 'enclosure-content';
    
    // ✅ AGREGAR DINOSAURIOS COMO IMÁGENES (igual que modo regular)
    currentPlayer.board[enclosure].forEach(dino => {
        const imgUrl = getDinoImage(dino);
        if (imgUrl) {
            const img = document.createElement('img');
            img.src = imgUrl;
            img.alt = DINO_NAMES[dino];
            img.className = 'enclosure-dino-img';
            img.title = DINO_NAMES[dino];
            
            // Fallback si la imagen no carga
            img.onerror = function() {
                console.warn(`⚠️ No se pudo cargar: ${imgUrl}`);
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
            // Fallback de color si no hay imagen
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
    
    // ✅ CLICK HANDLER para seleccionar recinto
    card.addEventListener('click', function() {
        if (gameState.selectedDino) {
            selectEnclosure(enclosure);
        }
    });
    
    return card;
}

// ==================== SELECCIÓN DE RECINTO ====================
function selectEnclosure(enclosure) {
    if (!gameState.selectedDino) {
        alert('⚠️ Primero selecciona un tipo de dinosaurio');
        return;
    }
    
    gameState.selectedEnclosure = enclosure;
    console.log(`📍 Recinto seleccionado: ${ENCLOSURE_NAMES[enclosure]}`);
    
    // Highlight del recinto seleccionado
    document.querySelectorAll('.enclosure-card').forEach(card => {
        card.classList.remove('selected');
    });
    document.querySelector(`[data-enclosure="${enclosure}"]`).classList.add('selected');
    
    // Habilitar botón de confirmar
    document.getElementById('confirmPlacementBtn').disabled = false;
}

// ==================== CONFIRMAR COLOCACIÓN ====================
function confirmPlacement() {
    if (!gameState.selectedDino || !gameState.selectedEnclosure) {
        alert('⚠️ Selecciona un dinosaurio y un recinto');
        return;
    }
    
    const currentPlayer = gameState.players[gameState.currentPlayer];
    const enclosure = gameState.selectedEnclosure;
    const dinoType = gameState.selectedDino;
    
    // Agregar dinosaurio al tablero
    currentPlayer.board[enclosure].push(dinoType);
    
    console.log(`✅ ${DINO_NAMES[dinoType]} colocado en ${ENCLOSURE_NAMES[enclosure]}`);
    
    // Calcular puntuación actualizada
    calculateScore(gameState.currentPlayer);
    
    // Actualizar interfaz
    renderBoard();
    renderScoreboard();
    
    // Resetear selección
    gameState.selectedDino = null;
    gameState.selectedEnclosure = null;
    const dinoSelect = document.getElementById('dinoTypeSelect');
    if (dinoSelect) dinoSelect.value = '';
    
    document.querySelectorAll('.enclosure-card').forEach(card => {
        card.classList.remove('selected', 'clickable');
    });
    
    // Habilitar botón de siguiente turno
    document.getElementById('confirmPlacementBtn').disabled = true;
    document.getElementById('nextTurnBtn').disabled = false;
}

// ==================== SIGUIENTE TURNO ====================
function nextTurn() {
    console.log('⏭️ Siguiente turno...');
    
    gameState.currentPlayer++;
    
    if (gameState.currentPlayer >= gameState.players.length) {
        gameState.currentPlayer = 0;
        gameState.currentTurn++;
        
        if (gameState.currentTurn > 6) {
            endRound();
            return;
        }
    }
    
    startTurn();
}

// ==================== FIN DE RONDA ====================
function endRound() {
    console.log(`\n========== FIN RONDA ${gameState.currentRound} ==========`);
    
    gameState.currentRound++;
    
    if (gameState.currentRound > 2) {
        endGame();
    } else {
        setTimeout(() => {
            if (confirm(`✅ Ronda ${gameState.currentRound - 1} completada!\n\n¿Iniciar Ronda ${gameState.currentRound}?`)) {
                gameState.currentTurn = 1;
                gameState.currentPlayer = 0;
                startTurn();
            }
        }, 500);
    }
}

// ==================== FIN DEL JUEGO ====================
function endGame() {
    console.log('\n🏁 FIN DEL JUEGO');
    
    // Calcular puntuación final de todos
    gameState.players.forEach((player, index) => {
        calculateScore(index);
    });
    
    const sorted = [...gameState.players].sort((a, b) => b.score - a.score);
    
    const resultsHTML = `
        <div class="text-center">
            <h2 class="mb-4">🏆 ${sorted[0].player_name} Gana!</h2>
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
                            <td><strong>${index + 1}º</strong></td>
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

// ==================== CÁLCULO DE PUNTUACIÓN ====================
function calculateScore(playerIndex) {
    const player = gameState.players[playerIndex];
    const board = player.board;
    let totalScore = 0;
    
    // Bosque: Dinosaurios del mismo tipo
    const bosqueTypes = {};
    board.bosque.forEach(dino => {
        bosqueTypes[dino] = (bosqueTypes[dino] || 0) + 1;
    });
    const maxSameType = Math.max(0, ...Object.values(bosqueTypes));
    const bosqueScores = [0, 1, 2, 4, 8, 12, 18];
    totalScore += bosqueScores[Math.min(maxSameType, 6)] || 0;
    
    // Prado: Dinosaurios de tipos distintos
    const pradoTypes = new Set(board.prado);
    const pradoScores = [0, 1, 3, 6, 10, 15, 21];
    totalScore += pradoScores[Math.min(pradoTypes.size, 6)] || 0;
    
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
    
    // Rey: 7 puntos si tienes la mayoría de ese tipo
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
                if (oppCount >= myCount) hasMoreThanOpponents = false;
            }
        });
        
        if (hasMoreThanOpponents) totalScore += 7;
    }
    
    // Isla: 7 puntos si es único en tu parque
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

// ==================== MARCADOR ====================
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

// ==================== ACTUALIZAR INFO ====================
function updateGameInfo() {
    document.getElementById('roundNumber').textContent = gameState.currentRound;
    document.getElementById('turnNumber').textContent = gameState.currentTurn;
    
    const currentPlayer = gameState.players[gameState.currentPlayer];
    document.getElementById('currentPlayerName').textContent = currentPlayer.player_name;
    
    const colorBar = document.getElementById('currentPlayerColorBar');
    if (colorBar) {
        colorBar.style.backgroundColor = currentPlayer.player_color;
    }
}

// ==================== UTILIDADES ====================
function toggleRules() {
    const modal = new bootstrap.Modal(document.getElementById('rulesModal'));
    modal.show();
}

function confirmExit() {
    if (confirm('¿Salir del modo seguimiento? Se perderá el progreso.')) {
        window.location.href = 'dashboard.php';
    }
}

console.log('✅ game-board-tracking.js cargado - Modo Seguimiento con imágenes activo');