<?php
/**
 * Procesar actualización de perfil de usuario
 * Draftosaurus - FossilWare
 */

require_once 'config.php';

// Verificar que el usuario esté logueado
if (!isLoggedIn()) {
    redirect('../inicio.html?error=notloggedin');
}

// Verificar que sea una petición POST
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    redirect('../configuracion.php?error=invalid_request');
}

$currentUser = getCurrentUser();
$userId = $currentUser['id'];

// Obtener datos del formulario
$newUsername = trim($_POST['username'] ?? '');

// Validar nombre de usuario
if (empty($newUsername)) {
    redirect('../configuracion.php?error=username_required');
}

if (strlen($newUsername) < 3 || strlen($newUsername) > 30) {
    redirect('../configuracion.php?error=username_length');
}

if (!preg_match('/^[a-zA-Z0-9_]+$/', $newUsername)) {
    redirect('../configuracion.php?error=username_invalid');
}

try {
    $pdo = getDatabaseConnection();
    
    // Verificar si el username ya existe (excepto el actual)
    if ($newUsername !== $currentUser['username']) {
        $stmt = $pdo->prepare("SELECT id FROM users WHERE username = ? AND id != ?");
        $stmt->execute([$newUsername, $userId]);
        if ($stmt->fetch()) {
            redirect('../configuracion.php?error=username_taken');
        }
    }
    
    // Procesar foto de perfil si se subió
    $profilePic = $currentUser['profile_pic'];
    
    if (isset($_FILES['profile_pic']) && $_FILES['profile_pic']['error'] === UPLOAD_ERR_OK) {
        $file = $_FILES['profile_pic'];
        
        // Validar tipo de archivo
        $allowedTypes = ['image/jpeg', 'image/png', 'image/jpg', 'image/gif'];
        $finfo = finfo_open(FILEINFO_MIME_TYPE);
        $mimeType = finfo_file($finfo, $file['tmp_name']);
        finfo_close($finfo);
        
        if (!in_array($mimeType, $allowedTypes)) {
            redirect('../configuracion.php?error=invalid_format');
        }
        
        // Validar tamaño (máx 5MB)
        if ($file['size'] > 5 * 1024 * 1024) {
            redirect('../configuracion.php?error=file_too_large');
        }
        
        // Crear directorio si no existe
        $uploadDir = '../uploads/profiles/';
        if (!file_exists($uploadDir)) {
            mkdir($uploadDir, 0777, true);
        }
        
        // Generar nombre único
        $extension = pathinfo($file['name'], PATHINFO_EXTENSION);
        $filename = 'profile_' . $userId . '_' . time() . '.' . $extension;
        $uploadPath = $uploadDir . $filename;
        
        // Mover archivo
        if (move_uploaded_file($file['tmp_name'], $uploadPath)) {
            // Eliminar foto anterior si no es la default
            if ($profilePic !== 'default-avatar.png' && file_exists($uploadDir . $profilePic)) {
                unlink($uploadDir . $profilePic);
            }
            $profilePic = $filename;
        } else {
            redirect('../configuracion.php?error=upload_failed');
        }
    }
    
    // Actualizar base de datos
    $stmt = $pdo->prepare("
        UPDATE users 
        SET username = ?, profile_pic = ?, updated_at = NOW()
        WHERE id = ?
    ");
    $stmt->execute([$newUsername, $profilePic, $userId]);
    
    // Actualizar sesión
    $_SESSION['user']['username'] = $newUsername;
    $_SESSION['user']['profile_pic'] = $profilePic;
    
    redirect('../configuracion.php?success=profile_updated');
    
} catch (PDOException $e) {
    error_log("Error updating profile: " . $e->getMessage());
    redirect('../configuracion.php?error=database_error');
}
?>