# 📱 PWA con Pestañas e Integración de API

Una Progressive Web App moderna con sistema de pestañas e integración con una API simple (JSONPlaceholder).

## ✨ Características

- **Pestañas Interactivas**: 4 pestañas funcionales (Inicio, Posts, Usuarios, Configuración)
- **API Integration**: Integración con JSONPlaceholder (sin necesidad de API Key)
- **Progressive Web App**: Funciona como aplicación nativa
- **Offline First**: Funciona sin conexión usando Service Worker
- **Responsive Design**: Se adapta a cualquier dispositivo
- **Dark Mode**: Soporte automático para tema oscuro
- **Sincronización**: Botón de sincronización en tiempo real
- **Cache Management**: Gestión de caché desde la configuración

## 📁 Estructura de Archivos

```
pwa_final/
├── index.html          # Página principal
├── styles.css          # Estilos (responsive)
├── app.js             # Lógica de la aplicación
├── sw.js              # Service Worker
├── manifest.json      # Configuración PWA
└── README.md          # Este archivo
```

## 🚀 Cómo Usar

### 1. Servidor Local
Necesitas servir la aplicación con HTTPS (requerido para Service Worker).

**Opción A: Python**
```bash
cd c:\pwa_final
python -m http.server 8000
# Luego ve a http://localhost:8000
```

**Opción B: Node.js (http-server)**
```bash
npm install -g http-server
cd c:\pwa_final
http-server
```

**Opción C: Visual Studio Code (Live Server)**
1. Instala la extensión "Live Server" en VS Code
2. Click derecho en `index.html`
3. Selecciona "Open with Live Server"

### 2. Usar como PWA

**En Móviles (Chrome, Edge, Firefox):**
- Abre la app en el navegador
- Tap en el menú (⋮)
- Selecciona "Instalar app" o "Agregar a pantalla de inicio"

**En Escritorio (Chrome, Edge):**
- Haz clic en el icono de instalación (⬇️) en la barra de direcciones
- O usa el botón "⬇️ Instalar" en la app

## 🎯 Pestañas Disponibles

### 1. **Inicio** 🏠
- Introducción a la PWA
- Características principales
- Instrucciones de uso

### 2. **Posts** 📝
- Lista de 10 posts de la API
- Cargados dinámicamente
- Funciona sin conexión (datos cacheados)

### 3. **Usuarios** 👥
- Cuadrícula de usuarios
- Información de perfil (nombre, email, usuario)
- Diseño responsivo

### 4. **Configuración** ⚙️
- Estado del Service Worker
- Uso de caché
- Botones de limpieza y desinstalación
- Indicador online/offline

## 🔌 Integración de API

La app usa **JSONPlaceholder** - una API gratuita y sin autenticación:

```javascript
// Endpoints utilizados:
https://jsonplaceholder.typicode.com/posts?_limit=10
https://jsonplaceholder.typicode.com/users
```

Características:
- ✅ No requiere API Key
- ✅ Datos ficticios para desarrollo/testing
- ✅ Respuestas rápidas
- ✅ Soporta CORS

## 🛠️ Tecnologías Utilizadas

- **HTML5**: Estructura semántica
- **CSS3**: Grid, Flexbox, Variables CSS, Media Queries
- **JavaScript (Vanilla)**: Fetch API, Service Workers
- **Service Workers**: Cache, Offline Support
- **Progressive Web App**: Manifest.json, installable

## 📱 Responsividad

- 📱 Mobile: < 480px
- 📱 Tablet: 480px - 768px
- 💻 Desktop: > 768px

## 🔄 Service Worker Features

- **Cache First**: Para archivos estáticos
- **Network First**: Para API calls
- **Background Sync**: Sincronización en background
- **Offline Support**: Fallback cuando no hay conexión

## 🎨 Personalización

### Cambiar Colores

Edita las variables CSS en `styles.css`:

```css
:root {
    --primary-color: #3498db;      /* Color principal */
    --secondary-color: #2ecc71;    /* Color secundario */
    --danger-color: #e74c3c;       /* Color de error */
}
```

### Cambiar API

Para usar otra API, modifica en `app.js`:

```javascript
const API_BASE = 'https://api.ejemplo.com';
```

## 📊 Ejemplo de Datos de API

```json
{
  "userId": 1,
  "id": 1,
  "title": "sunt aut facere repellat provident...",
  "body": "quia et suscipit..."
}
```

## ⚡ Performance

- ⚡ Carga rápida con caché
- ⚡ Funciona offline
- ⚡ Tamaño optimizado
- ⚡ 100% JavaScript vanilla (sin frameworks)

## 🐛 Troubleshooting

### Service Worker no se registra
- Usa HTTPS (excepto localhost)
- Verifica la consola del navegador (F12)

### No carga los datos de API
- Verifica conexión a internet
- Comprueba que JSONPlaceholder está disponible
- Ve a la consola para ver errores

### No puedo instalar la app
- Usa Chrome, Edge, Firefox o Opera
- Asegúrate de tener HTTPS
- Haz clic en el botón "Instalar" o usa el menú del navegador

## 📝 Licencia

Libre para usar y modificar.

## 🤝 Contribuciones

Siéntete libre de mejorar o extender esta PWA.

---

**¡Disfruta tu Progressive Web App!** 🎉
