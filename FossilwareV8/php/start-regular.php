<?php
/**
 * START REGULAR - Diseño Profesional
 * Modo Regular - Draftosaurus  
 */

error_reporting(E_ALL);
ini_set('display_errors', 1);

$configPaths = ['config.php', '../config.php', '../../config.php'];
$configLoaded = false;

foreach ($configPaths as $path) {
    if (file_exists($path)) {
        require_once $path;
        $configLoaded = true;
        break;
    }
}

if (!$configLoaded) {
    die("ERROR CRÍTICO: No se pudo cargar config.php");
}

if (!isLoggedIn()) {
    redirect('../inicio.html?error=notloggedin');
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    redirect('../dashboard.php');
}

$currentUser = getCurrentUser();

if (!$currentUser) {
    redirect('../dashboard.php?error=nouser');
}

$numPlayers = (int)($_POST['num_players'] ?? 0);
$timerEnabled = isset($_POST['timer_enabled']) ? 1 : 0;
$hints = isset($_POST['hints']) ? 1 : 0;

if ($numPlayers < 2 || $numPlayers > 5) {
    redirect("../game-regular.php?players=$numPlayers&error=invalidplayers");
}

$players = [];
for ($i = 1; $i <= $numPlayers; $i++) {
    $playerName = trim($_POST["player_name_$i"] ?? '');
    $playerType = $_POST["player_type_$i"] ?? 'human';
    $playerColor = $_POST["player_color_$i"] ?? '#4A90E2';
    
    if (empty($playerName)) {
        redirect("../game-regular.php?players=$numPlayers&error=emptyname");
    }
    
    $players[] = [
        'name' => $playerName,
        'type' => $playerType,
        'color' => $playerColor,
        'is_host' => ($i === 1)
    ];
}

