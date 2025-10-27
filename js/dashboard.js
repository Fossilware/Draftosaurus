/**
 * Dashboard JavaScript - Draftosaurus FossilWare
 */

// Función para iniciar el modo de juego regular
function startRegularGame() {
    const numPlayers = document.getElementById('playersRegular').value;
    
    // Confirmación antes de iniciar
    const confirmation = confirm(`¿Iniciar una nueva partida en Modo Regular con ${numPlayers} jugadores?`);
    
    if (confirmation) {
        // Mostrar loading
        showLoading('Preparando el juego...');
        
        // Redirigir al modo de juego regular
        setTimeout(() => {
            window.location.href = `game-regular.php?players=${numPlayers}`;
        }, 1000);
    }
}

// Función para iniciar el modo de seguimiento
function startTrackingGame() {
    const numPlayers = document.getElementById('playersTracking').value;
    
    // Confirmación antes de iniciar
    const confirmation = confirm(`¿Iniciar seguimiento de partida con ${numPlayers} jugadores?`);
    
    if (confirmation) {
        // Mostrar loading
        showLoading('Configurando el seguimiento...');
        
        // Redirigir al modo de seguimiento
        setTimeout(() => {
            window.location.href = `game-tracking.php?players=${numPlayers}`;
        }, 1000);
    }
}

// Función para mostrar mensaje de carga
function showLoading(message) {
    const loadingDiv = document.createElement('div');
    loadingDiv.id = 'loadingOverlay';
    loadingDiv.innerHTML = `
        <div style="
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(45, 80, 22, 0.9);
            display: flex;
            flex-direction: column;
            justify-content: center;
            align-items: center;
            z-index: 9999;
            color: white;
        ">
            <div class="spinner-border text-light mb-3" role="status" style="width: 4rem; height: 4rem;">
                <span class="visually-hidden">Cargando...</span>
            </div>
            <h3>${message}</h3>
            <p>Por favor espera un momento</p>
        </div>
    `;
    document.body.appendChild(loadingDiv);
}

// Animaciones al cargar la página
document.addEventListener('DOMContentLoaded', function() {
    
    // Animar las tarjetas de estadísticas
    const statCards = document.querySelectorAll('.stat-card');
    statCards.forEach((card, index) => {
        card.style.opacity = '0';
        card.style.transform = 'translateY(20px)';
        
        setTimeout(() => {
            card.style.transition = 'all 0.5s ease';
            card.style.opacity = '1';
            card.style.transform = 'translateY(0)';
        }, 100 * (index + 1));
    });
    
    // Animar las tarjetas de modo de juego
    const modeCards = document.querySelectorAll('.game-mode-card');
    modeCards.forEach((card, index) => {
        card.style.opacity = '0';
        card.style.transform = 'translateY(30px)';
        
        setTimeout(() => {
            card.style.transition = 'all 0.6s ease';
            card.style.opacity = '1';
            card.style.transform = 'translateY(0)';
        }, 200 * (index + 1));
    });
    
    // Tooltip de Bootstrap
    const tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'));
    tooltipTriggerList.map(function (tooltipTriggerEl) {
        return new bootstrap.Tooltip(tooltipTriggerEl);
    });
    
    // Verificar si hay mensajes en la URL
    const urlParams = new URLSearchParams(window.location.search);
    const success = urlParams.get('success');
    const error = urlParams.get('error');
    
    if (success === 'loggedin') {
        showNotification('¡Bienvenido! Has iniciado sesión correctamente.', 'success');
        // Limpiar URL
        window.history.replaceState({}, document.title, window.location.pathname);
    }
    
    if (error) {
        let message = 'Ha ocurrido un error.';
        switch(error) {
            case 'notloggedin':
                message = 'Debes iniciar sesión para acceder.';
                break;
            case 'sessionexpired':
                message = 'Tu sesión ha expirado. Por favor inicia sesión nuevamente.';
                break;
        }
        showNotification(message, 'danger');
        // Limpiar URL
        window.history.replaceState({}, document.title, window.location.pathname);
    }
});

// Función para mostrar notificaciones
function showNotification(message, type = 'info') {
    const alertDiv = document.createElement('div');
    alertDiv.className = `alert alert-${type} alert-dismissible fade show notification-toast`;
    alertDiv.role = 'alert';
    alertDiv.style.cssText = `
        position: fixed;
        top: 80px;
        right: 20px;
        z-index: 9999;
        min-width: 300px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        animation: slideInRight 0.5s ease;
    `;
    alertDiv.innerHTML = `
        ${message}
        <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
    `;
    
    document.body.appendChild(alertDiv);
    
    // Auto-cerrar después de 5 segundos
    setTimeout(() => {
        alertDiv.classList.remove('show');
        setTimeout(() => alertDiv.remove(), 150);
    }, 5000);
}

