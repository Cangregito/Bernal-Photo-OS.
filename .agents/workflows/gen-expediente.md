---
description: Genera el expediente digital (PDF) de un cliente con sello de integridad SHA-256 y marca de agua.
---

### Reglas para /gen-expediente:
1. **Extracción:** Consulta en Supabase los datos del cliente, sesiones y contratos vinculados.
2. **Generación PDF:**
   - Usa la plantilla profesional con logo y marca de agua.
   - Incluye el hash SHA-256 del documento en el footer.
3. **Integridad:** Calcula el hash único combinando el PDF + Firma del cliente + Timestamp.
4. **Guardado:** Sube el archivo al bucket `expedientes-privados` y actualiza el estado en la tabla `audit_logs`.
5. **Resultado:** Entrega el enlace firmado (temporal) para visualización administrativa.