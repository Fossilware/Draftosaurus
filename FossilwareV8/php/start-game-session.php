<?php
/**
 * Guardar Resultados del Juego
 * Draftosaurus - FossilWare
 */

header('Content-Type: application/json');
session_start();
require_once 'config.php';

// Verificar autenticación
if (!isLoggedIn()) {
    echo json_encode(['success' => false, 'error' => 'No autorizado']);
    exit();
}

// Obtener datos POST
$input = json_decode(file_get_contents('php://input'), true);

if (!$input) {
    echo json_encode(['success' => false, 'error' => 'Datos inválidos']);
    exit();
}

$sessionId = isset($input['session_id']) ? (int)$input['session_id'] : 0;
$players = isset($input['players']) ? $input['players'] : [];
$winner = isset($input['winner']) ? $input['winner'] : '';

if ($sessionId === 0 || empty($players)) {
    echo json_encode(['success' => false, 'error' => 'Datos incompletos']);
    exit();
}

try {
    $pdo = getDatabaseConnection();
    $pdo->beginTransaction();
    
    // Actualizar sesión de juego
    $stmt = $pdo->prepare("
        UPDATE game_sessions 
        SET status = 'completed',
            completed_at = NOW()
        WHERE id = ?
    ");
    $stmt->execute([$sessionId]);
    
    // Actualizar jugadores con puntuaciones finales
    $stmt = $pdo->prepare("
        UPDATE game_players 
        SET final_score = ?,
            board_state = ?
        WHERE session_id = ? AND player_name = ?
    ");
    
    foreach ($players as $player) {
        $stmt->execute([
            $player['score'],
            json_encode($player['board']),
            $sessionId,
            $player['name']
        ]);
    }
    
    // Actualizar estadísticas del usuario
    $userId = $_SESSION['user_id'];
    
    // Verificar si el usuario ganó
    $isWinner = false;
    foreach ($players as $player) {
        // Aquí asumimos que el primer jugador es el usuario logueado
        // En una implementación real, necesitarías relacionar el jugador con el user_id
        if ($player['name'] === $winner) {
            $isWinner = true;
            break;
        }
    }
    
    // Crear o actualizar estadísticas
    $stmt = $pdo->prepare("
        INSERT INTO user_statistics (user_id, total_games, games_won, games_lost, highest_score, average_score)
        VALUES (?, 1, ?, ?, ?, ?)
        ON DUPLICATE KEY UPDATE
            total_games = total_games + 1,
            games_won = games_won + ?,
            games_lost = games_lost + ?,
            highest_score = GREATEST(highest_score, ?),
            average_score = (average_score * total_games + ?) / (total_games + 1)
    ");
    
    $userScore = $players[0]['score']; // Asumiendo que el primer jugador es el usuario
    $won = $isWinner ? 1 : 0;
    $lost = $isWinner ? 0 : 1;
    
    $stmt->execute([
        $userId,
        $won,
        $lost,
        $userScore,
        $userScore,
        $won,
        $lost,
        $userScore,
        $userScore
    ]);
    
    $pdo->commit();
    
    echo json_encode([
        'success' => true,
        'message' => 'Resultados guardados correctamente',
        'winner' => $winner
    ]);
    
} catch (PDOException $e) {
    $pdo->rollBack();
    error_log("Error guardando resultados: " . $e->getMessage());
    echo json_encode([
        'success' => false,
        'error' => 'Error al guardar resultados: ' . $e->getMessage()
    ]);
}
?>