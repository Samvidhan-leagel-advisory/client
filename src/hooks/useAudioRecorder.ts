import { uploadAsset } from '@/api-client';
import { isReactNativeWebView, postNativeWebViewMessage } from '@/lib/is-react-native-webview';
import { useCallback, useEffect, useRef, useState } from 'react';

const MAX_SECONDS = 120;

type UploadState = 'idle' | 'uploading' | 'done' | 'error';
type RecorderError =
  | 'permission_denied'
  | 'no_device'
  | 'unsupported'
  | 'start_failed'
  | null;

type NativeAudioEvent =
  | { type: 'AUDIO_RECORD_STARTED' }
  | { type: 'AUDIO_RECORD_ERROR'; error: string }
  | { type: 'AUDIO_RECORD_DATA'; base64: string; mimeType: string };

/**
 * Try-catch MediaRecorder construction instead of relying on `isTypeSupported`,
 * because Android WebView often returns false for all types even when they work.
 */
const MIME_CANDIDATES = [
  'audio/webm;codecs=opus',
  'audio/webm',
  'audio/mp4;codecs=mp4a.40.2',
  'audio/mp4',
  'audio/ogg;codecs=opus',
  'audio/ogg',
] as const;

function makeRecorder(stream: MediaStream): { recorder: MediaRecorder; mime: string | undefined } {
  for (const mime of MIME_CANDIDATES) {
    try {
      const recorder = new MediaRecorder(stream, { mimeType: mime });
      return { recorder, mime };
    } catch {
      /* not supported, try next */
    }
  }
  const recorder = new MediaRecorder(stream);
  return { recorder, mime: undefined };
}

function extensionFor(mime: string | undefined): string {
  if (!mime) return 'webm';
  if (mime.includes('mp4')) return 'm4a';
  if (mime.includes('ogg')) return 'ogg';
  if (mime.includes('wav')) return 'wav';
  return 'webm';
}

