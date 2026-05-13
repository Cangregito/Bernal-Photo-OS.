import { test, expect } from '@playwright/test';

test.beforeEach(async ({ page }) => {
  await page.route('**/api/sign/preview?token=*', async route => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        content: 'CONTRATO DE PRUEBA\n\nCláusula 1: Servicio fotográfico.\nCláusula 2: Entrega digital.',
        clientName: 'Cliente Test',
      }),
    });
  });

  await page.route('**/api/sign', async route => {
    await new Promise(resolve => setTimeout(resolve, 150));
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        success: true,
        message: 'Contrato firmado legalmente con SHA-256',
      }),
    });
  });
});

test.describe('Flujo de Firma de Contrato', () => {
  test('debe mostrar la página de firma con los elementos correctos', async ({ page }) => {
    await page.goto('/sign/test-token-abc');
    
    // Verificar elementos de la página de firma
    await expect(page.getByRole('heading', { name: 'BERNAL PHOTO' })).toBeVisible();
    await expect(page.locator('text=Firma Digital de Contrato')).toBeVisible();
    await expect(page.locator('text=Firmar Contrato Digitalmente').first()).toBeVisible();
    
    // Verificar aviso de token único
    await expect(page.locator('text=Este enlace es de un solo uso')).toBeVisible();
  });

  test('debe firmar el contrato y mostrar confirmación', async ({ page }) => {
    await page.goto('/sign/test-token-abc');

    // Aceptar términos para habilitar botón
    await page.check('input[type="checkbox"]');
    
    // Click en "Firmar Contrato"
    await page.click('button:has-text("Firmar Contrato Digitalmente")');
    
    // Esperar confirmación (timeout de 5s para la simulación de 2s)
    await expect(page.locator('text=¡Contrato Firmado!')).toBeVisible({ timeout: 5000 });
    await expect(page.locator('text=hash criptográfico SHA-256')).toBeVisible();
    await expect(page.locator('text=Sello de integridad SHA-256 generado exitosamente')).toBeVisible();
  });

  test('debe mostrar página de enlace expirado', async ({ page }) => {
    await page.goto('/sign/expired');
    
    await expect(page.locator('text=Enlace Expirado')).toBeVisible();
    await expect(page.locator('text=ya fue utilizado o ha expirado')).toBeVisible();
    await expect(page.locator('text=contacta a tu fotógrafo')).toBeVisible();
  });
});
