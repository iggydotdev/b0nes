/**
 * b0nes Inspector UI
 * 
 * Self-contained HTML page for the visual component inspector.
 * All styles and scripts are embedded inline -- zero external dependencies.
 * Uses only native DOM APIs: createElement, EventSource, fetch, etc.
 * 
 * Layout: 3-panel (browser | preview+editor | code output)
 * Theme: Dark dev-tool aesthetic with amber accent
 */

/**
 * Returns the complete HTML page for the inspector UI
 * @returns {string} Full HTML document
 */
export function getInspectorPageHTML() {
    return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>b0nes Inspector</title>
    <style>${getStyles()}</style>
</head>
<body>
    <div id="inspector-app">
        <header class="inspector-header">
            <div class="header-left">
                <span class="header-logo">b0nes</span>
                <span class="header-divider"></span>
                <span class="header-title">Inspector</span>
            </div>
            <div class="header-center">
                <div class="search-container">
                    <svg class="search-icon" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
                    <input type="text" id="search-input" placeholder="Search components..." autocomplete="off" spellcheck="false" />
                    <kbd class="search-kbd">/</kbd>
                </div>
            </div>
            <div class="header-right">
                <a href="/_inspector/visualizer" class="header-btn" title="Composition Visualizer" style="text-decoration:none;display:inline-flex;">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="5" r="3"/><circle cx="5" cy="19" r="3"/><circle cx="19" cy="19" r="3"/><path d="M12 8v4"/><path d="M8.5 16.5 12 12"/><path d="M15.5 16.5 12 12"/></svg>
                </a>
                <div id="connection-status" class="status-dot status-connecting" title="Connecting..."></div>
                <button id="btn-compose-mode" class="header-btn" title="Toggle Composition Mode">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/></svg>
                </button>
            </div>
        </header>

        <div class="inspector-body">
            <!-- Left Panel: Component Browser -->
            <aside class="panel panel-browser" id="panel-browser">
                <div class="panel-header">
                    <span class="panel-label">Components</span>
                    <span class="component-count" id="component-count">0</span>
                </div>
                <div class="browser-tree" id="browser-tree">
                    <div class="loading-placeholder">Loading components...</div>
                </div>
            </aside>

            <!-- Resize handle -->
            <div class="resize-handle" data-resize="browser"></div>

            <!-- Center Panel: Preview + Props Editor -->
            <main class="panel panel-center">
                <!-- Preview area -->
                <div class="preview-section" id="preview-section">
                    <div class="panel-header">
                        <span class="panel-label" id="preview-title">Preview</span>
                        <div class="preview-controls">
                            <button class="icon-btn" id="btn-refresh" title="Refresh Preview">
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 2v6h-6"/><path d="M3 12a9 9 0 0 1 15-6.7L21 8"/><path d="M3 22v-6h6"/><path d="M21 12a9 9 0 0 1-15 6.7L3 16"/></svg>
                            </button>
                            <button class="icon-btn" id="btn-toggle-bg" title="Toggle Background">
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M12 3v18"/><path d="M3 12h18"/></svg>
                            </button>
                        </div>
                    </div>
                    <div class="preview-frame-wrapper" id="preview-wrapper">
                        <div class="empty-state" id="empty-state">
                            <div class="empty-icon">
                                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/><polyline points="14,2 14,8 20,8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10,9 9,9 8,9"/></svg>
                            </div>
                            <p class="empty-title">Select a component</p>
                            <p class="empty-desc">Choose from the browser on the left to inspect and preview components</p>
                        </div>
                        <iframe id="preview-frame" sandbox="allow-same-origin" style="display:none;"></iframe>
                    </div>
                </div>

                <!-- Props Editor -->
                <div class="resize-handle resize-handle-h" data-resize="preview"></div>
                <div class="editor-section" id="editor-section">
                    <div class="panel-header">
                        <span class="panel-label">Props</span>
                        <div class="editor-controls">
                            <button class="icon-btn" id="btn-reset-props" title="Reset to Defaults">
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/></svg>
                            </button>
                        </div>
                    </div>
                    <div class="editor-form" id="editor-form">
                        <div class="editor-empty">Select a component to edit its props</div>
                    </div>
                </div>
            </main>

            <!-- Resize handle -->
            <div class="resize-handle" data-resize="output"></div>

            <!-- Right Panel: Code Output -->
            <aside class="panel panel-output" id="panel-output">
                <div class="panel-header">
                    <span class="panel-label">Output</span>
                    <div class="output-tabs">
                        <button class="tab-btn active" data-tab="json">Config</button>
                        <button class="tab-btn" data-tab="html">HTML</button>
                        <button class="tab-btn" data-tab="compose">Compose</button>
                    </div>
                </div>
                <div class="output-content">
                    <div class="output-pane active" id="output-json">
                        <pre><code id="code-json" class="code-block">// Component config will appear here</code></pre>
                    </div>
                    <div class="output-pane" id="output-html">
                        <pre><code id="code-html" class="code-block">&lt;!-- Rendered HTML will appear here --&gt;</code></pre>
                    </div>
                    <div class="output-pane" id="output-compose">
                        <pre><code id="code-compose" class="code-block">// compose() call will appear here</code></pre>
                    </div>
                </div>
                <div class="output-actions">
                    <button class="action-btn" id="btn-copy">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>
                        Copy
                    </button>
                    <button class="action-btn" id="btn-add-to-composition" style="display:none;">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
                        Add to Composition
                    </button>
                </div>
            </aside>
        </div>

        <!-- Composition Panel (slides up from bottom when in compose mode) -->
        <div class="composition-panel" id="composition-panel" style="display:none;">
            <div class="panel-header">
                <span class="panel-label">Composition Tree</span>
                <div class="composition-controls">
                    <button class="icon-btn" id="btn-clear-composition" title="Clear All">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/></svg>
                        </button>
                    <button class="action-btn" id="btn-render-composition">Render All</button>
                </div>
            </div>
            <div class="composition-items" id="composition-items">
                <div class="editor-empty">Add components from the browser to build a composition</div>
            </div>
        </div>

        <!-- Toast notifications -->
        <div id="toast-container"></div>
    </div>

    <script>${getScript()}</script>
</body>
</html>`;
}

/**
 * Generate all CSS styles for the inspector
 * @returns {string}
 */
function getStyles() {
    return `
/* ============================================
   RESET & BASE
   ============================================ */
*, *::before, *::after {
    box-sizing: border-box;
    margin: 0;
    padding: 0;
}

:root {
    --bg-root: #0a0a0b;
    --bg-panel: #111113;
    --bg-surface: #18181b;
    --bg-elevated: #1e1e22;
    --bg-hover: #252529;
    --bg-active: #2a2a2f;
    
    --border: #27272a;
    --border-subtle: #1e1e22;
    --border-focus: #d97706;
    
    --text-primary: #fafafa;
    --text-secondary: #a1a1aa;
    --text-tertiary: #71717a;
    --text-inverse: #0a0a0b;
    
    --accent: #d97706;
    --accent-hover: #f59e0b;
    --accent-muted: rgba(217, 119, 6, 0.15);
    --accent-text: #fbbf24;
    
    --success: #22c55e;
    --error: #ef4444;
    --warning: #eab308;
    
    --radius-sm: 4px;
    --radius-md: 6px;
    --radius-lg: 8px;
    
    --font-sans: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
    --font-mono: "SF Mono", "Fira Code", "Fira Mono", Menlo, Consolas, monospace;
    
    --header-h: 44px;
    --panel-browser-w: 240px;
    --panel-output-w: 300px;
}

html, body {
    height: 100%;
    overflow: hidden;
    background: var(--bg-root);
    color: var(--text-primary);
    font-family: var(--font-sans);
    font-size: 13px;
    line-height: 1.5;
    -webkit-font-smoothing: antialiased;
}

/* ============================================
   LAYOUT
   ============================================ */
#inspector-app {
    display: flex;
    flex-direction: column;
    height: 100vh;
    overflow: hidden;
}

