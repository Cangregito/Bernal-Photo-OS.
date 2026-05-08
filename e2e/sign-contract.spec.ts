import { test, expect } from '@playwright/test';

test.describe('Flujo de Firma de Contrato', () => {
  test('debe mostrar la página de firma con los elementos correctos', async ({ page }) => {
    await page.goto('/sign/test-token-abc');
    
    // Verificar elementos de la página de firma
    await expect(page.locator('text=BERNAL PHOTO')).toBeVisible();
    await expect(page.locator('text=Firma Digital de Contrato')).toBeVisible();
    await expect(page.locator('text=Firmar Contrato').first()).toBeVisible();
    
    // Verificar aviso de token único
    await expect(page.locator('text=Este enlace es de un solo uso')).toBeVisible();
  });

  test('debe firmar el contrato y mostrar confirmación', async ({ page }) => {
    await page.goto('/sign/test-token-abc');
    
    // Click en "Firmar Contrato"
    await page.click('button:has-text("Firmar Contrato")');
    
    // Verificar estado de carga
    await expect(page.locator('text=Procesando firma...')).toBeVisible();
    
    // Esperar confirmación (timeout de 5s para la simulación de 2s)
    await expect(page.locator('text=¡Contrato Firmado!')).toBeVisible({ timeout: 5000 });
    await expect(page.locator('text=hash criptográfico SHA-256')).toBeVisible();
    await expect(page.locator('text=Sello de integridad generado exitosamente')).toBeVisible();
  });

  test('debe mostrar página de enlace expirado', async ({ page }) => {
    await page.goto('/sign/expired');
    
    await expect(page.locator('text=Enlace Expirado')).toBeVisible();
    await expect(page.locator('text=ya fue utilizado o ha expirado')).toBeVisible();
    await expect(page.locator('text=contacta a tu fotógrafo')).toBeVisible();
  });
});
