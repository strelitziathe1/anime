import { useEffect, useRef, useState } from 'react';
import Hls from 'hls.js';
import { useTheme } from '../contexts/ThemeContext';
import Navbar from '../components/Navbar';
import Alert from '../components/Alert';
import LoadingSpinner from '../components/LoadingSpinner';

export default function Player() {
  const { currentTheme } = useTheme();
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [signedUrl, setSignedUrl] = useState<string | null>(null);
  const [episodeId, setEpisodeId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const id = params.get('episodeId');
    setEpisodeId(id);

    if (!id) {
      setError('No episode ID provided');
      setLoading(false);
      return;
    }

    fetch(`/api/videos/${id}/signed-url`)
      .then((r) => r.json())
      .then((j) => {
        setSignedUrl(j.url);
        setLoading(false);
      })
      .catch((err) => {
        setError('Failed to load video');
        setLoading(false);
      });
  }, []);

  useEffect(() => {
    const video = videoRef.current;
    if (!video || !signedUrl) return;

    if (Hls.isSupported()) {
      const hls = new Hls();
      hls.loadSource(signedUrl);
      hls.attachMedia(video);
    } else {
      video.src = signedUrl;
    }

    let timer: any;
    const sendPos = async () => {
      const pos = Math.floor(video.currentTime);
      await fetch('/api/watch/position', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          episodeId: new URLSearchParams(window.location.search).get('episodeId'),
          lastPositionSec: pos,
        }),
        credentials: 'include',
      }).catch(() => {});
    };

    const onTime = () => {
      clearTimeout(timer);
      timer = setTimeout(sendPos, 10000);
    };

    video.addEventListener('timeupdate', onTime);
    return () => {
      video.removeEventListener('timeupdate', onTime);
      clearTimeout(timer);
    };
  }, [signedUrl]);

  return (
    <div style={{ backgroundColor: currentTheme.colors.background, minHeight: '100vh' }}>
      <Navbar />
      <div className="max-w-7xl mx-auto p-4">
        {error && <Alert type="error" message={error} onClose={() => setError(null)} />}

        {loading ? (
          <LoadingSpinner />
        ) : signedUrl ? (
          <div className="space-y-4">
            <div className="rounded-lg overflow-hidden shadow-lg">
              <video
                ref={videoRef}
                controls
                width="100%"
                className="w-full"
                style={{ backgroundColor: '#000' }}
              />
            </div>

            <div
              className="rounded-lg p-4"
              style={{ backgroundColor: currentTheme.colors.sidebar }}
            >
              <h2
                className="text-lg font-semibold"
                style={{ color: currentTheme.colors.primary }}
              >
                Episode {episodeId}
              </h2>
              <p style={{ color: currentTheme.colors.text }} className="mt-2">
                Video player with HLS streaming support. Your position is saved automatically.
              </p>
            </div>
          </div>
        ) : (
          <Alert type="error" message="Unable to load video" />
        )}
      </div>
    </div>
  );
}