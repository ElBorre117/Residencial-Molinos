# CondoAdmin — Sistema de Gestión de Condominio

App web para administrar pagos de mantenimiento, ingresos/egresos, residentes y contactos del condominio.

---

## Cómo abrir el proyecto

### Opción 1 — Directo en el navegador

Abre `index.html` con doble clic. Funciona sin instalar nada.

### Opción 2 — Con VS Code + Live Server (recomendado)

1. Abre la carpeta `condoadmin/` en VS Code
2. Instala la extensión **Live Server** (busca "Live Server" en extensiones)
3. Clic derecho en `index.html` → **Open with Live Server**
4. Se abre en `http://127.0.0.1:5500`

---

## Cuentas de demo

| Correo               | Contraseña          | Rol                   |
| -------------------- | ------------------- | --------------------- |
| admin@condo.com      | admin123            | Administrador         |
| admin@condominios.mx | hashed_password_123 | Administrador         |
| admin2@condo.com     | res123              | Residente (depto 101) |

---

## Estructura del proyecto

```
condoadmin/
│
├── index.html          ← Punto de entrada, toda la estructura HTML
│
├── css/
│   └── styles.css      ← Todos los estilos de la app
│
├── js/
│   ├── data.js         ← Conexión y sincronización con Supabase
│   └── app.js          ← Toda la lógica de la aplicación
│
├── assets/             ← Imágenes, logos, firma (vacío por ahora)
│
└── README.md           ← Este archivo
```

---

## Qué puede hacer cada usuario

### Administrador

- **Dashboard** — métricas, gráficas de flujo mensual y egresos por categoría
- **Residentes** — agregar, aprobar/rechazar departamentos, buscar
- **Comprobantes** — ver imagen del pago, aprobar y generar recibo automático
- **Ingresos / Egresos** — registrar, filtrar, importar CSV, exportar
- **Reportes** — estado de cobros por mes

### Residente

- **Mis pagos** — subir comprobante de transferencia/depósito, ver historial y recibos
- **Contactos** — teléfonos de administración, caseta y emergencias (llamada directa al tocar)

---

## Personalizar los datos

### Cambiar los teléfonos de contacto

Edita los `href="tel:..."` y los textos en el bloque `pageContacts` dentro de `index.html`.

### Cambiar el nombre del condominio

Edita la línea en `index.html`:

```html
<span id="condoName">Torre Residencial</span>
```

### Agregar residentes reales

Agrega o edita residentes directamente en la tabla `residents` de Supabase.

### Cambiar la cuota mensual por defecto

Actualiza el campo `fee` en Supabase para cada residente.

---

## Próximos pasos — conectar Supabase

Cuando quieras que los datos persistan en la nube:

1. Crea una cuenta en [supabase.com](https://supabase.com) (gratis)
2. Crea las tablas: `users`, `residents`, `payments`, `finances`
3. Usa la key `anon` y la URL de tu proyecto en `index.html` dentro de `window.SUPABASE_CONFIG`.
4. Activa Auth de Supabase (correo + teléfono OTP) si quieres reemplazar el login manual.

---

## Tecnologías usadas

| Tecnología         | Para qué                                  |
| ------------------ | ----------------------------------------- |
| HTML + CSS vanilla | Interfaz y estilos (sin frameworks)       |
| JavaScript vanilla | Toda la lógica (sin jQuery ni frameworks) |
| Chart.js (CDN)     | Gráficas de flujo y distribución          |

No requiere Node.js, npm, ni compiladores. Todo corre directo en el navegador.

GJKgwRg7W5bpdOXw
