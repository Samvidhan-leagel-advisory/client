// Must be imported BEFORE any module that depends on Node's Buffer
// (e.g. @react-pdf/renderer). ESM hoists imports, so polyfilling inside the
// same file as the consumer runs too late — react-pdf evaluates first and
// captures `globalThis.Buffer` as undefined, then later blows up with
// "cannot read property 'base64' of undefined" inside its image pipeline
// (notably in Android WebView, where Vite's globals aren't pre-injected).
import { Buffer } from 'buffer';

const g = globalThis as unknown as { Buffer?: unknown; process?: unknown };
if (typeof g.Buffer === 'undefined') {
  g.Buffer = Buffer;
}
if (typeof g.process === 'undefined') {
  g.process = { env: {} };
}