.inspector-header {
    display: flex;
    align-items: center;
    height: var(--header-h);
    padding: 0 12px;
    background: var(--bg-panel);
    border-bottom: 1px solid var(--border);
    gap: 12px;
    flex-shrink: 0;
}

.header-left {
    display: flex;
    align-items: center;
    gap: 8px;
    flex-shrink: 0;
}

.header-logo {
    font-family: var(--font-mono);
    font-weight: 700;
    font-size: 14px;
    color: var(--accent-text);
    letter-spacing: -0.5px;
}

.header-divider {
    width: 1px;
    height: 16px;
    background: var(--border);
}

.header-title {
    font-size: 12px;
    font-weight: 500;
    color: var(--text-secondary);
    text-transform: uppercase;
    letter-spacing: 0.5px;
}

.header-center {
    flex: 1;
    display: flex;
    justify-content: center;
}

.search-container {
    position: relative;
    width: 100%;
    max-width: 360px;
}

.search-icon {
    position: absolute;
    left: 10px;
    top: 50%;
    transform: translateY(-50%);
    color: var(--text-tertiary);
    pointer-events: none;
}

#search-input {
    width: 100%;
    height: 30px;
    padding: 0 36px 0 32px;
    background: var(--bg-surface);
    border: 1px solid var(--border);
    border-radius: var(--radius-md);
    color: var(--text-primary);
    font-family: var(--font-sans);
    font-size: 12px;
    outline: none;
    transition: border-color 0.15s;
}

#search-input:focus {
    border-color: var(--border-focus);
}

#search-input::placeholder {
    color: var(--text-tertiary);
}

.search-kbd {
    position: absolute;
    right: 8px;
    top: 50%;
    transform: translateY(-50%);
    padding: 1px 6px;
    background: var(--bg-elevated);
    border: 1px solid var(--border);
    border-radius: 3px;
    font-family: var(--font-mono);
    font-size: 10px;
    color: var(--text-tertiary);
    pointer-events: none;
}

.header-right {
    display: flex;
    align-items: center;
    gap: 8px;
    flex-shrink: 0;
}

.header-btn {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 30px;
    height: 30px;
    background: var(--bg-surface);
    border: 1px solid var(--border);
    border-radius: var(--radius-md);
    color: var(--text-secondary);
    cursor: pointer;
    transition: all 0.15s;
}

.header-btn:hover {
    background: var(--bg-hover);
    color: var(--text-primary);
}

.header-btn.active {
    background: var(--accent-muted);
    border-color: var(--accent);
    color: var(--accent-text);
}

.status-dot {
    width: 8px;
    height: 8px;
    border-radius: 50%;
    flex-shrink: 0;
}

.status-connecting { background: var(--warning); opacity: 0.6; animation: pulse 1.5s infinite; }
.status-connected { background: var(--success); }
.status-disconnected { background: var(--error); }

@keyframes pulse {
    0%, 100% { opacity: 0.4; }
    50% { opacity: 1; }
}

/* ============================================
   PANELS
   ============================================ */
.inspector-body {
    display: flex;
    flex: 1;
    overflow: hidden;
}

.panel {
    display: flex;
    flex-direction: column;
    overflow: hidden;
    background: var(--bg-panel);
}

.panel-browser {
    width: var(--panel-browser-w);
    min-width: 180px;
    border-right: 1px solid var(--border);
}

.panel-center {
    flex: 1;
    display: flex;
    flex-direction: column;
    min-width: 200px;
}

