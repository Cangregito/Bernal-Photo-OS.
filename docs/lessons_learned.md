# Reglas de Desarrollo y Lecciones Aprendidas — Bernal Photo OS

> Documento generado a partir de la auditoría de calidad ejecutada el 24 de abril de 2026.
> Contiene todos los errores encontrados durante la fase de estabilización y las reglas establecidas para evitarlos en el futuro.

---

## 1. Prohibición Absoluta del tipo `any`

### Error encontrado
Se utilizó `any` en 15+ ubicaciones del código: parámetros de funciones, mappers de Supabase, callbacks de `.map()`, e interfaces de componentes.

```typescript
// ❌ INCORRECTO - Encontrado en MasonryGallery, ContractTable, SessionTable, QuoteTable
{ images: any[] }
{ icon: any }
(row: any): Client
```

### Regla
**Siempre** usar interfaces explícitas o tipos genéricos en vez de `any`. Si la estructura viene de una fuente externa (DB, API), crear una interfaz `Row` en la misma capa de infraestructura.

```typescript
// ✅ CORRECTO
interface GalleryImage {
  id: number | string;
  image_url: string;
  alt_text?: string;
}

interface ClientRow {
  id: string;
  first_name: string;
  // ...
}
```

---

## 2. Rutas de Importación Relativas — Contar Niveles Correctamente

### Error encontrado
Se usaron rutas `../../domain/` desde archivos que estaban en `src/application/use-cases/client/`, cuando la ruta correcta era `../../../domain/`. Esto provocó **20+ errores TS2307 (module not found)**.

### Regla
Antes de escribir una ruta relativa, contar los niveles de directorio desde el archivo actual hasta el destino:

```
src/application/use-cases/client/GetClients.ts
│   │             │         │         └── Nivel 4
│   │             │         └── Nivel 3
│   │             └── Nivel 2
│   └── Nivel 1
└── root

→ Para llegar a src/domain/entities/Client.ts necesitas 3 niveles: ../../../domain/entities/Client
```

**Tip:** Si el proyecto crece, considerar configurar `paths` en `tsconfig.json` con alias como `@domain/`, `@application/`, etc.

---

## 3. `Record<string, unknown>` NO es un sustituto directo de `any`

### Error encontrado
Al reemplazar `(row: any)` por `(row: Record<string, unknown>)` en los mappers de Supabase, TypeScript arrojó **30+ errores** porque `unknown` no permite acceso directo a propiedades.

### Regla
Para datos de base de datos o APIs externas, **siempre** crear una interfaz `Row` que describa la forma exacta de la fila de la DB (en `snake_case`), y luego castear con `as unknown as RowType`:

```typescript
// ✅ CORRECTO
interface ClientRow {
  id: string;
  first_name: string;
  last_name: string;
  created_at: string;
}

private mapToClient(row: ClientRow): Client {
  return {
    id: row.id,
    firstName: row.first_name,
    // ...
  };
}

// En las queries
return (data as unknown as ClientRow[]).map(this.mapToClient);
```

---

## 4. Hooks de Git: Alinear Scripts con el Runner Real

### Error encontrado
El archivo `.husky/pre-commit` contenía `npm test`, pero el `package.json` **no tenía** un script `test` definido. El runner real de pruebas es `vitest`.

### Regla
Los hooks de Git en `.husky/` deben apuntar siempre a scripts que **existen** en `package.json`, o a comandos `npx` directos:

```bash
# .husky/pre-commit
npx vitest run
```

Además, el archivo `.husky/commit-msg` tenía un encoding binario (UTF-16LE) que impedía su ejecución. **Siempre** verificar que los archivos de hooks sean UTF-8 sin BOM.

---

## 5. Conventional Commits: Respetar el Límite de 100 Caracteres

### Error encontrado
Se intentó hacer un commit con un mensaje de 205 caracteres, siendo el límite configurado en `commitlint` de 100 caracteres (`header-max-length`).

