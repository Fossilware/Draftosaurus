-- ============================================
-- Base de Datos: Draftosaurus - FossilWare
-- Ubuntu 24.04 LTS + MySQL + phpMyAdmin
-- ============================================

-- Crear base de datos si no existe
CREATE DATABASE IF NOT EXISTS draftosaurus_db 
CHARACTER SET utf8mb4 
COLLATE utf8mb4_unicode_ci;

-- Usar la base de datos
USE draftosaurus_db;

-- ============================================
-- Tabla: users
-- Almacena información de usuarios registrados
-- ============================================
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(20) NOT NULL UNIQUE,
    email VARCHAR(100) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    profile_pic VARCHAR(255) DEFAULT 'default-avatar.png',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_login TIMESTAMP NULL,
    is_active TINYINT(1) DEFAULT 1,
    INDEX idx_username (username),
    INDEX idx_email (email)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- Tabla: game_sessions
-- Registra las partidas jugadas
-- ============================================
CREATE TABLE IF NOT EXISTS game_sessions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    session_code VARCHAR(20) UNIQUE NOT NULL,
    game_mode ENUM('regular', 'tracking') NOT NULL,
    status ENUM('waiting', 'in_progress', 'finished') DEFAULT 'waiting',
    created_by INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    started_at TIMESTAMP NULL,
    finished_at TIMESTAMP NULL,
    winner_id INT NULL,
    FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (winner_id) REFERENCES users(id) ON DELETE SET NULL,
    INDEX idx_session_code (session_code),
    INDEX idx_created_by (created_by),
    INDEX idx_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- Tabla: game_players
