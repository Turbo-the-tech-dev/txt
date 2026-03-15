import asyncio
from playwright.async_api import async_playwright

async def main():
    async with async_playwright() as p:
        browser = await p.chromium.launch()
        context = await browser.new_context(permissions=['clipboard-read', 'clipboard-write'])
        page = await context.new_page()

        # Mocking marked to ensure we have a code block to test
        await page.route("https://cdn.jsdelivr.net/npm/marked/marked.min.js", lambda route: route.fulfill(
            status=200,
            content_type="application/javascript",
            body="window.marked = { parse: (md) => '<h2>Mocked README</h2><pre><code>txt parse input.txt</code></pre>' };"
        ))

        await page.goto('http://localhost:8000/docs/index.html')
        await page.wait_for_selector('.copy-btn')

        # Verify initial state
        copy_btn = page.locator('.copy-btn')
        await expect(copy_btn).to_be_visible() # Visible on hover/focus but mock/mobile might show it

        # Take screenshot
        await page.hover('pre')
        await page.screenshot(path='verification/docs_copy_btn.png')

        # Test copy
        await copy_btn.click()
        await expect(copy_btn).to_have_text('Copied!')
        await page.screenshot(path='verification/docs_copied_btn.png')

        await browser.close()

from playwright.sync_api import expect # Not quite right for async but I'll use async wait
async def main_fixed():
    async with async_playwright() as p:
        browser = await p.chromium.launch()
        context = await browser.new_context(permissions=['clipboard-read', 'clipboard-write'])
        page = await context.new_page()
        await page.route("https://cdn.jsdelivr.net/npm/marked/marked.min.js", lambda route: route.fulfill(
            status=200,
            content_type="application/javascript",
            body="window.marked = { parse: (md) => '<h2>Mocked README</h2><pre><code>txt parse input.txt</code></pre>' };"
        ))
        await page.goto('http://localhost:8000/docs/index.html')
        btn = await page.wait_for_selector('.copy-btn')
        await page.hover('pre')
        await page.screenshot(path='verification/docs_copy_btn.png')
        await btn.click()
        await asyncio.sleep(0.5)
        # Check text
        text = await btn.inner_text()
        print(f"Button text: {text}")
        await page.screenshot(path='verification/docs_copied_btn.png')
        await browser.close()

if __name__ == '__main__':
    import os
    if not os.path.exists('verification'):
        os.makedirs('verification')
    asyncio.run(main_fixed())
