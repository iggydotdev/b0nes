/**
 * b0nes Composition Visualizer UI
 *
 * A zoomable, level-based composition graph that visualizes how pages,
 * templates, organisms, molecules, and atoms compose together in b0nes.
 *
 * Navigation: Pages -> top-level components -> slot children -> deeper...
 * Each level transition animates smoothly. Breadcrumbs for navigation back.
 * 
 * Zero external dependencies -- native DOM, SVG, and CSS transitions only.
 */

export function getVisualizerPageHTML() {
    return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>b0nes Visualizer</title>
    <style>
/* ============================================
   RESET AND BASE
   ============================================ */
*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

:root {
    --bg-root: #08080a;
    --bg-surface: #111114;
    --bg-elevated: #19191d;
    --bg-hover: #222228;
    --border-subtle: #2a2a30;
    --border-focus: #3a3a42;
    --text-primary: #ececef;
    --text-secondary: #8b8b95;
    --text-muted: #5c5c66;
    --accent: #f59e0b;
    --accent-dim: rgba(245, 158, 11, 0.15);
    --type-page: #10b981;
    --type-organism: #f59e0b;
    --type-molecule: #3b82f6;
    --type-atom: #a78bfa;
    --type-page-bg: rgba(16, 185, 129, 0.1);
    --type-organism-bg: rgba(245, 158, 11, 0.08);
    --type-molecule-bg: rgba(59, 130, 246, 0.1);
    --type-atom-bg: rgba(167, 139, 250, 0.1);
    --radius-sm: 6px;
    --radius-md: 10px;
    --radius-lg: 14px;
    --font-mono: 'SF Mono', 'Cascadia Code', 'Fira Code', 'Consolas', monospace;
    --font-sans: -apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui, sans-serif;
    --transition-fast: 180ms ease;
    --transition-normal: 300ms cubic-bezier(0.4, 0, 0.2, 1);
    --transition-slow: 500ms cubic-bezier(0.4, 0, 0.2, 1);
}

html, body {
    height: 100%;
    background: var(--bg-root);
    color: var(--text-primary);
    font-family: var(--font-sans);
    overflow: hidden;
    -webkit-font-smoothing: antialiased;
}

/* ============================================
   TOP BAR
   ============================================ */
.top-bar {
    display: flex;
    align-items: center;
    gap: 12px;
    height: 48px;
    padding: 0 20px;
    background: var(--bg-surface);
    border-bottom: 1px solid var(--border-subtle);
    flex-shrink: 0;
}

.top-bar-logo {
    font-family: var(--font-mono);
    font-size: 13px;
    font-weight: 700;
    color: var(--accent);
    letter-spacing: 0.5px;
}

.top-bar-divider {
    width: 1px;
    height: 18px;
    background: var(--border-subtle);
}

.top-bar-title {
    font-size: 13px;
    color: var(--text-secondary);
    font-weight: 500;
}

.top-bar-spacer { flex: 1; }

.top-bar-link {
    font-size: 12px;
    color: var(--text-muted);
    text-decoration: none;
    padding: 4px 10px;
    border-radius: var(--radius-sm);
    transition: color var(--transition-fast), background var(--transition-fast);
}
.top-bar-link:hover {
    color: var(--text-secondary);
    background: var(--bg-hover);
}

/* ============================================
   BREADCRUMBS
   ============================================ */
.breadcrumb-bar {
    display: flex;
    align-items: center;
    gap: 6px;
    height: 40px;
    padding: 0 24px;
    background: var(--bg-root);
    border-bottom: 1px solid var(--border-subtle);
    flex-shrink: 0;
    overflow-x: auto;
}

.breadcrumb-item {
    display: flex;
    align-items: center;
    gap: 6px;
    font-size: 12px;
    color: var(--text-muted);
    cursor: pointer;
    padding: 3px 8px;
    border-radius: var(--radius-sm);
    white-space: nowrap;
    transition: color var(--transition-fast), background var(--transition-fast);
    font-family: var(--font-mono);
    border: none;
    background: none;
}
.breadcrumb-item:hover { color: var(--text-secondary); background: var(--bg-hover); }
.breadcrumb-item.active { color: var(--text-primary); cursor: default; }
.breadcrumb-item.active:hover { background: none; }

.breadcrumb-sep {
    color: var(--border-focus);
    font-size: 11px;
    user-select: none;
}

.breadcrumb-type-dot {
    width: 7px;
    height: 7px;
    border-radius: 50%;
    flex-shrink: 0;
}

/* ============================================
   MAIN STAGE
   ============================================ */
.app-layout {
    display: flex;
    flex-direction: column;
    height: 100vh;
}

.stage {
    flex: 1;
    position: relative;
    overflow: hidden;
}

.level-container {
    position: absolute;
    inset: 0;
    display: flex;
    flex-direction: column;
    transition: opacity var(--transition-normal), transform var(--transition-normal);
    overflow-y: auto;
    padding: 32px;
}

.level-container.entering {
    opacity: 0;
    transform: scale(0.96) translateY(12px);
}
.level-container.active {
    opacity: 1;
    transform: scale(1) translateY(0);
}
.level-container.exiting {
    opacity: 0;
    transform: scale(1.03) translateY(-8px);
    pointer-events: none;
}

/* ============================================
   LEVEL HEADER (current context)
   ============================================ */
.level-header {
    text-align: center;
    margin-bottom: 40px;
    flex-shrink: 0;
}

.level-header h2 {
    font-size: 18px;
    font-weight: 600;
    color: var(--text-primary);
    margin-bottom: 6px;
}

.level-header p {
    font-size: 13px;
    color: var(--text-muted);
    font-family: var(--font-mono);
}

/* ============================================
   NODE GRAPH AREA
   ============================================ */
.nodes-graph {
    position: relative;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0;
    flex: 1;
}

.parent-indicator {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 8px;
    margin-bottom: 16px;
}

.parent-node-mini {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 8px 16px;
    background: var(--bg-elevated);
    border: 1px solid var(--border-subtle);
    border-radius: var(--radius-md);
    font-size: 12px;
    font-family: var(--font-mono);
    color: var(--text-secondary);
}

.connector-trunk {
    width: 1px;
    height: 32px;
    background: var(--border-subtle);
}

.connector-branch-row {
    position: relative;
    display: flex;
    justify-content: center;
    width: 100%;
    margin-bottom: 16px;
}

/* SVG connections are drawn dynamically */
.connections-svg {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    pointer-events: none;
    z-index: 0;
    overflow: visible;
}

.connections-svg path {
    fill: none;
    stroke: var(--border-subtle);
    stroke-width: 1.5;
    transition: stroke var(--transition-fast);
}

.connections-svg path.highlighted {
    stroke: var(--accent);
    stroke-width: 2;
}

/* ============================================
   NODE CARDS
   ============================================ */
.nodes-row {
    display: flex;
    flex-wrap: wrap;
    justify-content: center;
    gap: 16px;
    position: relative;
    z-index: 1;
}

.node-card {
    display: flex;
    flex-direction: column;
    gap: 10px;
    padding: 16px 20px;
    background: var(--bg-surface);
    border: 1px solid var(--border-subtle);
    border-radius: var(--radius-lg);
    cursor: pointer;
    min-width: 180px;
    max-width: 280px;
    transition: border-color var(--transition-fast),
                box-shadow var(--transition-fast),
                transform var(--transition-fast),
                background var(--transition-fast);
    position: relative;
    overflow: hidden;
}

.node-card::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 3px;
    border-radius: var(--radius-lg) var(--radius-lg) 0 0;
    transition: opacity var(--transition-fast);
}

