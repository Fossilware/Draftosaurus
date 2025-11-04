/**
 * Game Setup JavaScript - Draftosaurus FossilWare
 */

document.addEventListener('DOMContentLoaded', function() {
    
    // Validación del formulario de configuración
    const setupForm = document.getElementById('setupForm');
    
    if (setupForm) {
        setupForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            // Validar nombres de jugadores
            const playerInputs = setupForm.querySelectorAll('input[name^="player_name_"]');
            const playerNames = [];
            let isValid = true;
            
            playerInputs.forEach(input => {
                const name = input.value.trim();
                
                if (name === '') {
                    showAlert('Todos los jugadores deben tener un nombre', 'danger');
                    isValid = false;
                    return;
                }
                
                if (playerNames.includes(name)) {
                    showAlert(`El nombre "${name}" está duplicado. Cada jugador debe tener un nombre único.`, 'danger');
                    isValid = false;
                    return;
                }
                
                playerNames.push(name);
            });
            
            if (!isValid) return;
            
            // Mostrar confirmación
            const numPlayers = playerInputs.length;
            const confirmation = confirm(
                `¿Iniciar partida con los siguientes jugadores?\n\n${playerNames.join('\n')}\n\n` +
                `Total: ${numPlayers} jugadores`
            );
            
            if (confirmation) {
                showLoading('Iniciando partida...');
                // Enviar formulario
                setTimeout(() => {
                    setupForm.submit();
                }, 1000);
            }
        });
    }
    
    // Auto-focus en el primer campo de jugador vacío
    const firstEmptyInput = document.querySelector('input[name^="player_name_"]:not([value])');
    if (firstEmptyInput && firstEmptyInput.value === '') {
        firstEmptyInput.focus();
    }
    
    // Prevenir nombres duplicados en tiempo real
    const playerNameInputs = document.querySelectorAll('input[name^="player_name_"]');
    playerNameInputs.forEach(input => {
        input.addEventListener('blur', function() {
            validateDuplicateNames();
        });
    });
    
    // Cambiar el tipo de jugador (Humano/CPU) en modo regular
    const playerTypeSelects = document.querySelectorAll('select[name^="player_type_"]');
    playerTypeSelects.forEach(select => {
        select.addEventListener('change', function() {
            const row = this.closest('.player-setup-card');
            const nameInput = row.querySelector('input[name^="player_name_"]');
            
            if (this.value === 'cpu') {
                const playerNumber = this.name.match(/\d+/)[0];
                nameInput.value = `CPU ${playerNumber}`;
                nameInput.readOnly = true;
                nameInput.style.backgroundColor = '#f0f0f0';
            } else {
                if (nameInput.value.startsWith('CPU')) {
                    nameInput.value = '';
                }
                nameInput.readOnly = false;
                nameInput.style.backgroundColor = '';
                nameInput.focus();
            }
        });
    });
    
    // Preview de colores
    const colorSelects = document.querySelectorAll('select[name^="player_color_"]');
    colorSelects.forEach(select => {
        addColorPreview(select);
        
        select.addEventListener('change', function() {
            updateColorPreview(select);
        });
    });
    
    // Tooltips informativos
    addTooltips();
});

// Función para validar nombres duplicados
function validateDuplicateNames() {
    const playerInputs = document.querySelectorAll('input[name^="player_name_"]');
    const names = [];
    let hasDuplicates = false;
    
    playerInputs.forEach(input => {
        const name = input.value.trim().toLowerCase();
        if (name && names.includes(name)) {
            input.style.borderColor = '#f44336';
            hasDuplicates = true;
        } else {
            input.style.borderColor = '';
        }
        if (name) names.push(name);
    });
    
    return !hasDuplicates;
}

// Función para agregar preview de color
function addColorPreview(select) {
    const colorValue = select.value;
    const colorIndicator = document.createElement('span');
    colorIndicator.className = `color-indicator color-${colorValue}`;
    colorIndicator.style.marginLeft = '10px';
    colorIndicator.style.verticalAlign = 'middle';
    
    select.parentNode.appendChild(colorIndicator);
}

