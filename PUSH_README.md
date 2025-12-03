# Notificaciones Push - Guía rápida

Este proyecto incluye un ejemplo de servidor para enviar notificaciones push usando VAPID y la librería `web-push`.

## Pasos para configurar y probar localmente

1. Ir al directorio del servidor:

```powershell
cd c:\pwa_final\server
```

2. Instalar dependencias:

```powershell
npm install
```

3. Generar claves VAPID (si no las tienes):

```powershell
npm run gen:vapid
```

Esto generará `vapid.json` en la carpeta `server` con `publicKey` y `privateKey`.

4. Ejecutar el servidor de ejemplo:

```powershell
npm start
```

El servidor escucha por defecto en `http://localhost:4000` y expone:

- `GET /vapidPublicKey` -> devuelve `{ publicKey }` (clave pública para el cliente)
- `POST /subscribe` -> recibe `{ subscription }` y guarda la suscripción (en memoria)
- `POST /sendNotification` -> recibe `{ title, body, data }` y envía notificaciones a todas las suscripciones guardadas

5. En la PWA (cliente)

- Asegúrate que la PWA está sirviendo desde `http://localhost:8000` (o similar)
- Abre la pestaña `Configuración` y presiona `🔔 Activar Notificaciones`
  - El cliente pedirá permiso y luego intentará obtener la `publicKey` desde `GET /vapidPublicKey`.
  - Si la obtiene, solicitará al Service Worker una suscripción y la enviará a `POST /subscribe`.
- Presiona `📣 Enviar prueba` para que el servidor intente enviar una notificación a todas las suscripciones.

## Notas
- En este ejemplo las suscripciones se almacenan en memoria (variable `subscriptions`). Reiniciar el servidor borrará las suscripciones.
- En producción, guarda las suscripciones en una base de datos y maneja la limpieza de suscripciones expiradas.
- Asegúrate de servir la PWA y el servidor bajo HTTPS en producción.

## Generar VAPID keys manualmente
Si prefieres generar las claves manualmente (por ejemplo en otro equipo), puedes usar la herramienta `web-push`:

```powershell
# desde la carpeta server
node generate_vapid.js
```

Esto creará `vapid.json` automáticamente.

## Ejemplo de payload
El servidor envía un payload JSON como string. Ejemplo:

```json
{ "title": "Hola", "body": "Mensaje de prueba", "data": { "url": "/?tab=posts" } }
```

El service worker muestra la notificación y, al abrirla, intenta abrir la URL en `data.url` si existe.

## Seguridad
- VAPID keys deben mantenerse privadas (privateKey).
- Siempre usar HTTPS en producción.

