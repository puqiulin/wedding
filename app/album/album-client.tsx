"use client";

import Image, { ImageLoaderProps } from "next/image";
import { useState, useCallback, useEffect, useRef } from "react";
import type { Photo } from "@/lib/db/schema";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from "@/components/ui/dialog";

const seaweedLoader = ({ src }: ImageLoaderProps) =>
  `${process.env.NEXT_PUBLIC_S3_BASE}/${src}`;

export default function AlbumClient({ photos, bgmSrc }: { photos: Photo[]; bgmSrc?: string }) {
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const [playing, setPlaying] = useState(true);
  const audioRef = useRef<HTMLAudioElement>(null);

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
      if (e.key === "ArrowLeft") prev();
      if (e.key === "ArrowRight") next();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [lightboxIndex, prev, next]);

  function toggleBgm() {
    const audio = audioRef.current;
    if (!audio) return;
    if (playing) { audio.pause(); } else { audio.play(); }
    setPlaying(!playing);
  }

  return (
    <>
      {bgmSrc && (
        <>
          <audio ref={audioRef} src={`${process.env.NEXT_PUBLIC_S3_BASE}/${bgmSrc}`} loop />
          <Button
            onClick={toggleBgm}
            size="icon"
            variant="secondary"
            className="fixed bottom-6 right-6 z-40 rounded-full bg-black/50 text-white backdrop-blur hover:bg-black/70"
            aria-label={playing ? "暂停音乐" : "播放音乐"}
          >
            {playing ? "\u23F8" : "\u25B6"}
          </Button>
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

      <Dialog open={lightboxIndex !== null} onOpenChange={(open) => { if (!open) setLightboxIndex(null); }}>
        <DialogContent className="max-w-[95vw] max-h-[95vh] p-0 border-none bg-black/95 flex items-center justify-center [&>button]:text-white [&>button]:hover:text-white/80">
          <DialogTitle className="sr-only">照片预览</DialogTitle>
          {lightboxIndex !== null && (
            <>
              <Button
                variant="ghost"
                size="icon"
                onClick={prev}
                className="absolute left-2 top-1/2 -translate-y-1/2 text-white/70 hover:text-white hover:bg-white/10 text-3xl z-10"
              >
                &#8249;
              </Button>
              <div className="relative max-w-[90vw] max-h-[90vh]">
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
              <Button
                variant="ghost"
                size="icon"
                onClick={next}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-white/70 hover:text-white hover:bg-white/10 text-3xl z-10"
              >
                &#8250;
              </Button>
            </>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
