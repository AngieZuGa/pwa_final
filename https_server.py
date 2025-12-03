#!/usr/bin/env python3
"""
Servidor HTTPS simple para PWA
Usa certificado autofirmado para desarrollo local
"""

import http.server
import ssl
import os
import sys
from pathlib import Path

# Puerto
PORT = 8443

class MyHTTPRequestHandler(http.server.SimpleHTTPRequestHandler):
    """Handler personalizado para mejor logging"""
    
    def end_headers(self):
        """Agregar headers CORS"""
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
        self.send_header('Cache-Control', 'no-cache, no-store, must-revalidate')
        super().end_headers()
    
    def log_message(self, format, *args):
        """Logging mejorado"""
        print(f"[{self.log_date_time_string()}] {format % args}")

def crear_certificado():
    """Crear certificado autofirmado si no existe"""
    try:
        from cryptography import x509
        from cryptography.x509.oid import NameOID
        from cryptography.hazmat.primitives import hashes
        from cryptography.hazmat.backends import default_backend
        from cryptography.hazmat.primitives.asymmetric import rsa
        from cryptography.hazmat.primitives import serialization
        import datetime
        
        cert_file = Path("localhost.crt")
        key_file = Path("localhost.key")
        
        if cert_file.exists() and key_file.exists():
            print(f"✓ Certificados encontrados: {cert_file}, {key_file}")
            return str(cert_file), str(key_file)
        
        print("📜 Generando certificado autofirmado...")
        
        # Generar clave privada
        private_key = rsa.generate_private_key(
            public_exponent=65537,
            key_size=2048,
            backend=default_backend()
        )
        
        # Crear certificado
        subject = issuer = x509.Name([
            x509.NameAttribute(NameOID.COUNTRY_NAME, u"US"),
            x509.NameAttribute(NameOID.STATE_OR_PROVINCE_NAME, u"State"),
            x509.NameAttribute(NameOID.LOCALITY_NAME, u"City"),
            x509.NameAttribute(NameOID.ORGANIZATION_NAME, u"PWA Dev"),
            x509.NameAttribute(NameOID.COMMON_NAME, u"localhost"),
        ])
        
        cert = x509.CertificateBuilder().subject_name(
            subject
        ).issuer_name(
            issuer
        ).public_key(
            private_key.public_key()
        ).serial_number(
            x509.random_serial_number()
        ).not_valid_before(
            datetime.datetime.utcnow()
        ).not_valid_after(
            datetime.datetime.utcnow() + datetime.timedelta(days=365)
        ).add_extension(
            x509.SubjectAlternativeName([
                x509.DNSName(u"localhost"),
                x509.DNSName(u"127.0.0.1"),
            ]),
            critical=False,
        ).sign(private_key, hashes.SHA256(), default_backend())
        
        # Guardar clave privada
        with open(key_file, "wb") as f:
            f.write(private_key.private_bytes(
                encoding=serialization.Encoding.PEM,
                format=serialization.PrivateFormat.TraditionalOpenSSL,
                encryption_algorithm=serialization.NoEncryption()
            ))
        
        # Guardar certificado
        with open(cert_file, "wb") as f:
            f.write(cert.public_bytes(serialization.Encoding.PEM))
        
        print(f"✓ Certificado creado: {cert_file}")
        print(f"✓ Clave privada creada: {key_file}")
        
        return str(cert_file), str(key_file)
    
    except ImportError:
        print("⚠️  La librería 'cryptography' no está instalada")
        print("   Ejecuta: pip install cryptography")
        return None, None

def main():
    """Iniciar servidor HTTPS"""
    
    os.chdir(Path(__file__).parent)
    
    print("\n" + "="*50)
    print("🚀 Servidor PWA - HTTPS Local")
    print("="*50)
    
    # Crear certificados
    cert_file, key_file = crear_certificado()
    
    if not cert_file or not key_file:
        print("\n❌ No se pudieron crear los certificados")
        print("Usa: pip install cryptography")
        sys.exit(1)
    
    # Crear contexto SSL
    context = ssl.SSLContext(ssl.PROTOCOL_TLS_SERVER)
    context.load_cert_chain(cert_file, key_file)
    
    # Crear servidor
    handler = MyHTTPRequestHandler
    
    with http.server.HTTPSServer(("0.0.0.0", PORT), handler, ssl_context=context) as httpd:
        print(f"\n📍 Servidor ejecutándose en:")
        print(f"   🔒 https://localhost:{PORT}")
        print(f"   🔒 https://127.0.0.1:{PORT}")
        print(f"\n📱 En otra máquina (reemplaza con tu IP):")
        print(f"   🔒 https://192.168.X.X:{PORT}")
        print(f"\n⚠️  Advertencia: Certificado autofirmado (es normal)")
        print(f"   Acepta el certificado en tu navegador\n")
        print(f"✓ Directorio: {os.getcwd()}")
        print(f"✓ Presiona Ctrl+C para detener\n")
        
        try:
            httpd.serve_forever()
        except KeyboardInterrupt:
            print("\n\n👋 Servidor detenido")
            sys.exit(0)

if __name__ == '__main__':
    main()
