# Script para iniciar servidor local

## Usando Python 3
```powershell
python -m http.server 8000
```

Luego accede a: http://localhost:8000

---

## Usando Node.js (http-server)

```powershell
# Primero instala http-server globalmente
npm install -g http-server

# Luego ejecuta desde la carpeta
http-server
```

---

## Usando Python con HTTPS (recomendado para PWA)

Si quieres probar el Service Worker completamente, necesitas HTTPS.

### En PowerShell (crear certificado autofirmado):

```powershell
# Crear certificado (válido 365 días)
$cert = New-SelfSignedCertificate -CertStoreLocation cert:\currentuser\my -DnsName localhost -NotAfter (Get-Date).AddDays(365)

# Exportar a archivo PFX
Export-PfxCertificate -Cert $cert -FilePath server.pfx -Password (ConvertTo-SecureString -String "1234" -AsPlainText -Force)

# Instalar el certificado en el navegador (opcional)
```

### Luego ejecutar servidor HTTPS con Python:

```powershell
# Instala pyopenssl
pip install pyopenssl

# Crea un script Python para HTTPS
# Guarda como: https_server.py
```

---

## Alternativa Simple: Usar CloudFlare Tunnel

```powershell
# Instala Wrangler
npm install -g wrangler

# Inicia tunnel (genera URL HTTPS automáticamente)
wrangler dev --local
```

---

## Desde VS Code

**Opción 1: Live Server Extension**
1. Instala "Live Server" en VS Code
2. Click derecho en `index.html`
3. "Open with Live Server"

**Opción 2: Tasks en VS Code**
Crea `.vscode/tasks.json`:

```json
{
    "version": "2.0.0",
    "tasks": [
        {
            "label": "Start Web Server",
            "type": "shell",
            "command": "python",
            "args": ["-m", "http.server", "8000"],
            "isBackground": true,
            "problemMatcher": {
                "pattern": {
                    "regexp": "^.*$",
                    "file": 1,
                    "location": 2,
                    "message": 3
                },
                "background": {
                    "activeOnStart": true,
                    "beginsPattern": "Serving HTTP",
                    "endsPattern": "Keyboard interrupt"
                }
            },
            "presentation": {
                "echo": true,
                "reveal": "always",
                "focus": false
            }
        }
    ]
}
```

Luego ejecuta: `Ctrl+Shift+B` > "Start Web Server"

---

## Testing en Móvil

Para probar en tu teléfono:

1. Obtén tu IP local:
   ```powershell
   ipconfig
   # Busca "IPv4 Address" bajo tu conexión (ej: 192.168.1.100)
   ```

2. En el móvil, accede a:
   ```
   http://192.168.1.100:8000
   ```

3. El Service Worker solo funciona en HTTPS, pero el resto de la app funciona perfectamente en HTTP en desarrollo.

---

## Notas Importantes

- ✅ Service Worker requiere HTTPS (excepto localhost)
- ✅ Localhost funciona en HTTP para desarrollo
- ✅ La PWA se puede instalar desde el navegador
- ✅ Offline mode funciona después de la primera visita
