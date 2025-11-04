<?php
/**
 * Cerrar Sesión
 * Draftosaurus - FossilWare
 */

require_once 'config.php';

// Eliminar todas las variables de sesión
$_SESSION = array();

// Eliminar la cookie de sesión si existe
if (isset($_COOKIE[session_name()])) {
    setcookie(session_name(), '', time() - 3600, '/');
}

// Destruir la sesión
session_destroy();

// Redirigir al inicio
redirect('../index.html?success=loggedout');
?>