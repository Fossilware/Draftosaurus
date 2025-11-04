<?php
/**
 * Dashboard Principal - SelecciÃ³n de Modo de Juego
 * Draftosaurus - FossilWare
 */

require_once 'php/config.php';

// Verificar si el usuario estÃ¡ logueado
if (!isLoggedIn()) {
    redirect('inicio.html?error=notloggedin');
}

// Obtener datos del usuario
$currentUser = getCurrentUser();

// Obtener estadÃ­sticas del usuario
try {
    $pdo = getDatabaseConnection();
    $stmt = $pdo->prepare("
        SELECT 
            COALESCE(total_games, 0) as total_games,
            COALESCE(games_won, 0) as games_won,
            COALESCE(games_lost, 0) as games_lost,
            COALESCE(highest_score, 0) as highest_score,
            COALESCE(average_score, 0) as average_score
        FROM user_statistics 
        WHERE user_id = ?
    ");
    $stmt->execute([$currentUser['id']]);
    $stats = $stmt->fetch();
    
    $winRate = $stats['total_games'] > 0 
        ? round(($stats['games_won'] / $stats['total_games']) * 100, 1) 
        : 0;
} catch (PDOException $e) {
    $stats = [
        'total_games' => 0,
        'games_won' => 0,
        'games_lost' => 0,
        'highest_score' => 0,
        'average_score' => 0
    ];
    $winRate = 0;
}
?>
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Dashboard - Draftosaurus</title>
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
    <link rel="stylesheet" href="css/styles.css">
    <link rel="stylesheet" href="css/dashboard.css">
</head>
<body class="dashboard-body">
    <!-- Navbar Superior -->
    <nav class="navbar navbar-dark bg-dark-green">
        <div class="container-fluid">
            <a class="navbar-brand" href="dashboard.php">
                <img src="img/logo-draftosaurus.png" alt="Logo" height="40" class="d-inline-block align-text-top me-2" onerror="this.style.display='none'">
                DRAFTOSAURUS
            </a>
            <div class="d-flex align-items-center">
                <span class="text-white me-3">
                    <i class="fas fa-user-circle"></i> <?php echo htmlspecialchars($currentUser['username']); ?>
                </span>
                <a href="php/logout.php" class="btn btn-outline-light btn-sm">
                    <i class="fas fa-sign-out-alt"></i> Salir
                </a>
            </div>
        </div>
    </nav>

    <div class="container-fluid main-container">
        <div class="row">
            <!-- Sidebar -->
            <div class="col-md-3 col-lg-2 sidebar">
                <div class="profile-sidebar">
                    <img src="uploads/profiles/<?php echo htmlspecialchars($currentUser['profile_pic']); ?>" 
                         alt="Avatar" class="profile-avatar-sidebar" 
                         onerror="this.src='img/default-avatar.png'">
                    <h5 class="mt-3"><?php echo htmlspecialchars($currentUser['username']); ?></h5>
                    <small class="text-muted"><?php echo htmlspecialchars($currentUser['email']); ?></small>
                </div>

                <ul class="nav flex-column mt-4">
                    <li class="nav-item">
                        <a class="nav-link active" href="dashboard.php">
                            <i class="fas fa-home"></i> Inicio
                        </a>
                    </li>
                    <li class="nav-item">
                        <a class="nav-link" href="configuracion.php">
                            <i class="fas fa-cog"></i> Configuracion
                        </a>
                    </li>
                </ul>
            </div>

            <!-- Contenido Principal -->
            <div class="col-md-9 col-lg-10 main-content">
                <!-- Bienvenida -->
                <div class="welcome-card">
                    <div class="row align-items-center">
                        <div class="col-md-8">
                            <h1 class="display-5">¡Bienvenido, <?php echo htmlspecialchars($currentUser['username']); ?>!</h1>
                            <p class="lead">¿Listo para una nueva partida de Draftosaurus?</p>
                            <p class="text-muted">Selecciona un modo de juego para comenzar tu aventura prehistorica</p>
                        </div>
                        <div class="col-md-4 text-end">
                            <img src="img/logo-draftosaurus.png" alt="Draftosaurus" class="welcome-logo" onerror="this.style.display='none'">
                        </div>
                    </div>
                </div>

                <!-- Modos de Juego -->
                <div class="row mt-4">
                    <!-- Modo Regular -->
                    <div class="col-lg-6 mb-4">
                        <div class="game-mode-card mode-regular">
                            <div class="mode-icon">
                                <i class="fas fa-gamepad"></i>
                            </div>
                            <h3 class="mode-title">Modo Juego Regular</h3>
                            <p class="mode-description">
                                Juega una partida completa digitalizada de Draftosaurus. 
                                Selecciona, pasa y coloca dinosaurios siguiendo todas las reglas del juego original.
                            </p>

                            <div class="player-selector">
                                <label class="form-label">Numero de jugadores:</label>
                                <select class="form-select" id="playersRegular">
                                    <option value="2">2 Jugadores</option>
                                    <option value="3">3 Jugadores</option>
                                    <option value="4" selected>4 Jugadores</option>
                                    <option value="5">5 Jugadores</option>
                                </select>
                            </div>

                            <a href="#" class="btn btn-mode btn-mode-regular" onclick="event.preventDefault(); iniciarJuegoRegular();">
                                <i class="fas fa-play"></i> Jugar Ahora
                            </a>
                        </div>
                    </div>

                    <!-- Modo Seguimiento -->
                    <div class="col-lg-6 mb-4">
                        <div class="game-mode-card mode-tracking">
                            <div class="mode-icon">
                                <i class="fas fa-clipboard-list"></i>
                            </div>
                            <h3 class="mode-title">Modo Seguimiento de Partida</h3>
                            <p class="mode-description">
                                Registra y sigue una partida fisica del juego. 
                                La aplicacion te ayudara a calcular puntos y validar reglas mientras juegas con el tablero real.
                            </p>

                            <div class="player-selector">
                                <label class="form-label">Numero de jugadores:</label>
                                <select class="form-select" id="playersTracking">
                                    <option value="2">2 Jugadores</option>
                                    <option value="3">3 Jugadores</option>
                                    <option value="4" selected>4 Jugadores</option>
                                    <option value="5">5 Jugadores</option>
                                </select>
                            </div>

                            <a href="#" class="btn btn-mode btn-mode-tracking" onclick="event.preventDefault(); iniciarJuegoSeguimiento();">
                                <i class="fas fa-clipboard-check"></i> Iniciar Seguimiento
                            </a>
                        </div>
                    </div>
                </div>

                <!-- Reglas RÃ¡pidas -->
                <div class="rules-section mt-4">
                    <h3 class="section-title">
                        <i class="fas fa-book"></i> Reglas Rapidas
                    </h3>
                    <div class="alert alert-info">
                        <p><strong>Objetivo:</strong> Coloca tus dinosaurios en diferentes zonas para obtener el maximo de puntos.</p>
                        <p><strong>Mecanica:</strong> El dado determina donde colocar cada dinosaurio. Pasa tu mano al siguiente jugador despues de cada turno.</p>
                        <p class="mb-0"><strong>Puntuacion:</strong> Al final de 2 rondas, se cuentan los puntos segun las reglas de cada zona.</p>
                    </div>
                    
                    <div class="rules-accordion">
                        <div class="accordion" id="rulesAccordion">
                            <div class="accordion-item">
                                <h2 class="accordion-header">
                                    <button class="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#rule1">
                                        <i class="fas fa-dice me-2"></i> Objetivo del Juego
                                    </button>
                                </h2>
                                <div id="rule1" class="accordion-collapse collapse" data-bs-parent="#rulesAccordion">
                                    <div class="accordion-body">
                                        Construir un parque de dinosaurios y colocarlos estrategicamente en los distintos recintos para obtener la mayor cantidad de puntos al final de la partida.
                                    </div>
                                </div>
                            </div>
                            <div class="accordion-item">
                                <h2 class="accordion-header">
                                    <button class="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#rule2">
                                        <i class="fas fa-play-circle me-2"></i> Desarrollo del Juego
                                    </button>
                                </h2>
                                <div id="rule2" class="accordion-collapse collapse" data-bs-parent="#rulesAccordion">
                                    <div class="accordion-body">
                                        <ul>
                                            <li>El juego se desarrolla en <strong>2 rondas</strong> de <strong>6 turnos</strong> cada una</li>
                                            <li>Cada jugador toma 6 dinosaurios al azar</li>
                                            <li>Se lanza el dado para determinar restricciones</li>
                                            <li>Todos colocan un dinosaurio en su parque</li>
                                            <li>Se pasan los dinosaurios restantes al jugador de la izquierda</li>
                                        </ul>
                                    </div>
                                </div>
                            </div>
                            <div class="accordion-item">
                                <h2 class="accordion-header">
                                    <button class="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#rule3">
                                        <i class="fas fa-home me-2"></i> Recintos del Parque
                                    </button>
                                </h2>
                                <div id="rule3" class="accordion-collapse collapse" data-bs-parent="#rulesAccordion">
                                    <div class="accordion-body">
                                        <strong>Bosque de la Semejanza:</strong> Solo dinosaurios de la misma especie<br>
                                        <strong>Prado de la Diferencia:</strong> Solo dinosaurios de especies distintas<br>
                                        <strong>Pradera del Amor:</strong> 5 puntos por cada pareja de la misma especie<br>
                                        <strong>Tri­o Frondoso:</strong> 7 puntos si hay exactamente 3 dinosaurios<br>
                                        <strong>Rey de la Selva:</strong> 7 puntos si eres el que mas tiene de esa especie<br>
                                        <strong>Isla Solitaria:</strong> 7 puntos si es el unico de su especie en tu parque
                                    </div>
                                </div>
                            </div>
                            <div class="accordion-item">
                                <h2 class="accordion-header">
                                    <button class="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#rule4">
                                        <i class="fas fa-star me-2"></i> Puntuacion Final
                                    </button>
                                </h2>
                                <div id="rule4" class="accordion-collapse collapse" data-bs-parent="#rulesAccordion">
                                    <div class="accordion-body">
                                        <ul>
                                            <li>Se suman los puntos de cada recinto</li>
                                            <li>Cada dinosaurio en el ri­o suma 1 punto</li>
                                            <li>Cada recinto con al menos 1 T-Rex otorga 1 punto extra</li>
                                            <li>El jugador con mas puntos gana</li>
                                            <li>En caso de empate, gana quien tenga mas dinosaurios en su parque</li>
                                        </ul>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div class="text-center mt-3">
                        <a href="https://drive.google.com/file/d/1OAgB0MXv9NS41s4UGk6xopbSTuAZpu4T/view?usp=sharing" 
                           target="_blank" class="btn btn-outline-primary">
                            <i class="fas fa-book-open"></i> Manual Completo del Juego
                        </a>
                    </div>
                </div>
            </div>
        </div>
    </div>

    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/js/bootstrap.bundle.min.js"></script>
    
    <script>
        function iniciarJuegoRegular() {
            const jugadores = document.getElementById('playersRegular').value;
            window.location.href = 'game-regular.php?players=' + jugadores;
        }
        
        function iniciarJuegoSeguimiento() {
            const jugadores = document.getElementById('playersTracking').value;
            window.location.href = 'game-tracking.php?players=' + jugadores;
        }
    </script>
</body>
</html>