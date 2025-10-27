<?php
/**
 * Modo Seguimiento - Configuración Inicial
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
    <title>Modo Seguimiento - Draftosaurus</title>
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
                DRAFTOSAURUS - Modo Seguimiento
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
                <i class="fas fa-clipboard-list" style="font-size: 80px; color: #f093fb;"></i>
                <h1 class="mt-3">Configurar Partida - Modo Seguimiento</h1>
                <p class="lead">Configura los jugadores que participarán en la partida física</p>
            </div>

            <div class="alert alert-info">
                <i class="fas fa-info-circle"></i>
                <strong>Modo Seguimiento:</strong> Este modo te ayudará a registrar una partida física del juego. 
                Ingresa manualmente los dinosaurios que cada jugador coloca y la aplicación calculará automáticamente los puntos.
            </div>

            <form id="setupForm" action="php/start-tracking.php" method="POST">
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
                                <div class="col-md-6">
                                    <label class="form-label">Color de Tablero (opcional)</label>
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
                        <input class="form-check-input" type="checkbox" id="autoSave" name="auto_save" checked>
                        <label class="form-check-label" for="autoSave">
                            <strong>Guardar progreso automáticamente</strong>
                            <br><small class="text-muted">La partida se guardará después de cada ronda</small>
                        </label>
                    </div>

                    <div class="form-check form-switch mb-3">
                        <input class="form-check-input" type="checkbox" id="showRules" name="show_rules" checked>
                        <label class="form-check-label" for="showRules">
                            <strong>Mostrar ayuda de reglas durante el juego</strong>
                            <br><small class="text-muted">Muestra recordatorios de las reglas de cada recinto</small>
                        </label>
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
                        <i class="fas fa-play"></i> Iniciar Seguimiento de Partida
                    </button>
                    <a href="dashboard.php" class="btn btn-outline-secondary">
                        <i class="fas fa-times"></i> Cancelar
                    </a>
                </div>
            </form>
        </div>

        <!-- Tutorial del Modo Seguimiento -->
        <div class="tutorial-card mt-4">
            <h4><i class="fas fa-info-circle"></i> ¿Cómo funciona el Modo Seguimiento?</h4>
            <p>Este modo está diseñado para acompañar tu partida física del juego de mesa:</p>
            <ol>
                <li><strong>Juega normalmente</strong> con el tablero físico y los dinosaurios</li>
                <li><strong>Registra cada colocación</strong> en la aplicación mientras juegas</li>
                <li><strong>La app validará</strong> automáticamente si cumples las reglas de cada recinto</li>
                <li><strong>Al finalizar</strong>, calcula automáticamente todos los puntos</li>
                <li><strong>Guarda el historial</strong> de tus partidas para consultas futuras</li>
            </ol>
            <div class="alert alert-warning mt-3">
                <i class="fas fa-exclamation-triangle"></i>
                <strong>Importante:</strong> Necesitarás el juego físico de Draftosaurus para jugar. 
                Este modo solo te ayuda a llevar la cuenta de puntos y validar reglas.
            </div>
        </div>
    </div>

    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/js/bootstrap.bundle.min.js"></script>
    <script src="js/game-setup.js"></script>
</body>
</html>