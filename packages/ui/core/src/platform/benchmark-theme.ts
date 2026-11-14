/**
 * Pixel-calibrated desktop chrome for the light workspace benchmark
 * (output/imagegen/3lens-light-v2/01-light-workspace.png, 1774x887).
 *
 * Presentation only: no entities, queries, metrics or actions change. Measurements
 * and colors were sampled from the benchmark. The host application viewport, real
 * captured values and fidelity labels remain application-owned and are not mocked.
 * Scoped to desktop widths; compact layouts keep the responsive rules in styles.ts.
 */
export const benchmarkTheme = `
.tlp-workspace,.tlp-hud,.tlp-launcher,.tlp-floating-pickbar{
  --tlp-teal-strong:#0d9488;--tlp-teal-mark:#14b8a6;--tlp-teal-tint:#ccfbf1;--tlp-teal-ink:#115e59;
  --tlp-slate:#f8fafc;--tlp-line:#e2e8f0;--tlp-ink-soft:#475569;
}
.tlp-icon-only{padding:0!important;width:36px;min-width:36px;height:36px;min-height:36px!important;position:relative}
.tlp-icon-only>span{position:absolute;width:1px;height:1px;overflow:hidden;clip:rect(0 0 0 0);white-space:nowrap}
.tlp-icon-only .tlp-icon{width:20px;height:20px}
.tlp-icon-more{stroke-width:3.4!important}
.tlp-kind-pill{margin-left:auto;background:#eef2f6;color:#475569;border-radius:6px;padding:3px 13px;font-size:13.5px;font-weight:400}
.tlp-tree,.tlp-inspector,.tlp-main{scrollbar-width:thin;scrollbar-color:#cbd5e1 transparent}
.tlp-search-box{position:relative;margin-bottom:10px}.tlp-search-box>.tlp-icon{position:absolute;left:13px;top:50%;transform:translateY(-50%);width:18px;height:18px;color:#64748b;pointer-events:none}
.tlp-search-box>input{padding-left:40px!important}
.tlp-caret{width:16px;height:16px;flex:none;display:inline-grid;place-items:center;cursor:pointer;color:#475569}
.tlp-caret::before{content:'';border:solid currentColor;border-width:0 2px 2px 0;width:6px;height:6px;transform:rotate(-45deg);transition:transform .1s}
.tlp-caret[data-open=true]::before{transform:rotate(45deg) translate(-1px,-1px)}
.tlp-shared-note{display:inline-flex;align-items:center;gap:8px;color:#475569;font-weight:400}.tlp-shared-note .tlp-icon{width:17px;height:17px;color:#2563eb}
.tlp-id-chip{display:inline-flex;align-items:center;gap:6px;max-width:100%;background:#f1f5f9;border-radius:6px;padding:2px 4px 2px 10px}
.tlp-id-chip code{font:12px/1.45 ui-monospace,SFMono-Regular,Consolas,monospace!important;color:#1e293b!important;overflow-wrap:anywhere}
.tlp-id-chip .tlp-copy{width:26px;min-width:26px;height:26px;min-height:26px!important;border:0!important;background:transparent!important;box-shadow:none!important;color:#475569}.tlp-id-chip .tlp-copy .tlp-icon{width:16px;height:16px}
.tlp-stepper{display:inline-flex;align-items:center;gap:0}
.tlp-stepper>.tlp-btn{width:40px;min-width:40px;height:34px;min-height:34px!important}
.tlp-stepper>.tlp-prev{border-radius:6px 0 0 6px}.tlp-stepper>.tlp-prev .tlp-icon{transform:rotate(180deg);width:16px;height:16px}
.tlp-stepper>.tlp-next{border-radius:0 6px 6px 0}.tlp-stepper>.tlp-next .tlp-icon{width:16px;height:16px}
.tlp-stepper>input{width:92px!important;height:34px;text-align:center;border-radius:0!important;margin:0 -1px;padding:0 8px!important;font-size:15px;-moz-appearance:textfield}
.tlp-stepper>input::-webkit-inner-spin-button,.tlp-stepper>input::-webkit-outer-spin-button{-webkit-appearance:none;margin:0}
.tlp-frame-label{font-weight:500}
.tlp-help{width:20px;height:20px;color:#64748b;margin:0 10px 0 4px;flex:none}

/* One shell for every tool: header and tabs stay available at every width and layout (the rail no longer duplicates tool switching). */
.tlp-workspace[data-tool]>.tlp-topbar,.tlp-workspace[data-tool]>.tlp-nav{display:flex!important}
.tlp-workspace[data-tool]:not([data-tool=inspect]){grid-template-rows:53px 44px minmax(0,1fr) 0 24px!important}
.tlp-workspace[data-layout=overlay][data-tool]:not([data-tool=inspect]){grid-template-rows:48px 42px minmax(0,1fr) 0 24px!important}

/* Outlined selects share one chevron and height everywhere (the top bar overrides sizes). */
.tlp-workspace select:not(.tlp-mode-label){appearance:none;height:34px;padding:0 30px 0 12px;background:#fff url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='8' fill='none' stroke='%23334155' stroke-width='1.8' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='m1.5 1.5 4.5 4.5 4.5-4.5'/%3E%3C/svg%3E") no-repeat right 10px center;border-radius:6px}
.tlp-workspace .tlp-identity-name>span:not(.tlp-kind-pill){flex:1 1 0;min-width:0;overflow-wrap:anywhere}.tlp-workspace .tlp-kind-pill{flex:none}
.tlp-workspace .tlp-key-value{grid-template-columns:minmax(96px,30%) minmax(0,1fr)}
.tlp-workspace .tlp-trace-arrow{font-size:12px!important;color:#64748b;background:#f1f5f9;border-radius:999px;padding:2px 10px;white-space:nowrap}
.tlp-workspace .tlpa-analysis .tlp-table td :is(.tlp-muted,small,.tlp-link,button){font-size:inherit}
.tlp-workspace .tlp-surface-card .tlp-section-head h3{color:#0f172a}
.tlp-workspace .tlpa-resource-state{display:inline-block;font-size:12.5px;background:#f1f5f9;color:#334155;border-radius:6px;padding:2px 10px}
.tlp-workspace :is(.tlp-mini-inspector,.tlp-mini-metrics) .tlp-badge{font-size:10px;padding:1px 8px}
.tlp-workspace .tlp-command:not(:hover) button:first-of-type,.tlp-workspace .tlp-command button:hover,.tlp-workspace .tlp-command button:focus-visible{background:#ccfbf1;color:#115e59}
@media(min-width:1151px){
  .tlp-workspace{--tlp-tree:18.2%;--tlp-inspector:32.2%;grid-template-rows:58px 52px minmax(0,1fr) 176px 28px;font-size:14px}
  /* Benchmark row sizes for the full workspace; overlay/dock keep their compact rows. */
  .tlp-workspace[data-layout=workspace][data-tool]:not([data-tool=inspect]){grid-template-rows:58px 52px minmax(0,1fr) 0 28px!important}
  .tlp-workspace[data-tool=surfaces] .tlp-surfaces>.tlp-section-head{min-height:64px;padding:12px 24px;border-bottom:1px solid #eef0f3}
  .tlp-workspace[data-tool=surfaces] .tlp-surfaces>.tlp-section-head h2{font:600 22px/1.3 Inter,ui-sans-serif,system-ui,sans-serif;color:#0f172a;letter-spacing:-.3px}
  /* Top bar */
  .tlp-workspace .tlp-topbar{height:58px;gap:12px;padding:0 14px 0 8px;border-bottom:1px solid #ebecf0}
  .tlp-workspace .tlp-wordmark{font-size:31px;margin-right:12px;letter-spacing:-1.6px;line-height:1}
  .tlp-workspace .tlp-wordmark b{color:#00b3b0;font-weight:600;font-size:34px}
  .tlp-workspace .tlp-wordmark span{font-weight:500;color:#0f172a}
  .tlp-workspace .tlp-topbar>.tlp-divider:first-of-type{display:none}
  .tlp-workspace .tlp-session{font-size:15px;gap:12px;margin-left:4px}
  .tlp-workspace .tlp-session::after{content:'';width:6px;height:6px;border:solid #475569;border-width:0 1.8px 1.8px 0;transform:rotate(45deg) translate(-2px,-2px);margin-left:6px}
  .tlp-workspace .tlp-dot{width:11px;height:11px;background:#10b981;box-shadow:none}
  .tlp-workspace .tlp-mode{height:36px;display:inline-flex;align-items:center;padding:0 18px;font-size:15px;font-weight:500;letter-spacing:.2px;border-radius:6px;background:#ccfbf1;color:#018670;border:0}
  .tlp-workspace .tlp-mode[data-mode=offline]{background:#fef3c7;color:#92400e}
  .tlp-workspace .tlp-topbar>.tlp-divider{height:30px;margin:0 6px;background:#d4d8de}
  .tlp-workspace .tlp-topbar>select:not(.tlp-mode-label){height:36px;font-size:15px;font-weight:400;padding:0 34px 0 14px;min-width:172px;border-radius:6px;box-shadow:none;border-color:#d8dde3;appearance:none;background:#fff url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='8' fill='none' stroke='%23334155' stroke-width='1.8' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='m1.5 1.5 4.5 4.5 4.5-4.5'/%3E%3C/svg%3E") no-repeat right 13px center}
  .tlp-workspace .tlp-mode-label{height:30px;display:inline-flex;align-items:center;padding:0 14px;border:0;border-radius:6px;background:#eef0f4;color:#334155;font:500 14px/1 Inter,ui-sans-serif,system-ui,sans-serif;letter-spacing:.3px;box-shadow:none;appearance:none}
  .tlp-workspace .tlp-top-actions{gap:8px}
  .tlp-workspace .tlp-top-actions>.tlp-btn:not(.tlp-icon-only){height:38px;padding:0 18px;font-size:15px;font-weight:400;gap:10px;border-radius:6px;border-color:#dfe3e8;box-shadow:none}
  .tlp-workspace .tlp-top-actions>.tlp-btn:not(.tlp-icon-only) .tlp-icon{width:21px;height:21px;color:#1e293b}
  .tlp-workspace .tlp-top-actions>.tlp-btn[data-action=record] .tlp-icon{color:#ef4444;fill:#ef4444;width:16px;height:16px;margin-right:2px}
  .tlp-workspace .tlp-top-actions>.tlp-icon-only{border:0;background:transparent;box-shadow:none;color:#334155;width:34px;min-width:34px}.tlp-workspace .tlp-top-actions>.tlp-icon-only:hover{background:#f1f5f9}
  /* Tool tabs */
  .tlp-workspace .tlp-nav{height:52px;gap:6px;padding:0 6px;border-bottom:1px solid #ebecf0;background:#fff;font-size:15px}
  .tlp-workspace .tlp-nav>button{height:52px;padding:0 24px;gap:12px;border:0;border-bottom:3px solid transparent;border-radius:0;box-shadow:none;background:none;color:#1e293b;font-weight:400}
  .tlp-workspace .tlp-nav>button .tlp-icon{width:23px;height:23px;stroke-width:1.5}
  .tlp-workspace .tlp-nav>button:hover{background:#f8fafc}
  .tlp-workspace .tlp-nav>button[aria-selected=true]{background:none;color:#0b7a76;border-bottom-color:#00bdbf;box-shadow:none;font-weight:500}
  .tlp-workspace .tlp-nav>button[aria-selected=true] .tlp-icon{color:#0b8f8d}
  /* Scene graph */
  .tlp-workspace[data-tool=inspect] .tlp-tree{padding:12px 10px 0 10px;background:#f8fafc;border-right:1px solid #e2e8f0}
  .tlp-workspace[data-tool=inspect] .tlp-tree-head{margin:0 4px 14px 8px;min-height:38px}
  .tlp-workspace[data-tool=inspect] .tlp-tree-head h3{font-size:18px;font-weight:600;letter-spacing:-.1px}
  .tlp-workspace[data-tool=inspect] .tlp-tree-head .tlp-btn{border:0;background:transparent;box-shadow:none;color:#334155;width:32px;min-width:32px}
  .tlp-workspace[data-tool=inspect] .tlp-search{height:40px;margin:0;border-radius:6px;font-size:15px;border-color:#dfe3e8;background:#fff;box-shadow:none}
  .tlp-workspace[data-tool=inspect] .tlp-tree-node{min-height:38px;font-size:15px;gap:12px;border-radius:0;color:#1e293b;margin:0 -10px;width:calc(100% + 20px);box-shadow:none}
  .tlp-workspace[data-tool=inspect] .tlp-tree-node .tlp-icon{width:22px;height:22px;color:#1e293b;stroke-width:1.5}
  .tlp-workspace[data-tool=inspect] .tlp-tree-node[aria-current=true]{background:#ccfbf1;color:#0f766e;box-shadow:inset 4px 0 #14b8a6}
  .tlp-workspace[data-tool=inspect] .tlp-tree-node[aria-current=true] .tlp-icon{color:#0f9a95}
  .tlp-workspace[data-tool=inspect] .tlp-tree-node:hover:not([aria-current=true]){background:#eef2f6}
  .tlp-workspace .tlp-tool-rail .tlp-tree-node{margin:0;width:100%;border-radius:6px;font-size:13px;gap:10px;min-height:42px;padding-left:10px;padding-right:6px}
  .tlp-workspace .tlp-tool-rail .tlp-tree-node .tlp-icon{width:20px;height:20px}
  .tlp-workspace .tlp-tool-rail .tlp-tree-node[aria-current=true]{box-shadow:none}
  .tlp-workspace:not([data-tool=inspect]) .tlp-inspector-header{gap:8px;justify-content:flex-start}
  .tlp-workspace:not([data-tool=inspect]) .tlp-shared-note{margin-left:auto}
  .tlp-workspace:not([data-tool=inspect]) .tlp-shared-note>span{position:absolute;width:1px;height:1px;overflow:hidden;clip:rect(0 0 0 0)}
  .tlp-workspace .tlp-relation-group .tlp-link,.tlp-workspace .tlp-relation>.tlp-link{background:#f8fafc;border:1px solid #e2e8f0;border-radius:6px;padding:5px 12px;color:#1e293b;text-decoration:none}
  .tlp-workspace .tlp-relation-group .tlp-link:hover{border-color:#94a3b8}
  .tlp-workspace .tlp-relation>span{font:11.5px Inter,ui-sans-serif,system-ui,sans-serif;color:#64748b;text-transform:none}
  .tlp-workspace .tlp-tree-node[data-depth='0'][data-kind=scene]{font-weight:500}
  /* Center + viewport */
  .tlp-workspace .tlp-main{background:#fff}
  .tlp-workspace .tlp-main[data-tool=inspect]{padding:10px 9px 10px 9px}
  .tlp-workspace .tlp-viewport{border:1px solid #e2e8f0;border-radius:6px}
  .tlp-workspace .tlp-viewport-toolbar{top:15px;height:42px;border-radius:8px;border:1px solid #dfe3e8;background:#fff;box-shadow:0 1px 2px #0f172a0a;font-size:15px}
  .tlp-workspace .tlp-viewport-toolbar .tlp-btn{height:40px;min-height:40px;padding:0 16px;font-size:15px;font-weight:500;gap:10px;border:0;border-right:1px solid #e2e8f0;border-radius:0;background:transparent;box-shadow:none}
  .tlp-workspace .tlp-viewport-toolbar .tlp-btn:first-child{border-radius:7px 0 0 7px}
  .tlp-workspace .tlp-viewport-toolbar .tlp-btn .tlp-icon{width:19px;height:19px}
  .tlp-workspace .tlp-viewport-toolbar .tlp-btn:nth-child(n+2):not(:first-child){font-weight:400;color:#334155;padding:0 12px}
  .tlp-workspace .tlp-toolbar-hint{font-size:14px;color:#64748b;padding:0 14px}
  .tlp-workspace .tlp-breadcrumb{bottom:11px;left:11px;right:11px;height:40px;padding:0 16px;gap:12px;border-radius:6px;font-size:15px;border:1px solid #dfe3e8;background:#fff;box-shadow:none}
  .tlp-workspace .tlp-breadcrumb .tlp-icon{width:22px;height:22px}
  .tlp-workspace .tlp-breadcrumb .tlp-icon:not(:first-child){width:14px;height:14px;color:#64748b}
  .tlp-workspace .tlp-breadcrumb .tlp-link,.tlp-workspace .tlp-breadcrumb>span{color:#0f766e;font-size:15px}
  .tlp-workspace .tlp-breadcrumb .tlp-link:not(:last-child){color:#1e293b}
  .tlp-workspace .tlp-resizer{background:#fff;border-left:0;border-right:0}
  /* Inspector */
  .tlp-workspace .tlp-inspector{font-size:15px;border-left:1px solid #e2e8f0;background:#fff}
  .tlp-workspace .tlp-inspector-header{padding:0 16px 0 15px;height:54px;background:#fff;border-bottom:1px solid #eef0f3}
  .tlp-workspace .tlp-inspector-header strong{font-size:18px;font-weight:600}
  .tlp-workspace .tlp-inspector-header .tlp-shared-note{font-size:13.5px}
  .tlp-workspace .tlp-inspector-section{padding:0 0 12px;border-bottom:1px solid #eef0f3}
  .tlp-workspace .tlp-inspector-section>*:not(h3){margin-left:15px;margin-right:15px}
  .tlp-workspace .tlp-inspector-section>h3{height:42px;margin:0 0 6px;padding:0 15px;background:#fafafa;border-top:1px solid #eef0f3;border-bottom:1px solid #eef0f3;font-size:16px;font-weight:500;gap:12px}
  .tlp-workspace .tlp-inspector-section>h3 .tlp-icon{width:21px;height:21px;color:#334155}
  .tlp-workspace .tlp-identity-name{font-size:20px;font-weight:500;gap:12px;margin-bottom:8px}.tlp-workspace .tlp-identity-name>.tlp-icon{width:26px;height:26px}
  .tlp-workspace .tlp-key-value{font-size:15px;gap:10px 14px;grid-template-columns:minmax(70px,23%) minmax(0,1fr)}
  .tlp-workspace .tlp-key-value dt{color:#475569}
  .tlp-workspace .tlp-inspector-tabs{padding:0 15px;gap:18px;border-bottom:1px solid #eef0f3}.tlp-workspace .tlp-inspector-tabs button{font-size:13.5px;padding:10px 4px;border:0;border-bottom:2px solid transparent;border-radius:0;background:none;box-shadow:none;color:#475569}
  .tlp-workspace .tlp-inspector-tabs button[data-active=true]{color:#0f766e;border-bottom-color:#14b8a6;font-weight:500}
  .tlp-workspace .tlp-relation .tlp-btn,.tlp-workspace .tlp-relation-group .tlp-link{font-size:14px;border-radius:6px}
  .tlp-workspace .tlp-actions{gap:12px;margin-top:2px}.tlp-workspace .tlp-actions .tlp-btn{font-size:14.5px;min-height:40px;padding:0 16px;gap:10px;font-weight:400;border-color:#dfe3e8;box-shadow:none;flex:1 1 0}
  .tlp-workspace .tlp-actions .tlp-btn .tlp-icon{width:19px;height:19px}
  .tlp-workspace .tlp-badge{font:600 12px/1.5 Inter,ui-sans-serif,system-ui,sans-serif;letter-spacing:.3px;border-radius:6px;padding:2px 11px;border-width:0;background:#d1fae5;color:#065f46}
  .tlp-workspace .tlp-badge[data-fidelity=ESTIMATED]{background:#fde8ae;color:#92400e}
  .tlp-workspace .tlp-badge[data-fidelity=UNAVAILABLE]{background:#eef2f6;color:#475569}
  /* Frame timeline */
  .tlp-workspace .tlp-timeline{background:#fff;border-top:1px solid #e2e8f0}
  .tlp-workspace .tlp-timeline-toolbar{min-height:46px;padding:0 20px;gap:14px;font-size:15px;border-bottom:1px solid #eef0f3}
  .tlp-workspace .tlp-timeline-toolbar strong{font-size:18px;font-weight:600;margin-right:6px}
  .tlp-workspace .tlp-timeline-toolbar .tlp-btn:not(.tlp-icon-only){min-height:34px;font-size:14.5px;font-weight:400;padding:0 14px;box-shadow:none;border-color:#dfe3e8}
  .tlp-workspace .tlp-timeline-bars{padding-left:259px;padding-right:104px}
  .tlp-workspace .tlp-frame-bar{max-width:26px;background:#00bdbf;border-top:0;opacity:.85;border-radius:1px 1px 0 0}
  .tlp-workspace .tlp-frame-bar[data-selected=true]{background:#f59e0b}
  .tlp-workspace .tlp-timeline-lanes{grid-template-columns:225px 1fr 70px;gap:3px 14px;padding:3px 20px 3px 20px;font-size:12.5px;align-content:start}
  .tlp-workspace .tlp-ruler{display:flex;justify-content:space-between;font-size:11.5px;color:#64748b;border-bottom:1px solid #e2e8f0;padding-bottom:1px}
  .tlp-workspace .tlp-ruler span:last-child{text-align:right}
  .tlp-workspace .tlp-lane-ms{text-align:right;font-size:12.5px;color:#334155;align-self:center}
  .tlp-workspace .tlp-lane{height:20px;border:0;border-radius:2px;background:#e6f7f7}
  .tlp-workspace .tlp-lane span{font:12.5px/20px Inter,ui-sans-serif,system-ui,sans-serif;background:#00bdbf;color:#06302f;padding-left:8px}
  .tlp-workspace .tlp-timeline-lanes>.tlp-link{color:#1e293b;font-size:13.5px}
  /* Status bar */
  .tlp-workspace .tlp-statusbar{font-size:11.5px;background:#fff;border-top:1px solid #e2e8f0;gap:12px}
  .tlp-workspace .tlp-statusbar>.tlp-surface-control{display:flex;align-items:center;gap:6px}.tlp-workspace .tlp-statusbar>.tlp-surface-control>span{display:none}
  .tlp-workspace .tlp-statusbar select,.tlp-workspace .tlp-statusbar .tlp-btn{height:24px;min-height:24px;padding:0 10px;font-size:11.5px;box-shadow:none;border-color:#e2e8f0}
  .tlp-workspace .tlp-statusbar select{padding-right:26px;background-position:right 9px center}
}
@media(min-width:1151px) and (max-width:1449px){
  .tlp-workspace .tlp-mode-label{flex:none}
  .tlp-workspace .tlp-topbar>select:not(.tlp-mode-label){min-width:150px}
  .tlp-workspace .tlp-top-actions>.tlp-btn:not(.tlp-icon-only){padding:0 11px;gap:0}
  .tlp-workspace .tlp-top-actions>.tlp-btn:not(.tlp-icon-only)>span{position:absolute;width:1px;height:1px;overflow:hidden;clip:rect(0 0 0 0);white-space:nowrap}
  .tlp-workspace .tlp-top-actions>.tlp-btn{position:relative}
}
@media(max-width:1150px){
  /* Compact widths keep the original two-column lanes; the ruler needs the desktop grid. */
  .tlp-ruler-pad,.tlp-ruler,.tlp-lane-ms{display:none!important}
  .tlp-workspace .tlp-shared-note>span{position:absolute;width:1px;height:1px;overflow:hidden;clip:rect(0 0 0 0)}
  .tlp-workspace .tlp-statusbar>.tlp-surface-control>span{display:none}
  .tlp-workspace .tlp-nav>button[aria-selected=true]{background:none;border-bottom:3px solid #00bdbf;border-radius:0;box-shadow:none;color:#0b7a76}
  .tlp-workspace .tlp-nav>button{border-radius:0;border-bottom:3px solid transparent}
}
`;
