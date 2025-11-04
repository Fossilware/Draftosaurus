/**
 * Gestor de Estado del Juego - Draftosaurus
 * Maneja toda la lógica de estado del juego
 */

class GameState {
    constructor(sessionId, players) {
        this.sessionId = sessionId;
        this.players = players; // Array de objetos player
        this.currentRound = 1;
        this.currentTurn = 1;
        this.currentPlayerIndex = 0;
        this.gameState = GAME_STATES.SETUP;
        this.board = this.initializeBoard();
        this.playerHands = this.initializeHands();
        this.discardPile = [];
        this.diceResult = null;
        this.moveHistory = [];
    }

    /**
     * Inicializa el tablero (zonas vacías para cada jugador)
     */
    initializeBoard() {
        const board = {};
        
        this.players.forEach((player, index) => {
            board[player.id] = {
                playerId: player.id,
                playerName: player.name,
                playerColor: player.color,
                zones: {
                    [BOARD_ZONES.FOREST_OF_SAMENESS.id]: [],
                    [BOARD_ZONES.MEADOW_OF_DIFFERENCES.id]: [],
                    [BOARD_ZONES.PRAIRIE_OF_LOVE.id]: [],
                    [BOARD_ZONES.WOODY_TRIO.id]: [],
                    [BOARD_ZONES.KING_OF_THE_JUNGLE.id]: [],
                    [BOARD_ZONES.SOLITARY_ISLAND.id]: [],
                    [BOARD_ZONES.RIVER.id]: []
                },
                score: 0
            };
        });

        return board;
    }

    /**
     * Inicializa las manos de dinosaurios para cada jugador
     */
    initializeHands() {
        const hands = {};
        const allDinosaurs = Object.values(DINOSAUR_TYPES);

        this.players.forEach(player => {
            // Para la primera ronda, distribuir 6 dinosaurios aleatorios
            hands[player.id] = this.getRandomDinosaurs(allDinosaurs, GAME_CONFIG.HAND_SIZE);
        });

        return hands;
    }

    /**
     * Obtiene dinosaurios aleatorios del pool disponible
     */
    getRandomDinosaurs(dinos, count) {
        const shuffled = [...dinos].sort(() => Math.random() - 0.5);
        return shuffled.slice(0, count).map(type => ({
            type,
            id: this.generateDinoId(),
            color: DINOSAUR_COLORS[type.toUpperCase().replace(/\s+/g, '_')] || '#999'
        }));
    }

