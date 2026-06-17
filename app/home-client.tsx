"use client";

import { useEffect, useRef, useState } from "react";
import Image, { ImageLoaderProps } from "next/image";
import { Heart } from "lucide-react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { Button } from "@/components/ui/button";
import { storagePublicUrl } from "@/lib/storage";
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from "@/components/ui/dialog";
import type { GalleryPhoto } from "@/lib/invitation-data";
import { weddingEvents, type WeddingEvent } from "@/lib/venues";
import { VenueInfo } from "./venue-info";

const r2Loader = ({ src }: ImageLoaderProps) => storagePublicUrl(src);

export default function HomeClient({
  photos,
  bgmSrc,
  venueEvents = weddingEvents,
}: {
  photos: GalleryPhoto[];
  bgmSrc?: string;
  venueEvents?: readonly WeddingEvent[];
}) {
  const [opened, setOpened] = useState(false);
  const [coverHidden, setCoverHidden] = useState(false);
  const reduceMotion = useReducedMotion();

  function openInvitation() {
    if (opened) return;
    setOpened(true);
  }

  return (
    <main className="relative min-h-screen overflow-x-hidden bg-[#fff8f4] text-[#3b1410]">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,#ffe5dc_0,transparent_38%),linear-gradient(135deg,#fffaf7_0%,#fceae2_52%,#fff7f0_100%)]" />
      <motion.section
        aria-hidden={!coverHidden}
        className="relative flex min-h-screen flex-col items-center justify-center gap-6 px-6 py-16 text-center"
        initial={false}
        animate={{
          opacity: opened ? 1 : 0,
          scale: opened ? 1 : 0.98,
          filter: opened ? "blur(0px)" : "blur(6px)",
        }}
        transition={{ duration: reduceMotion ? 0 : 0.5, ease: "easeOut", delay: opened ? 0.18 : 0 }}
      >
        <div className="relative">
          <div className="absolute -inset-3 rounded-full bg-[#a90f1a]/10 blur-2xl" />
          <Image
            alt="婚礼邀请函照片"
            className="relative size-52 rounded-full border-4 border-white object-cover shadow-[0_22px_70px_rgba(138,27,21,0.22)] sm:size-64"
            src="/sprite.jpg"
            width={256}
            height={256}
            priority
          />
        </div>

        <div className="space-y-3">
          <p className="text-sm font-medium tracking-[0.24em] text-[#a80f1a]">WEDDING INVITATION</p>
          <h1 className="text-4xl font-semibold leading-tight sm:text-5xl">我们结婚啦</h1>
          <p className="text-base text-[#6b3a32] sm:text-lg">何星朋 &amp; 王培琳</p>
        </div>

        <p className="max-w-xs text-sm leading-6 text-[#8a554d]">请下滑查看相册与婚礼地点</p>
      </motion.section>

      {opened && (
        <>
          <AlbumGallery photos={photos} bgmSrc={bgmSrc} />
          <VenueInfo events={venueEvents} />
        </>
      )}

      {!coverHidden && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center overflow-hidden bg-[#65060c]"
          initial={false}
          animate={{
            opacity: opened ? 0 : 1,
          }}
          transition={{
            duration: reduceMotion ? 0.01 : 0.28,
            delay: opened && !reduceMotion ? 0.42 : 0,
            ease: "easeOut",
          }}
          onAnimationComplete={() => {
            if (opened) setCoverHidden(true);
          }}
        >
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_8%,rgba(255,223,174,0.28),transparent_34%),radial-gradient(circle_at_50%_100%,rgba(255,154,129,0.18),transparent_36%)]" />
          <motion.div className="relative h-full w-full overflow-hidden text-left [perspective:1400px]">
            <span className="absolute inset-0 bg-[#8f0d15]" />
            <span className="absolute inset-4 border border-[#ffd8a2]/28 sm:inset-6" />

            <motion.span
              className="absolute inset-y-0 left-0 block w-1/2 bg-[linear-gradient(110deg,#c51a27_0%,#8f0d15_64%,#65060c_100%)] shadow-[inset_-32px_0_52px_rgba(57,0,0,0.24)]"
              style={{ transformOrigin: "left center", transformStyle: "preserve-3d" }}
              animate={opened && !reduceMotion ? { rotateY: -84, x: -26, opacity: 0.78 } : { rotateY: 0, x: 0, opacity: 1 }}
              transition={{ duration: 0.56, ease: [0.22, 1, 0.36, 1] }}
            />
            <motion.span
              className="absolute inset-y-0 right-0 block w-1/2 bg-[linear-gradient(250deg,#d92130_0%,#98101a_62%,#69070d_100%)] shadow-[inset_32px_0_52px_rgba(57,0,0,0.24)]"
              style={{ transformOrigin: "right center", transformStyle: "preserve-3d" }}
              animate={opened && !reduceMotion ? { rotateY: 84, x: 26, opacity: 0.78 } : { rotateY: 0, x: 0, opacity: 1 }}
              transition={{ duration: 0.56, ease: [0.22, 1, 0.36, 1] }}
            />
            <motion.span
              className="absolute inset-x-0 top-0 block h-[58%] bg-[linear-gradient(180deg,#e3343f_0%,#b81522_58%,#8e0d16_100%)] [clip-path:polygon(0_0,100%_0,50%_82%)]"
              style={{ transformOrigin: "top center", transformStyle: "preserve-3d" }}
              animate={opened && !reduceMotion ? { rotateX: -116, y: -36, opacity: 0.86 } : { rotateX: 0, y: 0, opacity: 1 }}
              transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            />
            <motion.span
              className="absolute inset-x-0 bottom-0 block h-[54%] bg-[linear-gradient(0deg,#7c0911_0%,#ad1520_100%)] [clip-path:polygon(0_100%,100%_100%,50%_12%)]"
              animate={opened && !reduceMotion ? { y: 24, opacity: 0.5 } : { y: 0, opacity: 1 }}
              transition={{ duration: 0.44, ease: "easeOut" }}
            />

            <motion.button
              type="button"
              aria-label="打开婚礼邀请函"
              disabled={opened}
              onClick={openInvitation}
              className="absolute left-1/2 top-[52%] z-10 flex size-24 -translate-x-1/2 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full border border-[#ffe0a5]/70 bg-[#f8c76c] text-5xl font-semibold text-[#850910] shadow-[0_18px_38px_rgba(71,0,0,0.28)] outline-none transition-transform hover:scale-105 focus-visible:ring-4 focus-visible:ring-[#ffd8a2]/55 disabled:cursor-default sm:size-28 sm:text-6xl"
              animate={opened && !reduceMotion ? { scale: 0.78, rotate: -8, opacity: 0 } : { scale: 1, rotate: 0, opacity: 1 }}
              transition={{ duration: 0.45, ease: "easeOut" }}
              whileTap={opened || reduceMotion ? undefined : { scale: 0.94 }}
            >
              囍
            </motion.button>

            <motion.span
              className="pointer-events-none absolute inset-0 text-center text-[#ffefd0]"
              animate={opened && !reduceMotion ? { opacity: 0, y: -18 } : { opacity: 1, y: 0 }}
              transition={{ duration: 0.42, ease: "easeOut" }}
            >
              <span className="absolute left-1/2 top-12 flex -translate-x-1/2 items-center gap-2 text-xs font-medium tracking-[0.34em] text-[#ffd99a]">
                <Heart className="size-4 fill-current" />
                INVITATION
              </span>
              <span className="absolute left-1/2 top-[38%] w-full -translate-x-1/2 -translate-y-1/2 space-y-4 px-8">
                <span className="block text-4xl font-semibold leading-none sm:text-5xl">诚挚邀请</span>
              </span>
              <span className="absolute left-1/2 top-[63%] w-full -translate-x-1/2 -translate-y-1/2 px-8 text-base text-[#ffe7bf]/90">
                何星朋 &amp; 王培琳
              </span>
            </motion.span>
          </motion.div>
        </motion.div>
      )}
    </main>
  );
}

