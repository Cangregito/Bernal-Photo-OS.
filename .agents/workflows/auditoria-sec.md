---
description: Escaneo de vulnerabilidades, detección de secretos expuestos y auditoría de políticas RLS en Supabase.
---

### Reglas para /auditoria-sec:
1. **Dependencias:** Ejecuta `npm audit` para identificar librerías vulnerables.
2. **Secretos:** Escanea el código en busca de API Keys, contraseñas o tokens expuestos (especialmente en archivos no ignorados).
3. **Database (Supabase):**
   - Revisa las políticas de Row Level Security (RLS).
   - Verifica que ninguna tabla crítica (contracts, quotes, sessions) tenga acceso público sin autenticación.
4. **Reporte:** Genera un informe de "Estado de Seguridad" con prioridad: Crítico, Medio, Bajo.