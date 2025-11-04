<?php
/**
 * Modo Juego Regular - Configuración Inicial
 * Draftosaurus - FossilWare
 */

require_once 'php/config.php';

if (!isLoggedIn()) {
    redirect('inicio.html?error=notloggedin');
}

$numPlayers = isset($_GET['players']) ? (int)$_GET['players'] : 4;

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
    <style>
        /* Variables */
        :root {
            --primary-green: #2d5016;
            --secondary-green: #5a8f3a;
            --off-white: #fffdbd;
            --shadow: 0 8px 30px rgba(0, 0, 0, 0.15);
        }

        /* Body con background */
        body {
            background-image: url('img/background-index.jpg');
            background-size: cover;
            background-position: center;
            background-repeat: no-repeat;
            background-attachment: fixed;
            min-height: 100vh;
            padding-top: 76px;
        }

        /* Navbar */
        .navbar {
            background: linear-gradient(135deg, #2d5016 0%, #5a8f3a 100%) !important;
            box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
        }

        .navbar-brand {
            font-weight: 800;
            font-size: 1.6rem;
            letter-spacing: 2px;
            text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.3);
        }

        /* Contenedor flotante principal */
        .floating-container {
            max-width: 900px;
            margin: 40px auto;
            background: var(--off-white);
            border-radius: 20px;
            box-shadow: var(--shadow);
            overflow: hidden;
        }

        /* Header del contenedor */
        .container-header {
            background: linear-gradient(135deg, #2d5016 0%, #5a8f3a 100%);
            color: white;
            padding: 40px;
            text-align: center;
        }

        .container-header h1 {
            font-size: 2.5rem;
            font-weight: 800;
            margin-bottom: 10px;
            text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.3);
        }

        .container-header p {
            font-size: 1.1rem;
            opacity: 0.95;
            margin: 0;
        }

        /* Contenido */
        .container-content {
            padding: 40px;
        }

        /* Info alert */
        .info-alert {
            background: #e8f5e9;
            border-left: 5px solid #5a8f3a;
            border-radius: 10px;
            padding: 20px;
            margin-bottom: 30px;
        }

        .info-alert i {
            color: #5a8f3a;
            font-size: 1.5rem;
            margin-right: 15px;
        }

        /* Section title */
        .section-title {
            display: flex;
            align-items: center;
            gap: 15px;
            margin-bottom: 25px;
            padding-bottom: 15px;
            border-bottom: 3px solid #5a8f3a;
            color: var(--primary-green);
        }

        .section-title i {
            font-size: 1.8rem;
        }

        .section-title h3 {
            margin: 0;
            font-size: 1.6rem;
            font-weight: 700;
        }

        /* Player cards */
        .player-card {
            background: white;
            border-radius: 15px;
            overflow: hidden;
            box-shadow: 0 4px 15px rgba(0, 0, 0, 0.08);
            margin-bottom: 20px;
            transition: all 0.3s ease;
        }

        .player-card:hover {
            transform: translateY(-3px);
            box-shadow: 0 6px 20px rgba(0, 0, 0, 0.12);
        }

        .player-card-header {
            padding: 18px 25px;
            color: white;
            font-weight: 700;
            font-size: 1.1rem;
            text-align: center;
            text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.3);
        }

        .player-card-body {
            padding: 25px;
        }

        .player-card-body label {
            font-weight: 600;
            color: var(--primary-green);
            margin-bottom: 8px;
            display: block;
        }

        .player-card-body .form-control {
            border: 2px solid #ffffdb;
            border-radius: 10px;
            padding: 12px 15px;
            font-size: 1rem;
            transition: all 0.3s ease;
        }

        .player-card-body .form-control:focus {
            border-color: #5a8f3a;
            box-shadow: 0 0 0 0.25rem rgba(90, 143, 58, 0.15);
        }

        .color-badge {
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 12px 20px;
            border-radius: 10px;
            color: white;
            font-weight: 600;
            box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
            text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.3);
        }

        /* Options */
        .options-box {
            background: white;
            border-radius: 15px;
            padding: 25px;
            box-shadow: 0 4px 15px rgba(0, 0, 0, 0.08);
            margin-bottom: 30px;
        }

        .option-item {
            padding: 18px 20px;
            background: #f8f9fa;
            border-radius: 10px;
            transition: all 0.3s ease;
        }

        .option-item:hover {
            background: #e9ecef;
        }

        .option-item .form-check-input {
            width: 50px;
            height: 25px;
            cursor: pointer;
        }

        .option-item .form-check-input:checked {
            background-color: #5a8f3a;
            border-color: #5a8f3a;
        }

        .option-item label {
            cursor: pointer;
            margin-left: 15px;
        }

        .option-item strong {
            color: var(--primary-green);
            font-size: 1.1rem;
        }

        .option-item small {
            color: #6c757d;
            display: block;
            margin-top: 5px;
        }

        /* Buttons */
        .action-buttons {
            text-align: center;
            margin-top: 30px;
        }

        .btn-start {
            background: linear-gradient(135deg, #2d5016 0%, #5a8f3a 100%);
            color: white;
            border: none;
            padding: 18px 60px;
            font-size: 1.3rem;
            font-weight: 700;
            border-radius: 50px;
            box-shadow: 0 8px 20px rgba(45, 80, 22, 0.3);
            transition: all 0.3s ease;
            text-transform: uppercase;
            letter-spacing: 1px;
        }

        .btn-start:hover {
            transform: translateY(-3px);
            box-shadow: 0 12px 30px rgba(45, 80, 22, 0.4);
            background: linear-gradient(135deg, #5a8f3a 0%, #6aa84f 100%);
        }

        .btn-cancel {
            background: white;
            color: #6c757d;
            border: 2px solid #dee2e6;
            padding: 15px 50px;
            font-size: 1.1rem;
            font-weight: 600;
            border-radius: 50px;
            margin-left: 15px;
            transition: all 0.3s ease;
        }

        .btn-cancel:hover {
            background: #f8f9fa;
            border-color: #adb5bd;
            color: #495057;
        }

        /* Responsive */
        @media (max-width: 768px) {
            .floating-container {
                margin: 20px;
                border-radius: 15px;
            }

            .container-header {
                padding: 30px 20px;
            }

            .container-header h1 {
                font-size: 1.8rem;
            }

            .container-content {
                padding: 25px 20px;
            }

            .btn-start {
                width: 100%;
                margin-bottom: 15px;
            }

            .btn-cancel {
                width: 100%;
                margin-left: 0;
            }
        }
    </style>
</head>
<body>
    <!-- Navbar -->
    <nav class="navbar navbar-dark fixed-top">
        <div class="container-fluid">
            <a class="navbar-brand" href="dashboard.php">
                <img src="img/logo-draftosaurus.png" alt="Logo" height="40" class="d-inline-block align-text-top me-2" onerror="this.style.display='none'">
                DRAFTOSAURUS
            </a>
            <div class="d-flex align-items-center">
                <span class="text-white me-3 d-none d-md-inline">
                    <i class="fas fa-user-circle"></i> <?php echo htmlspecialchars($currentUser['username']); ?>
                </span>
                <a href="dashboard.php" class="btn btn-outline-light btn-sm">
                    <i class="fas fa-arrow-left"></i> Volver
                </a>
            </div>
        </div>
    </nav>

    <!-- Contenedor flotante principal -->
    <div class="floating-container">
        <!-- Header -->
        <div class="container-header">
            <h1><i class="fas fa-gamepad me-3"></i>Configurar Partida Fisica</h1>
            <p>Modo Seguimiento - Seguimiento Digitalizado</p>
        </div>

        <!-- Contenido -->
        <div class="container-content">
            <!-- Info -->
            <div class="info-alert">
                <div class="d-flex align-items-start">
                    <i class="fas fa-info-circle"></i>
                    <div>
                        <strong style="color: #2d5016; font-size: 1.1rem;">Modo Seguimiento:</strong>
                        <p class="mb-0 mt-1">Juego digitalizado donde podrás seleccionar y colocar dinosaurios para seguir la puntuación del juego fisico y original.</p>
                    </div>
                </div>
            </div>

            <form id="setupForm" action="php/start-tracking.php" method="POST">
                <input type="hidden" name="num_players" value="<?php echo $numPlayers; ?>">
                
                <!-- Sección Jugadores -->
                <div class="section-title">
                    <i class="fas fa-users"></i>
                    <h3>Jugadores (<?php echo $numPlayers; ?>)</h3>
                </div>

                <div id="playersContainer">
                    <?php 
                    $colors = ['#4A90E2', '#E74C3C', '#27AE60', '#F39C12', '#9B59B6'];
                    $colorNames = ['Azul', 'Rojo', 'Verde', 'Amarillo', 'Morado'];
                    
                    for ($i = 1; $i <= $numPlayers; $i++): 
                    ?>
                        <div class="player-card">
                            <div class="player-card-header" style="background: <?php echo $colors[$i-1]; ?>">
                                <i class="fas fa-user-circle me-2"></i>Jugador <?php echo $i; ?>
                            </div>
                            <div class="player-card-body">
                                <div class="row g-3">
                                    <div class="col-md-9">
                                        <label>
                                            <i class="fas fa-id-badge me-2"></i>Nombre del Jugador
                                        </label>
                                        <input type="text" 
                                               class="form-control" 
                                               name="player_name_<?php echo $i; ?>" 
                                               placeholder="Ingresa el nombre" 
                                               required
                                               <?php if ($i === 1) echo 'value="' . htmlspecialchars($currentUser['username']) . '"'; ?>>
                                        <input type="hidden" name="player_type_<?php echo $i; ?>" value="human">
                                    </div>
                                    <div class="col-md-3">
                                        <label>
                                            <i class="fas fa-palette me-2"></i>Color
                                        </label>
                                        <div class="color-badge" style="background: <?php echo $colors[$i-1]; ?>">
                                            <?php echo $colorNames[$i-1]; ?>
                                        </div>
                                        <input type="hidden" name="player_color_<?php echo $i; ?>" value="<?php echo $colors[$i-1]; ?>">
                                    </div>
                                </div>
                            </div>
                        </div>
                    <?php endfor; ?>
                </div>

                <!-- Botones -->
                <div class="action-buttons">
                    <button type="submit" class="btn btn-start">
                        <i class="fas fa-play-circle me-2"></i>Iniciar Partida
                    </button>
                    <a href="dashboard.php" class="btn btn-cancel">
                        <i class="fas fa-times me-2"></i>Cancelar
                    </a>
                </div>
            </form>
        </div>
    </div>

    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/js/bootstrap.bundle.min.js"></script>
    <script>
        // Validación
        document.getElementById('setupForm').addEventListener('submit', function(e) {
            const playerNames = document.querySelectorAll('input[name^="player_name_"]');
            let valid = true;
            
            playerNames.forEach(input => {
                if (input.value.trim() === '') {
                    valid = false;
                    input.classList.add('is-invalid');
                } else {
                    input.classList.remove('is-invalid');
                }
            });
            
            if (!valid) {
                e.preventDefault();
                alert('⚠️ Por favor, completa todos los nombres de jugadores');
            }
        });

        // Animación de entrada
        document.addEventListener('DOMContentLoaded', function() {
            const cards = document.querySelectorAll('.player-card');
            cards.forEach((card, index) => {
                card.style.opacity = '0';
                card.style.transform = 'translateY(20px)';
                setTimeout(() => {
                    card.style.transition = 'all 0.5s ease';
                    card.style.opacity = '1';
                    card.style.transform = 'translateY(0)';
                }, index * 100);
            });
        });
    </script>
</body>
</html>
