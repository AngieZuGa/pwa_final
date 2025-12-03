# Despliegue: GitHub Pages + Vercel

## Resumen
- **Cliente**: PWA hospedada en GitHub Pages (HTTPS gratuito)
- **Servidor de Push**: Node.js desplegado en Vercel (HTTPS gratuito, serverless)

## Paso 1: Preparar el repositorio en GitHub

### 1.1 Crear repositorio en GitHub
1. Ve a https://github.com/new
2. Nombre: `pwa-notificaciones` (o el que prefieras)
3. Descripción: `PWA con notificaciones push`
4. Selecciona **Public** (GitHub Pages requiere public para plan gratuito)
5. Clic en "Create repository"

### 1.2 Clonar o inicializar git localmente
En PowerShell, en `c:\pwa_final`:

```powershell
# Si aún no está inicializado como repo:
git init
git add .
git commit -m "Initial PWA commit"

# Añadir el remote del repositorio (reemplaza con tu URL):
git remote add origin https://github.com/TU_USUARIO/pwa-notificaciones.git
git branch -M main
git push -u origin main
```

## Paso 2: Configurar GitHub Pages

1. Abre tu repositorio en GitHub (https://github.com/TU_USUARIO/pwa-notificaciones)
2. Ve a **Settings** → **Pages**
3. En "Source", selecciona **Deploy from a branch**
4. Branch: **main** (o master)
5. Carpeta: **/ (root)**
6. Clic en "Save"
7. Espera 1-2 minutos; tu sitio estará en `https://TU_USUARIO.github.io/pwa-notificaciones/`

## Paso 3: Actualizar rutas en el cliente para GitHub Pages

Como GitHub Pages sirve desde `/pwa-notificaciones/`, necesitas actualizar:

### 3.1 Actualizar `index.html` - base tag
Agrega antes del `</head>`:

```html
<base href="/pwa-notificaciones/">
```

Esto hace que todas las rutas relativas funcionen correctamente.

### 3.2 Actualizar `manifest.json` - scope
Cambia `"scope"` y `"start_url"`:

```json
{
  "start_url": "/pwa-notificaciones/",
  "scope": "/pwa-notificaciones/",
  ...
}
```

### 3.3 Actualizar `app.js` - URL de servidor Vercel
En la función `DOMContentLoaded`, agrega antes de cargar app.js en index.html:

```html
<script>
  // Definir URL del servidor Vercel (reemplaza con tu proyecto)
  window.PUSH_SERVER_URL = 'https://tu-proyecto-vercel.vercel.app';
</script>
<script src="app.js"></script>
```

O edita directamente en `app.js` la constante `PUSH_SERVER` para apuntar a tu dominio Vercel (veremos esto en el Paso 5).

## Paso 4: Generar claves VAPID y desplegar servidor en Vercel

### 4.1 Generar claves VAPID (si aún no las tienes)
En PowerShell, en `c:\pwa_final\server`:

```powershell
npm install
npm run gen:vapid
```

Verifica que se creó `vapid.json` con `publicKey` y `privateKey`.

### 4.2 Crear cuenta en Vercel
- Ve a https://vercel.com
- Clic en "Sign Up"
- Usa tu cuenta de GitHub (más fácil)

### 4.3 Crear proyecto en Vercel (opción A: desde CLI)

Instala Vercel CLI:

```powershell
npm install -g vercel
```

En `c:\pwa_final\server`, ejecuta:

```powershell
vercel
```

Sigue las instrucciones:
- Link a una cuenta existente o crea una nueva
- Selecciona "Create and deploy a new project"
- Project name: `pwa-push-server` (o similar)
- Framework Preset: Other (no es Next.js)
- Root directory: `.` (actual)
- Dice "Ready!" con una URL como `https://pwa-push-server-xxxxx.vercel.app`

Copia esa URL (la usarás en el paso 5).

### 4.4 Crear proyecto en Vercel (opción B: desde web)
Alternativa: sube el código manualmente a GitHub en `repo/server` y conecta Vercel a GitHub:
1. Ve a https://vercel.com/dashboard
2. Clic en "Add New..." → "Project"
3. Importa tu repositorio GitHub
4. Root directory: `server`
5. Clic en "Deploy"

### 4.5 Agregar variable de entorno en Vercel (si quieres)
1. Ve a tu proyecto en Vercel
2. Settings → Environment Variables
3. Agrega `NODE_ENV` = `production` (opcional)

## Paso 5: Actualizar cliente con URL de Vercel

Una vez que tienes la URL de tu servidor Vercel (ej. `https://pwa-push-server-xxxxx.vercel.app`):

### 5.1 Actualizar `index.html`
Busca el lugar donde carga `app.js` y agrega antes:

```html
<script>
  window.PUSH_SERVER_URL = 'https://pwa-push-server-xxxxx.vercel.app';
</script>
<script src="app.js"></script>
```

### 5.2 Hacer push a GitHub

```powershell
cd c:\pwa_final
git add -A
git commit -m "Configure for GitHub Pages + Vercel"
git push origin main
```

GitHub Pages se actualizará automáticamente en 1-2 minutos.

## Paso 6: Probar en producción

1. Abre `https://TU_USUARIO.github.io/pwa-notificaciones/` en tu navegador (Chrome/Edge)
2. Ve a la pestaña **Configuración**
3. Haz clic en **"🔔 Activar Notificaciones"**
   - El navegador pedirá permiso
   - El cliente solicitará `publicKey` desde tu servidor Vercel
   - Se suscribirá y enviará la suscripción a Vercel
4. Haz clic en **"📣 Enviar prueba"**
   - Vercel intentará enviar notificaciones a todas las suscripciones guardadas
   - Deberías ver una notificación en tu navegador / PC

## Troubleshooting

### CORS error: "Access-Control-Allow-Origin"
- Asegúrate que tu servidor Vercel tiene el middleware CORS activado (ya incluído en `server.js`)
- Verifica que la URL de `PUSH_SERVER_URL` es correcta (sin trailing slash)

### "VAPID key not found"
- Necesitas crear `vapid.json` en tu servidor Vercel
- Opción 1: sube `vapid.json` como archivo (NO RECOMENDADO para producción — las claves serían públicas en GitHub)
- Opción 2 (SEGURO): usa Vercel Environment Variables para guardar publicKey y privateKey como strings, y redefine su carga en `server.js`

### Service Worker no se registra
- Verifica que la URL base (`/pwa-notificaciones/`) es correcta en `manifest.json` y `index.html`
- Abre DevTools → Application → Service Workers y busca errores

### No se reciben notificaciones
- Verifica permiso de notificaciones: DevTools → Application → Manifest → comprueba que los permisos están concedidos
- Abre la consola del navegador y busca errores en `sendTestPush()`
- En Vercel, abre el dashboard → Logs para ver si tu servidor recibe las solicitudes

## Próximos pasos (producción real)

1. **Guardar VAPID keys de forma segura**:
   - Crea un archivo `.env` en `server/` con `VAPID_PUBLIC_KEY` y `VAPID_PRIVATE_KEY`
   - Agrega `server/.env` a `.gitignore` (no commits)
   - En Vercel, usa "Environment Variables" en el dashboard para setear estas variables
   - Modifica `server.js` para leer desde `process.env.VAPID_PUBLIC_KEY` y `process.env.VAPID_PRIVATE_KEY`

2. **Persistencia de suscripciones**:
   - Reemplaza `subscriptions = []` (memoria) con una base de datos (Firestore, Supabase, MongoDB, etc.)
   - Así las suscripciones no se pierden en reinicios y puedes desactivar a clientes específicos

3. **Testing en dispositivos reales**:
   - Prueba en Android (Chrome) e iOS (Safari) desde el sitio público
   - Verifica que la app es instalable y que las notificaciones se reciben en background

---

¡Listo! Si necesitas ayuda en algún paso, avisa.
