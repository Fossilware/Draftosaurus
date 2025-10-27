<?php
/**
 * Iniciar Modo Seguimiento
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
$autoSave = isset($_POST['auto_save']);
$showRules = isset($_POST['show_rules']);
$difficulty = sanitizeInput($_POST['difficulty'] ?? 'base');

// Validar número de jugadores
if ($numPlayers < 2 || $numPlayers > 5) {
    redirect('../dashboard.php?error=invalidplayers');
}

// Obtener nombres de jugadores
$players = [];
for ($i = 1; $i <= $numPlayers; $i++) {
    $name = sanitizeInput($_POST["player_name_$i"] ?? '');
    $color = sanitizeInput($_POST["player_color_$i"] ?? 'blue');
    
    if (empty($name)) {
        redirect("../game-tracking.php?players=$numPlayers&error=emptyname");
    }
    
    $players[] = [
        'name' => $name,
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
        VALUES (?, 'tracking', 'in_progress', ?, NOW())
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
            $_SESSION['user_id'], // En modo seguimiento, todos son del mismo usuario
            $player['position']
        ]);
    }
    
    // Guardar configuración de la sesión en una tabla temporal o session
    $_SESSION['current_game'] = [
        'session_id' => $sessionId,
        'session_code' => $sessionCode,
        'mode' => 'tracking',
        'num_players' => $numPlayers,
        'players' => $players,
        'auto_save' => $autoSave,
        'show_rules' => $showRules,
        'difficulty' => $difficulty,
        'current_round' => 1,
        'current_turn' => 1
    ];
    
    // Commit de la transacción
    $pdo->commit();
    
    // Redirigir al juego
    redirect("../play-tracking.php?session=$sessionCode");
    
} catch (PDOException $e) {
    // Rollback en caso de error
    if ($pdo->inTransaction()) {
        $pdo->rollBack();
    }
    
    error_log("Error al iniciar modo seguimiento: " . $e->getMessage());
    redirect("../game-tracking.php?players=$numPlayers&error=sqlerror");
}
?>