/**
 * Edge-docked sidebar layout. The host viewer is never reparented or resized;
 * the tools float above the application along the right edge and publish how
 * much they cover (see `LensInsets`).
 */
export const sidebarTheme = `
.tlp-workspace[data-layout=sidebar]{--tlp-sidebar-w:440px;inset:0 0 0 auto;width:min(var(--tlp-sidebar-w),100vw);height:100%;border-left:1px solid var(--tlp-border);box-shadow:-14px 0 40px #18181b1a;grid-template-rows:48px 42px minmax(0,1fr) 96px 24px}
.tlp-workspace[data-layout=sidebar]:not([data-tool=inspect]){width:min(max(var(--tlp-sidebar-w),min(940px,72vw)),100vw)}
.tlp-sidebar-handle{display:none}
.tlp-workspace[data-layout=sidebar] .tlp-sidebar-handle{display:block;position:absolute;top:0;bottom:0;left:-3px;width:7px;cursor:col-resize;z-index:30;touch-action:none}
.tlp-workspace[data-layout=sidebar] .tlp-sidebar-handle:hover,.tlp-workspace[data-layout=sidebar] .tlp-sidebar-handle:active{background:var(--tlp-teal);opacity:.55}
.tlp-workspace[data-layout=sidebar] .tlp-session-label,.tlp-workspace[data-layout=sidebar] .tlp-mode-label{display:none}
.tlp-workspace[data-layout=sidebar][data-tool=inspect] .tlp-topbar{gap:7px;padding:0 10px}
.tlp-workspace[data-layout=sidebar][data-tool=inspect] .tlp-topbar>.tlp-session,.tlp-workspace[data-layout=sidebar][data-tool=inspect] .tlp-topbar>.tlp-mode,.tlp-workspace[data-layout=sidebar][data-tool=inspect] .tlp-topbar>.tlp-divider{display:none}
.tlp-workspace[data-layout=sidebar][data-tool=inspect] .tlp-topbar>select{max-width:130px}
.tlp-workspace[data-layout=sidebar][data-tool=inspect] .tlp-top-actions{gap:3px}
.tlp-workspace[data-layout=sidebar][data-tool=inspect] .tlp-top-actions .tlp-btn{min-height:26px;padding:4px 5px;font-size:0;gap:0}
.tlp-workspace[data-layout=sidebar][data-tool=inspect] .tlp-nav>button>span{display:none}
.tlp-workspace[data-layout=sidebar][data-tool=inspect] .tlp-nav>button{padding:0 10px}
.tlp-workspace[data-layout=sidebar][data-tool=inspect] .tlp-content{display:grid;grid-template-columns:minmax(0,1fr);grid-template-rows:minmax(130px,36%) minmax(0,1fr)}
.tlp-workspace[data-layout=sidebar][data-tool=inspect] .tlp-main,.tlp-workspace[data-layout=sidebar][data-tool=inspect] .tlp-resizer{display:none}
.tlp-workspace[data-layout=sidebar][data-tool=inspect] .tlp-tree{border-right:0;border-bottom:1px solid var(--tlp-border)}
.tlp-workspace[data-layout=sidebar][data-tool=inspect] .tlp-inspector{border-left:0;min-height:0}
.tlp-workspace[data-layout=sidebar][data-tool=inspect] .tlp-timeline-bars{padding-left:15px}
.tlp-workspace[data-layout=sidebar][data-tool=inspect] .tlp-timeline-lanes{display:none}
`;
