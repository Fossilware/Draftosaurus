# 🦕 Draftosaurus - FossilWare Gaming Platform

Sistema de gestión y juego digitalizado de Draftosaurus con autenticación de usuarios.

## 📋 Requisitos del Sistema

- **Servidor**: Ubuntu 24.04 LTS
- **Web Server**: Apache 2.4+
- **Base de Datos**: MySQL 8.0+
- **PHP**: 7.4+ (Recomendado 8.1+)
- **phpMyAdmin**: Para gestión de base de datos
- **Cliente FTP**: WinSCP o FileZilla

## 📂 Estructura de Archivos

```
draftosaurus/
├── index.html              # Página principal
├── inicio.html             # Formulario de login
├── registro.html           # Formulario de registro
├── dashboard.php           # Panel principal del usuario
├── css/
│   └── styles.css         # Estilos personalizados
├── js/
│   └── script.js          # JavaScript frontend
├── php/
│   ├── config.php         # Configuración de BD
│   ├── login.php          # Procesamiento de login
│   ├── register.php       # Procesamiento de registro
│   └── logout.php         # Cerrar sesión
├── img/
│   └── default-avatar.png # Avatar por defecto
├── uploads/
│   └── profiles/          # Fotos de perfil de usuarios
└── database.sql           # Script de base de datos
```

## 🚀 Instalación en Ubuntu 24.04 LTS

### 1. Instalar LAMP Stack

```bash
# Actualizar el sistema
sudo apt update && sudo apt upgrade -y

# Instalar Apache
sudo apt install apache2 -y
sudo systemctl start apache2
sudo systemctl enable apache2

# Instalar MySQL
sudo apt install mysql-server -y
sudo mysql_secure_installation

# Instalar PHP y extensiones necesarias
sudo apt install php libapache2-mod-php php-mysql php-gd php-mbstring php-xml php-curl -y

# Instalar phpMyAdmin
sudo apt install phpmyadmin -y
# Durante la instalación, selecciona Apache como servidor web
# Crea una contraseña para el usuario phpMyAdmin

# Habilitar módulos de Apache
sudo a2enmod rewrite
sudo systemctl restart apache2
```

### 2. Configurar MySQL

```bash
# Acceder a MySQL
sudo mysql -u root -p

# Crear usuario y base de datos (ejecutar en MySQL)
CREATE DATABASE draftosaurus_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER 'draftosaurus_user'@'localhost' IDENTIFIED BY 'tu_contraseña_segura';
GRANT ALL PRIVILEGES ON draftosaurus_db.* TO 'draftosaurus_user'@'localhost';
FLUSH PRIVILEGES;
EXIT;
```

### 3. Importar Base de Datos

**Opción A: Desde phpMyAdmin**
1. Accede a `http://tu-servidor/phpmyadmin`
2. Inicia sesión con tu usuario
3. Selecciona la base de datos `draftosaurus_db`
4. Ve a la pestaña "Importar"
5. Selecciona el archivo `database.sql`
6. Haz clic en "Continuar"

**Opción B: Desde línea de comandos**
```bash
mysql -u draftosaurus_user -p draftosaurus_db < database.sql
```

### 4. Subir Archivos con WinSCP

1. **Conectar por FTP/SFTP:**
   - Host: Tu IP o dominio del servidor
   - Puerto: 22 (SFTP) o 21 (FTP)
   - Usuario: Tu usuario de Ubuntu
   - Contraseña: Tu contraseña de Ubuntu

2. **Ruta de destino:**
   ```
   /var/www/html/draftosaurus/
   ```

3. **Crear directorio y copiar archivos:**
   ```bash
   sudo mkdir -p /var/www/html/draftosaurus
   sudo chown -R www-data:www-data /var/www/html/draftosaurus
   sudo chmod -R 755 /var/www/html/draftosaurus
   ```

4. **Subir todos los archivos del proyecto** usando WinSCP a la carpeta `/var/www/html/draftosaurus/`

### 5. Configurar Permisos

```bash
# Dar permisos de escritura a la carpeta uploads
sudo mkdir -p /var/www/html/draftosaurus/uploads/profiles
sudo chown -R www-data:www-data /var/www/html/draftosaurus/uploads
sudo chmod -R 775 /var/www/html/draftosaurus/uploads

# Dar permisos a la carpeta img
sudo mkdir -p /var/www/html/draftosaurus/img
sudo chown -R www-data:www-data /var/www/html/draftosaurus/img
sudo chmod -R 755 /var/www/html/draftosaurus/img
```

### 6. Configurar Base de Datos en config.php

Edita el archivo `php/config.php` y actualiza las credenciales:

