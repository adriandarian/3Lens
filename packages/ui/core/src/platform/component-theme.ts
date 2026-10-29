/**
 * Light component recipes informed by shadcn/ui's semantic token convention.
 * Scoped to the DOM island: no framework runtime or host-page theme mutation.
 * Entities/queries/actions: unchanged; this is presentation of the shared model.
 * Verification: all six live views, trace UI contracts, and browser captures.
 */
export const componentTheme = `
.tlp-workspace,.tlp-hud,.tlp-launcher,.tlp-floating-pickbar{
  --background:#fafafa;--foreground:#18181b;--card:#fff;--card-foreground:#18181b;
  --popover:#fff;--popover-foreground:#18181b;--primary:#18181b;--primary-foreground:#fafafa;
  --secondary:#f4f4f5;--secondary-foreground:#27272a;--muted:#f4f4f5;--muted-foreground:#52525b;
  --accent:#ecfdf5;--accent-foreground:#115e59;--border:#e4e4e7;--input:#d4d4d8;--ring:#0f766e;
  --radius:6px;--tlp-bg:var(--background);--tlp-text:var(--foreground);--tlp-panel:var(--card);
  --tlp-raised:var(--secondary);--tlp-muted:var(--muted-foreground);--tlp-border:var(--border);
  --tlp-teal:var(--ring);--tlp-accent:var(--accent);color-scheme:light;
}
.tlp-workspace{font-family:Inter,ui-sans-serif,system-ui,-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;letter-spacing:0}
.tlp-workspace .tlp-btn,.tlp-workspace input,.tlp-workspace select,.tlp-workspace textarea{
  border:1px solid var(--input);border-radius:var(--radius);background:var(--card);color:var(--foreground);
  box-shadow:0 1px 2px #18181b08;font-weight:500;
}
.tlp-workspace .tlp-btn:hover{background:var(--secondary);border-color:#a1a1aa}
.tlp-workspace .tlp-btn[data-active=true]{background:var(--accent);border-color:var(--ring);color:var(--accent-foreground)}
.tlp-workspace :is(button,input,select,textarea):focus-visible{outline:2px solid var(--ring);outline-offset:2px}
.tlp-workspace input::placeholder,.tlp-workspace textarea::placeholder{color:#71717a}
.tlp-workspace :is(.tlp-card,.tlpa-card,.tlp-surface-card){background:var(--card);border-radius:8px;box-shadow:0 1px 2px #18181b05}
.tlp-workspace :is(.tlp-topbar,.tlp-nav,.tlp-inspector,.tlp-inspector-header,.tlp-command){background:var(--card)}
.tlp-workspace :is(.tlp-tree,.tlp-statusbar,.tlp-timeline){background:var(--background)}
.tlp-workspace .tlp-nav{gap:4px;align-items:center}
.tlp-workspace .tlp-nav>button{height:34px;border:0;border-radius:var(--radius);padding:0 12px;color:var(--muted-foreground)}
.tlp-workspace .tlp-nav>button[aria-selected=true]{background:var(--secondary);color:var(--foreground);box-shadow:0 1px 3px #18181b12;font-weight:600}
.tlp-workspace .tlp-nav>button:hover{background:var(--secondary)}
.tlp-workspace .tlp-tree-node{border-left:0;border-radius:var(--radius)}
.tlp-workspace .tlp-tree-node[aria-current=true]{background:var(--accent);color:var(--accent-foreground);box-shadow:inset 2px 0 var(--ring)}
.tlp-workspace :is(.tlp-badge,.tlpa-analysis .tlp-badge){border-radius:999px;padding:2px 7px;background:#ecfdf5;color:#166534;border-color:#bbf7d0;font-weight:600}
.tlp-workspace :is(.tlp-badge,.tlpa-analysis .tlp-badge)[data-fidelity=ESTIMATED]{background:#fffbeb;color:#92400e;border-color:#fde68a}
.tlp-workspace :is(.tlp-badge,.tlpa-analysis .tlp-badge)[data-fidelity=UNAVAILABLE]{background:#f4f4f5;color:#52525b;border-color:#e4e4e7}
.tlp-workspace :is(.tlp-table,.tlp-trace-table) th{background:var(--background);color:var(--muted-foreground);font-weight:500}
.tlp-workspace :is(.tlp-table,.tlp-trace-table) td{border-color:var(--border)}
.tlp-workspace .tlp-command{border-color:var(--border);padding:8px;border-radius:10px;box-shadow:0 16px 48px #18181b26}
.tlp-workspace .tlp-command-backdrop{background:#18181b40}
.tlp-workspace .tlp-command button{color:var(--foreground);border:0;border-radius:var(--radius);box-shadow:none}
.tlp-workspace .tlp-command button:hover{background:var(--secondary)}
.tlp-workspace .tlp-command kbd{background:var(--secondary);border:1px solid var(--border);border-radius:4px;padding:1px 5px;color:var(--muted-foreground)}
.tlp-workspace :is(.tlp-mode,.tlp-mode-label){border-radius:999px}
.tlp-workspace .tlp-mode{background:#ecfdf5;color:#166534;border-color:#bbf7d0}
.tlp-workspace .tlp-mode[data-mode=offline]{background:#fffbeb;color:#92400e;border-color:#fde68a}
.tlp-workspace :is(.tlp-viewport-toolbar,.tlp-breadcrumb){background:#ffffffed;border-color:var(--border);border-radius:var(--radius);box-shadow:0 2px 8px #18181b0d}
.tlp-workspace .tlpa-source-body{background:#fafafa}
.tlp-workspace .tlpa-caution{background:#fffbeb;border-color:#fde68a;color:#92400e}
.tlp-workspace :is(h2,h3,h4){color:var(--foreground)}
.tlp-workspace .tlp-surfaces>.tlp-section-head h2{font:600 24px/1.4 ui-sans-serif,system-ui;letter-spacing:-.5px}
.tlp-workspace .tlp-surface-card .tlp-section-head h3{font:600 16px/1.4 ui-sans-serif,system-ui}
.tlp-floating-pickbar,.tlp-hud,.tlp-launcher{background:var(--card);color:var(--foreground);border-color:var(--border);border-radius:var(--radius);box-shadow:0 2px 10px #18181b14}
`;
