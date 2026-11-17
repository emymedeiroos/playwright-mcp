const { test, expect } = require('@playwright/test');

function uniqueEmail() {
  return `qa-compras-${Date.now()}-${Math.random().toString(36).slice(2, 8)}@example.com`;
}

async function createAccount(page, email) {
  await page.goto('/login');
  await page.getByPlaceholder('Name').fill('QA Compras');
  await page.getByPlaceholder('Email Address').first().fill(email);
  await page.getByRole('button', { name: 'Signup' }).click();

  await expect(page.getByRole('heading', { name: 'Enter Account Information' })).toBeVisible();
  await page.getByLabel('Mr.', { exact: true }).check();
  await page.getByLabel('Password', { exact: true }).fill('QA-Only-2026');
  await page.getByLabel('First name', { exact: true }).fill('QA');
  await page.getByLabel('Last name', { exact: true }).fill('Compras');
  await page.getByLabel('Address', { exact: true }).fill('123 Synthetic Street');
  await page.getByLabel('Country', { exact: true }).selectOption('Canada');
  await page.getByLabel('State', { exact: true }).fill('Ontario');
  await page.getByLabel('City', { exact: true }).fill('Toronto');
  await page.getByLabel('Zipcode', { exact: true }).fill('A1A1A1');
  await page.getByLabel('Mobile Number', { exact: true }).fill('5550102030');
  await page.getByRole('button', { name: 'Create Account' }).click();

  await expect(page.getByText('Account Created!', { exact: true })).toBeVisible();
  await page.getByRole('link', { name: 'Continue' }).click();
}

async function addOneProductToCart(page) {
  await page.goto('/products');
  await page.getByPlaceholder('Search Product').fill('Sleeveless');
  await page.getByRole('button', { name: 'Submit' }).click();
  await expect(page.getByRole('heading', { name: 'Searched Products' })).toBeVisible();

  const firstProduct = page.locator('.product-image-wrapper').first();
  await firstProduct.hover();
  await firstProduct.getByRole('link', { name: 'Add to cart' }).click();
  await expect(page.getByRole('heading', { name: 'Added!' })).toBeVisible();
  await page.getByRole('link', { name: 'View Cart' }).click();
  await expect(page).toHaveURL(/\/view_cart$/);
}

test.describe('Compras - AutomationExercise', () => {
  test('Compras - homepage is available', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveTitle(/Automation Exercise/);
    await expect(page.getByRole('link', { name: 'Website' })).toBeVisible();
  });

  test('Compras - search product and add it to cart', async ({ page }) => {
    await addOneProductToCart(page);

    await expect(page.locator('#cart_info_table tbody tr')).toHaveCount(1);
    await expect(page.locator('.cart_quantity').first()).toContainText('1');
  });

  test('Compras - filter products by Women Dress category', async ({ page }) => {
    await page.goto('/products');
    await page.getByRole('link', { name: 'Women' }).click();
    await page.getByRole('link', { name: 'Dress', exact: true }).click();

    await expect(page.locator('.title.text-center')).toContainText(/Women - Dress/i);
    await expect(page.locator('.product-image-wrapper').first()).toBeVisible();
  });

  test('Compras - add a product with quantity two', async ({ page }) => {
    await page.goto('/product_details/1');
    await page.getByRole('spinbutton').fill('2');
    await page.getByRole('button', { name: 'Add to cart' }).click();
    await page.getByRole('link', { name: 'View Cart' }).click();

    await expect(page).toHaveURL(/\/view_cart$/);
    await expect(page.locator('.cart_quantity').first()).toContainText('2');
  });

  test('Compras - remove product from cart', async ({ page }) => {
    await addOneProductToCart(page);
    await page.locator('a.cart_quantity_delete').first().click();

    await expect(page.getByText(/Cart is empty/i)).toBeVisible();
  });

  test('Compras - reject invalid login', async ({ page }) => {
    await page.goto('/login');
    await page.getByPlaceholder('Email Address').fill('invalid.qa@example.com');
    await page.getByPlaceholder('Password').fill('not-a-real-password');
    await page.getByRole('button', { name: 'Login' }).click();

    await expect(page.getByText('Your email or password is incorrect!')).toBeVisible();
  });

  test('Compras - create login logout login delete account lifecycle', async ({ page }) => {
    const email = uniqueEmail();
    await createAccount(page, email);

    await page.getByRole('link', { name: 'Logout' }).click();
    await expect(page).toHaveURL(/\/login$/);

    await page.getByPlaceholder('Email Address').fill(email);
    await page.getByPlaceholder('Password').fill('QA-Only-2026');
    await page.getByRole('button', { name: 'Login' }).click();
    await expect(page.getByText(/Logged in as QA Compras/i)).toBeVisible();

    await page.getByRole('link', { name: 'Delete Account' }).click();
    await expect(page.getByText('Account Deleted!', { exact: true })).toBeVisible();
  });

  test('Compras - reject duplicate signup email', async ({ page }) => {
    const email = uniqueEmail();
    await createAccount(page, email);
    await page.getByRole('link', { name: 'Logout' }).click();

    await page.getByPlaceholder('Name').fill('Duplicate QA');
    await page.getByPlaceholder('Email Address').first().fill(email);
    await page.getByRole('button', { name: 'Signup' }).click();

    await expect(page.getByText('Email Address already exist!')).toBeVisible();

    await page.getByPlaceholder('Email Address').fill(email);
    await page.getByPlaceholder('Password').fill('QA-Only-2026');
    await page.getByRole('button', { name: 'Login' }).click();
    await page.getByRole('link', { name: 'Delete Account' }).click();
    await expect(page.getByText('Account Deleted!', { exact: true })).toBeVisible();
  });

  test('Compras - submit contact form', async ({ page }) => {
    await page.goto('/contact_us');
    await page.getByPlaceholder('Name').fill('QA Compras');
    await page.getByPlaceholder('Email').fill('qa-synthetic@example.com');
    await page.getByPlaceholder('Subject').fill('Synthetic E2E validation');
    await page.getByPlaceholder('Your Message Here').fill('Mensagem sintética para validação automatizada.');

    page.once('dialog', (dialog) => dialog.accept());
    await page.getByRole('button', { name: 'Submit' }).click();

    await expect(page.getByText(/Success! Your details have been submitted successfully/i)).toBeVisible();
  });
});
