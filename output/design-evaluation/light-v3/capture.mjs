// Captures every tool at the benchmark size (1774x887; override with W/H env) from the running example
// (http://localhost:3000) with live frames, using headless Chrome over the DevTools
// protocol. Usage: node capture.mjs   (needs `pnpm dev` / the example on :3000)
import { spawn } from 'node:child_process';
import { mkdtempSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const out = dirname(fileURLToPath(import.meta.url));
const W = Number(process.env.W ?? 1774), H = Number(process.env.H ?? 887);
const tag = process.env.W ? `-${W}x${H}` : '';
const chrome = process.env.CHROME ?? 'C:/Program Files/Google/Chrome/Application/chrome.exe';
const port = 9333;
const proc = spawn(chrome, [
  '--headless=new', `--remote-debugging-port=${port}`, '--hide-scrollbars=false',
  `--window-size=${W},${H}`, '--force-device-scale-factor=1', '--no-first-run',
  `--user-data-dir=${mkdtempSync(join(tmpdir(), '3lens-cdp-'))}`, 'about:blank',
], { stdio: 'ignore' });
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
async function target() {
  for (let i = 0; i < 50; i++) {
    try {
      const list = await (await fetch(`http://127.0.0.1:${port}/json/list`)).json();
      const page = list.find((t) => t.type === 'page');
      if (page) return page.webSocketDebuggerUrl;
    } catch {}
    await sleep(200);
  }
  throw new Error('Chrome did not expose a DevTools target');
}
const ws = new WebSocket(await target());
await new Promise((r) => (ws.onopen = r));
let id = 0; const pending = new Map(); const errors = [];
ws.onmessage = (m) => {
  const msg = JSON.parse(m.data);
  if (msg.id && pending.has(msg.id)) { pending.get(msg.id)(msg); pending.delete(msg.id); }
  if (msg.method === 'Runtime.exceptionThrown') errors.push(msg.params.exceptionDetails.text + ' ' + (msg.params.exceptionDetails.exception?.description ?? ''));
};
const send = (method, params = {}) => new Promise((res) => { const i = ++id; pending.set(i, res); ws.send(JSON.stringify({ id: i, method, params })); });
const evaluate = async (expression) => (await send('Runtime.evaluate', { expression, awaitPromise: true, returnByValue: true })).result.result.value;
async function shot(name) {
  const { result } = await send('Page.captureScreenshot', { format: 'png' });
  writeFileSync(join(out, name), Buffer.from(result.data, 'base64'));
}
await send('Page.enable'); await send('Runtime.enable');
await send('Emulation.setDeviceMetricsOverride', { width: W, height: H, deviceScaleFactor: 1, mobile: false });
const url = process.env.URL ?? 'http://localhost:3000/';
const results = [];
for (const tool of ['inspect', 'performance', 'memory', 'changes', 'shaders', 'surfaces']) {
  await send('Page.navigate', { url });
  await sleep(3500);
  await evaluate(`document.querySelector('.tlp-nav [data-tool=${tool}]').click()`);
  await sleep(900);
  const check = await evaluate(`(() => {
    const w = document.querySelector('.tlp-workspace'); const s = getComputedStyle(w);
    const nav = document.querySelector('.tlp-nav').getBoundingClientRect();
    const top = document.querySelector('.tlp-topbar').getBoundingClientRect();
    return { scheme: s.colorScheme, bg: s.backgroundColor, tool: w.dataset.tool, navH: nav.height, topH: top.height,
      overflowX: document.documentElement.scrollWidth > innerWidth, frames: document.querySelectorAll('.tlp-frame-bar').length };
  })()`);
  await shot(`${tool}${tag}.png`);
  results.push(check);
}
await send('Page.navigate', { url }); await sleep(3000);
await evaluate(`document.dispatchEvent(new KeyboardEvent('keydown',{key:'k',ctrlKey:true,bubbles:true}))`); await sleep(500);
await shot(`command-menu${tag}.png`);
writeFileSync(join(out, `results${tag}.json`), JSON.stringify({ results, errors }, null, 2));
console.log(JSON.stringify({ results, errors }, null, 2));
ws.close(); proc.kill();