### Regla
El formato estricto de Conventional Commits para este proyecto es:

```
<tipo>(<alcance>): <descripción breve>
```

- **Header máximo**: 100 caracteres
- **Tipos permitidos**: `feat`, `fix`, `docs`, `refactor`, `chore`, `test`, `style`, `ci`
- Si necesitas más detalle, usar el **cuerpo** del commit (no el header):

```bash
git commit -m "feat(core): implement contracts with SHA-256" -m "Includes PDF generation, unit tests, and Supabase migrations with RLS policies"
```

---

## 6. JSX: Escapar Comillas dentro de Texto

### Error encontrado
En `dashboard/page.tsx`, se usaron comillas dobles literales `"` dentro de contenido JSX, provocando el error `react/no-unescaped-entities`.

```tsx
// ❌ INCORRECTO
<p>Sesión fotográfica "Boda García"</p>

// ✅ CORRECTO
<p>Sesión fotográfica &ldquo;Boda García&rdquo;</p>
```

### Regla
Dentro de contenido de texto JSX, **siempre** usar entidades HTML para caracteres especiales: `&ldquo;` / `&rdquo;` para comillas, `&apos;` para apóstrofes.

---

## 7. Variables Destructuradas No Usadas

### Error encontrado
En `page.tsx` (público), se destructuró `error` de la respuesta de Supabase pero nunca se usó, generando un warning `@typescript-eslint/no-unused-vars`.

```typescript
// ❌ INCORRECTO
const { data, error } = await supabase.from('table').select('*');
// 'error' nunca se usa

// ✅ CORRECTO
const { data } = await supabase.from('table').select('*');
```

### Regla
- Si no vas a usar una variable de destructuring, **no la declares**.
- Si necesitas la variable pero no la usarás en el bloque actual (ej: en un mock de test), prefijarla con `_`:

```typescript
async getByClientId(_clientId: string): Promise<Contract[]> { return []; }
```

---

## 8. `npm audit` — Vulnerabilidades Conocidas

### Estado actual
`npm audit` reportó **2 vulnerabilidades de severidad moderada** relacionadas con PostCSS (XSS en la salida CSS Stringify). Estas vienen de la dependencia interna de Next.js y **no tienen solución** sin hacer un downgrade destructivo de Next.js.

### Regla
- Ejecutar `npm audit` periódicamente.
- Si la vulnerabilidad viene de un paquete interno de un framework (como `postcss` dentro de `next`), **no ejecutar** `npm audit fix --force` ya que puede romper el proyecto.
- Documentar la vulnerabilidad y esperar al parche del framework.

---

## 9. Imports No Usados Generan Advertencias

### Error encontrado
Se importaron componentes de `lucide-react` que luego no se usaron en el componente final: `FileText`, `Clock`, `AlertCircle`.

### Regla
Después de cada refactor, **revisar los imports** y eliminar los que ya no se necesitan. ESLint con `@typescript-eslint/no-unused-vars` los detectará.

---

## 10. `package.json`: Mantener Scripts Alineados con Workflows

### Error encontrado
El workflow `/commit-local` exigía ejecutar `npm run type-check`, pero ese script no existía en el `package.json`.

### Regla
Cada vez que se agregue un nuevo workflow o se mencione un comando en la documentación del proyecto, **verificar** que el script correspondiente exista en `package.json`:

```json
{
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "lint": "eslint",
    "type-check": "tsc --noEmit"
  }
}
```

---

## Resumen de Resultados de la Auditoría

| Validación | Resultado |
|---|---|
| **Vitest (8 tests)** | ✅ 100% pasaron |
| **TypeScript (`tsc --noEmit`)** | ✅ 0 errores |
| **ESLint** | ✅ 0 errores, 4 warnings menores |
| **npm audit** | ⚠️ 2 moderadas (PostCSS/Next.js internos) |
| **Git Commit** | ✅ `4c4fa05` — Conventional Commits |
| **Supabase RLS** | ✅ 3 tablas con políticas de seguridad |
