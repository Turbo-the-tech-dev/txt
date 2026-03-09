## 2026-02-20 - [Dynamic Copy Button Injection]
**Learning:** For static sites that fetch and render Markdown dynamically (e.g., via marked.js), UI enhancements like 'Copy' buttons must be injected post-render. To avoid layout shifts and provide a polished feel, wrapping the code block and its button in a relative container ('code-wrapper') and using a subtle fade-in transition on the main content container works well.
**Action:** Use a post-render 'addCopyButtons' function and an 'opacity: 0' -> 'opacity: 1' transition on the content container after rendering is complete.