.node-card[data-type="page"]::before { background: var(--type-page); }
.node-card[data-type="organism"]::before { background: var(--type-organism); }
.node-card[data-type="molecule"]::before { background: var(--type-molecule); }
.node-card[data-type="atom"]::before { background: var(--type-atom); }

.node-card:hover {
    border-color: var(--border-focus);
    transform: translateY(-2px);
    box-shadow: 0 8px 24px rgba(0,0,0,0.3);
}

.node-card[data-type="page"]:hover { background: var(--type-page-bg); border-color: var(--type-page); }
.node-card[data-type="organism"]:hover { background: var(--type-organism-bg); border-color: var(--type-organism); }
.node-card[data-type="molecule"]:hover { background: var(--type-molecule-bg); border-color: var(--type-molecule); }
.node-card[data-type="atom"]:hover { background: var(--type-atom-bg); border-color: var(--type-atom); }

.node-card.no-children { cursor: default; }
.node-card.no-children:hover { transform: none; }

.node-card-head {
    display: flex;
    align-items: center;
    gap: 8px;
}

.node-type-badge {
    display: inline-flex;
    align-items: center;
    padding: 2px 7px;
    border-radius: 4px;
    font-size: 10px;
    font-family: var(--font-mono);
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    flex-shrink: 0;
}

