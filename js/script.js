// Función para mostrar alertas
function showAlert(message, type) {
    const alertContainer = document.getElementById('alertContainer');
    const alertDiv = document.createElement('div');
    alertDiv.className = `alert alert-${type} alert-dismissible fade show`;
    alertDiv.role = 'alert';
    alertDiv.innerHTML = `
        ${message}
        <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
    `;
    alertContainer.appendChild(alertDiv);
    
    // Auto-cerrar después de 5 segundos
    setTimeout(() => {
        alertDiv.remove();
    }, 5000);
}

// Toggle password visibility
document.addEventListener('DOMContentLoaded', function() {
    
    // Toggle para mostrar/ocultar contraseña
    const togglePassword = document.getElementById('togglePassword');
    if (togglePassword) {
        togglePassword.addEventListener('click', function() {
            const passwordInput = document.getElementById('password');
            const icon = this.querySelector('i');
            
            if (passwordInput.type === 'password') {
                passwordInput.type = 'text';
                icon.classList.remove('fa-eye');
                icon.classList.add('fa-eye-slash');
            } else {
                passwordInput.type = 'password';
                icon.classList.remove('fa-eye-slash');
                icon.classList.add('fa-eye');
            }
        });
    }
    
    // Toggle para confirmar contraseña
    const toggleConfirmPassword = document.getElementById('toggleConfirmPassword');
    if (toggleConfirmPassword) {
        toggleConfirmPassword.addEventListener('click', function() {
            const confirmPasswordInput = document.getElementById('confirmPassword');
            const icon = this.querySelector('i');
            
            if (confirmPasswordInput.type === 'password') {
                confirmPasswordInput.type = 'text';
                icon.classList.remove('fa-eye');
                icon.classList.add('fa-eye-slash');
            } else {
                confirmPasswordInput.type = 'password';
                icon.classList.remove('fa-eye-slash');
                icon.classList.add('fa-eye');
            }
        });
    }
    
    // Preview de imagen de perfil
    const profilePicInput = document.getElementById('profilePic');
    if (profilePicInput) {
        profilePicInput.addEventListener('change', function(e) {
            const file = e.target.files[0];
            if (file) {
                // Validar tamaño (máximo 5MB)
                if (file.size > 5 * 1024 * 1024) {
                    showAlert('La imagen es demasiado grande. Máximo 5MB.', 'danger');
                    this.value = '';
                    return;
                }
                
                // Validar tipo
                if (!file.type.match('image.*')) {
                    showAlert('Por favor selecciona una imagen válida.', 'danger');
                    this.value = '';
                    return;
                }
                
                const reader = new FileReader();
                reader.onload = function(e) {
                    document.getElementById('profilePreview').src = e.target.result;
                };
                reader.readAsDataURL(file);
            }
        });
    }
    
    // Validación del formulario de registro
    const registerForm = document.getElementById('registerForm');
    if (registerForm) {
        registerForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const username = document.getElementById('username').value.trim();
            const email = document.getElementById('email').value.trim();
            const password = document.getElementById('password').value;
            const confirmPassword = document.getElementById('confirmPassword').value;
            const terms = document.getElementById('terms').checked;
            
            // Validar nombre de usuario
            if (username.length < 3 || username.length > 20) {
                showAlert('El nombre de usuario debe tener entre 3 y 20 caracteres.', 'danger');
                return;
            }
            
            if (!/^[a-zA-Z0-9_]+$/.test(username)) {
                showAlert('El nombre de usuario solo puede contener letras, números y guiones bajos.', 'danger');
                return;
            }
            
            // Validar email
            if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
                showAlert('Por favor ingresa un email válido.', 'danger');
                return;
            }
            
            // Validar contraseña
            if (password.length < 6) {
                showAlert('La contraseña debe tener al menos 6 caracteres.', 'danger');
                return;
            }
            
            // Validar coincidencia de contraseñas
            if (password !== confirmPassword) {
                showAlert('Las contraseñas no coinciden.', 'danger');
                return;
            }
            
            // Validar términos
            if (!terms) {
                showAlert('Debes aceptar los términos y condiciones.', 'danger');
                return;
            }
            
            // Si todo está bien, enviar el formulario
            this.submit();
        });
    }
    
    // Validación del formulario de login
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const username = document.getElementById('username').value.trim();
            const password = document.getElementById('password').value;
            
            if (!username || !password) {
                showAlert('Por favor completa todos los campos.', 'danger');
                return;
            }
            
            if (username.length < 3) {
                showAlert('Usuario o email inválido.', 'danger');
                return;
            }
            
            if (password.length < 6) {
                showAlert('Contraseña inválida.', 'danger');
                return;
            }
            
            // Si todo está bien, enviar el formulario
            this.submit();
        });
    }
    
    // Validación en tiempo real del nombre de usuario
    const usernameInput = document.getElementById('username');
    if (usernameInput && registerForm) {
        usernameInput.addEventListener('input', function() {
            const value = this.value;
            if (value && !/^[a-zA-Z0-9_]+$/.test(value)) {
                this.setCustomValidity('Solo se permiten letras, números y guiones bajos');
            } else {
                this.setCustomValidity('');
            }
        });
    }
    
    // Validación en tiempo real de coincidencia de contraseñas
    const confirmPasswordInput = document.getElementById('confirmPassword');
    const passwordInput = document.getElementById('password');
    if (confirmPasswordInput && passwordInput) {
        confirmPasswordInput.addEventListener('input', function() {
            if (this.value !== passwordInput.value) {
                this.setCustomValidity('Las contraseñas no coinciden');
            } else {
                this.setCustomValidity('');
            }
        });
        
        passwordInput.addEventListener('input', function() {
            if (confirmPasswordInput.value && confirmPasswordInput.value !== this.value) {
                confirmPasswordInput.setCustomValidity('Las contraseñas no coinciden');
            } else {
                confirmPasswordInput.setCustomValidity('');
            }
        });
    }
});

