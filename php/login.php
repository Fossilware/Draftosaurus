<?php
/**
 * Procesamiento de Inicio de Sesión
 * Draftosaurus - FossilWare
 */

require_once 'config.php';

// Verificar que se envió el formulario por POST
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    redirect('../inicio.html?error=invalidrequest');
}

// Obtener y sanitizar datos del formulario
$username = sanitizeInput($_POST['username'] ?? '');
$password = $_POST['password'] ?? '';
$remember = isset($_POST['remember']);

// Validar campos vacíos
if (empty($username) || empty($password)) {
    redirect('../inicio.html?error=emptyfields');
}

try {
    // Conectar a la base de datos
    $pdo = getDatabaseConnection();
    
    // Buscar usuario por nombre de usuario o email
    $stmt = $pdo->prepare("
        SELECT id, username, email, password, profile_pic 
        FROM users 
        WHERE username = ? OR email = ?
    ");
    $stmt->execute([$username, $username]);
    $user = $stmt->fetch();
    
    // Verificar si el usuario existe
    if (!$user) {
        redirect('../inicio.html?error=nouser');
    }
    
    // Verificar contraseña
    if (!verifyPassword($password, $user['password'])) {
        redirect('../inicio.html?error=wrongpassword');
    }
    
    // Login exitoso - crear sesión
    session_regenerate_id(true); // Regenerar ID de sesión por seguridad
    
    $_SESSION['user_id'] = $user['id'];
    $_SESSION['username'] = $user['username'];
    $_SESSION['email'] = $user['email'];
    $_SESSION['profile_pic'] = $user['profile_pic'];
    $_SESSION['logged_in'] = true;
    $_SESSION['login_time'] = time();
    
    // Si se marcó "Recordarme", crear cookie de sesión más larga
    if ($remember) {
        // Cookie válida por 30 días
        $cookieLifetime = 30 * 24 * 60 * 60;
        setcookie(
            session_name(), 
            session_id(), 
            time() + $cookieLifetime, 
            '/', 
            '', 
            false, // Cambiar a true si usas HTTPS
            true   // HttpOnly
        );
    }
    
    // Actualizar último login
    $stmt = $pdo->prepare("UPDATE users SET last_login = NOW() WHERE id = ?");
    $stmt->execute([$user['id']]);
    
    // Redirigir al dashboard o página principal del juego
    redirect('../dashboard.php?success=loggedin');
    
} catch (PDOException $e) {
    error_log("Error en login: " . $e->getMessage());
    redirect('../inicio.html?error=sqlerror');
}
?>