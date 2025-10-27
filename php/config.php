<?php
/**
 * Configuración de Base de Datos - Draftosaurus FossilWare
 * Ubuntu 24.04 LTS + phpMyAdmin
 */

// Definir constantes de conexión
define('DB_HOST', 'localhost');
define('DB_USER', 'root');  // Cambiar según tu configuración
define('DB_PASS', '');      // Cambiar según tu configuración
define('DB_NAME', 'draftosaurus_db');
define('DB_CHARSET', 'utf8mb4');

// Configuración de zona horaria
date_default_timezone_set('America/Montevideo');

// Configuración de sesiones
ini_set('session.cookie_httponly', 1);
ini_set('session.use_only_cookies', 1);
ini_set('session.cookie_secure', 0); // Cambiar a 1 si usas HTTPS

// Iniciar sesión si no está iniciada
if (session_status() === PHP_SESSION_NONE) {
    session_start();
}

// Función para conectar a la base de datos
function getDatabaseConnection() {
    try {
        $dsn = "mysql:host=" . DB_HOST . ";dbname=" . DB_NAME . ";charset=" . DB_CHARSET;
        $options = [
            PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
            PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
            PDO::ATTR_EMULATE_PREPARES => false,
        ];
        
        $pdo = new PDO($dsn, DB_USER, DB_PASS, $options);
        return $pdo;
        
    } catch (PDOException $e) {
        // En producción, registrar el error en un log en lugar de mostrarlo
        error_log("Error de conexión a la base de datos: " . $e->getMessage());
        die("Error de conexión a la base de datos. Por favor contacta al administrador.");
    }
}

// Función para sanitizar datos de entrada
function sanitizeInput($data) {
    $data = trim($data);
    $data = stripslashes($data);
    $data = htmlspecialchars($data, ENT_QUOTES, 'UTF-8');
    return $data;
}

// Función para validar email
function isValidEmail($email) {
    return filter_var($email, FILTER_VALIDATE_EMAIL) !== false;
}

// Función para validar nombre de usuario
function isValidUsername($username) {
    // Solo letras, números y guiones bajos, entre 3 y 20 caracteres
    return preg_match('/^[a-zA-Z0-9_]{3,20}$/', $username);
}

// Función para generar hash seguro de contraseña
function hashPassword($password) {
    return password_hash($password, PASSWORD_DEFAULT);
}

// Función para verificar contraseña
function verifyPassword($password, $hash) {
    return password_verify($password, $hash);
}

// Función para redirigir
function redirect($url) {
    header("Location: " . $url);
    exit();
}

// Función para verificar si el usuario está logueado
function isLoggedIn() {
    return isset($_SESSION['user_id']) && !empty($_SESSION['user_id']);
}

// Función para obtener datos del usuario logueado
function getCurrentUser() {
    if (!isLoggedIn()) {
        return null;
    }
    
    try {
        $pdo = getDatabaseConnection();
        $stmt = $pdo->prepare("SELECT id, username, email, profile_pic, created_at FROM users WHERE id = ?");
        $stmt->execute([$_SESSION['user_id']]);
        return $stmt->fetch();
    } catch (PDOException $e) {
        error_log("Error al obtener usuario actual: " . $e->getMessage());
        return null;
    }
}

// Configuración de upload de archivos
define('UPLOAD_DIR', '../uploads/profiles/');
define('MAX_FILE_SIZE', 5242880); // 5MB en bytes
define('ALLOWED_EXTENSIONS', ['jpg', 'jpeg', 'png', 'gif']);

// Crear directorio de uploads si no existe
if (!file_exists(UPLOAD_DIR)) {
    mkdir(UPLOAD_DIR, 0755, true);
}
?>