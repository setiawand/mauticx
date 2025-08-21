# Frontend Testing dengan Playwright

Dokumentasi ini menjelaskan cara menggunakan Playwright untuk testing frontend aplikasi MauticX.

## Setup

Playwright sudah dikonfigurasi dan siap digunakan. Browser dependencies sudah terinstall.

## Menjalankan Tests

### Semua Tests
```bash
npm test
```

### Test dengan UI Mode (Recommended untuk Development)
```bash
npm run test:ui
```

### Test dengan Browser Visible (Headed Mode)
```bash
npm run test:headed
```

### Debug Mode
```bash
npm run test:debug
```

### Menjalankan Test Spesifik
```bash
# Test file tertentu
npx playwright test campaigns.spec.ts

# Test dengan pattern tertentu
npx playwright test --grep "should display campaigns page"

# Test pada browser tertentu
npx playwright test --project=chromium
```

## Struktur Test Files

- `campaigns.spec.ts` - Test untuk halaman campaigns dan navigasi
- `dashboard.spec.ts` - Test untuk dashboard utama dan navigasi umum
- `email-editor.spec.ts` - Test khusus untuk email editor functionality

## Test Coverage

### Campaign Management
- ✅ Tampilan halaman campaigns
- ✅ Navigasi ke halaman create campaign
- ✅ Validasi form
- ✅ Enable/disable tombol berdasarkan input

### Email Editor
- ✅ Interface email editor
- ✅ Tab switching (MJML Editor, Split View, Preview)
- ✅ MJML content editing
- ✅ Save/Cancel functionality
- ✅ Responsive behavior
- ✅ Content persistence

### Dashboard & Navigation
- ✅ Dashboard homepage
- ✅ Sidebar navigation
- ✅ Page loading
- ✅ Error handling
- ✅ Theme toggle

### Accessibility
- ✅ ARIA labels
- ✅ Keyboard navigation
- ✅ Screen reader compatibility

### Responsive Design
- ✅ Mobile viewport (375px)
- ✅ Tablet viewport (768px)
- ✅ Desktop viewport (1200px+)

## Configuration

Konfigurasi Playwright ada di `playwright.config.ts`:

- **Base URL**: `http://localhost:3001`
- **Browsers**: Chromium, Firefox, WebKit
- **Parallel execution**: Enabled
- **Retries**: 2x pada CI, 0x pada development
- **Trace**: On first retry
- **Reporter**: HTML report

## Best Practices

### 1. Selectors
```typescript
// ✅ Good - Use data-testid
page.locator('[data-testid="email-editor"]')

// ✅ Good - Use semantic selectors
page.locator('button[type="submit"]')

// ❌ Avoid - Fragile CSS selectors
page.locator('.btn.btn-primary.mt-4')
```

### 2. Waiting
```typescript
// ✅ Good - Wait for specific conditions
await expect(page.locator('text=Loading')).not.toBeVisible();

// ✅ Good - Wait for network idle
await page.waitForLoadState('networkidle');

// ❌ Avoid - Fixed timeouts
await page.waitForTimeout(5000);
```

### 3. Test Organization
```typescript
// ✅ Good - Group related tests
test.describe('Email Editor', () => {
  test.beforeEach(async ({ page }) => {
    // Common setup
  });
  
  test('specific functionality', async ({ page }) => {
    // Test implementation
  });
});
```

## Debugging Tests

### 1. Visual Debugging
```bash
# Run with UI mode untuk visual debugging
npm run test:ui
```

### 2. Screenshots
```typescript
// Ambil screenshot saat test fail
test('example', async ({ page }) => {
  await page.screenshot({ path: 'debug.png' });
});
```

### 3. Console Logs
```typescript
// Listen untuk console logs
page.on('console', msg => console.log(msg.text()));
```

## CI/CD Integration

Untuk menjalankan tests di CI/CD:

```yaml
# GitHub Actions example
- name: Install dependencies
  run: npm ci
  
- name: Install Playwright browsers
  run: npx playwright install --with-deps
  
- name: Run tests
  run: npm test
  
- name: Upload test results
  uses: actions/upload-artifact@v3
  if: always()
  with:
    name: playwright-report
    path: playwright-report/
```

## Troubleshooting

### Common Issues

1. **Server not starting**
   - Pastikan `npm run dev` berjalan di port 3001
   - Check `playwright.config.ts` untuk webServer configuration

2. **Element not found**
   - Gunakan `page.locator().first()` untuk multiple matches
   - Add proper waits dengan `waitForSelector()`

3. **Flaky tests**
   - Increase timeout untuk slow operations
   - Use proper waiting strategies
   - Avoid fixed timeouts

### Debug Commands

```bash
# Run single test dengan debug
npx playwright test campaigns.spec.ts --debug

# Generate test code
npx playwright codegen localhost:3001

# Show test report
npx playwright show-report
```

## Extending Tests

Untuk menambah test baru:

1. Buat file `.spec.ts` di folder `tests/`
2. Import `test` dan `expect` dari `@playwright/test`
3. Gunakan `test.describe()` untuk grouping
4. Implement test cases dengan `test()`
5. Jalankan dengan `npm test`

## Resources

- [Playwright Documentation](https://playwright.dev/)
- [Best Practices](https://playwright.dev/docs/best-practices)
- [API Reference](https://playwright.dev/docs/api/class-playwright)