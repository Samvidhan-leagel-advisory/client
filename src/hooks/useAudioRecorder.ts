import { uploadAsset } from '@/api-client';
import { useCallback, useEffect, useRef, useState } from 'react';

const MAX_SECONDS = 120;

type UploadState = 'idle' | 'uploading' | 'done' | 'error';
type RecorderError =
  | 'permission_denied'
  | 'no_device'
  | 'unsupported'
  | 'start_failed'
  | null;

/**
 * Native `MediaRecorder`. Avoids `react-media-recorder` / `extendable-media-recorder`,
 * which rely on AudioWorklet for WAV encoding and silently fails on Android WebView.
 * We pick whichever container the device supports (webm/opus on Android, mp4/aac on iOS Safari).
 *
 * NOTE: We try-catch actual MediaRecorder construction instead of relying on
 * `isTypeSupported`, because Android WebView often returns false for all supported
 * types making `isTypeSupported` unreliable.
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
  // Last resort: let the browser pick the default codec
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

  const stop = useCallback(() => {
    const rec = recorderRef.current;
    if (rec && rec.state !== 'inactive') {
      try {
        rec.stop();
      } catch {
        /* ignore */
      }
    } else {
      clearTimer();
      setIsRecording(false);
      stopStream();
    }
  }, []);

  const start = useCallback(async () => {
    setRecorderError(null);
    setUploadState('idle');
    setAudioUrl(null);
    setElapsed(0);
    onUrl(null);
    chunksRef.current = [];

    if (typeof navigator === 'undefined' || !navigator.mediaDevices?.getUserMedia) {
      setRecorderError('unsupported');
      return;
    }
    if (typeof MediaRecorder === 'undefined') {
      setRecorderError('unsupported');
      return;
    }

    let stream: MediaStream;
    try {
      stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    } catch (err) {
      const name = (err as { name?: string })?.name ?? '';
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
    } catch {
      stopStream();
      setRecorderError('unsupported');
      return;
    }
    mimeRef.current = mime;

    recorderRef.current = recorder;
    recorder.ondataavailable = (e) => {
      if (e.data && e.data.size > 0) chunksRef.current.push(e.data);
    };
    recorder.onstop = () => {
      void handleStop();
    };
    recorder.onerror = () => {
      setRecorderError('start_failed');
      try {
        recorder.stop();
      } catch {
        /* ignore */
      }
    };

    try {
      // Timeslice keeps Android WebView from buffering everything until stop.
      recorder.start(1000);
    } catch {
      stopStream();
      setRecorderError('start_failed');
      return;
    }

    setIsRecording(true);
    timerRef.current = setInterval(() => {
      setElapsed((s) => {
        if (s + 1 >= MAX_SECONDS) {
          stop();
          return MAX_SECONDS;
        }
        return s + 1;
      });
    }, 1000);
  }, [handleStop, onUrl, stop]);

  const clear = useCallback(() => {
    setAudioUrl(null);
    setElapsed(0);
    setUploadState('idle');
    setRecorderError(null);
    onUrl(null);
  }, [onUrl]);

  useEffect(
    () => () => {
      clearTimer();
      stopStream();
      const rec = recorderRef.current;
      if (rec && rec.state !== 'inactive') {
        try {
          rec.stop();
        } catch {
          /* ignore */
        }
      }
    },
    []
  );

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