```php
define('DB_HOST', 'localhost');
define('DB_USER', 'draftosaurus_user');  // Tu usuario de MySQL
define('DB_PASS', 'tu_contraseña_segura'); // Tu contraseña de MySQL
define('DB_NAME', 'draftosaurus_db');
```

### 7. Configurar Virtual Host (Opcional)

```bash
# Crear archivo de configuración
sudo nano /etc/apache2/sites-available/draftosaurus.conf
```

Agrega:
```apache
<VirtualHost *:80>
    ServerName draftosaurus.tudominio.com
    DocumentRoot /var/www/html/draftosaurus
    
    <Directory /var/www/html/draftosaurus>
        Options Indexes FollowSymLinks
        AllowOverride All
        Require all granted
    </Directory>
    
    ErrorLog ${APACHE_LOG_DIR}/draftosaurus_error.log
    CustomLog ${APACHE_LOG_DIR}/draftosaurus_access.log combined
</VirtualHost>
```

Habilitar el sitio:
```bash
sudo a2ensite draftosaurus.conf
sudo systemctl reload apache2
```

## 🔐 Configuración de Seguridad

### 1. Configurar Firewall

```bash
sudo ufw allow 'Apache Full'
sudo ufw allow OpenSSH
sudo ufw enable
```

### 2. SSL/HTTPS con Let's Encrypt (Recomendado)

```bash
# Instalar Certbot
sudo apt install certbot python3-certbot-apache -y

# Obtener certificado SSL
sudo certbot --apache -d draftosaurus.tudominio.com

# Renovación automática
sudo certbot renew --dry-run
```

### 3. Proteger phpMyAdmin

```bash
# Editar configuración de Apache para phpMyAdmin
sudo nano /etc/apache2/conf-available/phpmyadmin.conf
```

Agrega restricción de IP:
```apache
<Directory /usr/share/phpmyadmin>
    Order Deny,Allow
    Deny from all
    Allow from tu.ip.publica
</Directory>
```

## 🎮 Uso del Sistema

### Registro de Usuario
1. Accede a `http://tu-servidor/draftosaurus`
2. Haz clic en "Registrarse"
3. Completa los datos:
   - Nombre de usuario (3-20 caracteres)
   - Email válido
   - Contraseña (mínimo 6 caracteres)
   - Foto de perfil (opcional, máximo 5MB)
4. Acepta los términos y condiciones
5. Haz clic en "Crear Cuenta"

### Inicio de Sesión
1. Haz clic en "Iniciar Sesión"
2. Ingresa usuario/email y contraseña
3. Opcionalmente marca "Recordarme" para sesiones largas
4. Accede al dashboard

### Características Actuales
- ✅ Registro de usuarios con validaciones
- ✅ Inicio de sesión seguro
- ✅ Gestión de fotos de perfil
- ✅ Dashboard de usuario
- ✅ Sistema de estadísticas (estructura preparada)

### Próximas Funcionalidades
- 🎮 Modo de juego regular
- 📊 Modo de seguimiento
- 🏆 Sistema de logros
- 📈 Rankings y estadísticas detalladas

## 🔧 Solución de Problemas

### Error: "No se puede conectar a la base de datos"
- Verifica las credenciales en `php/config.php`
- Asegúrate de que MySQL esté corriendo: `sudo systemctl status mysql`

### Error: "No se puede subir la imagen"
- Verifica permisos de la carpeta uploads: `sudo chmod -R 775 uploads/`
- Verifica que el propietario sea www-data: `sudo chown -R www-data:www-data uploads/`

### Error 404 al acceder
- Verifica que Apache esté corriendo: `sudo systemctl status apache2`
- Verifica la ruta del proyecto en `/var/www/html/draftosaurus`

### Sesión no persiste
- Verifica que el módulo de sesiones de PHP esté habilitado
- Revisa los permisos de `/var/lib/php/sessions`

## 📝 Notas Importantes

- **Seguridad**: Cambia todas las contraseñas por defecto
- **Backups**: Realiza copias de seguridad regulares de la base de datos
- **Logs**: Revisa los logs de Apache en `/var/log/apache2/` para debugging
- **Producción**: En producción, desactiva los errores de PHP en pantalla

## 🤝 Soporte

Para soporte adicional o reportar problemas:
- Revisa los logs del sistema
- Consulta la documentación de Apache y MySQL
- Verifica la configuración de PHP con `php -i`

## 📄 Licencia

FossilWare - Draftosaurus Gaming Platform
Desarrollo para uso educativo y personal.

---
**Desarrollado con 🦕 para la comunidad de Draftosaurus**