.panel-output {
    width: var(--panel-output-w);
    min-width: 200px;
    border-left: 1px solid var(--border);
}

.panel-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 8px 12px;
    border-bottom: 1px solid var(--border-subtle);
    flex-shrink: 0;
    min-height: 36px;
}

.panel-label {
    font-size: 11px;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    color: var(--text-tertiary);
}

.component-count {
    font-family: var(--font-mono);
    font-size: 11px;
    color: var(--text-tertiary);
    background: var(--bg-surface);
    padding: 1px 6px;
    border-radius: 10px;
}

/* ============================================
   RESIZE HANDLES
   ============================================ */
.resize-handle {
    width: 4px;
    cursor: col-resize;
    background: transparent;
    transition: background 0.15s;
    flex-shrink: 0;
    position: relative;
}

.resize-handle::after {
    content: '';
    position: absolute;
    top: 0;
    left: -2px;
    right: -2px;
    bottom: 0;
}

.resize-handle:hover,
.resize-handle.active {
    background: var(--accent);
}

.resize-handle-h {
    width: auto;
    height: 4px;
    cursor: row-resize;
}

.resize-handle-h::after {
    left: 0;
    right: 0;
    top: -2px;
    bottom: -2px;
}

/* ============================================
   COMPONENT BROWSER
   ============================================ */
.browser-tree {
    flex: 1;
    overflow-y: auto;
    padding: 4px 0;
}

.browser-tree::-webkit-scrollbar {
    width: 6px;
}

.browser-tree::-webkit-scrollbar-track {
    background: transparent;
}

.browser-tree::-webkit-scrollbar-thumb {
    background: var(--bg-hover);
    border-radius: 3px;
}

.category-group {
    margin-bottom: 2px;
}

.category-header {
    display: flex;
    align-items: center;
    gap: 6px;
    padding: 6px 12px;
    cursor: pointer;
    color: var(--text-secondary);
    font-size: 11px;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.3px;
    user-select: none;
    transition: color 0.15s;
}

.category-header:hover {
    color: var(--text-primary);
}

.category-chevron {
    width: 12px;
    height: 12px;
    transition: transform 0.15s;
    flex-shrink: 0;
}

.category-header.collapsed .category-chevron {
    transform: rotate(-90deg);
}

.category-count {
    font-family: var(--font-mono);
    font-size: 10px;
    color: var(--text-tertiary);
    margin-left: auto;
}

.category-items {
    overflow: hidden;
}

.category-items.collapsed {
    display: none;
}

.component-item {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 5px 12px 5px 28px;
    cursor: pointer;
    color: var(--text-secondary);
    font-size: 12px;
    transition: all 0.1s;
    border-left: 2px solid transparent;
}

.component-item:hover {
    background: var(--bg-hover);
    color: var(--text-primary);
}

.component-item.active {
    background: var(--accent-muted);
    color: var(--accent-text);
    border-left-color: var(--accent);
}

.component-item.hidden {
    display: none;
}

.component-dot {
    width: 6px;
    height: 6px;
    border-radius: 50%;
    flex-shrink: 0;
}