// Agregar estilos para la animación de notificación
const style = document.createElement('style');
style.textContent = `
    @keyframes slideInRight {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
`;
document.head.appendChild(style);

// Función para actualizar el contador de jugadores en tiempo real
document.addEventListener('DOMContentLoaded', function() {
    const selectRegular = document.getElementById('playersRegular');
    const selectTracking = document.getElementById('playersTracking');
    
    if (selectRegular) {
        selectRegular.addEventListener('change', function() {
            console.log(`Modo Regular: ${this.value} jugadores seleccionados`);
        });
    }
    
    if (selectTracking) {
        selectTracking.addEventListener('change', function() {
            console.log(`Modo Seguimiento: ${this.value} jugadores seleccionados`);
        });
    }
});

// Función de ayuda para debugging
function logGameStart(mode, players) {
    console.log(`
        ========================================
        🦕 DRAFTOSAURUS - FOSSILWARE
        ========================================
        Modo: ${mode}
        Jugadores: ${players}
        Fecha: ${new Date().toLocaleString('es-ES')}
        ========================================
    `);
}

// Manejar el botón de volver en el navegador
window.addEventListener('popstate', function(event) {
    // Limpiar cualquier overlay de carga
    const overlay = document.getElementById('loadingOverlay');
    if (overlay) {
        overlay.remove();
    }
});

// Prevenir múltiples clics en los botones de inicio
let gameStarting = false;

function startRegularGame() {
    if (gameStarting) return;
    gameStarting = true;
    
    const numPlayers = document.getElementById('playersRegular').value;
    logGameStart('Regular', numPlayers);
    
    const confirmation = confirm(`¿Iniciar una nueva partida en Modo Regular con ${numPlayers} jugadores?\n\n` +
        `El modo regular es un juego completo digitalizado donde podrás jugar directamente desde el navegador.`);
    
    if (confirmation) {
        showLoading('Preparando el juego...');
        setTimeout(() => {
            window.location.href = `game-regular.php?players=${numPlayers}`;
        }, 1000);
    } else {
        gameStarting = false;
    }
}

function startTrackingGame() {
    if (gameStarting) return;
    gameStarting = true;
    
    const numPlayers = document.getElementById('playersTracking').value;
    logGameStart('Seguimiento', numPlayers);
    
    const confirmation = confirm(`¿Iniciar seguimiento de partida con ${numPlayers} jugadores?\n\n` +
        `El modo seguimiento te ayudará a registrar una partida física del juego y calculará automáticamente los puntos.`);
    
    if (confirmation) {
        showLoading('Configurando el seguimiento...');
        setTimeout(() => {
            window.location.href = `game-tracking.php?players=${numPlayers}`;
        }, 1000);
    } else {
        gameStarting = false;
    }
}

// Easter egg: Konami Code
let konamiCode = ['ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight', 'b', 'a'];
let konamiIndex = 0;

document.addEventListener('keydown', function(e) {
    if (e.key === konamiCode[konamiIndex]) {
        konamiIndex++;
        if (konamiIndex === konamiCode.length) {
            activateEasterEgg();
            konamiIndex = 0;
        }
    } else {
        konamiIndex = 0;
    }
});

function activateEasterEgg() {
    showNotification('🦖 ¡Has desbloqueado el modo T-Rex! (Próximamente)', 'warning');
    console.log('🦖 Easter Egg activado! Felicidades, eres un verdadero paleontólogo.');
}

// Funciones de utilidad para futuras implementaciones
const GameUtils = {
    // Obtener datos del usuario actual
    getCurrentUser: function() {
        // Esta función se puede expandir para obtener más datos del usuario
        return {
            username: document.querySelector('.navbar-brand + div span')?.textContent || 'Usuario'
        };
    },
    
    // Formatear fecha
    formatDate: function(date) {
        return new Date(date).toLocaleDateString('es-ES', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    },
    
    // Validar número de jugadores
    validatePlayerCount: function(count) {
        return count >= 2 && count <= 5;
    }
};

// Exportar funciones para uso global
window.startRegularGame = startRegularGame;
window.startTrackingGame = startTrackingGame;
window.showNotification = showNotification;
window.GameUtils = GameUtils;