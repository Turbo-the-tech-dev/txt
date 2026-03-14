## 2026-03-14 - Interactive Code Blocks in Documentation
**Learning:** Adding interactive elements like "Copy" buttons to dynamically rendered Markdown requires post-processing after the Markdown-to-HTML conversion cycle is complete. Providing immediate visual feedback (e.g., "Copied!" text) significantly improves user confidence in the interaction.
**Action:** Use a post-rendering loop to identify code blocks, wrap them in a relative container, and inject accessibility-aware buttons (with ARIA labels and focus states).