// Función para actualizar preview de color
function updateColorPreview(select) {
    const colorIndicator = select.parentNode.querySelector('.color-indicator');
    if (colorIndicator) {
        colorIndicator.className = `color-indicator color-${select.value}`;
    }
}

// Función para mostrar alertas
function showAlert(message, type = 'info') {
    const alertDiv = document.createElement('div');
    alertDiv.className = `alert alert-${type} alert-dismissible fade show`;
    alertDiv.role = 'alert';
    alertDiv.style.cssText = `
        position: fixed;
        top: 80px;
        right: 20px;
        z-index: 9999;
        min-width: 300px;
        max-width: 500px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        animation: slideInRight 0.5s ease;
    `;
    alertDiv.innerHTML = `
        ${message}
        <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
    `;
    
    document.body.appendChild(alertDiv);
    
    setTimeout(() => {
        alertDiv.classList.remove('show');
        setTimeout(() => alertDiv.remove(), 150);
    }, 5000);
}

// Función para mostrar loading
function showLoading(message) {
    const loadingDiv = document.createElement('div');
    loadingDiv.className = 'loading-overlay';
    loadingDiv.innerHTML = `
        <div class="loading-spinner"></div>
        <h3 class="mt-4">${message}</h3>
        <p>Por favor espera un momento</p>
    `;
    document.body.appendChild(loadingDiv);
}

// Función para agregar tooltips
function addTooltips() {
    // Tooltip para el temporizador
    const timerCheckbox = document.getElementById('timerEnabled');
    if (timerCheckbox) {
        timerCheckbox.parentElement.title = 'Cada jugador tendrá 60 segundos para tomar su decisión';
    }
    
    // Tooltip para las sugerencias
    const hintsCheckbox = document.getElementById('hints');
    if (hintsCheckbox) {
        hintsCheckbox.parentElement.title = 'Resalta visualmente los recintos donde puedes colocar dinosaurios';
    }
    
    // Tooltip para animaciones
    const animationsCheckbox = document.getElementById('animations');
    if (animationsCheckbox) {
        animationsCheckbox.parentElement.title = 'Activa efectos visuales y transiciones suaves';
    }
}

// Validación de formulario en tiempo real
function setupRealTimeValidation() {
    const form = document.getElementById('setupForm');
    if (!form) return;
    
    const inputs = form.querySelectorAll('input[required]');
    inputs.forEach(input => {
        input.addEventListener('input', function() {
            if (this.value.trim() !== '') {
                this.classList.remove('is-invalid');
                this.classList.add('is-valid');
            } else {
                this.classList.remove('is-valid');
                this.classList.add('is-invalid');
            }
        });
    });
}

// Agregar animaciones a las tarjetas de jugador
document.addEventListener('DOMContentLoaded', function() {
    const playerCards = document.querySelectorAll('.player-setup-card');
    playerCards.forEach((card, index) => {
        card.style.opacity = '0';
        card.style.transform = 'translateY(20px)';
        
        setTimeout(() => {
            card.style.transition = 'all 0.5s ease';
            card.style.opacity = '1';
            card.style.transform = 'translateY(0)';
        }, 100 * (index + 1));
    });
});

// Función para generar nombres aleatorios de CPU
const cpuNames = [
    'T-Rex Alpha', 'Velociraptor Beta', 'Triceratops Gamma', 
    'Stegosaurus Delta', 'Brachiosaurus Epsilon'
];

function getRandomCPUName(index) {
    return cpuNames[index % cpuNames.length];
}

// Guardar configuración en localStorage para recordar preferencias
function savePreferences() {
    const preferences = {
        timerEnabled: document.getElementById('timerEnabled')?.checked || false,
        hints: document.getElementById('hints')?.checked || true,
        animations: document.getElementById('animations')?.checked || true,
        gameSpeed: document.querySelector('select[name="game_speed"]')?.value || 'normal',
        autoSave: document.getElementById('autoSave')?.checked || true,
        showRules: document.getElementById('showRules')?.checked || true
    };
    
    localStorage.setItem('draftosaurus_preferences', JSON.stringify(preferences));
}

