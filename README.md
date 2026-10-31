# Restaurante Dos Palmeras — Sistema de Carta

## Stack
- **Backend:** Node.js + Express + TypeScript
- **Frontend:** React + TypeScript + Vite
- **Base de datos:** PostgreSQL

## Requisitos previos
- Node.js 18+
- PostgreSQL 14+
- npm 9+

---

## Instalación paso a paso

### 1. Crear la base de datos

```bash
psql -U postgres
CREATE DATABASE dos_palmeras;
\q
```

### 2. Crear las tablas

```bash
psql -U postgres -d dos_palmeras -f init.sql
```

### 3. Configurar el backend

```bash
cd backend
cp .env.example .env
```

Edita `.env` con tus datos de PostgreSQL:
```
PORT=3001
DATABASE_URL=postgresql://postgres:TU_PASSWORD@localhost:5432/dos_palmeras
JWT_SECRET=pon_un_secreto_largo_aqui
```

```bash
npm install
npm run seed    # Carga datos iniciales y crea usuario admin
npm run dev     # Inicia servidor en http://localhost:3001
```

### 4. Configurar el frontend

```bash
cd frontend
npm install
npm run dev     # Inicia en http://localhost:5173
```

---

## Acceso

| URL | Descripción |
|-----|-------------|
| `http://localhost:5173/` | Carta pública (sin login) |
| `http://localhost:5173/login` | Login admin |
| `http://localhost:5173/admin` | Panel de administración |

**Credenciales por defecto:**
- Usuario: `admin`
- Contraseña: `admin123`

---

## Funcionalidades

### Carta pública (`/`)
- Menú del Día destacado al inicio (solo si hay menús activos para hoy)
- Secciones con imagen de cabecera opcional
- Ítems con nombre, descripción y precio
- Diseño oscuro elegante, responsivo

### Panel de Administración (`/admin`)
- **Menú del Día:** Hasta 5 menús por día. Cambia la fecha para gestionar días distintos
- **Secciones:** Crear, renombrar, eliminar secciones
- **Imagen por sección:** Sube una foto para la cabecera de cada sección (máx 5MB)
- **Ítems:** Agregar, editar, eliminar ítems con nombre, descripción y precio

---

## Despliegue en producción

1. Compilar frontend: `cd frontend && npm run build` (genera `dist/`)
2. Servir `dist/` con nginx o Express estático
3. Compilar backend: `cd backend && npm run build`
4. Iniciar: `cd backend && npm start`
# dospalmeras_sw
