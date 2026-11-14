/** Styles for the HUD surfaces. Scoped to `.tlh` / `.tla` so nothing leaks into the host application. */
export const hudStyles = `
.tlh,.tla{--tlh-bg:#ffffff;--tlh-raised:#f4f4f5;--tlh-line:#e4e4e7;--tlh-text:#18181b;--tlh-muted:#52525b;--tlh-faint:#71717a;
  --tlh-teal:#0f766e;--tlh-teal-strong:#0d9488;--tlh-teal-tint:#ccfbf1;--tlh-amber:#92400e;--tlh-amber-tint:#fef3c7;
  --tlh-green:#166534;--tlh-green-tint:#dcfce7;--tlh-red:#b91c1c;--tlh-shadow:0 8px 28px #18181b26,0 1px 3px #18181b1f;
  font:13px/1.4 ui-sans-serif,system-ui,-apple-system,"Segoe UI",Roboto,sans-serif;color:var(--tlh-text);box-sizing:border-box}
.tlh *,.tla *{box-sizing:border-box}
.tlh [hidden],.tla [hidden]{display:none!important}
.tlh button,.tla button{font:inherit;color:inherit;cursor:pointer}
.tlh code,.tla code{font:11.5px ui-monospace,SFMono-Regular,Menlo,Consolas,monospace}
.tlh-root{position:fixed;inset:0;z-index:2147483000;pointer-events:none}
.tlh-root[hidden]{display:none}
.tlh-root>*{pointer-events:auto}
.tlh-root>.tlh-outline{pointer-events:none}
.tlh svg.tlh-icon{width:16px;height:16px;flex:none}
.tlh :focus-visible,.tla :focus-visible{outline:2px solid var(--tlh-teal-strong);outline-offset:1px}

/* status pills */
.tlh-root>.tlh-pills{position:absolute;top:12px;left:12px;right:68px;display:flex;gap:6px;align-items:center;flex-wrap:wrap;justify-content:center;pointer-events:none}
.tlh-pills>*{pointer-events:auto}
.tlh-root[data-drawer=true]>.tlh-pills{right:436px}
.tlh-pill{display:inline-flex;align-items:center;gap:6px;height:28px;padding:0 11px;background:var(--tlh-bg);border:1px solid var(--tlh-line);border-radius:999px;box-shadow:0 2px 8px #18181b14;white-space:nowrap;font-variant-numeric:tabular-nums}
.tlh-pill b{font-weight:600}
.tlh-pill span.k{color:var(--tlh-faint)}
.tlh-pill[data-kind=status]{font-weight:600;letter-spacing:.02em}
.tlh-pill[data-kind=status]::before{content:"";width:8px;height:8px;border-radius:50%;background:var(--tlh-green);box-shadow:0 0 0 3px var(--tlh-green-tint)}
.tlh-pill[data-kind=status][data-state=trace]::before{background:var(--tlh-amber);box-shadow:0 0 0 3px var(--tlh-amber-tint)}
.tlh-pill[data-kind=warn]{border-color:#f59e0b;background:var(--tlh-amber-tint);color:var(--tlh-amber)}
.tlh-pill select{appearance:none;border:0;background:transparent;font:inherit;font-weight:600;color:inherit;cursor:pointer;padding:0 2px}
button.tlh-pill:hover{background:var(--tlh-raised)}
button.tlh-pill[data-active=true]{background:var(--tlh-teal-tint);border-color:var(--tlh-teal-strong);color:var(--tlh-teal)}
.tlh-pill kbd{font:10.5px ui-monospace,monospace;background:var(--tlh-raised);border:1px solid var(--tlh-line);border-radius:4px;padding:0 4px;color:var(--tlh-muted)}

/* rail */
.tlh-rail{position:absolute;right:0;top:50%;transform:translateY(-50%);display:flex;flex-direction:column;gap:2px;padding:6px;background:var(--tlh-bg);border:1px solid var(--tlh-line);border-right:0;border-radius:12px 0 0 12px;box-shadow:var(--tlh-shadow)}
.tlh-rail button{display:grid;place-items:center;width:34px;height:34px;border:0;border-radius:8px;background:transparent;color:var(--tlh-muted);position:relative}
.tlh-rail button:hover{background:var(--tlh-raised);color:var(--tlh-text)}
.tlh-rail button[data-active=true]{background:var(--tlh-teal-tint);color:var(--tlh-teal)}
.tlh-rail button[data-badge]::after{content:attr(data-badge);position:absolute;top:1px;right:1px;min-width:14px;height:14px;padding:0 3px;border-radius:7px;background:var(--tlh-teal-strong);color:#fff;font-size:9.5px;line-height:14px;text-align:center}
.tlh-rail button[title]:hover::before{content:attr(title);position:absolute;right:42px;white-space:nowrap;background:#18181b;color:#fff;padding:3px 8px;border-radius:6px;font-size:11.5px}

/* drawer */
.tlh-drawer{position:absolute;top:12px;bottom:12px;right:56px;width:360px;max-width:calc(100vw - 80px);display:flex;flex-direction:column;background:var(--tlh-bg);border:1px solid var(--tlh-line);border-radius:12px;box-shadow:var(--tlh-shadow);overflow:hidden}
.tlh-drawer[hidden]{display:none}
.tlh-search{display:flex;align-items:center;gap:8px;padding:10px 12px;border-bottom:1px solid var(--tlh-line);color:var(--tlh-muted)}
.tlh-facts .tlh-badge{align-self:flex-start}
.tlh-search input:focus-visible{outline:0}
.tlh-search input{flex:1;min-width:0;border:0;outline:0;background:transparent;font:inherit;color:var(--tlh-text)}
.tlh-scroll{overflow:auto;flex:1;min-height:0;overscroll-behavior:contain}
.tlh-group-title{display:flex;justify-content:space-between;align-items:center;margin:0;padding:10px 12px 4px;font-size:11px;letter-spacing:.06em;text-transform:uppercase;color:var(--tlh-faint);font-weight:600}
.tlh-row{display:grid;grid-template-columns:minmax(0,1fr) auto;gap:2px 8px;width:100%;text-align:left;padding:8px 12px;border:0;border-top:1px solid transparent;background:transparent;align-items:center}
.tlh-row:hover,.tlh-row[data-active=true]{background:var(--tlh-raised)}
.tlh-row .t{font-weight:600;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.tlh-row .d{grid-column:1;color:var(--tlh-muted);font-size:12px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.tlh-row .w{grid-column:1/-1;color:var(--tlh-faint);font-size:11.5px}
.tlh-row kbd{font:10.5px ui-monospace,monospace;color:var(--tlh-faint)}
.tlh-empty{padding:18px 14px;color:var(--tlh-muted)}
.tlh-empty button{margin-top:8px}
.tlh-foot{padding:8px 12px;border-top:1px solid var(--tlh-line);color:var(--tlh-faint);font-size:11.5px}

/* badges */
.tlh-badge{display:inline-block;padding:0 6px;border-radius:4px;font-size:10px;font-weight:700;letter-spacing:.05em;line-height:16px;border:1px solid transparent;white-space:nowrap}
.tlh-badge[data-fidelity=EXACT]{background:var(--tlh-green-tint);color:var(--tlh-green)}
.tlh-badge[data-fidelity=ESTIMATED]{background:var(--tlh-amber-tint);color:var(--tlh-amber)}
.tlh-badge[data-fidelity=UNAVAILABLE]{background:var(--tlh-raised);color:var(--tlh-muted);border-color:var(--tlh-line)}

/* buttons */
.tlh-btn{display:inline-flex;align-items:center;gap:6px;height:28px;padding:0 10px;background:var(--tlh-bg);border:1px solid var(--tlh-line);border-radius:7px}
.tlh-btn:hover{background:var(--tlh-raised)}
.tlh-btn[data-primary=true]{background:var(--tlh-teal);border-color:var(--tlh-teal);color:#fff}
.tlh-btn[data-primary=true]:hover{background:#115e59}
.tlh-btn:disabled{opacity:.5;cursor:not-allowed}

/* pick card */
.tlh-outline{position:absolute;border:2px solid var(--tlh-teal-strong);border-radius:4px;background:#14b8a61a;box-shadow:0 0 0 1px #fff}
.tlh-card{position:absolute;width:320px;max-width:calc(100vw - 24px);background:var(--tlh-bg);border:1px solid var(--tlh-line);border-radius:12px;box-shadow:var(--tlh-shadow);overflow:hidden}
.tlh-card[hidden]{display:none}
.tlh-card header{display:flex;gap:8px;align-items:flex-start;padding:10px 12px 8px}
.tlh-card header .name{font-weight:700;font-size:14px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.tlh-card header .meta{display:flex;gap:6px;align-items:center;color:var(--tlh-faint);margin-top:1px}
.tlh-card header .meta code{overflow:hidden;text-overflow:ellipsis;white-space:nowrap;max-width:210px}
.tlh-card header>div{min-width:0;flex:1}
.tlh-x{display:grid;place-items:center;width:24px;height:24px;border:0;border-radius:6px;background:transparent;color:var(--tlh-muted)}
.tlh-x:hover{background:var(--tlh-raised)}
.tlh-facts{display:grid;grid-template-columns:76px minmax(0,1fr);border-top:1px solid var(--tlh-line)}
.tlh-facts>dt,.tlh-facts>dd{margin:0;padding:6px 12px;border-bottom:1px solid var(--tlh-line)}
.tlh-facts>dt{color:var(--tlh-faint);font-size:11.5px;padding-top:8px}
.tlh-facts>dd{display:flex;flex-direction:column;gap:3px;min-width:0}
.tlh-facts>dt:last-of-type,.tlh-facts>dd:last-of-type{border-bottom:0}
.tlh-line{display:flex;gap:2px 8px;align-items:center;justify-content:space-between;min-width:0;flex-wrap:wrap}
.tlh-line>button.link{flex:1;min-width:0;text-align:left;border:0;background:transparent;padding:0;color:var(--tlh-teal);overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.tlh-line>button.link:hover{text-decoration:underline}
.tlh-line .v{color:var(--tlh-muted);white-space:nowrap}
.tlh-note{color:var(--tlh-faint);font-size:11.5px}
.tlh-actions{display:flex;gap:6px;flex-wrap:wrap;padding:8px 12px 10px;background:var(--tlh-raised);border-top:1px solid var(--tlh-line)}

/* palette */
.tlh-backdrop{position:absolute;inset:0;background:#18181b33;display:flex;justify-content:center;align-items:flex-start;padding-top:13vh}
.tlh-backdrop[hidden]{display:none}
.tlh-palette{width:min(620px,calc(100vw - 24px));max-height:min(560px,72vh);display:flex;flex-direction:column;background:var(--tlh-bg);border:1px solid var(--tlh-line);border-radius:14px;box-shadow:0 20px 60px #18181b40;overflow:hidden}
.tlh-palette .tlh-search{padding:12px 14px}
.tlh-palette .tlh-search input{font-size:15px}
.tlh-palette .tlh-row[data-active=true]{background:var(--tlh-teal-tint)}

/* ===== analysis window ===== */
.tla{position:fixed;inset:0;display:flex;flex-direction:column;background:#fafafa;z-index:2147483001;overflow:hidden}
.tla[hidden]{display:none}
.tla[data-embedded=true]{inset:3vh 3vw;border:1px solid var(--tlh-line);border-radius:14px;box-shadow:0 24px 80px #18181b55}
.tla-bar{display:flex;align-items:center;gap:10px;padding:10px 16px;background:var(--tlh-bg);border-bottom:1px solid var(--tlh-line);flex-wrap:wrap}
.tla-bar h1{margin:0;font-size:15px;font-weight:700}
.tla-bar .grow{flex:1}
.tla-status{display:inline-flex;align-items:center;gap:6px;font-weight:600;font-size:12px}
.tla-status::before{content:"";width:8px;height:8px;border-radius:50%;background:var(--tlh-green)}
.tla-status[data-state=trace]::before{background:var(--tlh-amber)}
.tla-body{flex:1;min-height:0;overflow:auto;padding:16px;display:grid;gap:14px;grid-template-columns:minmax(0,1.15fr) minmax(0,1fr);align-content:start}
@media(max-width:900px){.tla-body{grid-template-columns:minmax(0,1fr)}}
.tla-card{background:var(--tlh-bg);border:1px solid var(--tlh-line);border-radius:12px;padding:12px 14px;min-width:0}
.tla-card.wide{grid-column:1/-1}
.tla-card h2{margin:0 0 8px;font-size:12px;letter-spacing:.06em;text-transform:uppercase;color:var(--tlh-faint);display:flex;justify-content:space-between;align-items:center;gap:8px}
.tla-subject{display:flex;gap:12px;align-items:flex-start;justify-content:space-between;flex-wrap:wrap}
.tla-subject .name{font-size:20px;font-weight:700}
.tla-subject .id{color:var(--tlh-faint)}
.tla-summary{margin:8px 0 0;padding:8px 10px;border-left:3px solid var(--tlh-teal-strong);background:var(--tlh-teal-tint);border-radius:0 6px 6px 0;color:#134e4a}
.tla-summary small{display:block;color:var(--tlh-muted);margin-top:2px}
table.tla-table{width:100%;border-collapse:collapse}
table.tla-table th{font-size:11px;font-weight:600;color:var(--tlh-faint);text-align:left;padding:4px 6px;border-bottom:1px solid var(--tlh-line)}
table.tla-table td{padding:6px;border-bottom:1px solid var(--tlh-line);vertical-align:top}
table.tla-table td.num{text-align:right;font-variant-numeric:tabular-nums;white-space:nowrap}
table.tla-table tr:last-child td{border-bottom:0}
.tla-bar-cell{display:flex;align-items:center;gap:8px}
.tla-meter{flex:1;height:8px;border-radius:4px;background:var(--tlh-raised);overflow:hidden;min-width:40px}
.tla-meter>i{display:block;height:100%;background:var(--tlh-teal-strong);border-radius:4px}
.tla-meter[data-fidelity=ESTIMATED]>i{background:repeating-linear-gradient(45deg,var(--tlh-teal-strong) 0 5px,#5eead4 5px 10px)}
.tla-link{border:0;background:transparent;padding:0;color:var(--tlh-teal);text-align:left}
.tla-link:hover{text-decoration:underline}
.tla-timeline{display:flex;align-items:flex-end;gap:1px;height:90px;padding-top:6px;border-bottom:1px solid var(--tlh-line)}
.tla-timeline button{flex:1;min-width:2px;border:0;padding:0;background:#99f6e4;border-radius:1px 1px 0 0;min-height:2px}
.tla-timeline button[data-spike=true]{background:#f59e0b}
.tla-timeline button[data-selected=true]{background:var(--tlh-teal)}
.tla-timeline button:hover{background:var(--tlh-teal-strong)}
.tla-axis{display:flex;justify-content:space-between;color:var(--tlh-faint);font-size:11px;margin-top:4px}
.tla-chain{display:flex;flex-wrap:wrap;align-items:center;gap:6px}
.tla-chip{display:inline-flex;gap:6px;align-items:center;padding:3px 9px;border:1px solid var(--tlh-line);border-radius:999px;background:var(--tlh-bg)}
.tla-chip[data-current=true]{border-color:var(--tlh-teal-strong);background:var(--tlh-teal-tint)}
.tla-chip small{color:var(--tlh-faint)}
.tla-arrow{color:var(--tlh-faint)}
.tla-muted{color:var(--tlh-muted)}
.tla-fine{color:var(--tlh-faint);font-size:11.5px;margin:8px 0 0}
.tla-tools{position:fixed;left:12px;bottom:12px;z-index:2147483002}
.tla-empty{padding:24px 8px;text-align:center;color:var(--tlh-muted)}
`;