.component-dot.atom { background: #60a5fa; }
.component-dot.molecule { background: #a78bfa; }
.component-dot.organism { background: #fb923c; }

.component-name {
    flex: 1;
    font-family: var(--font-mono);
    font-size: 12px;
}

.component-badges {
    display: flex;
    gap: 3px;
}

.component-badge {
    font-size: 9px;
    padding: 0px 4px;
    border-radius: 3px;
    background: var(--bg-elevated);
    color: var(--text-tertiary);
    font-family: var(--font-mono);
}

/* ============================================
   PREVIEW
   ============================================ */
.preview-section {
    flex: 1;
    display: flex;
    flex-direction: column;
    min-height: 120px;
}

.preview-controls {
    display: flex;
    gap: 4px;
}

.icon-btn {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 26px;
    height: 26px;
    background: none;
    border: 1px solid transparent;
    border-radius: var(--radius-sm);
    color: var(--text-tertiary);
    cursor: pointer;
    transition: all 0.15s;
}

.icon-btn:hover {
    background: var(--bg-hover);
    color: var(--text-primary);
    border-color: var(--border);
}

.preview-frame-wrapper {
    flex: 1;
    position: relative;
    overflow: hidden;
    background: var(--bg-surface);
    border-top: 1px solid var(--border-subtle);
}

.preview-frame-wrapper.checkerboard {
    background-image: 
        linear-gradient(45deg, var(--bg-elevated) 25%, transparent 25%),
        linear-gradient(-45deg, var(--bg-elevated) 25%, transparent 25%),
        linear-gradient(45deg, transparent 75%, var(--bg-elevated) 75%),
        linear-gradient(-45deg, transparent 75%, var(--bg-elevated) 75%);
    background-size: 16px 16px;
    background-position: 0 0, 0 8px, 8px -8px, -8px 0px;
}

#preview-frame {
    width: 100%;
    height: 100%;
    border: none;
    background: transparent;
}

.empty-state {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    text-align: center;
    color: var(--text-tertiary);
}

.empty-icon {
    margin-bottom: 12px;
    opacity: 0.3;
}

.empty-title {
    font-size: 14px;
    font-weight: 500;
    color: var(--text-secondary);
    margin-bottom: 4px;
}

.empty-desc {
    font-size: 12px;
    max-width: 240px;
    line-height: 1.5;
}

/* ============================================
   PROPS EDITOR
   ============================================ */
.editor-section {
    min-height: 140px;
    max-height: 50%;
    display: flex;
    flex-direction: column;
    border-top: 1px solid var(--border);
}

.editor-controls {
    display: flex;
    gap: 4px;
}

.editor-form {
    flex: 1;
    overflow-y: auto;
    padding: 8px 12px;
}

.editor-form::-webkit-scrollbar {
    width: 6px;
}

.editor-form::-webkit-scrollbar-thumb {
    background: var(--bg-hover);
    border-radius: 3px;
}

.editor-empty {
    color: var(--text-tertiary);
    font-size: 12px;
    text-align: center;
    padding: 24px 12px;
}

.prop-field {
    margin-bottom: 10px;
}

.prop-label {
    display: flex;
    align-items: center;
    gap: 6px;
    margin-bottom: 4px;
    font-size: 11px;
    color: var(--text-secondary);
}

.prop-name {
    font-family: var(--font-mono);
    font-weight: 500;
    color: var(--text-primary);
}

.prop-type {
    font-family: var(--font-mono);
    font-size: 10px;
    color: var(--text-tertiary);
    background: var(--bg-elevated);
    padding: 0 4px;
    border-radius: 3px;
}

.prop-required {
    font-size: 10px;
    color: var(--error);
    font-weight: 600;
}

.prop-input, .prop-select, .prop-textarea {
    width: 100%;
    padding: 6px 8px;
    background: var(--bg-surface);
    border: 1px solid var(--border);
    border-radius: var(--radius-sm);
    color: var(--text-primary);
    font-family: var(--font-mono);
    font-size: 12px;
    outline: none;
    transition: border-color 0.15s;
}

.prop-input:focus, .prop-select:focus, .prop-textarea:focus {
    border-color: var(--border-focus);
}

.prop-textarea {
    min-height: 56px;
    resize: vertical;
    line-height: 1.4;
}

.prop-desc {
    font-size: 10px;
    color: var(--text-tertiary);
    margin-top: 2px;
    line-height: 1.4;
}

.prop-checkbox-row {
    display: flex;
    align-items: center;
    gap: 8px;
}

.prop-checkbox {
    width: 16px;
    height: 16px;
    accent-color: var(--accent);
    cursor: pointer;
}

/* ============================================
   OUTPUT PANEL
   ============================================ */
.output-tabs {
    display: flex;
    gap: 2px;
}

.tab-btn {
    padding: 3px 8px;
    background: none;
    border: 1px solid transparent;
    border-radius: var(--radius-sm);
    color: var(--text-tertiary);
    font-size: 11px;
    cursor: pointer;
    transition: all 0.15s;
}

.tab-btn:hover {
    color: var(--text-secondary);
}

.tab-btn.active {
    background: var(--bg-surface);
    border-color: var(--border);
    color: var(--text-primary);
}

.output-content {
    flex: 1;
    overflow: hidden;
    position: relative;
}

.output-pane {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    overflow: auto;
    display: none;
    padding: 8px;
}

.output-pane.active {
    display: block;
}

.output-pane::-webkit-scrollbar {
    width: 6px;
}

.output-pane::-webkit-scrollbar-thumb {
    background: var(--bg-hover);
    border-radius: 3px;
}

.code-block {
    font-family: var(--font-mono);
    font-size: 11px;
    line-height: 1.6;
    color: var(--text-secondary);
    white-space: pre-wrap;
    word-break: break-all;
}

.output-actions {
    display: flex;
    gap: 6px;
    padding: 8px 12px;
    border-top: 1px solid var(--border-subtle);
    flex-shrink: 0;
}

.action-btn {
    display: flex;
    align-items: center;
    gap: 6px;
    padding: 5px 10px;
    background: var(--bg-surface);
    border: 1px solid var(--border);
    border-radius: var(--radius-md);
    color: var(--text-secondary);
    font-size: 11px;
    cursor: pointer;
    transition: all 0.15s;
}

.action-btn:hover {
    background: var(--bg-hover);
    color: var(--text-primary);
}

.action-btn.primary {
    background: var(--accent);
    border-color: var(--accent);
    color: var(--text-inverse);
}

.action-btn.primary:hover {
    background: var(--accent-hover);
}

/* ============================================
   COMPOSITION PANEL
   ============================================ */
.composition-panel {
    border-top: 1px solid var(--border);
    background: var(--bg-panel);
    max-height: 200px;
    flex-shrink: 0;
}

.composition-controls {
    display: flex;
    gap: 6px;
    align-items: center;
}

.composition-items {
    overflow-y: auto;
    padding: 8px 12px;
    min-height: 40px;
    max-height: 150px;
}

.comp-item {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 4px 8px;
    background: var(--bg-surface);
    border: 1px solid var(--border);
    border-radius: var(--radius-sm);
    margin-bottom: 4px;
    font-family: var(--font-mono);
    font-size: 11px;
    color: var(--text-secondary);
    cursor: grab;
}

.comp-item:active {
    cursor: grabbing;
}

.comp-item-type {
    font-size: 10px;
    color: var(--text-tertiary);
    background: var(--bg-elevated);
    padding: 0 4px;
    border-radius: 3px;
}

.comp-item-name {
    flex: 1;
    color: var(--text-primary);
}

.comp-item-remove {
    background: none;
    border: none;
    color: var(--text-tertiary);
    cursor: pointer;
    padding: 2px;
    display: flex;
    align-items: center;
}

.comp-item-remove:hover {
    color: var(--error);
}

/* ============================================
   TOAST
   ============================================ */
#toast-container {
    position: fixed;
    bottom: 16px;
    right: 16px;
    z-index: 9999;
    display: flex;
    flex-direction: column;
    gap: 8px;
}

.toast {
    padding: 8px 14px;
    background: var(--bg-elevated);
    border: 1px solid var(--border);
    border-radius: var(--radius-md);
    color: var(--text-primary);
    font-size: 12px;
    box-shadow: 0 4px 12px rgba(0,0,0,0.4);
    animation: toast-in 0.2s ease-out;
    display: flex;
    align-items: center;
    gap: 8px;
}

.toast.success { border-left: 3px solid var(--success); }
.toast.error { border-left: 3px solid var(--error); }
.toast.info { border-left: 3px solid var(--accent); }

@keyframes toast-in {
    from { opacity: 0; transform: translateY(8px); }
    to { opacity: 1; transform: translateY(0); }
}

/* ============================================
   LOADING / MISC
   ============================================ */
.loading-placeholder {
    color: var(--text-tertiary);
    font-size: 12px;
    text-align: center;
    padding: 24px;
}

/* Syntax highlight helpers for code output */
.hl-key { color: #60a5fa; }
.hl-str { color: #a78bfa; }
.hl-num { color: #fb923c; }
.hl-tag { color: #f472b6; }
.hl-attr { color: #60a5fa; }
.hl-val { color: #a78bfa; }

.hot-reload-flash {
    animation: flash-border 0.6s ease-out;
}

@keyframes flash-border {
    0% { box-shadow: inset 0 0 0 2px var(--accent); }
    100% { box-shadow: inset 0 0 0 0px transparent; }
}
`;
}

/**
 * Generate all JavaScript for the inspector client
 * @returns {string}
 */
function getScript() {
    return `
(function() {
    'use strict';

    // ============================================
    // STATE
    // ============================================
    const state = {
        registry: null,
        components: [],
        selectedComponent: null,
        currentProps: {},
        compositionMode: false,
        composition: [],
        activeOutputTab: 'json',
        lastRenderedHTML: '',
        previewBgToggle: false,
        sseConnected: false
    };

    // ============================================
    // DOM REFERENCES
    // ============================================
    const $ = (sel) => document.querySelector(sel);
    const $$ = (sel) => document.querySelectorAll(sel);

    // ============================================
    // API HELPERS
    // ============================================
    async function fetchComponents() {
        try {
            const res = await fetch('/_inspector/api/components');
            if (!res.ok) throw new Error('Failed to fetch components');
            const data = await res.json();
            state.registry = data.registry;
            state.components = data.components;
            return data;
        } catch (err) {
            showToast('Failed to load components: ' + err.message, 'error');
            throw err;
        }
    }

    async function renderComponent(type, name, props) {
        try {
            const res = await fetch('/_inspector/api/render', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ type, name, props })
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || 'Render failed');
            return data;
        } catch (err) {
            showToast('Render error: ' + err.message, 'error');
            return null;
        }
    }

    async function fetchShowcase(category, name) {
        try {
            const res = await fetch('/_inspector/api/showcase/' + category + '/' + name);
            if (!res.ok) return null;
            const data = await res.json();
            return data.html;
        } catch {
            return null;
        }
    }

    // ============================================
    // SSE HOT RELOAD
    // ============================================
    function connectSSE() {
        const statusEl = $('#connection-status');
        
        const evtSource = new EventSource('/_inspector/events');
        
        evtSource.addEventListener('connected', () => {
            state.sseConnected = true;
            statusEl.className = 'status-dot status-connected';
            statusEl.title = 'Connected - live reload active';
        });
        
        evtSource.addEventListener('component-changed', async (e) => {
            const data = JSON.parse(e.data);
            showToast(data.component + ' changed', 'info');
            
            // Re-fetch the registry
            await fetchComponents();
            renderBrowserTree();
            
            // If the changed component is currently selected, re-render
            if (state.selectedComponent &&
                state.selectedComponent.type === data.type &&
                state.selectedComponent.name === data.name) {
                await doRender();
                // Flash the preview
                const wrapper = $('#preview-wrapper');
                wrapper.classList.remove('hot-reload-flash');
                void wrapper.offsetWidth; // Force reflow
                wrapper.classList.add('hot-reload-flash');
            }
        });
        
        evtSource.addEventListener('registry-changed', async () => {
            await fetchComponents();
            renderBrowserTree();
        });
        
        evtSource.onerror = () => {
            state.sseConnected = false;
            statusEl.className = 'status-dot status-disconnected';
            statusEl.title = 'Disconnected - attempting reconnect...';
        };
    }

    // ============================================
    // BROWSER TREE
    // ============================================
    function renderBrowserTree() {
        const tree = $('#browser-tree');
        const search = ($('#search-input').value || '').toLowerCase();
        tree.innerHTML = '';

        const categories = [
            { key: 'atoms', label: 'Atoms', type: 'atom' },
            { key: 'molecules', label: 'Molecules', type: 'molecule' },
            { key: 'organisms', label: 'Organisms', type: 'organism' }
        ];

        let totalVisible = 0;

        for (const cat of categories) {
            const components = Object.values(state.registry[cat.key] || {});
            if (components.length === 0) continue;

            const group = document.createElement('div');
            group.className = 'category-group';

            const header = document.createElement('div');
            header.className = 'category-header';
            header.innerHTML = '<svg class="category-chevron" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="6,9 12,15 18,9"/></svg>' +
                '<span>' + cat.label + '</span>' +
                '<span class="category-count">' + components.length + '</span>';

            const items = document.createElement('div');
            items.className = 'category-items';

            let visibleInCategory = 0;

            for (const comp of components) {
                const matchesSearch = !search || comp.name.includes(search) || 
                    (comp.description && comp.description.toLowerCase().includes(search));

                const item = document.createElement('div');
                item.className = 'component-item' + 
                    (matchesSearch ? '' : ' hidden') +
                    (state.selectedComponent && state.selectedComponent.name === comp.name && state.selectedComponent.type === comp.type ? ' active' : '');
                
                item.dataset.type = comp.type;
                item.dataset.name = comp.name;
                item.dataset.category = comp.category;

                let badges = '';
                if (comp.hasShowcase) badges += '<span class="component-badge">show</span>';
                if (comp.hasClientBehavior) badges += '<span class="component-badge">js</span>';

                item.innerHTML = '<span class="component-dot ' + cat.type + '"></span>' +
                    '<span class="component-name">' + comp.name + '</span>' +
                    '<span class="component-badges">' + badges + '</span>';

                item.addEventListener('click', () => selectComponent(comp));
                items.appendChild(item);

                if (matchesSearch) visibleInCategory++;
            }

            totalVisible += visibleInCategory;

            header.addEventListener('click', () => {
                header.classList.toggle('collapsed');
                items.classList.toggle('collapsed');
            });

            // Auto-collapse if no matches in search
            if (search && visibleInCategory === 0) {
                header.classList.add('collapsed');
                items.classList.add('collapsed');
            }

            group.appendChild(header);
            group.appendChild(items);
            tree.appendChild(group);
        }

        $('#component-count').textContent = totalVisible || state.components.length;
    }

    // ============================================
    // COMPONENT SELECTION
    // ============================================
    function selectComponent(comp) {
        state.selectedComponent = comp;
        
        // Build default props
        state.currentProps = {};
        for (const prop of comp.props) {
            if (prop.default !== null && prop.default !== undefined) {
                state.currentProps[prop.name] = prop.default;
            } else if (prop.required) {
                // Provide sensible defaults for required props
                if (prop.name === 'slot') {
                    state.currentProps[prop.name] = comp.name + ' content';
                } else if (prop.name === 'is') {
                    state.currentProps[prop.name] = 'div';
                } else {
                    state.currentProps[prop.name] = '';
                }
            }
        }

        // Update UI
        renderBrowserTree();
        renderPropsEditor();
        doRender();
        
        $('#preview-title').textContent = comp.type + '/' + comp.name;
        $('#empty-state').style.display = 'none';
        $('#preview-frame').style.display = 'block';
        
        if (state.compositionMode) {
            $('#btn-add-to-composition').style.display = 'flex';
        }
    }

    // ============================================
    // PROPS EDITOR
    // ============================================
    function renderPropsEditor() {
        const form = $('#editor-form');
        form.innerHTML = '';

        if (!state.selectedComponent) {
            form.innerHTML = '<div class="editor-empty">Select a component to edit its props</div>';
            return;
        }

        const comp = state.selectedComponent;
        
        if (comp.props.length === 0) {
            form.innerHTML = '<div class="editor-empty">This component has no configurable props</div>';
            return;
        }

        for (const prop of comp.props) {
            const field = document.createElement('div');
            field.className = 'prop-field';

            // Label
            const label = document.createElement('div');
            label.className = 'prop-label';
            label.innerHTML = '<span class="prop-name">' + prop.name + '</span>' +
                '<span class="prop-type">' + escapeHTML(prop.type) + '</span>' +
                (prop.required ? '<span class="prop-required">*</span>' : '');
            field.appendChild(label);

            // Input control
            const currentValue = state.currentProps[prop.name] !== undefined 
                ? state.currentProps[prop.name] 
                : (prop.default || '');

            if (prop.controlType === 'select' && prop.enumValues) {
                const select = document.createElement('select');
                select.className = 'prop-select';
                select.dataset.prop = prop.name;
                
                for (const val of prop.enumValues) {
                    const opt = document.createElement('option');
                    opt.value = val;
                    opt.textContent = val;
                    opt.selected = currentValue === val;
                    select.appendChild(opt);
                }
                
                select.addEventListener('change', onPropChange);
                field.appendChild(select);

            } else if (prop.controlType === 'textarea') {
                const textarea = document.createElement('textarea');
                textarea.className = 'prop-textarea';
                textarea.dataset.prop = prop.name;
                textarea.value = currentValue;
                textarea.placeholder = prop.name;
                textarea.addEventListener('input', onPropChange);
                field.appendChild(textarea);

            } else if (prop.controlType === 'boolean') {
                const row = document.createElement('div');
                row.className = 'prop-checkbox-row';
                const cb = document.createElement('input');
                cb.type = 'checkbox';
                cb.className = 'prop-checkbox';
                cb.dataset.prop = prop.name;
                cb.checked = currentValue === 'true' || currentValue === true;
                cb.addEventListener('change', onPropChange);
                const cbLabel = document.createElement('span');
                cbLabel.textContent = cb.checked ? 'true' : 'false';
                cbLabel.style.cssText = 'font-family:var(--font-mono);font-size:11px;color:var(--text-secondary)';
                cb.addEventListener('change', () => { cbLabel.textContent = cb.checked ? 'true' : 'false'; });
                row.appendChild(cb);
                row.appendChild(cbLabel);
                field.appendChild(row);

            } else {
                const input = document.createElement('input');
                input.type = prop.controlType === 'number' ? 'number' : 'text';
                input.className = 'prop-input';
                input.dataset.prop = prop.name;
                input.value = currentValue;
                input.placeholder = prop.default !== null ? 'Default: ' + prop.default : prop.name;
                input.addEventListener('input', onPropChange);
                field.appendChild(input);
            }

            // Description
            if (prop.description) {
                const desc = document.createElement('div');
                desc.className = 'prop-desc';
                desc.textContent = prop.description;
                field.appendChild(desc);
            }

            form.appendChild(field);
        }
    }

    let renderDebounce = null;
    function onPropChange(e) {
        const propName = e.target.dataset.prop;
        let value;
        
        if (e.target.type === 'checkbox') {
            value = e.target.checked;
        } else if (e.target.type === 'number') {
            value = e.target.value === '' ? '' : Number(e.target.value);
        } else {
            value = e.target.value;
        }
        
        state.currentProps[propName] = value;

        // Debounced render
        if (renderDebounce) clearTimeout(renderDebounce);
        renderDebounce = setTimeout(doRender, 200);
    }

    // ============================================
    // RENDERING
    // ============================================
    async function doRender() {
        if (!state.selectedComponent) return;

        const comp = state.selectedComponent;
        
        // Build clean props (omit empty strings for non-required)
        const cleanProps = {};
        for (const [key, val] of Object.entries(state.currentProps)) {
            if (val !== '' && val !== undefined && val !== null) {
                cleanProps[key] = val;
            }
        }

        const result = await renderComponent(comp.type, comp.name, cleanProps);
        
        if (result && result.html) {
            state.lastRenderedHTML = result.html;
            updatePreview(result.html);
            updateOutput(comp, cleanProps, result.html);
        }
    }

    function updatePreview(html) {
        const frame = $('#preview-frame');
        const srcdoc = '<!DOCTYPE html><html><head><style>body{margin:12px;font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,sans-serif;font-size:14px;color:#1a1a1a;background:white;}</style></head><body>' + html + '</body></html>';
        frame.srcdoc = srcdoc;
    }

    function updateOutput(comp, props, html) {
        // JSON config
        const config = { type: comp.type, name: comp.name, props };
        $('#code-json').innerHTML = highlightJSON(JSON.stringify(config, null, 2));

        // HTML
        $('#code-html').innerHTML = highlightHTML(html);

        // Compose call
        const composeCode = 'compose([\\n' + JSON.stringify(config, null, 2).split('\\n').map(l => '  ' + l).join('\\n') + '\\n]);';
        $('#code-compose').innerHTML = highlightJSON(composeCode);
    }

    // ============================================
    // OUTPUT TABS
    // ============================================
    function initOutputTabs() {
        for (const btn of $$('.tab-btn')) {
            btn.addEventListener('click', () => {
                const tab = btn.dataset.tab;
                state.activeOutputTab = tab;
                
                $$('.tab-btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                
                $$('.output-pane').forEach(p => p.classList.remove('active'));
                $('#output-' + tab).classList.add('active');
            });
        }
    }

    // ============================================
    // COMPOSITION MODE
    // ============================================
    function initCompositionMode() {
        $('#btn-compose-mode').addEventListener('click', () => {
            state.compositionMode = !state.compositionMode;
            $('#btn-compose-mode').classList.toggle('active', state.compositionMode);
            $('#composition-panel').style.display = state.compositionMode ? 'block' : 'none';
            $('#btn-add-to-composition').style.display = 
                (state.compositionMode && state.selectedComponent) ? 'flex' : 'none';
        });

        $('#btn-add-to-composition').addEventListener('click', () => {
            if (!state.selectedComponent) return;
            
            const cleanProps = {};
            for (const [key, val] of Object.entries(state.currentProps)) {
                if (val !== '' && val !== undefined && val !== null) {
                    cleanProps[key] = val;
                }
            }

            state.composition.push({
                type: state.selectedComponent.type,
                name: state.selectedComponent.name,
                props: { ...cleanProps }
            });

            renderCompositionTree();
            showToast('Added ' + state.selectedComponent.name + ' to composition', 'success');
        });

        $('#btn-clear-composition').addEventListener('click', () => {
            state.composition = [];
            renderCompositionTree();
        });

        $('#btn-render-composition').addEventListener('click', async () => {
            if (state.composition.length === 0) return;
            
            try {
                const res = await fetch('/_inspector/api/render', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ 
                        type: state.composition[0].type, 
                        name: state.composition[0].name, 
                        props: state.composition[0].props 
                    })
                });
                
                // For full composition, render each and combine
                let fullHTML = '';
                for (const item of state.composition) {
                    const result = await renderComponent(item.type, item.name, item.props);
                    if (result && result.html) fullHTML += result.html + '\\n';
                }
                
                if (fullHTML) {
                    state.lastRenderedHTML = fullHTML;
                    updatePreview(fullHTML);
                    
                    // Update output to show full composition
                    $('#code-json').innerHTML = highlightJSON(JSON.stringify(state.composition, null, 2));
                    $('#code-html').innerHTML = highlightHTML(fullHTML);
                    $('#code-compose').innerHTML = highlightJSON(
                        'compose(' + JSON.stringify(state.composition, null, 2) + ');'
                    );
                }
            } catch (err) {
                showToast('Composition render failed: ' + err.message, 'error');
            }
        });
    }

    function renderCompositionTree() {
        const container = $('#composition-items');
        
        if (state.composition.length === 0) {
            container.innerHTML = '<div class="editor-empty">Add components from the browser to build a composition</div>';
            return;
        }

        container.innerHTML = '';
        
        state.composition.forEach((item, index) => {
            const el = document.createElement('div');
            el.className = 'comp-item';
            el.draggable = true;
            el.dataset.index = index;
            
            el.innerHTML = '<span class="comp-item-type">' + item.type + '</span>' +
                '<span class="comp-item-name">' + item.name + '</span>' +
                '<button class="comp-item-remove" title="Remove">' +
                '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>' +
                '</button>';

            el.querySelector('.comp-item-remove').addEventListener('click', (e) => {
                e.stopPropagation();
                state.composition.splice(index, 1);
                renderCompositionTree();
            });

            // Drag and drop reorder
            el.addEventListener('dragstart', (e) => {
                e.dataTransfer.setData('text/plain', index.toString());
                el.style.opacity = '0.5';
            });

            el.addEventListener('dragend', () => { el.style.opacity = '1'; });

            el.addEventListener('dragover', (e) => {
                e.preventDefault();
                el.style.borderTop = '2px solid var(--accent)';
            });

            el.addEventListener('dragleave', () => {
                el.style.borderTop = '';
            });

            el.addEventListener('drop', (e) => {
                e.preventDefault();
                el.style.borderTop = '';
                const fromIndex = parseInt(e.dataTransfer.getData('text/plain'));
                const toIndex = index;
                if (fromIndex === toIndex) return;
                const [moved] = state.composition.splice(fromIndex, 1);
                state.composition.splice(toIndex, 0, moved);
                renderCompositionTree();
            });

            container.appendChild(el);
        });
    }

    // ============================================
    // RESIZE HANDLES
    // ============================================
    function initResize() {
        const handles = $$('.resize-handle');
        
        handles.forEach(handle => {
            let startX, startY, startWidth, startHeight;
            const target = handle.dataset.resize;
            
            handle.addEventListener('mousedown', (e) => {
                e.preventDefault();
                handle.classList.add('active');
                startX = e.clientX;
                startY = e.clientY;
                
                if (target === 'browser') {
                    startWidth = $('#panel-browser').offsetWidth;
                } else if (target === 'output') {
                    startWidth = $('#panel-output').offsetWidth;
                } else if (target === 'preview') {
                    startHeight = $('#preview-section').offsetHeight;
                }
                
                const onMove = (e) => {
                    if (target === 'browser') {
                        const newWidth = Math.max(180, Math.min(400, startWidth + (e.clientX - startX)));
                        $('#panel-browser').style.width = newWidth + 'px';
                    } else if (target === 'output') {
                        const newWidth = Math.max(200, Math.min(500, startWidth - (e.clientX - startX)));
                        $('#panel-output').style.width = newWidth + 'px';
                    } else if (target === 'preview') {
                        const newHeight = Math.max(120, startHeight + (e.clientY - startY));
                        $('#preview-section').style.flex = 'none';
                        $('#preview-section').style.height = newHeight + 'px';
                    }
                };
                
                const onUp = () => {
                    handle.classList.remove('active');
                    document.removeEventListener('mousemove', onMove);
                    document.removeEventListener('mouseup', onUp);
                };
                
                document.addEventListener('mousemove', onMove);
                document.addEventListener('mouseup', onUp);
            });
        });
    }

    // ============================================
    // KEYBOARD SHORTCUTS
    // ============================================
    function initKeyboard() {
        document.addEventListener('keydown', (e) => {
            // "/" to focus search
            if (e.key === '/' && document.activeElement.tagName !== 'INPUT' && document.activeElement.tagName !== 'TEXTAREA') {
                e.preventDefault();
                $('#search-input').focus();
                return;
            }
            
            // Escape to blur
            if (e.key === 'Escape') {
                document.activeElement.blur();
            }
        });
        
        // Search filtering
        $('#search-input').addEventListener('input', () => {
            renderBrowserTree();
        });
    }

    // ============================================
    // MISC CONTROLS
    // ============================================
    function initControls() {
        // Refresh
        $('#btn-refresh').addEventListener('click', doRender);
        
        // Toggle background
        $('#btn-toggle-bg').addEventListener('click', () => {
            state.previewBgToggle = !state.previewBgToggle;
            $('#preview-wrapper').classList.toggle('checkerboard', state.previewBgToggle);
        });
        
        // Reset props
        $('#btn-reset-props').addEventListener('click', () => {
            if (!state.selectedComponent) return;
            selectComponent(state.selectedComponent);
        });
        
        // Copy
        $('#btn-copy').addEventListener('click', () => {
            let text = '';
            if (state.activeOutputTab === 'json') {
                text = $('#code-json').textContent;
            } else if (state.activeOutputTab === 'html') {
                text = state.lastRenderedHTML;
            } else {
                text = $('#code-compose').textContent;
            }
            
            navigator.clipboard.writeText(text).then(() => {
                showToast('Copied to clipboard', 'success');
            }).catch(() => {
                showToast('Failed to copy', 'error');
            });
        });
    }

    // ============================================
    // UTILITIES
    // ============================================
    function escapeHTML(str) {
        return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
    }

    function highlightJSON(json) {
        return escapeHTML(json)
            .replace(/"([^"]+)"\\s*:/g, '<span class="hl-key">"$1"</span>:')
            .replace(/:\\s*"([^"]*)"/g, ': <span class="hl-str">"$1"</span>')
            .replace(/:\\s*(\\d+)/g, ': <span class="hl-num">$1</span>')
            .replace(/:\\s*(true|false|null)/g, ': <span class="hl-num">$1</span>');
    }

    function highlightHTML(html) {
        return escapeHTML(html)
            .replace(/&lt;(\\/?[a-zA-Z][a-zA-Z0-9-]*)/g, '&lt;<span class="hl-tag">$1</span>')
            .replace(/([a-zA-Z-]+)=&quot;/g, '<span class="hl-attr">$1</span>=&quot;')
            .replace(/=&quot;([^&]*)&quot;/g, '=&quot;<span class="hl-val">$1</span>&quot;');
    }

    function showToast(message, type) {
        type = type || 'info';
        const container = $('#toast-container');
        const toast = document.createElement('div');
        toast.className = 'toast ' + type;
        toast.textContent = message;
        container.appendChild(toast);
        
        setTimeout(() => {
            toast.style.opacity = '0';
            toast.style.transform = 'translateY(8px)';
            toast.style.transition = 'all 0.2s';
            setTimeout(() => toast.remove(), 200);
        }, 2500);
    }

    // ============================================
    // INIT
    // ============================================
    async function init() {
        try {
            await fetchComponents();
            renderBrowserTree();
            initOutputTabs();
            initCompositionMode();
            initResize();
            initKeyboard();
            initControls();
            connectSSE();
            
            showToast('Inspector loaded - ' + state.components.length + ' components', 'success');
        } catch (err) {
            console.error('[inspector] Init failed:', err);
        }
    }

    // Start when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
`;
}
