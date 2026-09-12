async (page) => {
  // FamilyHub use-case shots → docs/user/images (app at http://localhost:3000, seed anna@example.com).
  const dir = '/Users/joe/Projects/Privat/family/docs/user/images';
  const base = 'http://localhost:3000';

  const shot = async (name) => {
    await page.waitForTimeout(400);
    await page.screenshot({ path: `${dir}/${name}.png`, fullPage: true, animations: 'disabled' });
  };

  const goto = async (path) => {
    await page.goto(`${base}${path}`, { waitUntil: 'networkidle' });
    await page.waitForTimeout(400);
  };

  const loginAnna = async () => {
    await goto('/de/login');
    await page.getByLabel('E-Mail').fill('anna@example.com');
    await page.getByLabel('Passwort').fill('password123');
    await page.getByRole('button', { name: 'Anmelden' }).click();
    await page.waitForURL(/\/(de\/)?dashboard/, { timeout: 20000 });
    await page.waitForLoadState('networkidle');
  };

  await page.setViewportSize({ width: 1440, height: 900 });

  // --- Auth ---
  await goto('/de/login');
  await shot('01-login');

  await page.getByLabel('E-Mail').fill('wrong@example.com');
  await page.getByLabel('Passwort').fill('wrongpass');
  await page.getByRole('button', { name: 'Anmelden' }).click();
  await page.getByText('E-Mail oder Passwort ist falsch.').waitFor();
  await shot('02-login-fehler');

  await goto('/de/register');
  await shot('03-registrieren');

  const email = `doku-${Date.now()}@example.com`;
  await page.getByLabel('Dein Name').fill('Lisa Doku');
  await page.getByLabel('E-Mail').fill(email);
  await page.getByLabel('Passwort').fill('password123');
  await page.getByRole('button', { name: 'Registrieren' }).click();
  await page.waitForURL(/onboarding/, { timeout: 20000 });
  await page.getByRole('heading', { name: 'Neue Familie gründen' }).waitFor();
  await shot('04-onboarding');

  // --- Signed-in family (demo seed) ---
  await goto('/de/login');
  await loginAnna();
  await shot('05-uebersicht');

  await goto('/de/todos');
  await page.getByRole('heading', { name: 'Aufgaben' }).waitFor();
  await shot('06-aufgaben-listen');

  await page.getByRole('button', { name: 'Neue Liste' }).click();
  await page.getByRole('heading', { name: 'Neue Liste' }).waitFor();
  await shot('07-aufgaben-liste-erstellen');
  await page.keyboard.press('Escape');

  await page.getByRole('link', { name: /Haushalt/ }).click();
  await page.waitForURL(/\/todos\//);
  await page.getByPlaceholder('Neue Aufgabe hinzufügen…').waitFor();
  await shot('08-aufgaben-liste');

  await page.getByText('Wocheneinkauf erledigen').click();
  await page.getByRole('heading', { name: 'Aufgabe bearbeiten' }).waitFor();
  await shot('09-aufgaben-bearbeiten');
  await page.keyboard.press('Escape');

  await goto('/de/calendar');
  await page.getByRole('button', { name: 'Neuer Termin' }).waitFor();
  await shot('10-kalender');

  await page.getByRole('button', { name: 'Neuer Termin' }).click();
  await page.getByRole('heading', { name: 'Neuer Termin' }).waitFor();
  await shot('11-kalender-termin-erstellen');
  await page.keyboard.press('Escape');

  await page.locator('ul li').getByText('Familienabendessen').click();
  await page.getByRole('heading', { name: 'Termin bearbeiten' }).waitFor();
  await shot('12-kalender-termin-bearbeiten');
  await page.keyboard.press('Escape');

  await goto('/de/mindmaps');
  await page.getByRole('heading', { name: 'Mindmaps' }).waitFor();
  await shot('13-mindmaps');

  await page.getByRole('button', { name: 'Neue Mindmap' }).click();
  await page.getByRole('heading', { name: 'Mindmap erstellen' }).waitFor();
  await shot('14-mindmap-erstellen');
  await page.keyboard.press('Escape');

  await page.getByRole('link', { name: /Urlaubsplanung/ }).click();
  await page.waitForURL(/\/mindmaps\//);
  const ideaNode = page.locator('.react-flow__node').filter({ hasText: 'Strandurlaub Italien' });
  await ideaNode.waitFor({ timeout: 15000 });
  await page.waitForTimeout(800);
  await shot('15-mindmap-editor');

  await ideaNode.click();
  await page.getByRole('button', { name: 'Idee' }).waitFor();
  await shot('16-mindmap-knoten-hinzufuegen');

  await ideaNode.dblclick();
  await page.getByRole('heading', { name: 'Knoten bearbeiten' }).waitFor();
  await shot('17-mindmap-knoten-bearbeiten');
  await page.keyboard.press('Escape');
  await page.getByRole('heading', { name: 'Knoten bearbeiten' }).waitFor({ state: 'hidden' });

  await page.getByTitle('Knoten automatisch hierarchisch anordnen').click();
  await page.getByText('Auto-Layout').waitFor();
  await shot('18-mindmap-auto-layout');

  await goto('/de/settings');
  await page.getByRole('heading', { name: 'Einstellungen' }).waitFor();
  await shot('19-einstellungen');

  // English locale of the same signed-in session
  await goto('/en/dashboard');
  await page.getByRole('heading', { name: /Hi, Anna/ }).waitFor();
  await shot('20-dashboard-en');

  // Mobile
  await page.setViewportSize({ width: 390, height: 844 });
  await goto('/de/dashboard');
  await page.getByRole('heading', { name: /Hallo, Anna/ }).waitFor();
  await shot('21-uebersicht-mobil');

  await goto('/de/todos');
  await page.getByRole('heading', { name: 'Aufgaben' }).waitFor();
  await shot('22-aufgaben-mobil');

  await goto('/de/calendar');
  await page.waitForTimeout(600);
  await shot('23-kalender-mobil');

  await goto('/de/mindmaps');
  await page.getByRole('heading', { name: 'Mindmaps' }).waitFor();
  await shot('24-mindmaps-mobil');

  await goto('/de/settings');
  await page.getByRole('heading', { name: 'Einstellungen' }).waitFor();
  await shot('25-einstellungen-mobil');

  await goto('/de/login');
  await shot('26-login-mobil');

  return 'captured';
}