-- Jugadores participantes en cada partida
-- ============================================
CREATE TABLE IF NOT EXISTS game_players (
    id INT AUTO_INCREMENT PRIMARY KEY,
    session_id INT NOT NULL,
    user_id INT NOT NULL,
    player_position TINYINT NOT NULL,
    score INT DEFAULT 0,
    joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (session_id) REFERENCES game_sessions(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE KEY unique_player_session (session_id, user_id),
    INDEX idx_session_id (session_id),
    INDEX idx_user_id (user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- Tabla: user_statistics
-- Estadísticas generales de cada usuario
-- ============================================
CREATE TABLE IF NOT EXISTS user_statistics (
    user_id INT PRIMARY KEY,
    total_games INT DEFAULT 0,
    games_won INT DEFAULT 0,
    games_lost INT DEFAULT 0,
    highest_score INT DEFAULT 0,
    total_score INT DEFAULT 0,
    average_score DECIMAL(10,2) DEFAULT 0.00,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- Tabla: dinosaur_placements
-- Registro de colocación de dinosaurios (modo tracking)
-- ============================================
CREATE TABLE IF NOT EXISTS dinosaur_placements (
    id INT AUTO_INCREMENT PRIMARY KEY,
    session_id INT NOT NULL,
    user_id INT NOT NULL,
    dinosaur_type VARCHAR(50) NOT NULL,
    zone_position VARCHAR(20) NOT NULL,
    round_number TINYINT NOT NULL,
    points_earned INT DEFAULT 0,
    placed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (session_id) REFERENCES game_sessions(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_session_id (session_id),
    INDEX idx_user_id (user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- Tabla: game_moves
-- Registro de movimientos en el juego
-- ============================================
CREATE TABLE IF NOT EXISTS game_moves (
    id INT AUTO_INCREMENT PRIMARY KEY,
    session_id INT NOT NULL,
    user_id INT NOT NULL,
    move_number INT NOT NULL,
    move_data JSON NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (session_id) REFERENCES game_sessions(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_session_id (session_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- Tabla: achievements
-- Logros disponibles en el juego
-- ============================================
CREATE TABLE IF NOT EXISTS achievements (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    icon VARCHAR(255),
    requirement_type VARCHAR(50) NOT NULL,
    requirement_value INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- Tabla: user_achievements
-- Logros obtenidos por cada usuario
-- ============================================
CREATE TABLE IF NOT EXISTS user_achievements (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    achievement_id INT NOT NULL,
    unlocked_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (achievement_id) REFERENCES achievements(id) ON DELETE CASCADE,
    UNIQUE KEY unique_user_achievement (user_id, achievement_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- Insertar datos iniciales
-- ============================================

-- Insertar logros básicos
INSERT INTO achievements (name, description, icon, requirement_type, requirement_value) VALUES
('Primer Paso', 'Completa tu primera partida', 'first_game.png', 'games_played', 1),
('Aficionado', 'Juega 10 partidas', 'amateur.png', 'games_played', 10),
('Experto', 'Juega 50 partidas', 'expert.png', 'games_played', 50),
('Victoria Inicial', 'Gana tu primera partida', 'first_win.png', 'games_won', 1),
('Racha Ganadora', 'Gana 5 partidas consecutivas', 'winning_streak.png', 'consecutive_wins', 5),
('Máximo Puntaje', 'Alcanza 100 puntos en una partida', 'high_score.png', 'single_score', 100),
('Coleccionista', 'Usa todos los tipos de dinosaurios', 'collector.png', 'dinosaur_types', 15);

-- ============================================
-- Vistas útiles
-- ============================================

-- Vista: Ranking de jugadores
CREATE OR REPLACE VIEW player_rankings AS
SELECT 
    u.id,
    u.username,
    u.profile_pic,
    s.total_games,
    s.games_won,
    s.games_lost,
    s.highest_score,
    s.average_score,
    ROUND((s.games_won / NULLIF(s.total_games, 0) * 100), 2) as win_rate
FROM users u
LEFT JOIN user_statistics s ON u.id = s.user_id
WHERE u.is_active = 1
ORDER BY s.games_won DESC, s.average_score DESC;

-- Vista: Últimas partidas
CREATE OR REPLACE VIEW recent_games AS
SELECT 
    gs.id,
    gs.session_code,
    gs.game_mode,
    gs.status,
    gs.created_at,
    gs.finished_at,
    u.username as creator_name,
    w.username as winner_name,
    COUNT(gp.id) as total_players
FROM game_sessions gs
LEFT JOIN users u ON gs.created_by = u.id
LEFT JOIN users w ON gs.winner_id = w.id
LEFT JOIN game_players gp ON gs.id = gp.session_id
GROUP BY gs.id
ORDER BY gs.created_at DESC;

-- ============================================
-- Procedimientos almacenados
-- ============================================

DELIMITER //

-- Procedimiento: Actualizar estadísticas de usuario
CREATE PROCEDURE update_user_statistics(IN p_user_id INT)
BEGIN
    INSERT INTO user_statistics (user_id, total_games, games_won, games_lost, highest_score, total_score, average_score)
    SELECT 
        p_user_id,
        COUNT(*) as total_games,
        SUM(CASE WHEN gs.winner_id = p_user_id THEN 1 ELSE 0 END) as games_won,
        SUM(CASE WHEN gs.winner_id != p_user_id AND gs.status = 'finished' THEN 1 ELSE 0 END) as games_lost,
        MAX(gp.score) as highest_score,
        SUM(gp.score) as total_score,
        AVG(gp.score) as average_score
    FROM game_players gp
    JOIN game_sessions gs ON gp.session_id = gs.id
    WHERE gp.user_id = p_user_id AND gs.status = 'finished'
    ON DUPLICATE KEY UPDATE
        total_games = VALUES(total_games),
        games_won = VALUES(games_won),
        games_lost = VALUES(games_lost),
        highest_score = VALUES(highest_score),
        total_score = VALUES(total_score),
        average_score = VALUES(average_score);
END //

DELIMITER ;

-- ============================================
-- Triggers
-- ============================================

DELIMITER //

-- Trigger: Crear estadísticas al registrar usuario
CREATE TRIGGER create_user_statistics 
AFTER INSERT ON users
FOR EACH ROW
BEGIN
    INSERT INTO user_statistics (user_id) VALUES (NEW.id);
END //

-- Trigger: Actualizar estadísticas al finalizar partida
CREATE TRIGGER update_stats_after_game
AFTER UPDATE ON game_sessions
FOR EACH ROW
BEGIN
    IF NEW.status = 'finished' AND OLD.status != 'finished' THEN
        -- Actualizar estadísticas de todos los jugadores de la partida
        UPDATE user_statistics us
        INNER JOIN game_players gp ON us.user_id = gp.user_id
        SET us.total_games = us.total_games + 1
        WHERE gp.session_id = NEW.id;
        
        -- Actualizar victorias del ganador si hay uno
        IF NEW.winner_id IS NOT NULL THEN
            UPDATE user_statistics 
            SET games_won = games_won + 1 
            WHERE user_id = NEW.winner_id;
        END IF;
    END IF;
END //

DELIMITER ;

-- ============================================
-- Fin del script
-- ============================================