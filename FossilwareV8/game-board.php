<?php
/**
 * Tablero de Juego - Modo Regular RENOVADO
 * Draftosaurus - FossilWare
 */

// ✅ NO hacer session_start() aquí - config.php ya lo hace
require_once 'php/config.php';

if (!isLoggedIn()) {
    header('Location: inicio.html?error=notloggedin');
    exit();
}

$sessionId = isset($_GET['session']) ? (int)$_GET['session'] : 0;

if ($sessionId === 0) {
    header('Location: dashboard.php?error=nosession');
    exit();
}

try {
    $pdo = getDatabaseConnection();
    
    $stmt = $pdo->query("DESCRIBE game_sessions");
    $sessionColumns = $stmt->fetchAll(PDO::FETCH_COLUMN);
    
    $whereClause = "id = ?";
    $params = [$sessionId];
    
    if (in_array('host_user_id', $sessionColumns)) {
        $whereClause .= " AND host_user_id = ?";
        $params[] = $_SESSION['user_id'];
    } elseif (in_array('created_by', $sessionColumns)) {
        $whereClause .= " AND created_by = ?";
        $params[] = $_SESSION['user_id'];
    }
    
    $stmt = $pdo->prepare("SELECT * FROM game_sessions WHERE $whereClause");
    $stmt->execute($params);
    $gameSession = $stmt->fetch();
    
    if (!$gameSession) {
        $stmt = $pdo->prepare("SELECT * FROM game_sessions WHERE id = ?");
        $stmt->execute([$sessionId]);
        $gameSession = $stmt->fetch();
        
        if (!$gameSession) {
            header('Location: dashboard.php?error=sessionnotfound');
            exit();
        }
    }
    
    $stmt = $pdo->query("DESCRIBE game_players");
    $playerColumns = $stmt->fetchAll(PDO::FETCH_COLUMN);
    $orderColumn = in_array('player_order', $playerColumns) ? 'player_order' : 'player_position';
    
    $stmt = $pdo->prepare("
        SELECT * FROM game_players 
        WHERE session_id = ? 
        ORDER BY $orderColumn
    ");
    $stmt->execute([$sessionId]);
    $players = $stmt->fetchAll();
    
    if (empty($players)) {
        header('Location: dashboard.php?error=noplayers');
        exit();
    }
    
    $gameState = null;
    if (isset($gameSession['game_state']) && !empty($gameSession['game_state'])) {
        $gameState = json_decode($gameSession['game_state'], true);
    }
    
    if (!$gameState) {
        $gameState = [
            'current_round' => 1,
            'current_turn' => 1,
            'current_player' => 0,
            'dice_result' => null,
            'game_phase' => 'playing'
        ];
    }
    
    $currentUser = getCurrentUser();
    $timerEnabled = isset($gameSession['timer_enabled']) ? (bool)$gameSession['timer_enabled'] : false;
    $hintsEnabled = isset($gameSession['hints_enabled']) ? (bool)$gameSession['hints_enabled'] : true;
    
} catch (PDOException $e) {
    error_log("Error loading game session: " . $e->getMessage());
    die("Error al cargar la sesión de juego.");
}
?>
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Partida - Draftosaurus</title>
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
    <link rel="stylesheet" href="css/styles.css">
    <link rel="stylesheet" href="css/game-board.css">
</head>
<body class="game-body">
    <!-- Navbar -->
    <nav class="navbar navbar-dark bg-dark-green">
        <div class="container-fluid">
            <a class="navbar-brand" href="dashboard.php">
                <img src="img/logo-draftosaurus.png" alt="Logo" height="40" class="d-inline-block align-text-top me-2" onerror="this.style.display='none'">
                DRAFTOSAURUS
            </a>
            <div class="game-header-info">
                <span class="game-info-badge">
                    <i class="fas fa-circle-notch"></i> Ronda <strong id="roundNumber">1</strong>/2
                </span>
                <span class="game-info-badge">
                    <i class="fas fa-hourglass-half"></i> Turno <strong id="turnNumber">1</strong>/6
                </span>
                <span class="game-info-badge" id="timerBadge" style="display: none;">
                    <i class="fas fa-clock"></i> <strong id="timerDisplay">60</strong>s
                </span>
            </div>
            <div class="d-flex align-items-center">
                <button class="btn btn-sm btn-outline-light me-2" onclick="toggleRules()">
                    <i class="fas fa-book"></i> Reglas
                </button>
                <button class="btn btn-sm btn-outline-warning" onclick="confirmExit()">
                    <i class="fas fa-sign-out-alt"></i> Salir
                </button>
            </div>
        </div>
    </nav>

    <div class="container-fluid game-container">
        <div class="row g-3">
            <!-- Columna Izquierda: Controles -->
            <div class="col-lg-3">
                <!-- Jugador Actual -->
                <div class="card shadow-sm mb-3">
                    <div class="card-header bg-primary text-white">
                        <h6 class="mb-0"><i class="fas fa-user-circle"></i> Turno de:</h6>
                    </div>
                    <div class="card-body text-center">
                        <h4 class="mb-2" id="currentPlayerName">Cargando...</h4>
                        <div class="player-color-bar" id="currentPlayerColorBar"></div>
                    </div>
                </div>

                <!-- Dado -->
                <div class="card shadow-sm mb-3">
                    <div class="card-header bg-danger text-white">
                        <h6 class="mb-0"><i class="fas fa-dice"></i> Restricción del Dado</h6>
                    </div>
                    <div class="card-body text-center">
                        <div class="dice-container" id="diceDisplay">
                            <img src="img/dice/question.png" alt="Dado" class="dice-image" id="diceImage" onerror="this.style.display='none';this.nextElementSibling.style.display='block'">
                            <div class="dice-fallback" style="display:none;">?</div>
                        </div>
                        <button class="btn btn-danger w-100 mt-3" id="rollDiceBtn" onclick="rollDice()">
                            <i class="fas fa-dice"></i> 
                        </button>
                        <p class="mt-2 mb-0 text-muted" id="diceResultText"></p>
                    </div>
                </div>

                <!-- Mano -->
                <div class="card shadow-sm mb-3">
                    <div class="card-header bg-success text-white">
                        <h6 class="mb-0"><i class="fas fa-hand-paper"></i> Tu Mano (<span id="handCount">0</span>)</h6>
                    </div>
                    <div class="card-body">
                        <div class="dino-hand-grid" id="dinoHand">
                            <p class="text-muted text-center small">Esperando...</p>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Columna Central: Tablero -->
            <div class="col-lg-6">
                <div class="card shadow-sm">
                    <div class="card-header bg-dark text-white">
                        <h5 class="mb-0">
                            <i class="fas fa-chess-board"></i> Parque de <span id="boardPlayerName">Jugador</span>
                        </h5>
                    </div>
                    </div>
                    
                    <div class="card-body p-4">
                        <!-- ✅ CORREGIDO: Contenedor con fondo de tablero -->
                        <div class="board-container">
                            <div class="board-background"></div>
                            <div class="board-grid" id="boardGrid">
                                <!-- Se llenará dinámicamente -->
                            </div>
                        </div>
                    </div>
                </div>
                            <!-- Columna Derecha: Marcador e Info -->
            <div class="col-lg-3">
                <!-- Marcador -->
                <div class="card shadow-sm mb-3">
                    <div class="card-header bg-warning">
                        <h6 class="mb-0"><i class="fas fa-trophy"></i> Marcador</h6>
                    </div>
                    <div class="card-body p-2">
                        <div id="scoresList">
                            <!-- Se llenará dinámicamente -->
                        </div>
                    </div>
                </div>
                                <!-- Botones de Acción -->
                <div class="action-buttons">
                    <button class="btn btn-success btn-lg w-100 mb-2" id="confirmPlacementBtn" onclick="confirmPlacement()" disabled>
                        <i class="fas fa-check"></i> Confirmar Colocación
                    </button>
                    <button class="btn btn-primary btn-lg w-100" id="nextTurnBtn" onclick="nextTurn()" disabled>
                        <i class="fas fa-arrow-right"></i> Siguiente Turno
                    </button>
                </div>
            </div>
        </div>
    </div>

    <!-- Modal de Reglas -->
    <div class="modal fade" id="rulesModal" tabindex="-1">
        <div class="modal-dialog modal-lg">
            <div class="modal-content">
                <div class="modal-header">
                    <h5 class="modal-title"><i class="fas fa-book"></i> Reglas del Juego</h5>
                    <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                </div>
                <div class="modal-body">
                    <h6>Objetivo</h6>
                    <p>Colocar dinosaurios estratégicamente para obtener la mayor puntuación.</p>
                    <h6>Desarrollo</h6>
                    <ul>
                        <li>2 rondas de 6 turnos cada una</li>
                        <li>Cada jugador recibe 6 dinosaurios por ronda</li>
                        <li>El jugador activo lanza el dado que indica restricciones</li>
                        <li>Selecciona un dinosaurio y colócalo en un recinto válido</li>
                    </ul>
                    <h6>Puntuación</h6>
                    <ul>
                        <li><strong>Bosque:</strong> Mismo tipo (1,2,4,8,12,18 pts)</li>
                        <li><strong>Prado:</strong> Distintos (1,3,6,10,15,21 pts)</li>
                        <li><strong>Pradera:</strong> 5 pts por pareja</li>
                        <li><strong>Trío:</strong> 7 pts si hay exactamente 3</li>
                        <li><strong>Rey:</strong> 7 pts si tienes mayoría de ese tipo</li>
                        <li><strong>Isla:</strong> 7 pts si es único en tu parque</li>
                        <li><strong>Río:</strong> 1 pt por cada uno</li>
                    </ul>
                </div>
            </div>
        </div>
    </div>

    <!-- Modal de Fin de Juego -->
    <div class="modal fade" id="endGameModal" tabindex="-1" data-bs-backdrop="static">
        <div class="modal-dialog modal-lg">
            <div class="modal-content">
                <div class="modal-header bg-success text-white">
                    <h5 class="modal-title"><i class="fas fa-trophy"></i> Partida Finalizada</h5>
                </div>
                <div class="modal-body" id="finalResults"></div>
                <div class="modal-footer">
                    <button type="button" class="btn btn-primary" onclick="location.href='dashboard.php'">
                        <i class="fas fa-home"></i> Volver al Dashboard
                    </button>
                </div>
            </div>
        </div>
    </div>

    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/js/bootstrap.bundle.min.js"></script>
    <script>
        const GAME_DATA = {
            sessionId: <?php echo $sessionId; ?>,
            numPlayers: <?php echo count($players); ?>,
            timerEnabled: <?php echo $timerEnabled ? 'true' : 'false'; ?>,
            hintsEnabled: <?php echo $hintsEnabled ? 'true' : 'false'; ?>,
            players: <?php echo json_encode($players); ?>,
            gameState: <?php echo json_encode($gameState); ?>
        };
    </script>
    <!-- ✅ Cargar PRIMERO game-images.js y LUEGO game-board.js -->
    <script src="js/game-images.js"></script>
    <script src="js/game-board.js"></script>
</body>
</html>