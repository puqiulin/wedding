"use client";

import Image, { ImageLoaderProps } from "next/image";
import { useState, useCallback, useEffect, useRef } from "react";
import type { Photo } from "@/lib/db/schema";

const seaweedLoader = ({ src }: ImageLoaderProps) =>
  `${process.env.NEXT_PUBLIC_S3_BASE}/${src}`;

export default function AlbumClient({ photos, bgmSrc }: { photos: Photo[]; bgmSrc?: string }) {
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const [playing, setPlaying] = useState(true);
  const audioRef = useRef<HTMLAudioElement>(null);

  // Browsers block autoplay — start on first user interaction
  useEffect(() => {
    if (!bgmSrc) return;
    const tryPlay = () => {
      audioRef.current?.play().then(() => setPlaying(true)).catch(() => {});
    };
    tryPlay();
    document.addEventListener("click", tryPlay, { once: true });
    document.addEventListener("touchstart", tryPlay, { once: true });
    return () => {
      document.removeEventListener("click", tryPlay);
      document.removeEventListener("touchstart", tryPlay);
    };
  }, [bgmSrc]);

  const close = useCallback(() => setLightboxIndex(null), []);
  const prev = useCallback(
    () => setLightboxIndex((i) => (i !== null ? (i - 1 + photos.length) % photos.length : null)),
    [photos.length]
  );
  const next = useCallback(
    () => setLightboxIndex((i) => (i !== null ? (i + 1) % photos.length : null)),
    [photos.length]
  );

  useEffect(() => {
    if (lightboxIndex === null) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
      if (e.key === "ArrowLeft") prev();
      if (e.key === "ArrowRight") next();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [lightboxIndex, close, prev, next]);

  function toggleBgm() {
    const audio = audioRef.current;
    if (!audio) return;
    if (playing) {
      audio.pause();
    } else {
      audio.play();
    }
    setPlaying(!playing);
  }

  return (
    <>
      {bgmSrc && (
        <>
          <audio ref={audioRef} src={`${process.env.NEXT_PUBLIC_S3_BASE}/${bgmSrc}`} loop />
          <button
            onClick={toggleBgm}
            className="fixed bottom-6 right-6 z-40 w-10 h-10 rounded-full bg-black/50 text-white flex items-center justify-center backdrop-blur hover:bg-black/70 transition-colors"
            aria-label={playing ? "暂停音乐" : "播放音乐"}
          >
            {playing ? "\u23F8" : "\u25B6"}
          </button>
        </>
      )}
      <main>
        <div className="grid grid-cols-1">
          {photos.map((photo, i) => (
            <button
              key={photo.id}
              onClick={() => setLightboxIndex(i)}
              className="block w-full overflow-hidden hover:opacity-90 transition-opacity cursor-zoom-in"
            >
              <Image
                loader={seaweedLoader}
                src={photo.src}
                alt={photo.alt}
                width={600}
                height={600}
                className="w-full h-full object-cover block"
                sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
              />
            </button>
          ))}
        </div>
      </main>
      {lightboxIndex !== null && (
        <div
          className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center"
          onClick={close}
        >
          <button onClick={(e) => { e.stopPropagation(); prev(); }} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/70 hover:text-white text-4xl p-2">
            &#8249;
          </button>
          <div className="relative max-w-[90vw] max-h-[90vh]" onClick={(e) => e.stopPropagation()}>
            <Image
              loader={seaweedLoader}
              src={photos[lightboxIndex].src}
              alt={photos[lightboxIndex].alt}
              width={1200}
              height={1600}
              className="max-w-full max-h-[90vh] object-contain"
              priority
            />
          </div>
          <button onClick={(e) => { e.stopPropagation(); next(); }} className="absolute right-4 top-1/2 -translate-y-1/2 text-white/70 hover:text-white text-4xl p-2">
            &#8250;
          </button>
          <button onClick={close} className="absolute top-4 right-4 text-white/70 hover:text-white text-2xl p-2">
            &times;
          </button>
        </div>
      )}
    </>
  );
}
