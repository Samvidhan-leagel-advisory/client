import { uploadAsset } from '@/api-client';
import { useCallback, useEffect, useRef, useState } from 'react';
import { useReactMediaRecorder } from 'react-media-recorder';

const MAX_SECONDS = 120;

type UploadState = 'idle' | 'uploading' | 'done' | 'error';

export function useAudioRecorder(onUrl: (url: string | null) => void) {
  const [uploadState, setUploadState] = useState<UploadState>('idle');
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [elapsed, setElapsed] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const stopRef = useRef<() => void>(() => {});

  const clearTimer = () => {
    if (timerRef.current) clearInterval(timerRef.current);
  };

  const handleStop = useCallback(
    async (_url: string, blob: Blob) => {
      clearTimer();
      setUploadState('uploading');
      try {
        const file = new File([blob], 'audio-description.wav', { type: 'audio/wav' });
        const { data } = await uploadAsset(file);
        setAudioUrl(data.assetUrl);
        onUrl(data.assetUrl);
        setUploadState('done');
      } catch {
        setUploadState('error');
        onUrl(null);
      }
    },
    [onUrl]
  );

  const { status, startRecording, stopRecording } = useReactMediaRecorder({
    audio: true,
    blobPropertyBag: { type: 'audio/wav' },
    onStop: handleStop,
  });

  stopRef.current = stopRecording;

  const start = useCallback(() => {
    setElapsed(0);
    setUploadState('idle');
    setAudioUrl(null);
    onUrl(null);
    startRecording();

    timerRef.current = setInterval(() => {
      setElapsed((s) => {
        if (s + 1 >= MAX_SECONDS) {
          stopRef.current();
          clearTimer();
          return MAX_SECONDS;
        }
        return s + 1;
      });
    }, 1000);
  }, [startRecording, onUrl]);

  const stop = useCallback(() => {
    stopRecording();
    clearTimer();
  }, [stopRecording]);

  const clear = useCallback(() => {
    setAudioUrl(null);
    setElapsed(0);
    setUploadState('idle');
    onUrl(null);
  }, [onUrl]);

  useEffect(() => () => clearTimer(), []);

  return {
    isRecording: status === 'recording',
    uploadState,
    elapsed,
    remaining: Math.max(0, MAX_SECONDS - elapsed),
    audioUrl,
    start,
    stop,
    clear,
  };
}
