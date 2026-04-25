---
description: Ejecuta validaciones de calidad (Lint/Type-check) y realiza un commit siguiendo el estándar de Conventional Commits.
---

### Reglas para /commit-local:
1. **Validación:** Ejecuta `npm run lint` y `npm run type-check`. Si hay errores, detén el proceso y muéstralos.
2. **Estado:** Muestra un resumen de los archivos modificados (`git status`).
3. **Entrada:** Solicita al usuario el `tipo` (feat, fix, docs, refactor, chore) y una descripción breve.
4. **Ejecución:**
   - Realiza `git add .`.
   - Ejecuta `git commit -m "<tipo>(scope): <descripcion>"`.
5. **Confirmación:** Informa que el commit local fue exitoso y está listo para ser pusheado.