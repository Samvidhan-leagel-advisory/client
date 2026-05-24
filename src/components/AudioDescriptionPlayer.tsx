import { Mic } from 'lucide-react';
import AudioPlayer from 'react-h5-audio-player';
import 'react-h5-audio-player/lib/styles.css';

type Props = {
  src: string;
};

export function AudioDescriptionPlayer({ src }: Props) {
  return (
    <div className="rounded-lg border border-gold/20 bg-gold-light/30 overflow-hidden">
      <div className="flex items-center gap-2 px-4 pt-3 pb-1">
        <span className="flex h-6 w-6 items-center justify-center rounded-full bg-gold/15">
          <Mic className="h-3.5 w-3.5 text-gold" />
        </span>
        <span className="text-xs font-semibold uppercase tracking-wide text-gold">
          Audio Description
        </span>
      </div>

      <AudioPlayer
        src={src}
        showJumpControls={false}
        showDownloadProgress={false}
        customAdditionalControls={[]}
        customVolumeControls={[]}
        layout="horizontal"
        className="audio-desc-player"
      />

      <style>{`
        .audio-desc-player.rhap_container {
          background: transparent;
          box-shadow: none;
          padding: 6px 12px 10px;
        }
        .audio-desc-player .rhap_main {
          gap: 8px;
        }
        .audio-desc-player .rhap_controls-section {
          flex: 0;
        }
        .audio-desc-player .rhap_main-controls-button svg {
          color: hsl(var(--gold));
          fill: hsl(var(--gold));
          width: 28px;
          height:28px;
        }
        .audio-desc-player .rhap_progress-section {
          flex: 1;
          gap: 8px;
          align-items: center;
        }
        .audio-desc-player .rhap_progress-container {
          margin: 0;
        }
        .audio-desc-player .rhap_progress-bar {
          background: hsl(var(--border));
          height: 4px;
          border-radius: 9999px;
        }
        .audio-desc-player .rhap_progress-filled,
        .audio-desc-player .rhap_progress-indicator {
          background: hsl(var(--gold));
        }
        .audio-desc-player .rhap_progress-indicator {
          width: 12px;
          height: 12px;
          top: -4px;
          box-shadow: none;
        }
        .audio-desc-player .rhap_time {
          font-size: 11px;
          color: hsl(var(--muted-foreground));
          min-width: 34px;
        }
        .audio-desc-player .rhap_stacked-reverse .rhap_controls-section {
          margin-bottom: 0;
        }
      `}</style>
    </div>
  );
}
