/**
 * Controlador de Juego - Gestor de Interacciones
 * Draftosaurus - FossilWare
 */

class GameController {
    constructor(gameSession, players) {
        this.gameSession = gameSession;
        this.players = players;
        this.gameState = null;
        this.isCurrentPlayer = false;
        this.selectedDinosaur = null;
        this.confirmationPending = false;
        this.init();
    }

    /**
     * Inicializa el controlador del juego
     */
    init() {
        // Preparar datos de jugadores
        const formattedPlayers = this.players.map((p, idx) => ({
            id: p.user_id,
            name: p.username,
            position: p.player_position,
            avatar: p.profile_pic || 'default-avatar.png',
            color: this.getPlayerColor(idx)
        }));

        // Crear instancia de GameState
        this.gameState = new GameState(this.gameSession.id, formattedPlayers);

        // Configurar listener de eventos
        this.setupEventListeners();

        // Renderizar UI inicial
        this.render();

        // Iniciar primer turno automáticamente después de 1 segundo
        setTimeout(() => this.startGame(), 1000);
    }

    /**
     * Configurar listeners de botones y eventos
     */
    setupEventListeners() {
        const rollDieBtn = document.getElementById('roll-die-btn');
        const nextTurnBtn = document.getElementById('next-turn-btn');
        const undoBtn = document.getElementById('undo-btn');

        if (rollDieBtn) {
            rollDieBtn.addEventListener('click', () => this.rollDice());
        }

        if (nextTurnBtn) {
            nextTurnBtn.addEventListener('click', () => this.confirmTurn());
        }

        if (undoBtn) {
            undoBtn.addEventListener('click', () => this.undoMove());
        }

        // Event listeners para habilitar/deshabilitar botones
        this.updateButtonStates();
    }

    /**
     * Obtiene un color para un jugador según su índice
     */
    getPlayerColor(index) {
        return PLAYER_COLORS[index % PLAYER_COLORS.length];
    }

    /**
     * Inicia el juego
     */
    startGame() {
        this.gameState.gameState = GAME_STATES.PLAYING;
        console.log('🎮 Juego iniciado');
        this.render();
    }

    /**
     * Tira el dado
     */
    rollDice() {
        if (this.gameState.gameState === GAME_STATES.PLAYING) {
            const diceResult = this.gameState.rollPlacementDie();
            console.log('🎲 Dado tirado:', diceResult.name);
            
            // Mostrar resultado del dado
            this.displayDiceResult(diceResult);

            // Cambiar estado a selección de dinosaurio
            this.gameState.gameState = GAME_STATES.DINOSAUR_SELECTION;
            
            this.render();
        }
    }

    /**
     * Muestra el resultado del dado en la UI
     */
    displayDiceResult(zone) {
        const dieResult = document.getElementById('die-result');
        if (dieResult) {
            dieResult.textContent = zone.name;
            dieResult.setAttribute('data-zone', zone.id);
            
            // Animación
            dieResult.classList.add('dice-result-animate');
            setTimeout(() => dieResult.classList.remove('dice-result-animate'), 600);
        }
    }

    /**
     * Coloca un dinosaurio en la zona indicada por el dado
     */
    placeDinosaur(dinosaurId, zoneId) {
        const currentPlayer = this.gameState.getCurrentPlayer();
        
        // Validar que es el turno del jugador actual
        if (!this.isCurrentPlayer) {
            this.showError('No es tu turno');
            return false;
        }

        // Validar que la zona es la correcta (según el dado)
        if (this.gameState.diceResult.id !== zoneId) {
            this.showError(`Debes colocar en ${this.gameState.diceResult.name}`);
            return false;
        }

        // Intentar colocar el dinosaurio
        if (this.gameState.placeDinosaur(currentPlayer.id, dinosaurId, zoneId)) {
            console.log('✅ Dinosaurio colocado:', dinosaurId);
            
            // Mostrar modal de confirmación
            this.showPlacementConfirmation(dinosaurId, zoneId);
            
            return true;
        } else {
            this.showError('No se puede colocar en esta zona');
            return false;
        }
    }

    /**
     * Muestra confirmación de colocación
     */
    showPlacementConfirmation(dinosaurId, zoneId) {
        this.confirmationPending = true;
        this.selectedDinosaur = { dinosaurId, zoneId };

        // Podría mostrar un modal aquí si es necesario
        // Por ahora automáticamente confirmamos después de 500ms
        setTimeout(() => {
            if (this.confirmationPending) {
                this.confirmPlacement();
            }
        }, 300);
    }

    /**
     * Confirma la colocación del dinosaurio
     */
    confirmPlacement() {
        this.confirmationPending = false;
        this.render();
    }

