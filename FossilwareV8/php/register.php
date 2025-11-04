<?php
/**
 * Procesamiento de Registro de Usuarios
 * Draftosaurus - FossilWare
 */

require_once 'config.php';

// Verificar que se envió el formulario por POST
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    redirect('../registro.html?error=invalidrequest');
}

// Obtener y sanitizar datos del formulario
$username = sanitizeInput($_POST['username'] ?? '');
$email = sanitizeInput($_POST['email'] ?? '');
$password = $_POST['password'] ?? '';
$confirmPassword = $_POST['confirmPassword'] ?? '';

// Validar campos vacíos
if (empty($username) || empty($email) || empty($password) || empty($confirmPassword)) {
    redirect('../registro.html?error=emptyfields');
}

// Validar nombre de usuario
if (!isValidUsername($username)) {
    redirect('../registro.html?error=invalidusername');
}

// Validar email
if (!isValidEmail($email)) {
    redirect('../registro.html?error=invalidemail');
}

// Validar longitud de contraseña
if (strlen($password) < 6) {
    redirect('../registro.html?error=passwordtooshort');
}

// Validar coincidencia de contraseñas
if ($password !== $confirmPassword) {
    redirect('../registro.html?error=passwordsdontmatch');
}

// Procesar foto de perfil
$profilePic = 'default-avatar.png';

if (isset($_FILES['profilePic']) && $_FILES['profilePic']['error'] !== UPLOAD_ERR_NO_FILE) {
    if ($_FILES['profilePic']['error'] === UPLOAD_ERR_OK) {
        $file = $_FILES['profilePic'];
        
        // Validar tamaño
        if ($file['size'] > MAX_FILE_SIZE) {
            redirect('../registro.html?error=filetoobig');
        }
        
        // Obtener extensión del archivo
        $fileExtension = strtolower(pathinfo($file['name'], PATHINFO_EXTENSION));
        
        // Validar extensión
        if (!in_array($fileExtension, ALLOWED_EXTENSIONS)) {
            redirect('../registro.html?error=invalidfiletype');
        }
        
        // Generar nombre único para el archivo
        $newFileName = uniqid('profile_', true) . '.' . $fileExtension;
        $uploadPath = UPLOAD_DIR . $newFileName;
        
        // Mover archivo a directorio de uploads
        if (move_uploaded_file($file['tmp_name'], $uploadPath)) {
            $profilePic = $newFileName;
        } else {
            redirect('../registro.html?error=uploadfailed');
        }
    } else if ($_FILES['profilePic']['error'] !== UPLOAD_ERR_NO_FILE) {
        redirect('../registro.html?error=uploaderror');
    }
}

try {
    // Conectar a la base de datos
    $pdo = getDatabaseConnection();
    
    // Verificar si el nombre de usuario ya existe
    $stmt = $pdo->prepare("SELECT id FROM users WHERE username = ?");
    $stmt->execute([$username]);
    if ($stmt->fetch()) {
        // Si hay foto subida, eliminarla
        if ($profilePic !== 'default-avatar.png' && file_exists(UPLOAD_DIR . $profilePic)) {
            unlink(UPLOAD_DIR . $profilePic);
        }
        redirect('../registro.html?error=usertaken');
    }
    
    // Verificar si el email ya existe
    $stmt = $pdo->prepare("SELECT id FROM users WHERE email = ?");
    $stmt->execute([$email]);
    if ($stmt->fetch()) {
        // Si hay foto subida, eliminarla
        if ($profilePic !== 'default-avatar.png' && file_exists(UPLOAD_DIR . $profilePic)) {
            unlink(UPLOAD_DIR . $profilePic);
        }
        redirect('../registro.html?error=emailtaken');
    }
    
    // Hash de la contraseña
    $hashedPassword = hashPassword($password);
    
    // Insertar usuario en la base de datos
    $stmt = $pdo->prepare("
        INSERT INTO users (username, email, password, profile_pic, created_at) 
        VALUES (?, ?, ?, ?, NOW())
    ");
    
    $stmt->execute([$username, $email, $hashedPassword, $profilePic]);
    
    // Registro exitoso
    redirect('../inicio.html?success=registered');
    
} catch (PDOException $e) {
    // Si hay foto subida, eliminarla
    if ($profilePic !== 'default-avatar.png' && file_exists(UPLOAD_DIR . $profilePic)) {
        unlink(UPLOAD_DIR . $profilePic);
    }
    
    error_log("Error en registro: " . $e->getMessage());
    redirect('../registro.html?error=sqlerror');
}
?>