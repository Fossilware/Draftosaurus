<?php
/**
 * Modo Juego Regular - Configuración Inicial
 * Draftosaurus - FossilWare
 */

require_once 'php/config.php';

// Verificar si el usuario está logueado
if (!isLoggedIn()) {
    redirect('inicio.html?error=notloggedin');
}

// Obtener número de jugadores
$numPlayers = isset($_GET['players']) ? (int)$_GET['players'] : 2;

// Validar número de jugadores
if ($numPlayers < 2 || $numPlayers > 5) {
    redirect('dashboard.php?error=invalidplayers');
}

$currentUser = getCurrentUser();
?>
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Modo Regular - Draftosaurus</title>
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
    <link rel="stylesheet" href="css/styles.css">
    <link rel="stylesheet" href="css/dashboard.css">
    <link rel="stylesheet" href="css/game.css">
</head>
<body class="game-body">
    <!-- Navbar -->
    <nav class="navbar navbar-dark bg-dark-green">
        <div class="container-fluid">
            <a class="navbar-brand" href="dashboard.php">
                <img src="img/logo-draftosaurus.png" alt="Logo" height="40" class="d-inline-block align-text-top me-2">
                DRAFTOSAURUS - Modo Regular
            </a>
            <div class="d-flex align-items-center">
                <span class="text-white me-3">
                    <i class="fas fa-user-circle"></i> <?php echo htmlspecialchars($currentUser['username']); ?>
                </span>
                <a href="dashboard.php" class="btn btn-outline-light btn-sm">
                    <i class="fas fa-arrow-left"></i> Volver
                </a>
            </div>
        </div>
    </nav>

    <div class="container mt-5">
        <div class="setup-card">
            <div class="text-center mb-4">
                <i class="fas fa-gamepad" style="font-size: 80px; color: #667eea;"></i>
                <h1 class="mt-3">Configurar Partida - Modo Regular</h1>
                <p class="lead">Configura los jugadores para la partida digitalizada</p>
            </div>

            <div class="alert alert-info">
                <i class="fas fa-info-circle"></i>
                <strong>Modo Regular:</strong> Juego completo digitalizado donde podrás seleccionar, pasar y colocar dinosaurios 
                siguiendo todas las reglas del juego original. Ideal para jugar desde el navegador.
            </div>

            <form id="setupForm" action="php/start-regular.php" method="POST">
                <input type="hidden" name="num_players" value="<?php echo $numPlayers; ?>">
                
                <h3 class="mb-3">
                    <i class="fas fa-users"></i> Jugadores (<?php echo $numPlayers; ?>)
                </h3>

                <div id="playersContainer">
                    <?php for ($i = 1; $i <= $numPlayers; $i++): ?>
                        <div class="player-setup-card mb-3">
                            <div class="row align-items-center">
                                <div class="col-md-1 text-center">
                                    <div class="player-number">
                                        <?php echo $i; ?>
                                    </div>
                                </div>
                                <div class="col-md-5">
                                    <label class="form-label">Nombre del Jugador</label>
                                    <input type="text" 
                                           class="form-control" 
                                           name="player_name_<?php echo $i; ?>" 
                                           placeholder="Ingresa el nombre" 
                                           required
                                           <?php if ($i === 1) echo 'value="' . htmlspecialchars($currentUser['username']) . '"'; ?>>
                                </div>
                                <div class="col-md-3">
                                    <label class="form-label">Tipo</label>
                                    <select class="form-select" name="player_type_<?php echo $i; ?>">
                                        <option value="human" <?php if ($i === 1) echo 'selected'; ?>>Humano</option>
                                        <option value="cpu">CPU (IA)</option>
                                    </select>
                                </div>
                                <div class="col-md-3">
                                    <label class="form-label">Color</label>
                                    <select class="form-select" name="player_color_<?php echo $i; ?>">
                                        <option value="blue" <?php if ($i === 1) echo 'selected'; ?>>Azul</option>
                                        <option value="red" <?php if ($i === 2) echo 'selected'; ?>>Rojo</option>
                                        <option value="green" <?php if ($i === 3) echo 'selected'; ?>>Verde</option>
                                        <option value="yellow" <?php if ($i === 4) echo 'selected'; ?>>Amarillo</option>
                                        <option value="purple" <?php if ($i === 5) echo 'selected'; ?>>Morado</option>
                                    </select>
                                </div>
                            </div>
                        </div>
                    <?php endfor; ?>
                </div>

                <div class="game-options mt-4">
                    <h3 class="mb-3">
                        <i class="fas fa-cog"></i> Opciones de Partida
                    </h3>
                    
                    <div class="form-check form-switch mb-3">
                        <input class="form-check-input" type="checkbox" id="timerEnabled" name="timer_enabled">
                        <label class="form-check-label" for="timerEnabled">
                            <strong>Activar temporizador por turno</strong>
                            <br><small class="text-muted">Cada jugador tendrá tiempo limitado para elegir (60 segundos)</small>
                        </label>
                    </div>

                    <div class="form-check form-switch mb-3">
                        <input class="form-check-input" type="checkbox" id="hints" name="hints" checked>
                        <label class="form-check-label" for="hints">
                            <strong>Mostrar sugerencias de colocación</strong>
                            <br><small class="text-muted">Destaca los recintos válidos para colocar dinosaurios</small>
                        </label>
                    </div>

                    <div class="form-check form-switch mb-3">
                        <input class="form-check-input" type="checkbox" id="animations" name="animations" checked>
                        <label class="form-check-label" for="animations">
                            <strong>Activar animaciones</strong>
                            <br><small class="text-muted">Animaciones de paso de dinosaurios y efectos visuales</small>
                        </label>
                    </div>

                    <div class="mb-3">
                        <label class="form-label"><strong>Velocidad del juego</strong></label>
                        <select class="form-select" name="game_speed">
                            <option value="slow">Lenta (Recomendado para principiantes)</option>
                            <option value="normal" selected>Normal</option>
                            <option value="fast">Rápida</option>
                        </select>
                    </div>

                    <div class="mb-3">
                        <label class="form-label"><strong>Dificultad</strong></label>
                        <select class="form-select" name="difficulty">
                            <option value="base" selected>Modo Base (Recomendado)</option>
                            <option value="advanced" disabled>Modo Avanzado (Próximamente)</option>
                        </select>
                    </div>
                </div>

                <div class="d-grid gap-2 mt-4">
                    <button type="submit" class="btn btn-primary btn-lg">
                        <i class="fas fa-play"></i> Iniciar Partida
                    </button>
                    <a href="dashboard.php" class="btn btn-outline-secondary">
                        <i class="fas fa-times"></i> Cancelar
                    </a>
                </div>
            </form>
        </div>

        <!-- Tutorial Rápido -->
        <div class="tutorial-card mt-4">
            <h4><i class="fas fa-graduation-cap"></i> ¿Primera vez jugando?</h4>
            <p>Aquí tienes un resumen rápido de cómo jugar:</p>
            <ol>
                <li>Cada jugador recibe 6 dinosaurios al azar</li>
                <li>El jugador activo lanza el dado que determina restricciones</li>
                <li>Todos eligen 1 dinosaurio y lo colocan en su parque</li>
                <li>Los dinosaurios restantes se pasan al jugador de la izquierda</li>
                <li>Se repite hasta colocar los 6 dinosaurios (fin de ronda)</li>
                <li>Se juega una segunda ronda con 6 nuevos dinosaurios</li>
                <li>Se cuentan los puntos y se determina el ganador</li>
            </ol>
            <button class="btn btn-outline-primary" data-bs-toggle="modal" data-bs-target="#rulesModal">
                <i class="fas fa-book"></i> Ver Reglas Completas
            </button>
        </div>
    </div>

    <!-- Modal de Reglas -->
    <div class="modal fade" id="rulesModal" tabindex="-1">
        <div class="modal-dialog modal-lg">
            <div class="modal-content">
                <div class="modal-header">
                    <h5 class="modal-title">
                        <i class="fas fa-book"></i> Reglas Completas de Draftosaurus
                    </h5>
                    <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                </div>
                <div class="modal-body">
                    <h6>Objetivo del Juego</h6>
                    <p>Construir un parque de dinosaurios y colocarlos estratégicamente para obtener la mayor cantidad de puntos.</p>
                    
                    <h6 class="mt-3">Desarrollo del Juego</h6>
                    <ul>
                        <li>2 rondas de 6 turnos cada una</li>
                        <li>Cada jugador toma 6 dinosaurios al azar</li>
                        <li>El jugador activo lanza el dado</li>
                        <li>Todos colocan un dinosaurio en su parque</li>
                        <li>Se pasan los dinosaurios restantes a la izquierda</li>
                    </ul>
                    
                    <h6 class="mt-3">Recintos del Parque</h6>
                    <div class="table-responsive">
                        <table class="table table-sm">
                            <thead>
                                <tr>
                                    <th>Recinto</th>
                                    <th>Regla</th>
                                    <th>Puntuación</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr>
                                    <td><strong>Bosque de la Semejanza</strong></td>
                                    <td>Solo misma especie</td>
                                    <td>Según cantidad colocada</td>
                                </tr>
                                <tr>
                                    <td><strong>Prado de la Diferencia</strong></td>
                                    <td>Solo especies distintas</td>
                                    <td>Según cantidad colocada</td>
                                </tr>
                                <tr>
                                    <td><strong>Pradera del Amor</strong></td>
                                    <td>Cualquier especie</td>
                                    <td>5 pts por pareja</td>
                                </tr>
                                <tr>
                                    <td><strong>Trío Frondoso</strong></td>
                                    <td>Máximo 3 dinosaurios</td>
                                    <td>7 pts si hay exactamente 3</td>
                                </tr>
                                <tr>
                                    <td><strong>Rey de la Selva</strong></td>
                                    <td>Solo 1 dinosaurio</td>
                                    <td>7 pts si eres el que más tiene de esa especie</td>
                                </tr>
                                <tr>
                                    <td><strong>Isla Solitaria</strong></td>
                                    <td>Solo 1 dinosaurio</td>
                                    <td>7 pts si es único en tu parque</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                    
                    <h6 class="mt-3">Puntuación Final</h6>
                    <ul>
                        <li>Suma de puntos de cada recinto</li>
                        <li>+1 punto por cada dinosaurio en el río</li>
                        <li>+1 punto por cada recinto con al menos un T-Rex</li>
                    </ul>
                    
                    <a href="https://drive.google.com/file/d/138qY_aZfQ-RXYDA0j6HshSk-_1mmJIrG/view" 
                       target="_blank" class="btn btn-outline-primary mt-3">
                        <i class="fas fa-file-pdf"></i> Ver Manual Completo
                    </a>
                </div>
            </div>
        </div>
    </div>

    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/js/bootstrap.bundle.min.js"></script>
    <script src="js/game-setup.js"></script>
</body>
</html>