.node-type-badge[data-type="page"] { background: var(--type-page-bg); color: var(--type-page); }
.node-type-badge[data-type="organism"] { background: var(--type-organism-bg); color: var(--type-organism); }
.node-type-badge[data-type="molecule"] { background: var(--type-molecule-bg); color: var(--type-molecule); }
.node-type-badge[data-type="atom"] { background: var(--type-atom-bg); color: var(--type-atom); }

.node-name {
    font-size: 15px;
    font-weight: 600;
    color: var(--text-primary);
    font-family: var(--font-mono);
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
}

.node-meta {
    display: flex;
    align-items: center;
    gap: 10px;
    font-size: 11px;
    color: var(--text-muted);
}

.node-meta-item {
    display: flex;
    align-items: center;
    gap: 4px;
}

.node-props-preview {
    display: flex;
    flex-direction: column;
    gap: 3px;
    padding: 8px 10px;
    background: var(--bg-root);
    border-radius: var(--radius-sm);
    max-height: 80px;
    overflow: hidden;
}

.prop-line {
    font-size: 11px;
    font-family: var(--font-mono);
    color: var(--text-muted);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
}

.prop-line-key { color: var(--type-molecule); }
.prop-line-value { color: var(--text-secondary); }

.node-children-indicator {
    display: flex;
    align-items: center;
    gap: 6px;
    font-size: 11px;
    color: var(--text-muted);
    padding-top: 4px;
    border-top: 1px solid var(--border-subtle);
}

.children-arrow {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 18px;
    height: 18px;
    border-radius: 4px;
    background: var(--bg-hover);
    color: var(--text-secondary);
    font-size: 11px;
    transition: background var(--transition-fast), color var(--transition-fast);
}

.node-card:hover .children-arrow {
    background: var(--accent-dim);
    color: var(--accent);
}

/* ============================================
   DETAIL PANEL (slides in from right)
   ============================================ */
.detail-overlay {
    position: fixed;
    inset: 0;
    z-index: 100;
    display: none;
}
.detail-overlay.open { display: flex; }

.detail-backdrop {
    flex: 1;
    background: rgba(0,0,0,0.4);
    cursor: pointer;
}

.detail-panel {
    width: 380px;
    max-width: 90vw;
    background: var(--bg-surface);
    border-left: 1px solid var(--border-subtle);
    overflow-y: auto;
    padding: 24px;
    display: flex;
    flex-direction: column;
    gap: 20px;
    transform: translateX(100%);
    transition: transform var(--transition-normal);
}
.detail-overlay.open .detail-panel {
    transform: translateX(0);
}

.detail-header {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: 12px;
}

.detail-title-group {
    display: flex;
    flex-direction: column;
    gap: 6px;
}

.detail-name {
    font-size: 18px;
    font-weight: 700;
    font-family: var(--font-mono);
    color: var(--text-primary);
}

.detail-close {
    background: none;
    border: 1px solid var(--border-subtle);
    border-radius: var(--radius-sm);
    color: var(--text-muted);
    cursor: pointer;
    width: 28px;
    height: 28px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 16px;
    transition: color var(--transition-fast), border-color var(--transition-fast);
    flex-shrink: 0;
}
.detail-close:hover { color: var(--text-primary); border-color: var(--border-focus); }