// Cargar preferencias guardadas
function loadPreferences() {
    const saved = localStorage.getItem('draftosaurus_preferences');
    if (!saved) return;
    
    try {
        const preferences = JSON.parse(saved);
        
        if (document.getElementById('timerEnabled')) {
            document.getElementById('timerEnabled').checked = preferences.timerEnabled;
        }
        if (document.getElementById('hints')) {
            document.getElementById('hints').checked = preferences.hints;
        }
        if (document.getElementById('animations')) {
            document.getElementById('animations').checked = preferences.animations;
        }
        if (document.getElementById('autoSave')) {
            document.getElementById('autoSave').checked = preferences.autoSave;
        }
        if (document.getElementById('showRules')) {
            document.getElementById('showRules').checked = preferences.showRules;
        }
        if (document.querySelector('select[name="game_speed"]')) {
            document.querySelector('select[name="game_speed"]').value = preferences.gameSpeed;
        }
    } catch (e) {
        console.error('Error al cargar preferencias:', e);
    }
}

// Cargar preferencias al iniciar
document.addEventListener('DOMContentLoaded', function() {
    loadPreferences();
    
    // Guardar preferencias cuando cambien
    const preferenceInputs = document.querySelectorAll(
        '#timerEnabled, #hints, #animations, #autoSave, #showRules, select[name="game_speed"]'
    );
    
    preferenceInputs.forEach(input => {
        input.addEventListener('change', savePreferences);
    });
});

// Teclas de acceso rápido
document.addEventListener('keydown', function(e) {
    // Ctrl/Cmd + Enter para enviar formulario
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
        const form = document.getElementById('setupForm');
        if (form) {
            form.dispatchEvent(new Event('submit', { cancelable: true }));
        }
    }
    
    // Escape para volver
    if (e.key === 'Escape') {
        if (confirm('¿Deseas salir de la configuración?')) {
            window.location.href = 'dashboard.php';
        }
    }
});

// Función de ayuda contextual
function showHelp(topic) {
    const helpMessages = {
        'player_types': 'Selecciona "Humano" para jugadores reales o "CPU" para que la computadora juegue automáticamente.',
        'colors': 'Cada jugador puede elegir un color para identificar su tablero durante el juego.',
        'timer': 'El temporizador ayuda a mantener un ritmo constante en el juego, limitando el tiempo de decisión.',
        'hints': 'Las sugerencias visuales te ayudarán a identificar rápidamente dónde puedes colocar dinosaurios.',
        'animations': 'Las animaciones hacen el juego más dinámico y visual, pero puedes desactivarlas para mayor velocidad.'
    };
    
    const message = helpMessages[topic] || 'Ayuda no disponible para este tema.';
    showAlert(message, 'info');
}

// Prevenir salida accidental
window.addEventListener('beforeunload', function(e) {
    const form = document.getElementById('setupForm');
    if (form) {
        const inputs = form.querySelectorAll('input[name^="player_name_"]');
        let hasData = false;
        
        inputs.forEach(input => {
            if (input.value.trim() !== '' && input.value !== input.defaultValue) {
                hasData = true;
            }
        });
        
        if (hasData) {
            e.preventDefault();
            e.returnValue = '';
        }
    }
});

// Función para resetear el formulario
function resetForm() {
    if (confirm('¿Estás seguro de que deseas resetear toda la configuración?')) {
        document.getElementById('setupForm').reset();
        loadPreferences(); // Recargar preferencias guardadas
        showAlert('Formulario reseteado', 'info');
    }
}

// Exportar funciones para uso global
window.showAlert = showAlert;
window.showLoading = showLoading;
window.showHelp = showHelp;
window.resetForm = resetForm;