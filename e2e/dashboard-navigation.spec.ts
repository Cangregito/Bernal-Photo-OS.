import { test, expect } from '@playwright/test';

test.describe('Navegación del Dashboard', () => {
  test('debe cargar el panel de control con stats y calendario', async ({ page }) => {
    await page.goto('/dashboard');

    // Verificar encabezado
    await expect(page.locator('text=Panel de Control')).toBeVisible();
    await expect(page.locator('text=Resumen en tiempo real')).toBeVisible();

    // Verificar que existan las 4 stat cards
    await expect(page.locator('text=Clientes Activos')).toBeVisible();
    await expect(page.locator('text=Sesiones Programadas')).toBeVisible();
    await expect(page.locator('text=Ingresos Totales')).toBeVisible();
    await expect(page.locator('text=Firmas Pendientes')).toBeVisible();

    // Verificar calendario
    await expect(page.locator('text=Lun')).toBeVisible();
    await expect(page.locator('text=Dom')).toBeVisible();
  });

  test('debe navegar entre secciones del sidebar', async ({ page }) => {
    await page.goto('/dashboard');

    // Navegar a Clientes
    await page.click('text=Clientes');
    await expect(page).toHaveURL(/\/dashboard\/clients/);
    await expect(page.locator('text=Gestión de Clientes')).toBeVisible();

    // Navegar a Sesiones
    await page.click('text=Sesiones');
    await expect(page).toHaveURL(/\/dashboard\/sessions/);

    // Navegar a Cotizaciones
    await page.click('text=Cotizaciones');
    await expect(page).toHaveURL(/\/dashboard\/quotes/);

    // Navegar a Contratos
    await page.click('text=Contratos');
    await expect(page).toHaveURL(/\/dashboard\/contracts/);
  });

  test('debe abrir y cerrar el panel de notificaciones', async ({ page }) => {
    await page.goto('/dashboard');

    // Click en la campana
    await page.locator('button').filter({ has: page.locator('svg.lucide-bell') }).click();

    // Verificar que se abre el panel
    await expect(page.locator('text=Notificaciones')).toBeVisible();
    await expect(page.locator('text=Contrato firmado')).toBeVisible();

    // Click fuera para cerrar
    await page.click('body', { position: { x: 10, y: 10 } });
  });

  test('debe abrir el dropdown de perfil', async ({ page }) => {
    await page.goto('/dashboard');

    // Click en el avatar/nombre del perfil
    await page.locator('text=Bernal Photo').first().click();

    // Verificar opciones del menú
    await expect(page.locator('text=Mi Perfil')).toBeVisible();
    await expect(page.locator('text=Configuración')).toBeVisible();
    await expect(page.locator('text=Cerrar Sesión')).toBeVisible();
  });
});