function AlbumGallery({ photos, bgmSrc }: { photos: GalleryPhoto[]; bgmSrc?: string }) {
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

  const prev = () =>
    setLightboxIndex((index) => (index !== null ? (index - 1 + photos.length) % photos.length : null));
  const next = () =>
    setLightboxIndex((index) => (index !== null ? (index + 1) % photos.length : null));

  useEffect(() => {
    if (lightboxIndex === null) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "ArrowLeft") prev();
      if (event.key === "ArrowRight") next();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  });

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
    <section className="relative bg-white">
      {bgmSrc && (
        <>
          <audio ref={audioRef} src={storagePublicUrl(bgmSrc)} loop />
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

      <div className="grid grid-cols-1">
        {photos.map((photo, index) => (
          <motion.button
            key={photo.id}
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.6, delay: index < 3 ? index * 0.15 : 0, ease: "easeOut" }}
            onClick={() => setLightboxIndex(index)}
            className="block w-full cursor-zoom-in overflow-hidden transition-opacity hover:opacity-90"
          >
            <Image
                  loader={r2Loader}
              src={photo.src}
              alt={photo.alt}
              width={600}
              height={600}
              className="block h-full w-full object-cover"
              sizes="100vw"
            />
          </motion.button>
        ))}
      </div>

      {!photos.length && (
        <div className="px-6 py-20 text-center text-sm text-[#8a554d]">暂无相册照片</div>
      )}

      <Dialog open={lightboxIndex !== null} onOpenChange={(open) => { if (!open) setLightboxIndex(null); }}>
        <DialogContent className="max-h-[95vh] max-w-[95vw] border-none bg-black/95 p-0 flex items-center justify-center [&>button]:text-white [&>button]:hover:text-white/80">
          <DialogTitle className="sr-only">照片预览</DialogTitle>
          {lightboxIndex !== null && (
            <>
              <Button
                variant="ghost"
                size="icon"
                onClick={prev}
                className="absolute left-2 top-1/2 z-10 -translate-y-1/2 text-3xl text-white/70 hover:bg-white/10 hover:text-white"
              >
                &#8249;
              </Button>
              <div className="relative max-h-[90vh] max-w-[90vw]">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={lightboxIndex}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: 0.25, ease: "easeOut" }}
                  >
                    <Image
                      loader={r2Loader}
                      src={photos[lightboxIndex].src}
                      alt={photos[lightboxIndex].alt}
                      width={1200}
                      height={1600}
                      className="max-h-[90vh] max-w-full object-contain"
                      priority
                    />
                  </motion.div>
                </AnimatePresence>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={next}
                className="absolute right-2 top-1/2 z-10 -translate-y-1/2 text-3xl text-white/70 hover:bg-white/10 hover:text-white"
              >
                &#8250;
              </Button>
            </>
          )}
        </DialogContent>
      </Dialog>
    </section>
  );
}
