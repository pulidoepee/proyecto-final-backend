# 🛒 Módulo POS para NestJS

## 📁 ESTRUCTURA FINAL

Copia los archivos en tu proyecto así:

```
src/
├── auth/           (ya existe)
├── tasks/          (ya existe)
└── pos/            ← CREAR NUEVA CARPETA
    ├── pos.module.ts
    ├── controllers/
    │   ├── products.controller.ts
    │   └── sales.controller.ts
    ├── services/
    │   ├── products.service.ts
    │   └── sales.service.ts
    └── dto/
        └── index.ts
```

## ⚙️ PASOS DE INSTALACIÓN

### 1️⃣ Ejecutar migración de base de datos

Abre una terminal y ejecuta:

```bash
psql -U postgres -d TodoListApp -f pos-migration.sql
```

O desde psql:
```sql
\c TodoListApp
\i ruta/a/pos-migration.sql
```

### 2️⃣ Copiar archivos al proyecto

Crea la carpeta `src/pos/` y copia todos los archivos manteniendo la estructura.

### 3️⃣ Registrar módulo en AppModule

Abre `src/app.module.ts` y agrega:

```typescript
import { PosModule } from './pos/pos.module';

@Module({
  imports: [
    // ... tus imports existentes (AuthModule, TasksModule, etc.)
    PosModule,  // ← AGREGAR ESTA LÍNEA
  ],
  // ...
})
export class AppModule {}
```

### 4️⃣ Reiniciar el servidor

```bash
npm run start:dev
```

## ✅ VERIFICAR QUE FUNCIONA

Prueba estos endpoints:

```bash
# Listar productos
curl http://localhost:3000/products

# Crear producto de prueba
curl -X POST http://localhost:3000/products \
  -H "Content-Type: application/json" \
  -d '{"name":"Producto Test","price":10,"stock":5}'
```

## 📡 ENDPOINTS DISPONIBLES

### Productos
- `GET /products` - Listar todos
- `GET /products/search?q=query` - Buscar
- `GET /products/:id` - Ver uno
- `POST /products` - Crear
- `PUT /products/:id` - Actualizar
- `DELETE /products/:id` - Eliminar

### Ventas
- `GET /sales` - Listar todas
- `GET /sales/:id` - Ver una
- `POST /sales` - Crear venta
- `GET /sales/range?startDate=X&endDate=Y` - Por fecha

## 🎨 CONFIGURAR FRONTEND

En tu proyecto Vue, archivo `.env`:

```env
VITE_API_URL=http://localhost:3000
```

## 🚫 NO CREAR ARCHIVOS .ROUTES.TS

En NestJS NO se usan archivos `.routes.ts`. Los controladores manejan las rutas automáticamente.

## ✅ CHECKLIST

- [ ] Ejecutar `pos-migration.sql` en PostgreSQL
- [ ] Crear carpeta `src/pos/`
- [ ] Copiar todos los archivos
- [ ] Importar `PosModule` en `app.module.ts`
- [ ] Reiniciar servidor
- [ ] Probar endpoint GET /products
- [ ] Configurar VITE_API_URL en frontend