.detail-section {
    display: flex;
    flex-direction: column;
    gap: 8px;
}

.detail-section-label {
    font-size: 10px;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 1px;
    color: var(--text-muted);
}

.detail-props-table {
    display: flex;
    flex-direction: column;
    gap: 1px;
    background: var(--border-subtle);
    border-radius: var(--radius-sm);
    overflow: hidden;
}

.detail-prop-row {
    display: flex;
    gap: 12px;
    padding: 8px 12px;
    background: var(--bg-elevated);
    font-size: 12px;
    font-family: var(--font-mono);
}

.detail-prop-key {
    color: var(--type-molecule);
    min-width: 90px;
    flex-shrink: 0;
}

.detail-prop-value {
    color: var(--text-secondary);
    word-break: break-all;
}

.detail-children-list {
    display: flex;
    flex-direction: column;
    gap: 6px;
}

.detail-child-chip {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 6px 10px;
    background: var(--bg-elevated);
    border: 1px solid var(--border-subtle);
    border-radius: var(--radius-sm);
    font-size: 12px;
    font-family: var(--font-mono);
    color: var(--text-secondary);
    cursor: pointer;
    transition: border-color var(--transition-fast), background var(--transition-fast);
}
.detail-child-chip:hover {
    border-color: var(--border-focus);
    background: var(--bg-hover);
}

/* ============================================
   EMPTY / LOADING STATES
   ============================================ */
.empty-state {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 12px;
    flex: 1;
    color: var(--text-muted);
    font-size: 14px;
    min-height: 300px;
}

.empty-state-icon {
    width: 48px;
    height: 48px;
    border-radius: 12px;
    background: var(--bg-elevated);
    display: flex;
    align-items: center;
    justify-content: center;
}

.loading-spinner {
    width: 24px;
    height: 24px;
    border: 2px solid var(--border-subtle);
    border-top-color: var(--accent);
    border-radius: 50%;
    animation: spin 0.8s linear infinite;
}

@keyframes spin { to { transform: rotate(360deg); } }

/* ============================================
   LEGEND
   ============================================ */
.legend {
    position: fixed;
    bottom: 20px;
    left: 20px;
    display: flex;
    gap: 16px;
    padding: 8px 14px;
    background: var(--bg-surface);
    border: 1px solid var(--border-subtle);
    border-radius: var(--radius-md);
    font-size: 11px;
    color: var(--text-muted);
    z-index: 50;
}

.legend-item {
    display: flex;
    align-items: center;
    gap: 6px;
}

.legend-dot {
    width: 8px;
    height: 8px;
    border-radius: 50%;
}

/* ============================================
   SCROLLBAR
   ============================================ */
::-webkit-scrollbar { width: 6px; height: 6px; }
::-webkit-scrollbar-track { background: transparent; }
::-webkit-scrollbar-thumb { background: var(--border-subtle); border-radius: 3px; }
::-webkit-scrollbar-thumb:hover { background: var(--border-focus); }
    </style>
</head>
<body>
<div class="app-layout">
    <!-- Top bar -->
    <div class="top-bar">
        <span class="top-bar-logo">b0nes</span>
        <span class="top-bar-divider"></span>
        <span class="top-bar-title">Composition Visualizer</span>
        <span class="top-bar-spacer"></span>
        <a href="/_inspector" class="top-bar-link">Inspector</a>
    </div>

    <!-- Breadcrumbs -->
    <div class="breadcrumb-bar" id="breadcrumb-bar"></div>

    <!-- Stage: level views render here -->
    <div class="stage" id="stage"></div>

    <!-- Legend -->
    <div class="legend">
        <div class="legend-item"><div class="legend-dot" style="background:var(--type-page)"></div> Page</div>
        <div class="legend-item"><div class="legend-dot" style="background:var(--type-organism)"></div> Organism</div>
        <div class="legend-item"><div class="legend-dot" style="background:var(--type-molecule)"></div> Molecule</div>
        <div class="legend-item"><div class="legend-dot" style="background:var(--type-atom)"></div> Atom</div>
    </div>
