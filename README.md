# 🚀 SaaS Kit Starter

Base estructural para un **SaaS multitenant** desarrollado con tecnologías modernas como Next.js 14.
Incluye gestión de organizaciones, control de accesos (RBAC), auditoría de acciones y paneles administrativos separados.

---

## 🧩 Características Principales

* 🏢 Arquitectura **multitenant** con aislamiento de datos
* 👥 Gestión de usuarios y organizaciones
* 🔐 Sistema de autenticación seguro con JWT
* 🛡️ Control de acceso basado en roles (**RBAC**)
* 📜 Auditoría completa de acciones (logs)
* 🖥️ Panel dual:

  * Admin global (`/admin`)
  * Cliente/tenant (`/dashboard`)
* ⚡ Interfaz dinámica basada en permisos

---

## 🛠️ Stack Tecnológico

| Tecnología        | Descripción                        |
| ----------------- | ---------------------------------- |
| **Framework**     | Next.js 14 (App Router) + React 18 |
| **Lenguaje**      | TypeScript                         |
| **Base de Datos** | MongoDB + Mongoose                 |
| **Autenticación** | NextAuth.js (Credentials Provider) |
| **Seguridad**     | bcryptjs (hash de contraseñas)     |
| **Estilos**       | Tailwind CSS                       |
| **Iconos**        | Lucide React                       |

---

## 📊 Arquitectura de Datos

El sistema está diseñado para soportar múltiples organizaciones con separación de recursos.

### Modelos principales:

```ts
User {
  email: string
  name: string
  userType: "admin" | "customer"
  organization?: ObjectId
}

Organization {
  name: string
  slug: string
  createdBy: ObjectId
}

OrgRole {
  name: string
  permissions: string[]
  isSystem: boolean
}

Log {
  userId: ObjectId
  action: string
  entity: string
  details: string
}
```

---

## 🔐 Autenticación y Seguridad

* Login con **email + contraseña**
* Sesiones gestionadas con **JWT**
* Middleware para protección de rutas
* Redirección automática según:

  * Estado de autenticación
  * Tipo de usuario
* Contraseñas encriptadas con **bcrypt**

---

## 👥 Tipos de Usuario

### 🛡️ Admin (Global)

* Acceso completo a `/admin`
* Gestión global de usuarios
* Visualización de logs del sistema

### 🏢 Customer (Tenant)

* Acceso a `/dashboard`
* Gestión de su organización:

  * Usuarios
  * Roles
  * Configuración

---

## 🖥️ Paneles

### 🛡️ Admin Panel (`/admin`)

* Dashboard con métricas
* CRUD de usuarios globales
* Auditoría (logs paginados)
* Gestión de perfil

### 🏢 Client Panel (`/dashboard`)

* Dashboard organizacional
* Configuración:

  * Roles (permisos granulares)
  * Usuarios
* Gestión de perfil

---

## 📜 Sistema de Permisos (RBAC)

* 🔝 **Jerarquía**

  * Admin global → acceso total
  * Admin de organización → acceso total dentro del tenant

* 🔑 **Permisos granulares**

  * `users.*`
  * `roles.*`

* 🎯 **UI adaptativa**

  * Tabs y botones visibles según permisos

* 🔄 **Redirección inteligente**

  * Acceso automático a la primera sección permitida

---

## 📝 Sistema de Auditoría

Se registran automáticamente:

* 🔐 Autenticación: login / logout
* 👥 Usuarios: creación, edición, eliminación
* 🛡️ Roles: cambios en permisos
* 👤 Perfil: actualizaciones de datos y seguridad

---

## 🌱 Seed Inicial (Modo Desarrollo)

Para pruebas rápidas:

| Tipo           | Credenciales                           |
| -------------- | -------------------------------------- |
| Admin Global   | `admin@example.com` / `admin123`       |
| Customer Admin | `customer@example.com` / `customer123` |
| Organización   | `Acme Inc.`                            |

---

## 🚀 Instalación

```bash
# Clonar repositorio
git clone https://github.com/tu-usuario/saas-kit-starter.git

# Instalar dependencias
npm install

# Configurar variables de entorno
cp .env.example .env

# Ejecutar en desarrollo
npm run dev
```

---

## 📌 Notas

* Diseñado para **escalar fácilmente**
* Basado en **mejores prácticas de Next.js 14**
* Arquitectura preparada para:

  * Multi-organización
  * Extensión de permisos
  * Auditoría avanzada

---

## 📄 Licencia

MIT License