export function useAudioRecorder(onUrl: (url: string | null) => void) {
  const [uploadState, setUploadState] = useState<UploadState>('idle');
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [elapsed, setElapsed] = useState(0);
  const [isRecording, setIsRecording] = useState(false);
  const [recorderError, setRecorderError] = useState<RecorderError>(null);

  const recorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const mimeRef = useRef<string | undefined>(undefined);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Stable across renders — __samvidhanNativeApp is injected before React loads.
  const isWebView = isReactNativeWebView();

  const clearTimer = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  };

  const stopStream = () => {
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
  };

  const startTimer = useCallback((onMaxReached: () => void) => {
    timerRef.current = setInterval(() => {
      setElapsed((s) => {
        if (s + 1 >= MAX_SECONDS) {
          clearInterval(timerRef.current!);
          timerRef.current = null;
          onMaxReached();
          return MAX_SECONDS;
        }
        return s + 1;
      });
    }, 1000);
  }, []);

  // ── Web path: MediaRecorder stop handler ─────────────────────────────────

  const handleStop = useCallback(async () => {
    clearTimer();
    setIsRecording(false);
    const mime = mimeRef.current || 'audio/webm';
    const blob = new Blob(chunksRef.current, { type: mime });
    chunksRef.current = [];
    stopStream();
    if (blob.size === 0) {
      setRecorderError('start_failed');
      return;
    }
    setUploadState('uploading');
    try {
      const ext = extensionFor(mime);
      const file = new File([blob], `audio-description.${ext}`, { type: mime });
      const { data } = await uploadAsset(file);
      setAudioUrl(data.assetUrl);
      onUrl(data.assetUrl);
      setUploadState('done');
    } catch {
      setUploadState('error');
      onUrl(null);
    }
  }, [onUrl]);

  // ── Native bridge path: handle data sent back from React Native ───────────

  const handleNativeData = useCallback(async (base64: string, mimeType: string) => {
    clearTimer();
    setIsRecording(false);
    if (!base64) {
      setRecorderError('start_failed');
      return;
    }
    setUploadState('uploading');
    try {
      // data URI → Blob is the cleanest way to decode base64 in the browser
      const response = await fetch(`data:${mimeType};base64,${base64}`);
      const blob = await response.blob();
      const ext = extensionFor(mimeType);
      const file = new File([blob], `audio-description.${ext}`, { type: mimeType });
      const { data } = await uploadAsset(file);
      setAudioUrl(data.assetUrl);
      onUrl(data.assetUrl);
      setUploadState('done');
    } catch {
      setUploadState('error');
      onUrl(null);
    }
  }, [onUrl]);

  // Listen for events dispatched by App.js via injectJavaScript
  useEffect(() => {
    if (!isWebView) return;
    const handler = (e: Event) => {
      const detail = (e as CustomEvent<NativeAudioEvent>).detail;
      console.log('[AudioRecorder] native event:', detail);
      if (detail.type === 'AUDIO_RECORD_STARTED') {
        setIsRecording(true);
        setRecorderError(null);
        startTimer(() => postNativeWebViewMessage({ type: 'AUDIO_RECORD_STOP' }));
      } else if (detail.type === 'AUDIO_RECORD_ERROR') {
        console.error('[AudioRecorder] native error:', detail.error);
        clearTimer();
        setIsRecording(false);
        setRecorderError('start_failed');
      } else if (detail.type === 'AUDIO_RECORD_DATA') {
        void handleNativeData(detail.base64, detail.mimeType);
      }
    };
    window.addEventListener('samvidhan-native-audio', handler);
    return () => window.removeEventListener('samvidhan-native-audio', handler);
  }, [isWebView, startTimer, handleNativeData]);

  // ── stop ─────────────────────────────────────────────────────────────────

  const stop = useCallback(() => {
    if (isWebView) {
      clearTimer();
      postNativeWebViewMessage({ type: 'AUDIO_RECORD_STOP' });
      return;
    }
    const rec = recorderRef.current;
    if (rec && rec.state !== 'inactive') {
      try { rec.stop(); } catch { /* ignore */ }
    } else {
      clearTimer();
      setIsRecording(false);
      stopStream();
    }
  }, [isWebView]);

  // ── start ─────────────────────────────────────────────────────────────────

  const start = useCallback(async () => {
    setRecorderError(null);
    setUploadState('idle');
    setAudioUrl(null);
    setElapsed(0);
    onUrl(null);
    chunksRef.current = [];

    // WebView: delegate entirely to React Native native recording
    if (isWebView) {
      console.log('[AudioRecorder] WebView mode — delegating to native bridge');
      postNativeWebViewMessage({ type: 'AUDIO_RECORD_START' });
      return;
    }

    // Web browser: use getUserMedia + MediaRecorder
    console.log('[AudioRecorder] start() — web mode');
    console.log('[AudioRecorder] mediaDevices:', navigator?.mediaDevices);
    console.log('[AudioRecorder] isSecureContext:', window.isSecureContext);

    if (typeof navigator === 'undefined' || !navigator.mediaDevices?.getUserMedia) {
      console.error('[AudioRecorder] getUserMedia not available');
      setRecorderError('unsupported');
      return;
    }
    if (typeof MediaRecorder === 'undefined') {
      console.error('[AudioRecorder] MediaRecorder not available');
      setRecorderError('unsupported');
      return;
    }

    let stream: MediaStream;
    try {
      console.log('[AudioRecorder] calling getUserMedia...');
      stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      console.log('[AudioRecorder] getUserMedia OK — tracks:', stream.getTracks().map(t => `${t.kind}:${t.readyState}`));
    } catch (err) {
      const name = (err as { name?: string })?.name ?? '';
      const message = (err as { message?: string })?.message ?? '';
      console.error('[AudioRecorder] getUserMedia FAILED name:', name, 'message:', message);
      if (name === 'NotAllowedError' || name === 'SecurityError' || name === 'PermissionDeniedError') {
        setRecorderError('permission_denied');
      } else if (name === 'NotFoundError' || name === 'OverconstrainedError') {
        setRecorderError('no_device');
      } else {
        setRecorderError('start_failed');
      }
      return;
    }

    streamRef.current = stream;

    let recorder: MediaRecorder;
    let mime: string | undefined;
    try {
      ({ recorder, mime } = makeRecorder(stream));
      console.log('[AudioRecorder] MediaRecorder mime:', mime ?? '(default)');
    } catch (err) {
      console.error('[AudioRecorder] makeRecorder failed:', err);
      stopStream();
      setRecorderError('unsupported');
      return;
    }
    mimeRef.current = mime;

    recorderRef.current = recorder;
    recorder.ondataavailable = (e) => {
      if (e.data && e.data.size > 0) chunksRef.current.push(e.data);
    };
    recorder.onstop = () => { void handleStop(); };
    recorder.onerror = (e) => {
      console.error('[AudioRecorder] recorder.onerror:', e);
      setRecorderError('start_failed');
      try { recorder.stop(); } catch { /* ignore */ }
    };

    try {
      recorder.start(1000);
      console.log('[AudioRecorder] recorder.start OK — state:', recorder.state);
    } catch (err) {
      console.error('[AudioRecorder] recorder.start failed:', err);
      stopStream();
      setRecorderError('start_failed');
      return;
    }

    setIsRecording(true);
    startTimer(() => stop());
  }, [isWebView, handleStop, onUrl, stop, startTimer]);

  // ── clear ─────────────────────────────────────────────────────────────────

  const clear = useCallback(() => {
    setAudioUrl(null);
    setElapsed(0);
    setUploadState('idle');
    setRecorderError(null);
    onUrl(null);
  }, [onUrl]);

  // ── cleanup on unmount ────────────────────────────────────────────────────

  useEffect(() => () => {
    clearTimer();
    if (isWebView) {
      postNativeWebViewMessage({ type: 'AUDIO_RECORD_STOP' });
      return;
    }
    stopStream();
    const rec = recorderRef.current;
    if (rec && rec.state !== 'inactive') {
      try { rec.stop(); } catch { /* ignore */ }
    }
  }, []);  // eslint-disable-line react-hooks/exhaustive-deps

  return {
    isRecording,
    uploadState,
    elapsed,
    remaining: Math.max(0, MAX_SECONDS - elapsed),
    audioUrl,
    permissionDenied: recorderError === 'permission_denied',
    recorderError,
    start,
    stop,
    clear,
  };
}