</div>

<!-- Detail panel overlay -->
<div class="detail-overlay" id="detail-overlay">
    <div class="detail-backdrop" id="detail-backdrop"></div>
    <div class="detail-panel" id="detail-panel"></div>
</div>

<script>
(function() {
    'use strict';

    // ============================================
    // STATE
    // ============================================
    let pagesData = [];
    let navStack = []; // [{ label, type, data }] breadcrumb history
    const stage = document.getElementById('stage');
    const breadcrumbBar = document.getElementById('breadcrumb-bar');
    const detailOverlay = document.getElementById('detail-overlay');
    const detailBackdrop = document.getElementById('detail-backdrop');
    const detailPanel = document.getElementById('detail-panel');

    // ============================================
    // DATA LOADING
    // ============================================
    async function loadPages() {
        showLoading();
        try {
            const res = await fetch('/_inspector/api/pages');
            if (!res.ok) throw new Error('Failed to load pages: ' + res.status);
            const data = await res.json();
            pagesData = data.pages || [];
            navigateToRoot();
        } catch (err) {
            showError(err.message);
        }
    }

    // ============================================
    // NAVIGATION
    // ============================================
    function navigateToRoot() {
        navStack = [{ label: 'Pages', type: 'root', data: null }];
        renderLevel(buildPagesView());
        renderBreadcrumbs();
    }

    function navigateIntoPage(page) {
        navStack.push({
            label: page.route,
            type: 'page',
            data: page
        });
        renderLevel(buildComponentsView(page.tree, page.title || page.route, page.route));
        renderBreadcrumbs();
    }

    function navigateIntoNode(node, parentLabel) {
        navStack.push({
            label: node.name,
            type: node.type,
            data: node
        });
        const contextLabel = parentLabel ? parentLabel + ' / ' + node.name : node.name;
        renderLevel(buildComponentsView(node.children, node.type + '/' + node.name, contextLabel));
        renderBreadcrumbs();
    }

    function navigateToIndex(index) {
        if (index >= navStack.length - 1) return;
        navStack = navStack.slice(0, index + 1);
        const current = navStack[navStack.length - 1];

        if (current.type === 'root') {
            renderLevel(buildPagesView());
        } else if (current.type === 'page') {
            const page = current.data;
            renderLevel(buildComponentsView(page.tree, page.title || page.route, page.route));
        } else {
            const node = current.data;
            renderLevel(buildComponentsView(node.children, node.type + '/' + node.name, node.name));
        }
        renderBreadcrumbs();
    }

    // ============================================
    // BREADCRUMBS
    // ============================================
    function renderBreadcrumbs() {
        breadcrumbBar.innerHTML = '';
        navStack.forEach(function(crumb, i) {
            if (i > 0) {
                const sep = document.createElement('span');
                sep.className = 'breadcrumb-sep';
                sep.textContent = '/';
                breadcrumbBar.appendChild(sep);
            }

            const btn = document.createElement('button');
            btn.className = 'breadcrumb-item' + (i === navStack.length - 1 ? ' active' : '');

            if (crumb.type !== 'root') {
                const dot = document.createElement('span');
                dot.className = 'breadcrumb-type-dot';
                dot.style.background = 'var(--type-' + crumb.type + ')';
                btn.appendChild(dot);
            }

            const text = document.createElement('span');
            text.textContent = crumb.label;
            btn.appendChild(text);

            if (i < navStack.length - 1) {
                btn.addEventListener('click', function() { navigateToIndex(i); });
            }

            breadcrumbBar.appendChild(btn);
        });
    }

    // ============================================
    // LEVEL RENDERING (with animation)
    // ============================================
    let currentLevelEl = null;

    function renderLevel(contentEl) {
        // Exit current
        if (currentLevelEl) {
            const exiting = currentLevelEl;
            exiting.className = 'level-container exiting';
            setTimeout(function() { if (exiting.parentNode) exiting.parentNode.removeChild(exiting); }, 350);
        }

        // Create new level
        const container = document.createElement('div');
        container.className = 'level-container entering';
        container.appendChild(contentEl);
        stage.appendChild(container);

        // Force reflow then animate in
        container.offsetHeight;
        requestAnimationFrame(function() {
            container.className = 'level-container active';
        });

        currentLevelEl = container;
    }

    // ============================================
    // BUILD PAGES VIEW (Level 0)
    // ============================================
    function buildPagesView() {
        const frag = document.createDocumentFragment();

        const header = document.createElement('div');
        header.className = 'level-header';
        header.innerHTML = '<h2>Pages</h2><p>' + pagesData.length + ' routes discovered</p>';
        frag.appendChild(header);

        const row = document.createElement('div');
        row.className = 'nodes-row';

        pagesData.forEach(function(page) {
            const card = createNodeCard({
                type: 'page',
                name: page.route,
                props: {
                    title: page.title || '',
                    file: page.filePath || ''
                },
                propCount: 0,
                children: page.tree,
                _extra: { componentCount: page.componentCount, description: page.description }
            });
            card.addEventListener('click', function(e) {
                if (e.shiftKey) {
                    openDetail({
                        type: 'page',
                        name: page.route,
                        props: { title: page.title, file: page.filePath, description: page.description },
                        children: page.tree
                    });
                } else {
                    navigateIntoPage(page);
                }
            });
            row.appendChild(card);
        });

        frag.appendChild(row);
        return frag;
    }

    // ============================================
    // BUILD COMPONENTS VIEW (Level 1+)
    // ============================================
    function buildComponentsView(nodes, title, subtitle) {
        const frag = document.createDocumentFragment();

        const header = document.createElement('div');
        header.className = 'level-header';
        header.innerHTML = '<h2>' + escapeHtml(title) + '</h2><p>' + escapeHtml(subtitle) + ' &middot; ' + nodes.length + ' components</p>';
        frag.appendChild(header);

        if (nodes.length === 0) {
            const empty = document.createElement('div');
            empty.className = 'empty-state';
            empty.innerHTML = '<div class="empty-state-icon"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M8 12h8"/></svg></div><span>No nested components at this level</span>';
            frag.appendChild(empty);
            return frag;
        }

        // Parent indicator (breadcrumb context)
        if (navStack.length > 1) {
            const parentCrumb = navStack[navStack.length - 2];
            const parentIndicator = document.createElement('div');
            parentIndicator.className = 'parent-indicator';

            const parentMini = document.createElement('div');
            parentMini.className = 'parent-node-mini';
            const dot = document.createElement('span');
            dot.className = 'breadcrumb-type-dot';
            dot.style.background = 'var(--type-' + (parentCrumb.type === 'root' ? 'page' : parentCrumb.type) + ')';
            parentMini.appendChild(dot);
            const lbl = document.createElement('span');
            lbl.textContent = parentCrumb.label;
            parentMini.appendChild(lbl);
            parentIndicator.appendChild(parentMini);

            const trunk = document.createElement('div');
            trunk.className = 'connector-trunk';
            parentIndicator.appendChild(trunk);

            frag.appendChild(parentIndicator);
        }

        const graph = document.createElement('div');
        graph.className = 'nodes-graph';

        const row = document.createElement('div');
        row.className = 'nodes-row';

        nodes.forEach(function(node) {
            const card = createNodeCard(node);
            const hasChildren = node.children && node.children.length > 0;

            card.addEventListener('click', function(e) {
                if (e.shiftKey || !hasChildren) {
                    openDetail(node);
                } else {
                    navigateIntoNode(node, title);
                }
            });

            row.appendChild(card);
        });

        graph.appendChild(row);
        frag.appendChild(graph);
        return frag;
    }

    // ============================================
    // NODE CARD BUILDER
    // ============================================
    function createNodeCard(node) {
        const card = document.createElement('div');
        card.className = 'node-card';
        card.setAttribute('data-type', node.type);

        const hasChildren = node.children && node.children.length > 0;
        if (!hasChildren) card.classList.add('no-children');

        // Head: type badge + name
        const head = document.createElement('div');
        head.className = 'node-card-head';

        const badge = document.createElement('span');
        badge.className = 'node-type-badge';
        badge.setAttribute('data-type', node.type);
        badge.textContent = node.type;
        head.appendChild(badge);

        const name = document.createElement('span');
        name.className = 'node-name';
        name.textContent = node.name;
        name.title = node.name;
        head.appendChild(name);

        card.appendChild(head);

        // Meta line
        const meta = document.createElement('div');
        meta.className = 'node-meta';

        if (node.propCount !== undefined && node.propCount > 0) {
            const propsItem = document.createElement('span');
            propsItem.className = 'node-meta-item';
            propsItem.textContent = node.propCount + ' props';
            meta.appendChild(propsItem);
        }

        if (node._extra && node._extra.componentCount !== undefined) {
            const countItem = document.createElement('span');
            countItem.className = 'node-meta-item';
            countItem.textContent = node._extra.componentCount + ' total nodes';
            meta.appendChild(countItem);
        }

        if (meta.childNodes.length > 0) card.appendChild(meta);

        // Props preview (show up to 3 props)
        if (node.props && Object.keys(node.props).length > 0) {
            const propsPreview = document.createElement('div');
            propsPreview.className = 'node-props-preview';

            const entries = Object.entries(node.props);
            const show = entries.slice(0, 3);
            show.forEach(function(pair) {
                const line = document.createElement('div');
                line.className = 'prop-line';
                line.innerHTML = '<span class="prop-line-key">' + escapeHtml(pair[0]) + '</span>: <span class="prop-line-value">' + escapeHtml(String(pair[1])) + '</span>';
                propsPreview.appendChild(line);
            });
            if (entries.length > 3) {
                const more = document.createElement('div');
                more.className = 'prop-line';
                more.style.color = 'var(--text-muted)';
                more.textContent = '+ ' + (entries.length - 3) + ' more';
                propsPreview.appendChild(more);
            }

            card.appendChild(propsPreview);
        }

        // Children indicator
        if (hasChildren) {
            const indicator = document.createElement('div');
            indicator.className = 'node-children-indicator';

            const arrow = document.createElement('span');
            arrow.className = 'children-arrow';
            arrow.innerHTML = '&#8594;';
            indicator.appendChild(arrow);

            const childText = document.createElement('span');

            const childTypes = {};
            node.children.forEach(function(c) {
                childTypes[c.type] = (childTypes[c.type] || 0) + 1;
            });
            const summary = Object.entries(childTypes).map(function(e) { return e[1] + ' ' + e[0] + (e[1] > 1 ? 's' : ''); }).join(', ');
            childText.textContent = summary;
            indicator.appendChild(childText);

            card.appendChild(indicator);
        }

        return card;
    }

    // ============================================
    // DETAIL PANEL
    // ============================================
    function openDetail(node) {
        detailPanel.innerHTML = '';

        // Header
        const header = document.createElement('div');
        header.className = 'detail-header';

        const titleGroup = document.createElement('div');
        titleGroup.className = 'detail-title-group';

        const badge = document.createElement('span');
        badge.className = 'node-type-badge';
        badge.setAttribute('data-type', node.type);
        badge.textContent = node.type;
        titleGroup.appendChild(badge);

        const name = document.createElement('div');
        name.className = 'detail-name';
        name.textContent = node.name;
        titleGroup.appendChild(name);

        header.appendChild(titleGroup);

        const closeBtn = document.createElement('button');
        closeBtn.className = 'detail-close';
        closeBtn.innerHTML = '&times;';
        closeBtn.addEventListener('click', closeDetail);
        header.appendChild(closeBtn);

        detailPanel.appendChild(header);

        // Props section
        if (node.props && Object.keys(node.props).length > 0) {
            const section = document.createElement('div');
            section.className = 'detail-section';

            const label = document.createElement('div');
            label.className = 'detail-section-label';
            label.textContent = 'Props';
            section.appendChild(label);

            const table = document.createElement('div');
            table.className = 'detail-props-table';

            Object.entries(node.props).forEach(function(pair) {
                const row = document.createElement('div');
                row.className = 'detail-prop-row';
                row.innerHTML = '<span class="detail-prop-key">' + escapeHtml(pair[0]) + '</span><span class="detail-prop-value">' + escapeHtml(String(pair[1])) + '</span>';
                table.appendChild(row);
            });

            section.appendChild(table);
            detailPanel.appendChild(section);
        }

        // Children section
        if (node.children && node.children.length > 0) {
            const section = document.createElement('div');
            section.className = 'detail-section';

            const label = document.createElement('div');
            label.className = 'detail-section-label';
            label.textContent = 'Slot Children (' + node.children.length + ')';
            section.appendChild(label);

            const list = document.createElement('div');
            list.className = 'detail-children-list';

            node.children.forEach(function(child) {
                const chip = document.createElement('div');
                chip.className = 'detail-child-chip';

                const dot = document.createElement('span');
                dot.className = 'breadcrumb-type-dot';
                dot.style.background = 'var(--type-' + child.type + ')';
                chip.appendChild(dot);

                const text = document.createElement('span');
                text.textContent = child.type + '/' + child.name;
                chip.appendChild(text);

                if (child.children && child.children.length > 0) {
                    const badge2 = document.createElement('span');
                    badge2.style.cssText = 'margin-left:auto;font-size:10px;color:var(--text-muted);';
                    badge2.textContent = child.children.length + ' children';
                    chip.appendChild(badge2);
                }

                chip.addEventListener('click', function() {
                    closeDetail();
                    navigateIntoNode(child, node.name);
                });

                list.appendChild(chip);
            });

            section.appendChild(list);
            detailPanel.appendChild(section);
        }

        detailOverlay.classList.add('open');
    }

    function closeDetail() {
        detailOverlay.classList.remove('open');
    }

    detailBackdrop.addEventListener('click', closeDetail);

    // ============================================
    // LOADING / ERROR STATES
    // ============================================
    function showLoading() {
        stage.innerHTML = '';
        const el = document.createElement('div');
        el.className = 'level-container active';
        el.innerHTML = '<div class="empty-state"><div class="loading-spinner"></div><span>Loading composition data...</span></div>';
        stage.appendChild(el);
        currentLevelEl = el;
    }

    function showError(msg) {
        stage.innerHTML = '';
        const el = document.createElement('div');
        el.className = 'level-container active';
        el.innerHTML = '<div class="empty-state"><div class="empty-state-icon"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#ef4444" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M12 8v4"/><path d="M12 16h.01"/></svg></div><span style="color:#ef4444;">' + escapeHtml(msg) + '</span></div>';
        stage.appendChild(el);
        currentLevelEl = el;
    }

    // ============================================
    // UTILITIES
    // ============================================
    function escapeHtml(str) {
        var div = document.createElement('div');
        div.appendChild(document.createTextNode(str));
        return div.innerHTML;
    }

    // ============================================
    // KEYBOARD SHORTCUTS
    // ============================================
    document.addEventListener('keydown', function(e) {
        // Escape: close detail or go back
        if (e.key === 'Escape') {
            if (detailOverlay.classList.contains('open')) {
                closeDetail();
            } else if (navStack.length > 1) {
                navigateToIndex(navStack.length - 2);
            }
        }
        // Backspace: go back one level (when not in input)
        if (e.key === 'Backspace' && document.activeElement === document.body) {
            e.preventDefault();
            if (navStack.length > 1) {
                navigateToIndex(navStack.length - 2);
            }
        }
    });

    // ============================================
    // SSE HOT RELOAD
    // ============================================
    if (typeof EventSource !== 'undefined') {
        var es = new EventSource('/_inspector/events');
        es.addEventListener('change', function() {
            loadPages();
        });
    }

    // ============================================
    // INIT
    // ============================================
    loadPages();

})();
</script>
</body>
</html>`;
}