    /**
     * Finaliza el turno actual
     */
    confirmTurn() {
        const hand = this.gameState.getCurrentPlayerHand();
        
        // Validar que haya colocado un dinosaurio
        if (hand.length === this.gameState.playerHands[this.gameState.getCurrentPlayer().id].length) {
            this.showError('Debes colocar un dinosaurio');
            return;
        }

        // Avanzar al siguiente turno
        this.gameState.nextTurn();

        // Renderizar
        this.render();

        // Verificar si el juego ha terminado
        if (this.gameState.gameState === GAME_STATES.GAME_END) {
            this.showGameEndResults();
        }
    }

    /**
     * Deshace el último movimiento
     */
    undoMove() {
        if (this.gameState.moveHistory.length > 0) {
            const lastMove = this.gameState.moveHistory[this.gameState.moveHistory.length - 1];
            
            // Remover dinosaurio de la zona
            const zone = this.gameState.board[lastMove.playerId].zones[lastMove.zone];
            const index = zone.findIndex(d => d.id === lastMove.dinosaur.id);
            
            if (index > -1) {
                zone.splice(index, 1);
                
                // Agregar dinosaurio de vuelta a la mano
                this.gameState.playerHands[lastMove.playerId].push(lastMove.dinosaur);
                
                // Remover del historial
                this.gameState.moveHistory.pop();
                
                console.log('↩️ Movimiento deshecho');
            }
        }

        this.render();
    }

    /**
     * Muestra los resultados finales del juego
     */
    showGameEndResults() {
        const results = this.gameState.getGameResults();
        const resultsHtml = this.generateResultsHTML(results);

        const gameResultsDiv = document.getElementById('game-results');
        if (gameResultsDiv) {
            gameResultsDiv.innerHTML = resultsHtml;
        }

        // Guardar resultados en la base de datos
        this.saveGameResults(results);

        // Mostrar modal
        const modal = new bootstrap.Modal(document.getElementById('gameEndModal'));
        modal.show();
    }

    /**
     * Genera HTML para los resultados del juego
     */
    generateResultsHTML(results) {
        let html = '<div class="results-podium">';
        
        // Medallas
        const medals = ['🥇', '🥈', '🥉'];
        
        results.ranking.forEach((player, index) => {
            const medal = medals[index] || '•';
            html += `
                <div class="result-item rank-${index + 1}">
                    <span class="medal">${medal}</span>
                    <h6>${player.playerName}</h6>
                    <p class="score">${player.score} puntos</p>
                </div>
            `;
        });

        html += '</div>';
        return html;
    }

