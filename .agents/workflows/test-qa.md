---
description: Ejecuta pruebas unitarias y de integración enfocadas en el flujo legal y financiero del sistema.
---

### Reglas para /test-qa:
1. **Unitarios:** Ejecuta pruebas sobre los helpers de cálculo de cotizaciones y lógica de expiración de links.
2. **Integración:** Valida que al marcar un contrato como "firmado", el sistema genere automáticamente el log de auditoría.
3. **Cobertura:** Muestra el porcentaje de cobertura de código (Code Coverage).
4. **Feedback:** Indica específicamente qué funciones fallaron y sugiere una posible corrección basada en la lógica de Clean Architecture definida.