// Función para obtener parámetros de URL (para mensajes de éxito/error)
function getURLParameter(name) {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get(name);
}

// Mostrar mensajes de la URL al cargar la página
window.addEventListener('load', function() {
    const error = getURLParameter('error');
    const success = getURLParameter('success');
    
    if (error) {
        let message = '';
        switch(error) {
            case 'emptyfields':
                message = 'Por favor completa todos los campos.';
                break;
            case 'invalidusername':
                message = 'Nombre de usuario inválido.';
                break;
            case 'invalidemail':
                message = 'Email inválido.';
                break;
            case 'passwordsdontmatch':
                message = 'Las contraseñas no coinciden.';
                break;
            case 'usertaken':
                message = 'Ese nombre de usuario ya está en uso.';
                break;
            case 'emailtaken':
                message = 'Ese email ya está registrado.';
                break;
            case 'sqlerror':
                message = 'Error en el servidor. Por favor intenta más tarde.';
                break;
            case 'uploadfailed':
                message = 'Error al subir la imagen. Intenta nuevamente.';
                break;
            case 'wrongpassword':
                message = 'Contraseña incorrecta.';
                break;
            case 'nouser':
                message = 'Usuario no encontrado.';
                break;
            case 'notloggedin':
                message = 'Por favor inicia sesión para continuar.';
                break;
            default:
                message = 'Ocurrió un error. Por favor intenta nuevamente.';
        }
        showAlert(message, 'danger');
    }
    
    if (success) {
        let message = '';
        switch(success) {
            case 'registered':
                message = '¡Registro exitoso! Por favor inicia sesión.';
                break;
            case 'loggedout':
                message = 'Sesión cerrada correctamente.';
                break;
            default:
                message = 'Operación exitosa.';
        }
        showAlert(message, 'success');
    }
});