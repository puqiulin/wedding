"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import Image from "next/image";
import { Heart, Languages } from "lucide-react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from "@/components/ui/dialog";
import type { GalleryPhoto } from "@/lib/invitation-data";
import {
  defaultLocale,
  isLocale,
  localeStorageKey,
  translations,
  type Locale,
} from "@/lib/i18n";
import { weddingEvents, type WeddingEvent } from "@/lib/venues";
import { VenueInfo } from "./venue-info";

const galleryStoryModes = ["intro", "side", "overlay", "side", "overlay"] as const;

function subscribeToLocale(onStoreChange: () => void) {
  window.addEventListener("storage", onStoreChange);
  window.addEventListener("wedding-locale-change", onStoreChange);
  return () => {
    window.removeEventListener("storage", onStoreChange);
    window.removeEventListener("wedding-locale-change", onStoreChange);
  };
}

function getLocaleSnapshot(): Locale {
  const savedLocale = window.localStorage.getItem(localeStorageKey);
  return isLocale(savedLocale) ? savedLocale : defaultLocale;
}

function setStoredLocale(locale: Locale) {
  window.localStorage.setItem(localeStorageKey, locale);
  document.cookie = `${localeStorageKey}=${locale}; Path=/; Max-Age=31536000; SameSite=Lax`;
  window.dispatchEvent(new Event("wedding-locale-change"));
}

