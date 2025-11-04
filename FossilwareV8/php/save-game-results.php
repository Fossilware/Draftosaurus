<?php
/**
 * Guardador de Resultados del Juego - MEJORADO
 * Draftosaurus - FossilWare
 * Actualiza correctamente las estadísticas de usuarios
 */

require_once 'config.php';

header('Content-Type: application/json');

// Verificar autenticación
if (!isLoggedIn()) {
    http_response_code(401);
    echo json_encode(['success' => false, 'error' => 'Usuario no autenticado']);
    exit;
}

// Verificar método POST
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['success' => false, 'error' => 'Método no permitido']);
    exit;
}

// Obtener datos JSON
$data = json_decode(file_get_contents('php://input'), true);

if (!$data) {
    http_response_code(400);
    echo json_encode(['success' => false, 'error' => 'Datos inválidos']);
    exit;
}

$sessionId = $data['sessionId'] ?? $data['gameSessionId'] ?? null;
$players = $data['players'] ?? $data['results']['ranking'] ?? null;
$winnerId = $data['winnerId'] ?? $data['results']['winner']['playerId'] ?? null;

if (!$sessionId || !$players) {
    http_response_code(400);
    echo json_encode(['success' => false, 'error' => 'Datos incompletos', 'received' => $data]);
    exit;
}

try {
    $pdo = getDatabaseConnection();
    $pdo->beginTransaction();
    
    // 1. Verificar que la sesión existe
    $stmt = $pdo->prepare("SELECT * FROM game_sessions WHERE id = ?");
    $stmt->execute([$sessionId]);
    $session = $stmt->fetch();
    
    if (!$session) {
        throw new Exception('Sesión no encontrada');
    }
    
    // 2. Actualizar estado de la sesión como finalizada
    $stmt = $pdo->prepare("
        UPDATE game_sessions 
        SET status = 'finished', 
            winner_id = ?, 
            finished_at = NOW()
        WHERE id = ?
    ");
    $stmt->execute([$winnerId, $sessionId]);
    
    // 3. Actualizar puntuaciones de jugadores
    foreach ($players as $player) {
        $playerId = $player['playerId'] ?? $player['id'] ?? null;
        $score = $player['score'] ?? 0;
        
        if ($playerId) {
            // Actualizar score en game_players
            $stmt = $pdo->prepare("
                UPDATE game_players 
                SET score = ? 
                WHERE session_id = ? AND user_id = ?
            ");
            $stmt->execute([$score, $sessionId, $playerId]);
            
            // 4. Actualizar estadísticas del jugador
            $isWinner = ($playerId == $winnerId) ? 1 : 0;
            
            // Verificar si ya existe registro en user_statistics
            $stmt = $pdo->prepare("SELECT * FROM user_statistics WHERE user_id = ?");
            $stmt->execute([$playerId]);
            $stats = $stmt->fetch();
            
            if ($stats) {
                // Actualizar estadísticas existentes
                $newTotalGames = $stats['total_games'] + 1;
                $newGamesWon = $stats['games_won'] + $isWinner;
                $newGamesLost = $stats['games_lost'] + ($isWinner ? 0 : 1);
                $newTotalScore = $stats['total_score'] + $score;
                $newHighestScore = max($stats['highest_score'], $score);
                $newAverageScore = $newTotalScore / $newTotalGames;
                
                $stmt = $pdo->prepare("
                    UPDATE user_statistics 
                    SET total_games = ?,
                        games_won = ?,
                        games_lost = ?,
                        highest_score = ?,
                        total_score = ?,
                        average_score = ?,
                        updated_at = NOW()
                    WHERE user_id = ?
                ");
                $stmt->execute([
                    $newTotalGames,
                    $newGamesWon,
                    $newGamesLost,
                    $newHighestScore,
                    $newTotalScore,
                    $newAverageScore,
                    $playerId
                ]);
            } else {
                // Crear nuevo registro de estadísticas
                $stmt = $pdo->prepare("
                    INSERT INTO user_statistics 
                    (user_id, total_games, games_won, games_lost, highest_score, total_score, average_score)
                    VALUES (?, 1, ?, ?, ?, ?, ?)
                ");
                $stmt->execute([
                    $playerId,
                    $isWinner,
                    ($isWinner ? 0 : 1),
                    $score,
                    $score,
                    $score
                ]);
            }
        }
    }
    
    // 5. Guardar movimientos si existen
    if (isset($data['moves']) && is_array($data['moves'])) {
        foreach ($data['moves'] as $index => $move) {
            $stmt = $pdo->prepare("
                INSERT INTO game_moves (session_id, user_id, move_number, move_data, created_at)
                VALUES (?, ?, ?, ?, NOW())
            ");
            
            $moveData = json_encode($move);
            $moveUserId = $move['playerId'] ?? $move['user_id'] ?? null;
            
            if ($moveUserId) {
                $stmt->execute([
                    $sessionId,
                    $moveUserId,
                    $index + 1,
                    $moveData
                ]);
            }
        }
    }
    
    $pdo->commit();
    
    // Respuesta exitosa
    http_response_code(200);
    echo json_encode([
        'success' => true,
        'message' => 'Resultados guardados correctamente',
        'sessionId' => $sessionId,
        'winnerId' => $winnerId,
        'playersUpdated' => count($players)
    ]);
    
} catch (Exception $e) {
    if ($pdo->inTransaction()) {
        $pdo->rollBack();
    }
    
    error_log("Error al guardar resultados: " . $e->getMessage());
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'error' => 'Error al guardar los resultados',
        'details' => $e->getMessage()
    ]);
}
?>