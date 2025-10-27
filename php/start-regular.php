<?php
/**
 * Iniciar Modo Regular (Juego Completo)
 * Draftosaurus - FossilWare
 */

require_once 'config.php';

// Verificar que el usuario está logueado
if (!isLoggedIn()) {
    redirect('../inicio.html?error=notloggedin');
}

// Verificar que se envió el formulario por POST
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    redirect('../dashboard.php?error=invalidrequest');
}

// Obtener datos del formulario
$numPlayers = (int)$_POST['num_players'];
$timerEnabled = isset($_POST['timer_enabled']);
$hints = isset($_POST['hints']);
$animations = isset($_POST['animations']);
$gameSpeed = sanitizeInput($_POST['game_speed'] ?? 'normal');
$difficulty = sanitizeInput($_POST['difficulty'] ?? 'base');

// Validar número de jugadores
if ($numPlayers < 2 || $numPlayers > 5) {
    redirect('../dashboard.php?error=invalidplayers');
}

// Obtener nombres y configuración de jugadores
$players = [];
for ($i = 1; $i <= $numPlayers; $i++) {
    $name = sanitizeInput($_POST["player_name_$i"] ?? '');
    $type = sanitizeInput($_POST["player_type_$i"] ?? 'human');
    $color = sanitizeInput($_POST["player_color_$i"] ?? 'blue');
    
    if (empty($name)) {
        redirect("../game-regular.php?players=$numPlayers&error=emptyname");
    }
    
    $players[] = [
        'name' => $name,
        'type' => $type,
        'color' => $color,
        'position' => $i
    ];
}

try {
    $pdo = getDatabaseConnection();
    
    // Iniciar transacción
    $pdo->beginTransaction();
    
    // Generar código único de sesión
    $sessionCode = strtoupper(substr(md5(uniqid(rand(), true)), 0, 8));
    
    // Crear sesión de juego
    $stmt = $pdo->prepare("
        INSERT INTO game_sessions (session_code, game_mode, status, created_by, created_at)
        VALUES (?, 'regular', 'in_progress', ?, NOW())
    ");
    $stmt->execute([$sessionCode, $_SESSION['user_id']]);
    $sessionId = $pdo->lastInsertId();
    
    // Insertar jugadores
    foreach ($players as $player) {
        $stmt = $pdo->prepare("
            INSERT INTO game_players (session_id, user_id, player_position, score)
            VALUES (?, ?, ?, 0)
        ");
        $stmt->execute([
            $sessionId,
            $_SESSION['user_id'],
            $player['position']
        ]);
    }
    
    // Inicializar el estado del juego
    $gameState = initializeGameState($numPlayers, $players);
    
    // Guardar estado del juego en sesión
    $_SESSION['current_game'] = [
        'session_id' => $sessionId,
        'session_code' => $sessionCode,
        'mode' => 'regular',
        'num_players' => $numPlayers,
        'players' => $players,
        'timer_enabled' => $timerEnabled,
        'hints' => $hints,
        'animations' => $animations,
        'game_speed' => $gameSpeed,
        'difficulty' => $difficulty,
        'game_state' => $gameState
    ];
    
    // Commit de la transacción
    $pdo->commit();
    
    // Redirigir al juego
    redirect("../play-regular.php?session=$sessionCode");
    
} catch (PDOException $e) {
    // Rollback en caso de error
    if ($pdo->inTransaction()) {
        $pdo->rollBack();
    }
    
    error_log("Error al iniciar modo regular: " . $e->getMessage());
    redirect("../game-regular.php?players=$numPlayers&error=sqlerror");
}

/**
 * Inicializar el estado del juego
 */
function initializeGameState($numPlayers, $players) {
    // Tipos de dinosaurios disponibles en el juego base
    $dinosaurTypes = [
        'Tyrannosaurus' => '🦖',
        'Triceratops' => '🦕',
        'Velociraptor' => '🦎',
        'Stegosaurus' => '🦴',
        'Brachiosaurus' => '🦕',
        'Pteranodon' => '🦅'
    ];
    
    // Crear la bolsa de dinosaurios
    // En Draftosaurus hay aproximadamente 60 dinosaurios en total
    $dinosaurBag = [];
    foreach ($dinosaurTypes as $name => $icon) {
        for ($i = 0; $i < 10; $i++) {
            $dinosaurBag[] = [
                'type' => $name,
                'icon' => $icon,
                'is_trex' => ($name === 'Tyrannosaurus')
            ];
        }
    }
    
    // Mezclar la bolsa
    shuffle($dinosaurBag);
    
    // Estado inicial del juego
    $gameState = [
        'round' => 1,
        'turn' => 1,
        'active_player' => 0,
        'dinosaur_bag' => $dinosaurBag,
        'players_state' => []
    ];
    
    // Inicializar estado de cada jugador
    foreach ($players as $index => $player) {
        $gameState['players_state'][$index] = [
            'name' => $player['name'],
            'color' => $player['color'],
            'type' => $player['type'],
            'score' => 0,
            'hand' => [],
            'park' => [
                'bosque_semejanza' => [],
                'prado_diferencia' => [],
                'pradera_amor' => [],
                'trio_frondoso' => [],
                'rey_selva' => [],
                'isla_solitaria' => [],
                'rio' => []
            ]
        ];
    }
    
    return $gameState;
}
?>