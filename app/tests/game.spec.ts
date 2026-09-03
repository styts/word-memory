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

    // Check GitHub link
    const githubLink = page.locator('.github-link');
    await expect(githubLink).toBeVisible();
    await expect(githubLink).toHaveAttribute('href', 'https://github.com/styts/word-memory');
  });

  test('should complete full game lifecycle with delay step from start to end screen', async ({ page }) => {
    // 1. Open settings and set memorize duration to 1 sec and delay duration to 1 sec for fast test execution
    await page.locator('.settings-btn').click();
    await page.locator('#memorizeSeconds').fill('1');
    await page.locator('#delaySeconds').fill('1');
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

    // 4. Verify transition to delay step
    const delayContainer = page.locator('.delay-container');
    await expect(delayContainer).toBeVisible({ timeout: 5000 });
    await expect(page.locator('.delay-number')).toHaveText('1');

    // 5. Wait for transition to 'play' state (play grid visible)
    const playGrid = page.locator('.play-grid');
    await expect(playGrid).toBeVisible({ timeout: 10000 });
    await expect(page.locator('.progressor-container')).toBeVisible();

    const playWords = page.locator('.play-word');
    await expect(playWords).toHaveCount(12);

    // 6. Click 4 words on grid
    for (let i = 0; i < 4; i++) {
      await playWords.nth(i).click();
    }

    // 7. Verify transition to 'end' state
    const endBanner = page.locator('.end-banner');
    await expect(endBanner).toBeVisible();
    await expect(page.locator('.try-again-btn')).toBeVisible();

    // 8. Click PLAY again to restart
    await page.locator('.try-again-btn').click();
    await expect(page.locator('.status-banner')).toHaveText('Memorize the words below');
  });

  test('should open adjust and save game settings including delay and play duration', async ({ page }) => {
    // Open settings modal
    await page.locator('.settings-btn').click();
    await expect(page.locator('.settings-card h2')).toHaveText('Game Settings');

    // Change settings
    await page.locator('#memorizeSeconds').fill('3');
    await page.locator('#delaySeconds').fill('4');
    await page.locator('#playSeconds').fill('20');
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
    expect(parsed.delaySeconds).toBe(4);
    expect(parsed.playSeconds).toBe(20);
    expect(parsed.targetWordsCount).toBe(5);
    expect(parsed.totalGridWords).toBe(15);
  });
});
