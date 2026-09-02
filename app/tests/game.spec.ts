import { test, expect } from '@playwright/test';

test.describe('Word Memory Game', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should display initial start screen correctly', async ({ page }) => {
    // Check title and header elements
    await expect(page.locator('.timer')).toBeVisible();
    await expect(page.locator('.settings-btn')).toBeVisible();
    await expect(page.locator('.status-banner')).toHaveText('Memorize the words below');

    // Check target words initial state (question marks)
    const hiddenWords = page.locator('.memorize-word');
    await expect(hiddenWords).toHaveCount(4);
    for (let i = 0; i < 4; i++) {
      await expect(hiddenWords.nth(i)).toHaveText('?');
    }

    // Check Play button
    const playBtn = page.locator('.play-btn');
    await expect(playBtn).toBeVisible();
    await expect(playBtn).toHaveText('PLAY');
  });

  test('should complete full game lifecycle from start to end screen', async ({ page }) => {
    // 1. Open settings and set memorize duration to 1 sec for fast test execution
    await page.locator('.settings-btn').click();
    const durationInput = page.locator('#memorizeSeconds');
    await durationInput.fill('1');
    await page.locator('.save-btn').click();

    // 2. Click PLAY to start memorizing
    await page.locator('.play-btn').click();

    // 3. Verify revealed words during memorize state
    const memorizeWords = page.locator('.memorize-word');
    await expect(memorizeWords).toHaveCount(4);
    const targetWordsText: string[] = [];
    for (let i = 0; i < 4; i++) {
      const text = await memorizeWords.nth(i).textContent();
      if (text) targetWordsText.push(text.trim());
    }
    expect(targetWordsText.length).toBe(4);

    // 4. Wait for transition to 'play' state (play grid visible)
    const playGrid = page.locator('.play-grid');
    await expect(playGrid).toBeVisible({ timeout: 5000 });

    const playWords = page.locator('.play-word');
    await expect(playWords).toHaveCount(12);

    // 5. Click 4 words on grid
    for (let i = 0; i < 4; i++) {
      await playWords.nth(i).click();
    }

    // 6. Verify transition to 'end' state
    const endBanner = page.locator('.end-banner');
    await expect(endBanner).toBeVisible();
    await expect(page.locator('.try-again-btn')).toBeVisible();

    // 7. Click PLAY again to restart
    await page.locator('.try-again-btn').click();
    await expect(page.locator('.status-banner')).toHaveText('Memorize the words below');
  });

  test('should open adjust and save game settings', async ({ page }) => {
    // Open settings modal
    await page.locator('.settings-btn').click();
    await expect(page.locator('.settings-card h2')).toHaveText('Game Settings');

    // Change settings
    await page.locator('#memorizeSeconds').fill('3');
    await page.locator('#targetWordsCount').fill('5');
    await page.locator('#totalGridWords').fill('15');

    // Save and close
    await page.locator('.save-btn').click();
    await expect(page.locator('.settings-card')).not.toBeVisible();

    // Verify localStorage has persisted settings
    const storedSettings = await page.evaluate(() => {
      return localStorage.getItem('word_memory_settings');
    });
    expect(storedSettings).not.toBeNull();
    const parsed = JSON.parse(storedSettings!);
    expect(parsed.memorizeSeconds).toBe(3);
    expect(parsed.targetWordsCount).toBe(5);
    expect(parsed.totalGridWords).toBe(15);
  });
});