export default function HomeClient({
  photos,
  bgmSrc,
  coverSrc = "/sprite.jpg",
  venueEvents = weddingEvents,
  initialLocale = defaultLocale,
}: {
  photos: GalleryPhoto[];
  bgmSrc?: string;
  coverSrc?: string;
  venueEvents?: readonly WeddingEvent[];
  initialLocale?: Locale;
}) {
  const [opened, setOpened] = useState(false);
  const [coverHidden, setCoverHidden] = useState(false);
  const locale = useSyncExternalStore(subscribeToLocale, getLocaleSnapshot, () => initialLocale);
  const reduceMotion = useReducedMotion();
  const copy = translations[locale];
  const pageTitle = venueEvents.length === 1
    ? copy.routeTitles[venueEvents[0].slug]
    : copy.siteTitle;

  useEffect(() => {
    document.documentElement.lang = locale === "zh" ? "zh-CN" : "en";
    document.title = pageTitle;
  }, [locale, pageTitle]);

  function openInvitation() {
    if (opened) return;
    setOpened(true);
  }

  return (
    <main className="relative min-h-screen overflow-x-hidden bg-[#fff8f4] text-[#3b1410]">
      <LanguageSwitcher locale={locale} onLocaleChange={setStoredLocale} />
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
            alt={copy.hero.photoAlt}
            className="relative size-52 rounded-full border-4 border-white object-cover shadow-[0_22px_70px_rgba(138,27,21,0.22)] sm:size-64"
            src={coverSrc}
            width={256}
            height={256}
            priority
          />
        </div>

        <div className="space-y-3">
          <p className="text-sm font-medium tracking-[0.24em] text-[#a80f1a]">WEDDING INVITATION</p>
          <h1 className="text-4xl font-semibold leading-tight sm:text-5xl">{copy.hero.heading}</h1>
          <p className="text-base text-[#6b3a32] sm:text-lg">何星朋 &amp; 王培琳</p>
        </div>

        <p className="max-w-xs text-sm leading-6 text-[#8a554d]">{copy.hero.scrollHint}</p>
      </motion.section>

      {opened && (
        <>
          <AlbumGallery photos={photos} bgmSrc={bgmSrc} locale={locale} />
          <VenueInfo events={venueEvents} locale={locale} />
          <SiteFooter />
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
              aria-label={copy.hero.openInvitation}
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
                <span className="block text-4xl font-semibold leading-none sm:text-5xl">{copy.hero.invitationTitle}</span>
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

function LanguageSwitcher({
  locale,
  onLocaleChange,
}: {
  locale: Locale;
  onLocaleChange: (locale: Locale) => void;
}) {
  return (
    <div
      className="fixed right-4 top-4 z-[70] flex h-9 items-center gap-1 rounded-full bg-white/88 p-1 text-xs font-semibold text-[#6b3a32] shadow-[0_8px_24px_rgba(59,20,16,0.16)] backdrop-blur-md sm:right-6 sm:top-6"
      role="group"
      aria-label="切换语言 / Switch language"
    >
      <Languages className="ml-1 size-4 text-[#9f101a]" aria-hidden="true" />
      {(["zh", "en"] as const).map((option) => (
        <button
          key={option}
          type="button"
          onClick={() => onLocaleChange(option)}
          aria-pressed={locale === option}
          className={[
            "flex h-7 min-w-8 items-center justify-center rounded-full px-2 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#c31b28]/35",
            locale === option ? "bg-[#9f101a] text-white" : "hover:bg-[#f7e5df]",
          ].join(" ")}
        >
          {option === "zh" ? "中" : "EN"}
        </button>
      ))}
    </div>
  );
}

function SiteFooter() {
  return (
    <footer className="relative border-t border-[#d7837d]/15 bg-[#fff8f4] px-6 py-6 text-center text-xs text-[#8a554d]">
      <div className="flex flex-col items-center justify-center gap-2 sm:flex-row sm:gap-4">
        <a
          href="https://beian.miit.gov.cn/"
          target="_blank"
          rel="noreferrer"
          className="transition-colors hover:text-[#9f101a]"
        >
          蜀ICP备2026033844号-1
        </a>
        <a
          href="https://beian.mps.gov.cn/#/query/webSearch?code=51012402001727"
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center justify-center gap-1.5 transition-colors hover:text-[#9f101a]"
        >
          <Image
            src="/beian-police.png"
            alt=""
            width={16}
            height={17}
            className="h-[17px] w-4 shrink-0 object-contain"
            aria-hidden="true"
          />
          川公网安备51012402001727号
        </a>
      </div>
    </footer>
  );
}

function AlbumGallery({ photos, bgmSrc, locale }: { photos: GalleryPhoto[]; bgmSrc?: string; locale: Locale }) {
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const [playing, setPlaying] = useState(true);
  const audioRef = useRef<HTMLAudioElement>(null);
  const copy = translations[locale];

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
          <audio ref={audioRef} src={bgmSrc} loop />
          <Button
            onClick={toggleBgm}
            size="icon"
            variant="secondary"
            className="fixed bottom-6 right-6 z-40 rounded-full bg-black/50 text-white backdrop-blur hover:bg-black/70"
            aria-label={playing ? copy.album.pauseMusic : copy.album.playMusic}
          >
            {playing ? "\u23F8" : "\u25B6"}
          </Button>
        </>
      )}

      <div className="mx-auto grid w-full max-w-5xl gap-10 px-6 py-12 sm:gap-14 sm:py-16">
        {photos.map((photo, index) => {
          const storyIndex = index % copy.stories.length;
          const story = copy.stories[storyIndex];
          const storyMode = galleryStoryModes[storyIndex];
          const isIntro = index === 0;
          const isOverlay = storyMode === "overlay";
          const isReversed = index % 2 === 1;

          if (isIntro) {
            return (
              <motion.figure
                key={photo.id}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ duration: 0.6, ease: "easeOut" }}
                className="grid gap-5"
              >
                <StoryImageButton
                  photo={photo}
                  onOpen={() => setLightboxIndex(index)}
                  className="aspect-[4/5] sm:aspect-[16/9]"
                  sizes="(min-width: 1024px) 960px, 100vw"
                  priority
                  previewLabel={copy.album.previewPhoto(index + 1)}
                />
                <figcaption className="mx-auto max-w-2xl text-center">
                  <span className="mx-auto mb-3 block h-px w-24 bg-[#d7837d]/55" />
                  <p className="text-xl font-semibold leading-8 text-[#9f101a] sm:text-2xl">{story.title}</p>
                  <p className="mt-3 text-sm leading-7 text-[#8a554d]">{story.body}</p>
                </figcaption>
              </motion.figure>
            );
          }

          if (isOverlay) {
            return (
              <motion.figure
                key={photo.id}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ duration: 0.6, ease: "easeOut" }}
              >
                <StoryImageButton
                  photo={photo}
                  onOpen={() => setLightboxIndex(index)}
                  className="aspect-[5/4] sm:aspect-[16/9]"
                  sizes="(min-width: 1024px) 960px, 100vw"
                  previewLabel={copy.album.previewPhoto(index + 1)}
                >
                  <span className="pointer-events-none absolute inset-x-0 bottom-0 flex min-h-36 flex-col justify-end bg-gradient-to-t from-black/58 via-black/22 to-transparent p-6 text-left text-white sm:p-8">
                    <span className="max-w-md text-2xl font-semibold leading-9 sm:text-3xl">{story.title}</span>
                    <span className="mt-3 max-w-md text-sm leading-7 text-white/82">{story.body}</span>
                  </span>
                </StoryImageButton>
              </motion.figure>
            );
          }

          return (
            <motion.figure
              key={photo.id}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.6, ease: "easeOut" }}
              className={[
                "grid items-center gap-6 md:grid-cols-[1.35fr_0.85fr] md:gap-10",
                isReversed ? "md:grid-flow-col-dense" : "",
              ].join(" ")}
            >
              <StoryImageButton
                photo={photo}
                onOpen={() => setLightboxIndex(index)}
                className={["aspect-[4/5] sm:aspect-[4/3]", isReversed ? "md:col-start-2" : ""].join(" ")}
                sizes="(min-width: 1024px) 600px, 100vw"
                previewLabel={copy.album.previewPhoto(index + 1)}
              />
              <StoryCaption
                number={index}
                title={story.title}
                body={story.body}
                className={isReversed ? "md:col-start-1 md:row-start-1" : ""}
              />
            </motion.figure>
          );
        })}
      </div>

      {!photos.length && (
        <div className="px-6 py-20 text-center text-sm text-[#8a554d]">{copy.album.empty}</div>
      )}

      <Dialog open={lightboxIndex !== null} onOpenChange={(open) => { if (!open) setLightboxIndex(null); }}>
        <DialogContent className="max-h-[95vh] max-w-[95vw] border-none bg-black/95 p-0 flex items-center justify-center [&>button]:text-white [&>button]:hover:text-white/80">
          <DialogTitle className="sr-only">{copy.album.photoPreview}</DialogTitle>
          {lightboxIndex !== null && (
            <>
              <Button
                variant="ghost"
                size="icon"
                onClick={prev}
                aria-label={copy.album.previousPhoto}
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
                aria-label={copy.album.nextPhoto}
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

function StoryImageButton({
  photo,
  onOpen,
  className,
  sizes,
  previewLabel,
  priority = false,
  children,
}: {
  photo: GalleryPhoto;
  onOpen: () => void;
  className: string;
  sizes: string;
  previewLabel: string;
  priority?: boolean;
  children?: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onOpen}
      className={[
        "group relative block w-full cursor-zoom-in overflow-hidden rounded-lg bg-[#f3ded8] shadow-[0_18px_44px_rgba(138,27,21,0.12)] outline-none transition-transform duration-300 hover:-translate-y-1 focus-visible:ring-3 focus-visible:ring-[#c31b28]/25",
        className,
      ].join(" ")}
      aria-label={previewLabel}
    >
      <Image
        src={photo.src}
        alt={photo.alt}
        fill
        className="object-cover transition duration-500 group-hover:scale-[1.03]"
        sizes={sizes}
        priority={priority}
      />
      {children}
    </button>
  );
}

function StoryCaption({
  number,
  title,
  body,
  className,
}: {
  number: number;
  title: string;
  body: string;
  className?: string;
}) {
  return (
    <figcaption className={["px-1 text-left", className].filter(Boolean).join(" ")}>
      <p className="font-serif text-3xl italic leading-none text-[#b7464a]">{String(number).padStart(2, "0")}.</p>
      <h2 className="mt-5 max-w-xs text-2xl font-semibold leading-10 text-[#9f101a]">{title}</h2>
      <span className="mt-5 block h-px w-10 bg-[#b7464a]" />
      <p className="mt-5 max-w-xs text-sm leading-7 text-[#8a554d]">{body}</p>
    </figcaption>
  );
}
