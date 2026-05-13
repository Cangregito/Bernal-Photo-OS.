import { test, expect } from '@playwright/test';

test.describe('Página de Login', () => {
  test('debe mostrar el formulario de login', async ({ page }) => {
    await page.goto('/login');

    await expect(page.locator('text=Iniciar Sesión')).toBeVisible();
    await expect(page.locator('text=Accede al panel de administración')).toBeVisible();
    await expect(page.locator('#email')).toBeVisible();
    await expect(page.locator('#password')).toBeVisible();
    await expect(page.locator('button:has-text("Acceder")')).toBeVisible();
  });

  test('el botón debe estar deshabilitado sin datos', async ({ page }) => {
    await page.goto('/login');

    const submitBtn = page.locator('button:has-text("Acceder")');
    await expect(submitBtn).toBeDisabled();
  });

  test('debe llenar los campos y simular login en dev', async ({ page }) => {
    await page.goto('/login');

    await page.fill('#email', 'admin@bernalphoto.com');
    await page.fill('#password', 'password123');

    const submitBtn = page.locator('button:has-text("Acceder")');
    await expect(submitBtn).toBeEnabled();

    // En dev sin Supabase, el login simula y redirige al dashboard
    await submitBtn.click();
    await expect(page.locator('text=Verificando...')).toBeVisible();

    // Esperar redirección al dashboard (puede tardar más en CI)
    await expect(page).toHaveURL(/\/dashboard/, { timeout: 15000 });
  });

  test('debe mostrar branding en desktop', async ({ page }) => {
    // Asegurar viewport de escritorio
    await page.setViewportSize({ width: 1280, height: 800 });
    await page.goto('/login');

    await expect(page.locator('text=Sistema')).toBeVisible();
    await expect(page.locator('text=Fotográfico')).toBeVisible();
    await expect(page.locator('text=integridad documental SHA-256')).toBeVisible();
  });
});