    /**
     * Guarda los resultados del juego en la base de datos
     */
    async saveGameResults(results) {
        try {
            const response = await fetch('php/save-game-results.php', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    gameSessionId: this.gameSession.id,
                    results: results,
                    moves: this.gameState.moveHistory
                })
            });

            const data = await response.json();
            if (!data.success) {
                console.error('Error al guardar resultados:', data.error);
            }
        } catch (error) {
            console.error('Error al guardar resultados:', error);
        }
    }

    /**
     * Actualiza el estado de los botones según el estado del juego
     */
    updateButtonStates() {
        const rollDieBtn = document.getElementById('roll-die-btn');
        const nextTurnBtn = document.getElementById('next-turn-btn');
        const undoBtn = document.getElementById('undo-btn');

        // Roll die solo está disponible al inicio de turno
        if (rollDieBtn) {
            rollDieBtn.disabled = this.gameState.diceResult !== null;
        }

        // Next turn solo disponible después de colocar dinosaurio
        if (nextTurnBtn) {
            nextTurnBtn.disabled = this.gameState.diceResult === null;
        }

        // Undo solo disponible si hay movimientos
        if (undoBtn) {
            undoBtn.disabled = this.gameState.moveHistory.length === 0;
        }
    }

    /**
     * Renderiza la UI completa
     */
    render() {
        this.updateCurrentPlayerInfo();
        this.updatePlayerHand();
        this.updateBoardZones();
        this.updateOtherPlayers();
        this.updateGameInfo();
        this.updateButtonStates();
        this.updateMovesLog();
    }

    /**
     * Actualiza información del jugador actual
     */
    updateCurrentPlayerInfo() {
        const currentPlayer = this.gameState.getCurrentPlayer();
        const currentPlayerNameEl = document.getElementById('current-player-name');
        
        if (currentPlayerNameEl) {
            currentPlayerNameEl.textContent = currentPlayer.name;
        }

        // Verificar si es el jugador actual
        // Esto debería validarse con la sesión del servidor
        this.isCurrentPlayer = true; // Simplificado para desarrollo
    }

    /**
     * Actualiza la mano del jugador actual
     */
    updatePlayerHand() {
        const hand = this.gameState.getCurrentPlayerHand();
        const handContainer = document.getElementById('current-player-hand');

        if (!handContainer) return;

        handContainer.innerHTML = '';

        hand.forEach(dinosaur => {
            const dinoEl = document.createElement('div');
            dinoEl.className = 'hand-dinosaur';
            dinoEl.setAttribute('data-id', dinosaur.id);
            dinoEl.style.backgroundColor = dinosaur.color;
            dinoEl.innerHTML = `
                <div class="dino-type">${dinosaur.type}</div>
                <small>${dinosaur.id.substring(5, 10)}</small>
            `;

            // Click para seleccionar dinosaurio
            dinoEl.addEventListener('click', () => {
                this.selectDinosaurFromHand(dinosaur.id);
            });

            handContainer.appendChild(dinoEl);
        });
    }

    /**
     * Maneja la selección de un dinosaurio de la mano
     */
    selectDinosaurFromHand(dinosaurId) {
        if (this.gameState.diceResult === null) {
            this.showError('Primero debes tirar el dado');
            return;
        }

        const zoneId = this.gameState.diceResult.id;
        this.placeDinosaur(dinosaurId, zoneId);
    }

    /**
     * Actualiza las zonas del tablero
     */
    updateBoardZones() {
        const currentPlayer = this.gameState.getCurrentPlayer();
        const playerBoard = this.gameState.board[currentPlayer.id];

        Object.keys(playerBoard.zones).forEach(zoneId => {
            const dinosaurs = playerBoard.zones[zoneId];
            const zoneEl = document.getElementById(`zone-${zoneId}`);

            if (!zoneEl) return;

            zoneEl.innerHTML = '';

            dinosaurs.forEach(dinosaur => {
                const dinoEl = document.createElement('div');
                dinoEl.className = 'zone-dinosaur';
                dinoEl.style.backgroundColor = dinosaur.color;
                dinoEl.innerHTML = `
                    <small>${dinosaur.type.substring(0, 3)}</small>
                `;
                zoneEl.appendChild(dinoEl);
            });
        });
    }

    /**
     * Actualiza lista de otros jugadores
     */
    updateOtherPlayers() {
        const currentPlayer = this.gameState.getCurrentPlayer();
        const otherPlayersContainer = document.getElementById('other-players');

        if (!otherPlayersContainer) return;

        otherPlayersContainer.innerHTML = '';

        this.gameState.players.forEach(player => {
            if (player.id === currentPlayer.id) return; // Saltarse jugador actual

            const playerBoard = this.gameState.board[player.id];
            const totalDinos = Object.values(playerBoard.zones).reduce((sum, zone) => sum + zone.length, 0);

            const playerEl = document.createElement('div');
            playerEl.className = 'other-player-item';
            playerEl.innerHTML = `
                <div class="player-badge" style="background-color: ${player.color}"></div>
                <div class="player-details">
                    <h6>${player.name}</h6>
                    <small>${totalDinos} dinosaurios</small>
                </div>
            `;

            otherPlayersContainer.appendChild(playerEl);
        });
    }

    /**
     * Actualiza información del juego (ronda, turno)
     */
    updateGameInfo() {
        document.getElementById('current-round').textContent = this.gameState.currentRound;
        document.getElementById('current-turn').textContent = this.gameState.currentTurn;
    }

    /**
     * Actualiza el registro de movimientos
     */
    updateMovesLog() {
        const movesLog = document.getElementById('moves-log');
        
        if (!movesLog) return;

        if (this.gameState.moveHistory.length === 0) {
            movesLog.innerHTML = '<p class="text-muted small">Historial vacío</p>';
            return;
        }

        movesLog.innerHTML = '';

        // Mostrar últimos 5 movimientos
        const recentMoves = this.gameState.moveHistory.slice(-5);
        
        recentMoves.forEach(move => {
            const moveEl = document.createElement('div');
            moveEl.className = 'move-log-item';
            moveEl.innerHTML = `
                <small>
                    <strong>${this.gameState.board[move.playerId].playerName}:</strong>
                    ${move.dinosaur.type} → ${this.getZoneName(move.zone)}
                </small>
            `;
            movesLog.appendChild(moveEl);
        });
    }

    /**
     * Obtiene el nombre de una zona
     */
    getZoneName(zoneId) {
        const zone = Object.values(BOARD_ZONES).find(z => z.id === zoneId);
        return zone ? zone.name : 'Desconocida';
    }

    /**
     * Muestra un mensaje de error
     */
    showError(message) {
        const errorMessageEl = document.getElementById('error-message');
        if (errorMessageEl) {
            errorMessageEl.textContent = message;
            const modal = new bootstrap.Modal(document.getElementById('errorModal'));
            modal.show();
        } else {
            alert(message);
        }
    }
}

// Inicializar controlador cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
    if (typeof gameSessionData !== 'undefined' && typeof playersData !== 'undefined') {
        window.gameController = new GameController(gameSessionData, playersData);
    }
});