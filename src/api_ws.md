# API WS endpoints

Base URL: `http://localhost/ws`
Content-Type: JSON for endpoints that read `getJSON(true)`.

Notes:
- Some responses use `status`, others use `success`. This doc mirrors current behavior in `app/Controllers/Api/Ws.php`.
- Endpoints that use `getPost()` expect form-encoded body (or `multipart/form-data`).

---

## Auth / Usuarios

### POST /registro
Body (JSON):
```json
{
  "nombre": "Juan",
  "apellido": "Perez",
  "correo": "juan@example.com",
  "fecha_nacimiento": "2000-01-01",
  "alias": "juanp",
  "contrasena": "P4ssw0rd!",
  "estatus": "activo",
  "uuid": "device-uuid"
}
```
Response (200):
```json
{
  "status": true,
  "message": "Usuario registrado correctamente",
  "id": 10,
  "token": "token-string",
  "uuid": "device-uuid",
  "hash": "base64hash"
}
```

### POST /login
Body (JSON):
```json
{
  "correo": "juan@example.com",
  "contrasena": "P4ssw0rd!",
  "uuid": "device-uuid"
}
```
Response (200):
```json
{
  "success": true,
  "success_message": "Login correcto",
  "id": 10,
  "token": "token-string",
  "hash": "base64hash",
  "nombre": "Juan",
  "alias": "juanp",
  "verificada": "si"
}
```

### POST /perfil
Body (JSON, requiere auth):
```json
{
  "id": 10,
  "token": "token-string",
  "uuid": "device-uuid"
}
```
Response (200):
```json
{
  "success": true,
  "perfil": {
    "id": 10,
    "nombre": "Juan",
    "apellido": "Perez",
    "fecha_nacimiento": "2000-01-01",
    "alias": "juanp",
    "telefono": "5555555555",
    "correo": "juan@example.com",
    "tutor_id": null,
    "verificada": "si",
    "hash": "base64hash"
  },
  "success_message": "Información de perfil"
}
```

### POST /actualizarPerfil
Body (JSON, requiere auth):
```json
{
  "id": 10,
  "token": "token-string",
  "uuid": "device-uuid",
  "nombre": "Juan",
  "telefono": "5555555555"
}
```
Response (200):
```json
{
  "status": true,
  "message": "Perfil actualizado correctamente",
  "data": {
    "id": 10,
    "nombre": "Juan"
  }
}
```

### POST /solicitudCambioPwd
Body (JSON):
```json
{
  "correo": "juan@example.com",
  "uuid": "device-uuid"
}
```
Response (200):
```json
{
  "success": true,
  "hash": "base64hash",
  "token": "codigo-recuperacion",
  "success_message": "Se ha enviado un correo con un código de recuperación de contraseña"
}
```

### POST /actualizaPwd
Body (JSON):
```json
{
  "correo": "juan@example.com",
  "uuid": "device-uuid",
  "token": "codigo-recuperacion",
  "contrasena": "Nuev4Pwd!"
}
```
Response (200):
```json
{
  "success": true,
  "success_message": "Se ha actualizado su contraseña"
}
```

---

## Encuestas

### GET /encuestas
Response (200):
```json
{
  "status": true,
  "message": "Encuestas encontrados",
  "data": [
    {
      "id": 1,
      "titulo": "Encuesta 1",
      "motivos": []
    }
  ]
}
```

### GET /encuesta/{id}
Response (200):
```json
{
  "status": true,
  "message": "Encuesta encontrado",
  "data": {
    "id": 1,
    "titulo": "Encuesta 1",
    "motivos": []
  }
}
```

### GET /motivos/{encuesta_id}
Response (200):
```json
{
  "status": true,
  "message": "Motivos encontrados",
  "data": [
    {
      "id": 1,
      "motivo": "Motivo",
      "intensidades": []
    }
  ]
}
```

### POST /guardarEncuesta
Body (JSON):
```json
{
  "usuario_id": 10,
  "encuesta_id": 1,
  "nota_general": "Opcional",
  "evaluaciones": [
    { "motivo_id": 1, "intensidad_id": 2 },
    { "motivo_id": 2, "intensidad_id": 1 }
  ]
}
```
Response (200):
```json
{
  "status": true,
  "message": "Encuesta guardada correctamente",
  "data": { "usuarioencuesta_id": 99 }
}
```

---

## Membresias / Suscripciones

### GET /membresias
Response (200):
```json
{
  "status": true,
  "message": "Membresías encontradas",
  "data": [
    { "id": 1, "nombre": "Plan", "conceptos": [] }
  ]
}
```

### GET /membresia/{id}
Response (200):
```json
{
  "status": true,
  "message": "Membresía encontrada",
  "data": { "id": 1, "nombre": "Plan", "conceptos": [] }
}
```

### POST /suscripcion
Body (form):
```
usuario_id=10&membresia_id=1&fecha_inicio=2024-01-01&fecha_fin=2024-12-31
```
Response (201):
```json
{ "msg": "Suscripción creada correctamente", "suscripcion_id": 123 }
```

### GET /obtenerSuscripcion/{usuario_id}
Response (200):
```json
{
  "suscripcion": { "id": 123, "usuario_id": 10 },
  "conceptos": [
    { "concepto_id": 1, "cantidad_usada": 0, "cantidad_asignada": 10 }
  ]
}
```

### POST /consumirConcepto
Body (form):
```
suscripcion_id=123&concepto_id=1&cantidad=1
```
Response (200):
```json
{
  "msg": "Concepto consumido correctamente",
  "concepto_id": 1,
  "cantidad_usada": 1,
  "cantidad_asignada": 10
}
```

---

## Diagnostico

### GET /diagnostico/motivos
Response (200):
```json
{
  "data": [
    {
      "id": 1,
      "titulo": "Motivo",
      "descripcion": "Texto",
      "orden": 1,
      "intensidades": [
        { "id": 1, "key": "baja", "label": "Baja", "valor": 1, "orden": 1 }
      ]
    }
  ]
}
```

### GET /diagnostico/sintomas-fisicos
Response (200):
```json
{
  "data": [
    { "id": 1, "titulo": "Dolor", "descripcion": "Desc", "orden": 1 }
  ]
}
```

### GET /diagnostico/sintomas-emocionales
Response (200):
```json
{
  "data": [
    { "id": 1, "titulo": "Ansiedad", "descripcion": "Desc", "orden": 1 }
  ]
}
```

### GET /diagnostico/reglas?modulo={modulo}&item_id={id}
Params:
- `modulo`: `motivos` | `sintomas_fisicos` | `sintomas_emocionales`
- `item_id`: numeric id
Response (200):
```json
{
  "data": [
    {
      "id": 1,
      "modulo": "motivos",
      "item_id": 10,
      "rule_type": "required",
      "trigger": "always",
      "config": { "min": 1 },
      "config_json": null
    }
  ]
}
```
