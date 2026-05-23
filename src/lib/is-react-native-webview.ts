type NativeWebWindow = Window & {
  ReactNativeWebView?: { postMessage(msg: string): void };
  /** Set in `app/App.js` `injectedJavaScriptBeforeContentLoaded` before the SPA runs. */
  __samvidhanNativeApp?: boolean;
};

/**
 * True when the legal app is running inside the Samvidhan native WebView shell.
 *
 * Prefer `__samvidhanNativeApp`: it is injected before document load, while
 * `ReactNativeWebView` can lag a frame — if we miss it, the web app falls back to
 * Google’s iframe sign-in inside WebView, which Google blocks (“request is invalid”).
 */
export function isReactNativeWebView(): boolean {
  if (typeof window === 'undefined') return false;
  const w = window as NativeWebWindow;
  if (w.__samvidhanNativeApp === true) return true;
  const bridge = w.ReactNativeWebView;
  return typeof bridge === 'object' && bridge !== null && typeof bridge.postMessage === 'function';
}

/** JSON message to the Expo shell (`App.js` `onMessage`). Safe no-op outside the native WebView. */
export function postNativeWebViewMessage(payload: Record<string, unknown>): void {
  if (typeof window === 'undefined') return;
  const w = window as NativeWebWindow;
  try {
    w.ReactNativeWebView?.postMessage(JSON.stringify(payload));
  } catch {
    /* ignore */
  }
}