    /**
     * Genera un ID único para cada dinosaurio
     */
    generateDinoId() {
        return `dino_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }

    /**
     * Tira el dado de colocación
     */
    rollPlacementDie() {
        const randomIndex = Math.floor(Math.random() * DICE_FACES.length);
        this.diceResult = DICE_FACES[randomIndex];
        this.gameState = GAME_STATES.DICE_ROLL;
        return this.diceResult;
    }

    /**
     * Obtiene el jugador actual
     */
    getCurrentPlayer() {
        return this.players[this.currentPlayerIndex];
    }

    /**
     * Obtiene la mano del jugador actual
     */
    getCurrentPlayerHand() {
        const player = this.getCurrentPlayer();
        return this.playerHands[player.id];
    }

    /**
     * Coloca un dinosaurio en una zona
     */
    placeDinosaur(playerId, dinosauroId, zoneId) {
        // Validaciones
        if (!this.validatePlacement(playerId, dinosauroId, zoneId)) {
            return false;
        }

        // Obtener el dinosaurio de la mano
        const hand = this.playerHands[playerId];
        const dinoIndex = hand.findIndex(d => d.id === dinosauroId);
        
        if (dinoIndex === -1) {
            console.error('Dinosaurio no encontrado en la mano');
            return false;
        }

        const dinosaur = hand.splice(dinoIndex, 1)[0];

        // Agregar a la zona
        this.board[playerId].zones[zoneId].push(dinosaur);

        // Registrar movimiento
        this.moveHistory.push({
            round: this.currentRound,
            turn: this.currentTurn,
            playerId,
            dinosaur,
            zone: zoneId,
            timestamp: Date.now()
        });

        return true;
    }

    /**
     * Valida si una colocación es válida
     */
    validatePlacement(playerId, dinosauroId, zoneId) {
        // El dinosaurio debe estar en la mano del jugador
        const hand = this.playerHands[playerId];
        if (!hand.find(d => d.id === dinosauroId)) {
            return false;
        }

        // La zona debe coincidir con el resultado del dado
        if (this.diceResult.id !== zoneId) {
            return false;
        }

        // Validar capacidad de la zona
        const zone = this.board[playerId].zones[zoneId];
        const zoneConfig = Object.values(BOARD_ZONES).find(z => z.id === zoneId);
        
        if (zone.length >= zoneConfig.maxCapacity) {
            return false;
        }

        return true;
    }

    /**
     * Avanza al siguiente turno
     */
    nextTurn() {
        // Pasar dinosaurios al siguiente jugador (derecha)
        this.passHandsToNextPlayer();

        // Avanzar índice del jugador
        this.currentPlayerIndex = (this.currentPlayerIndex + 1) % this.players.length;
        this.currentTurn++;

        // Validar si la ronda ha terminado
        if (this.currentTurn > GAME_CONFIG.TURNS_PER_ROUND) {
            this.endRound();
            return;
        }

        this.gameState = GAME_STATES.DICE_ROLL;
        this.diceResult = null;
    }

    /**
     * Pasa las manos de dinosaurios al siguiente jugador
     */
    passHandsToNextPlayer() {
        const nextPlayerIndex = (this.currentPlayerIndex + 1) % this.players.length;
        const tempHand = this.playerHands[this.players[this.currentPlayerIndex].id];
        
        // Rotar las manos
        let currentHand = tempHand;
        for (let i = 0; i < this.players.length; i++) {
            const playerIndex = (this.currentPlayerIndex + i) % this.players.length;
            const playerId = this.players[playerIndex].id;
            
            if (i === 0) {
                currentHand = this.playerHands[playerId];
            } else {
                const nextHand = this.playerHands[playerId];
                this.playerHands[playerId] = currentHand;
                currentHand = nextHand;
            }
        }

        this.playerHands[this.players[this.currentPlayerIndex].id] = currentHand;
    }

    /**
     * Termina una ronda
     */
    endRound() {
        this.gameState = GAME_STATES.ROUND_END;

        if (this.currentRound === GAME_CONFIG.TOTAL_ROUNDS) {
            // Fin del juego
            this.endGame();
        } else {
            // Siguiente ronda
            this.currentRound++;
            this.currentTurn = 1;
            this.currentPlayerIndex = 0;
            this.playerHands = this.initializeHands();
            this.gameState = GAME_STATES.PLAYING;
        }
    }

    /**
     * Termina el juego y calcula puntajes finales
     */
    endGame() {
        this.gameState = GAME_STATES.GAME_END;
        this.calculateFinalScores();
        return this.getGameResults();
    }

    /**
     * Calcula los puntajes finales
     */
    calculateFinalScores() {
        Object.keys(this.board).forEach(playerId => {
            const playerBoard = this.board[playerId];
            let totalScore = 0;

            // Calcular puntuación por cada zona
            Object.keys(playerBoard.zones).forEach(zoneId => {
                const dinosaurs = playerBoard.zones[zoneId];
                const zoneScore = this.calculateZoneScore(zoneId, dinosaurs, playerId);
                totalScore += zoneScore;
            });

            // Sumar bonus de T-Rex
            totalScore += this.calculateTRexBonus(playerId);

            playerBoard.score = totalScore;
        });
    }

    /**
     * Calcula el puntaje de una zona específica
     */
    calculateZoneScore(zoneId, dinosaurs, playerId) {
        if (dinosaurs.length === 0) return 0;

        switch (zoneId) {
            case BOARD_ZONES.FOREST_OF_SAMENESS.id:
                // Puntos por dinosaurios del mismo tipo
                const typeGroups = this.groupByType(dinosaurs);
                return Object.values(typeGroups).reduce((sum, group) => {
                    return sum + (group.length > 0 ? group.length : 0);
                }, 0);

            case BOARD_ZONES.MEADOW_OF_DIFFERENCES.id:
                // Puntos por cada tipo diferente
                const uniqueTypes = new Set(dinosaurs.map(d => d.type));
                return uniqueTypes.size;

            case BOARD_ZONES.PRAIRIE_OF_LOVE.id:
                // 5 puntos por cada par del mismo tipo
                const pairs = this.groupByType(dinosaurs);
                return Object.values(pairs).reduce((sum, group) => {
                    return sum + Math.floor(group.length / 2) * SCORING_RULES.PRAIRIE_OF_LOVE_PAIR_POINTS;
                }, 0);

            case BOARD_ZONES.WOODY_TRIO.id:
                // 7 puntos si hay exactamente 3
                return dinosaurs.length === 3 ? SCORING_RULES.WOODY_TRIO_EXACT_POINTS : 0;

            case BOARD_ZONES.KING_OF_THE_JUNGLE.id:
                // 7 puntos si tienes el mayor número de ese tipo
                // Se calcula comparando con otros jugadores
                return this.calculateKingOfJungle(zoneId, dinosaurs, playerId);

            case BOARD_ZONES.SOLITARY_ISLAND.id:
                // 7 puntos si es el único de su tipo
                return dinosaurs.length === 1 ? SCORING_RULES.SOLITARY_ISLAND_POINTS : 0;

            case BOARD_ZONES.RIVER.id:
                // 1 punto por dinosaurio
                return dinosaurs.length * SCORING_RULES.RIVER_POINTS_PER_DINO;

            default:
                return 0;
        }
    }

    /**
     * Agrupa dinosaurios por tipo
     */
    groupByType(dinosaurs) {
        return dinosaurs.reduce((groups, dino) => {
            if (!groups[dino.type]) {
                groups[dino.type] = [];
            }
            groups[dino.type].push(dino);
            return groups;
        }, {});
    }

    /**
     * Calcula el bonus de Rey de la Jungla
     */
    calculateKingOfJungle(zoneId, dinosaurs, playerId) {
        // Agrupar por tipo
        const types = this.groupByType(dinosaurs);
        let kingScore = 0;

        Object.keys(types).forEach(type => {
            const playerCount = types[type].length;
            let hasMax = true;

            // Comparar con otros jugadores
            Object.keys(this.board).forEach(otherId => {
                if (otherId !== playerId) {
                    const otherTypes = this.groupByType(this.board[otherId].zones[zoneId] || []);
                    const otherCount = otherTypes[type] ? otherTypes[type].length : 0;
                    if (otherCount >= playerCount) {
                        hasMax = false;
                    }
                }
            });

            if (hasMax && playerCount > 0) {
                kingScore += SCORING_RULES.KING_OF_JUNGLE_POINTS;
            }
        });

        return kingScore;
    }

    /**
     * Calcula el bonus de T-Rex
     */
    calculateTRexBonus(playerId) {
        const zones = this.board[playerId].zones;
        let bonus = 0;

        Object.keys(zones).forEach(zoneId => {
            const hasTRex = zones[zoneId].some(d => d.type === DINOSAUR_TYPES.TYRANNOSAURUS);
            if (hasTRex && zones[zoneId].length > 0) {
                bonus += SCORING_RULES.T_REX_BONUS;
            }
        });

        return bonus;
    }

    /**
     * Obtiene los resultados finales del juego
     */
    getGameResults() {
        const results = [];
        
        Object.keys(this.board).forEach(playerId => {
            const playerBoard = this.board[playerId];
            results.push({
                playerId,
                playerName: playerBoard.playerName,
                score: playerBoard.score
            });
        });

        // Ordenar por puntuación descendente
        results.sort((a, b) => b.score - a.score);

        return {
            winner: results[0],
            ranking: results,
            gameId: this.sessionId
        };
    }

    /**
     * Obtiene el estado actual del juego en formato JSON
     */
    getGameState() {
        return {
            sessionId: this.sessionId,
            currentRound: this.currentRound,
            currentTurn: this.currentTurn,
            currentPlayer: this.getCurrentPlayer(),
            gameState: this.gameState,
            diceResult: this.diceResult,
            playerHands: this.playerHands,
            board: this.board,
            moveHistory: this.moveHistory
        };
    }

    /**
     * Deserializa un estado del juego desde JSON (para cargar de BD)
     */
    static fromJSON(data) {
        const game = new GameState(data.sessionId, data.players || []);
        Object.assign(game, data);
        return game;
    }
}