try {
    $pdo = getDatabaseConnection();
    $sessionCode = strtoupper(substr(uniqid(), -6));
    
    $stmt = $pdo->query("DESCRIBE game_sessions");
    $sessionColumns = $stmt->fetchAll(PDO::FETCH_COLUMN);
    
    $insertFields = ['session_code', 'game_mode', 'status', 'created_by'];
    $insertValues = [$sessionCode, 'regular', 'waiting', $currentUser['id']];
    $placeholders = ['?', '?', '?', '?'];
    
    if (in_array('game_id', $sessionColumns)) {
        $gameId = uniqid('game_', true);
        $insertFields[] = 'game_id';
        $insertValues[] = $gameId;
        $placeholders[] = '?';
    }
    
    if (in_array('host_user_id', $sessionColumns)) {
        $insertFields[] = 'host_user_id';
        $insertValues[] = $currentUser['id'];
        $placeholders[] = '?';
    }
    
    if (in_array('num_players', $sessionColumns)) {
        $insertFields[] = 'num_players';
        $insertValues[] = $numPlayers;
        $placeholders[] = '?';
    }
    
    if (in_array('timer_enabled', $sessionColumns)) {
        $insertFields[] = 'timer_enabled';
        $insertValues[] = $timerEnabled;
        $placeholders[] = '?';
    }
    
    if (in_array('hints_enabled', $sessionColumns)) {
        $insertFields[] = 'hints_enabled';
        $insertValues[] = $hints;
        $placeholders[] = '?';
    }
    
    $sql = "INSERT INTO game_sessions (" . implode(', ', $insertFields) . ") 
            VALUES (" . implode(', ', $placeholders) . ")";
    
    $stmt = $pdo->prepare($sql);
    $stmt->execute($insertValues);
    $sessionId = $pdo->lastInsertId();
    
    $stmt = $pdo->query("DESCRIBE game_players");
    $playerColumnsInfo = $stmt->fetchAll(PDO::FETCH_ASSOC);
    $playerColumns = array_column($playerColumnsInfo, 'Field');
    
    $positionColumn = in_array('player_order', $playerColumns) ? 'player_order' : 'player_position';
    
    foreach ($players as $index => $player) {
        $playerFields = ['session_id'];
        $playerValues = [$sessionId];
        $playerPlaceholders = ['?'];
        
        if (in_array('user_id', $playerColumns)) {
            $playerFields[] = 'user_id';
            $playerValues[] = ($index === 0) ? $currentUser['id'] : null;
            $playerPlaceholders[] = '?';
        }
        
        if (in_array('player_name', $playerColumns)) {
            $playerFields[] = 'player_name';
            $playerValues[] = $player['name'];
            $playerPlaceholders[] = '?';
        }
        
        if (in_array('player_type', $playerColumns)) {
            $playerFields[] = 'player_type';
            $playerValues[] = $player['type'];
            $playerPlaceholders[] = '?';
        }
        
        if (in_array('player_color', $playerColumns)) {
            $playerFields[] = 'player_color';
            $playerValues[] = $player['color'];
            $playerPlaceholders[] = '?';
        }
        
        $playerFields[] = $positionColumn;
        $playerValues[] = $index + 1;
        $playerPlaceholders[] = '?';
        
        if (in_array('is_host', $playerColumns)) {
            $playerFields[] = 'is_host';
            $playerValues[] = $player['is_host'] ? 1 : 0;
            $playerPlaceholders[] = '?';
        }
        
        if (in_array('score', $playerColumns)) {
            $playerFields[] = 'score';
            $playerValues[] = 0;
            $playerPlaceholders[] = '?';
        }
        
        $playerSql = "INSERT INTO game_players (" . implode(', ', $playerFields) . ") 
                      VALUES (" . implode(', ', $playerPlaceholders) . ")";
        
        $stmt = $pdo->prepare($playerSql);
        $stmt->execute($playerValues);
    }
    
    if (in_array('game_state', $sessionColumns)) {
        $gameState = [
            'current_round' => 1,
            'current_turn' => 1,
            'current_player' => 0,
            'game_phase' => 'setup',
            'players' => $players,
            'mode' => 'regular'
        ];
        
        $stmt = $pdo->prepare("UPDATE game_sessions SET game_state = ? WHERE id = ?");
        $stmt->execute([json_encode($gameState), $sessionId]);
    }
    
    $updateFields = ['status = ?', 'started_at = NOW()'];
    $updateValues = ['in_progress'];
    
    $updateSql = "UPDATE game_sessions SET " . implode(', ', $updateFields) . " WHERE id = ?";
    $updateValues[] = $sessionId;
    
    $stmt = $pdo->prepare($updateSql);
    $stmt->execute($updateValues);
    
    // ======== PÁGINA DE CONFIRMACIÓN CON FONDO DEL INDEX ========
    ?>
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Partida Creada - Draftosaurus</title>
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
    <style>
        :root {
            --primary-green: #2d5016;
            --secondary-green: #5a8f3a;
            --off-white: #fffdbd;
        }
        body {
            background-image: url('../img/background-index.jpg');
            background-size: cover;
            background-position: center;
            background-attachment: fixed;
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 20px;
        }
        .confirmation-card {
            max-width: 700px;
            background: var(--off-white);
            border-radius: 20px;
            box-shadow: 0 8px 30px rgba(0, 0, 0, 0.2);
            overflow: hidden;
            animation: slideIn 0.5s;
        }
        @keyframes slideIn {
            from { opacity: 0; transform: translateY(-30px); }
            to { opacity: 1; transform: translateY(0); }
        }
        .card-header-custom {
            background: linear-gradient(135deg, var(--primary-green), var(--secondary-green));
            color: white;
            padding: 40px;
            text-align: center;
        }
        .card-header-custom i {
            font-size: 4rem;
            margin-bottom: 15px;
        }
        .card-header-custom h1 {
            font-size: 2rem;
            font-weight: 800;
        }
        .card-body-custom {
            padding: 40px;
        }
        .mode-badge {
            display: inline-block;
            background: linear-gradient(135deg, #27ae60, #2ecc71);
            color: white;
            padding: 8px 20px;
            border-radius: 20px;
            font-size: 0.9rem;
            font-weight: 600;
            margin-bottom: 20px;
        }
        .session-code-display {
            background: var(--primary-green);
            color: white;
            padding: 15px;
            border-radius: 10px;
            text-align: center;
            font-size: 2rem;
            font-weight: 800;
            letter-spacing: 3px;
            margin-bottom: 30px;
        }
        .info-grid {
            display: grid;
            grid-template-columns: repeat(2, 1fr);
            gap: 20px;
            margin-bottom: 30px;
        }
        .info-item {
            background: white;
            padding: 20px;
            border-radius: 12px;
            border-left: 4px solid var(--secondary-green);
        }
        .info-item .label {
            font-size: 0.85rem;
            color: #6c757d;
            margin-bottom: 8px;
        }
        .info-item .value {
            font-size: 1.3rem;
            font-weight: bold;
            color: var(--primary-green);
        }
        .features-list {
            background: white;
            padding: 20px;
            border-radius: 12px;
            margin-bottom: 20px;
        }
        .features-list .feature-item {
            padding: 8px 0;
            border-bottom: 1px solid #f0f0f0;
        }
        .features-list .feature-item:last-child {
            border-bottom: none;
        }
        .btn-start-game {
            background: linear-gradient(135deg, var(--primary-green), var(--secondary-green));
            color: white;
            padding: 15px;
            border-radius: 50px;
            font-size: 1.1rem;
            font-weight: 700;
            width: 100%;
            text-align: center;
            text-decoration: none;
            display: block;
            transition: all 0.3s;
        }
        .btn-start-game:hover {
            transform: translateY(-3px);
            color: white;
        }
        .countdown-text {
            text-align: center;
            margin-top: 20px;
            color: #6c757d;
        }
        @media (max-width: 768px) {
            .info-grid {
                grid-template-columns: 1fr;
            }
        }
    </style>
</head>
<body>
    <div class="confirmation-card">
        <div class="card-header-custom">
            <i class="fas fa-check-circle"></i>
            <h1>Partida Creada Exitosamente</h1>
            <p>Modo Regular</p>
        </div>
        <div class="card-body-custom">
            <div class="text-center">
                <span class="mode-badge">
                    <i class="fas fa-gamepad"></i> MODO JUEGO REGULAR
                </span>
            </div>
            
            <div class="session-code-display"><?php echo $sessionCode; ?></div>
            
            <div class="info-grid">
                <div class="info-item">
                    <div class="label"><i class="fas fa-hashtag"></i> Session ID</div>
                    <div class="value"><?php echo $sessionId; ?></div>
                </div>
                <div class="info-item">
                    <div class="label"><i class="fas fa-users"></i> Jugadores</div>
                    <div class="value"><?php echo $numPlayers; ?></div>
                </div>
                <div class="info-item">
                    <div class="label"><i class="fas fa-calendar"></i> Fecha</div>
                    <div class="value" id="fecha"></div>
                </div>
                <div class="info-item">
                    <div class="label"><i class="fas fa-clock"></i> Hora</div>
                    <div class="value" id="hora"></div>
                </div>
            </div>

            <div class="features-list">
                <div class="feature-item">
                    <i class="fas fa-<?php echo $timerEnabled ? 'check-circle text-success' : 'times-circle text-danger'; ?>"></i>
                    Temporizador: <strong><?php echo $timerEnabled ? 'Activado (60s)' : 'Desactivado'; ?></strong>
                </div>
                <div class="feature-item">
                    <i class="fas fa-dice text-primary"></i>
                    Dado: <strong>Automático</strong>
                </div>
                <div class="feature-item">
                    <i class="fas fa-sync-alt text-primary"></i>
                    Turnos: <strong>2 Rondas × 6 Turnos</strong>
                </div>
            </div>
            
            <a href="../game-board.php?session=<?php echo $sessionId; ?>" class="btn-start-game">
                <i class="fas fa-play-circle me-2"></i>Comenzar Partida
            </a>
            
            <div class="countdown-text">
                Redirigiendo en <strong id="counter">3</strong>s
            </div>
        </div>
    </div>
    <script>
        const now = new Date();
        document.getElementById('fecha').textContent = now.toLocaleDateString('es-ES');
        document.getElementById('hora').textContent = now.toLocaleTimeString('es-ES', {hour: '2-digit', minute: '2-digit'});
        let c = 3;
        setInterval(() => {
            if (--c <= 0) location.href = '../game-board.php?session=<?php echo $sessionId; ?>';
            document.getElementById('counter').textContent = c;
        }, 1000);
    </script>
</body>
</html>
<?php
    exit();
} catch (PDOException $e) {
?>
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <title>Error</title>
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">
    <style>
        body {
            background-image: url('../img/background-index.jpg');
            background-size: cover;
            min-height: 100vh;
            display: flex;
            align-items: center;
            padding: 20px;
        }
        .error-card {
            max-width: 600px;
            background: #fffdbd;
            border-radius: 20px;
            padding: 40px;
            margin: 0 auto;
        }
    </style>
</head>
<body>
    <div class="error-card">
        <h2 class="text-danger">Error al Crear Partida</h2>
        <div class="alert alert-danger mt-3"><?php echo htmlspecialchars($e->getMessage()); ?></div>
        <a href="../game-regular.php?players=2" class="btn btn-primary">Volver</a>
    </div>
</body>
</html>
<?php
    exit();
}
?>