"use client";

import { useEffect, useRef, useState } from "react";

interface UseFrameSequenceReturn {
  images: HTMLImageElement[];
  progress: number;
  isReady: boolean;
  posterSrc: string;
}

const CHUNK_SIZE = 20;
const MIN_FRAMES_FOR_READY = 60;

/**
 * Progressively preloads a numbered image sequence for scroll-scrub playback.
 *
 * - Loads frame 1 immediately (poster/fallback)
 * - Remaining frames load in chunks of 20
 * - isReady becomes true when first 60 frames (or all if < 60) are loaded
 * - On mobile (< 768px), loads from /mobile/ subdirectory
 * - On low-RAM devices (< 4GB), returns poster only
 *
 * @param pathPrefix - Path prefix for frames, e.g. "/frames/serpent/frame-"
 * @param totalFrames - Total number of frames in the sequence
 * @param ext - File extension (default: "webp")
 */
export function useFrameSequence(
  pathPrefix: string,
  totalFrames: number,
  ext: string = "webp"
): UseFrameSequenceReturn {
  const imagesRef = useRef<HTMLImageElement[]>([]);
  const [loadedCount, setLoadedCount] = useState(0);
  const [isMobile, setIsMobile] = useState(false);

  // Detect mobile on mount
  useEffect(() => {
    setIsMobile(window.innerWidth < 768);
  }, []);

  // Build the frame path for a given index (1-based)
  const getFramePath = (index: number): string => {
    const pad = String(index).padStart(4, "0");
    const prefix = isMobile ? pathPrefix.replace("/serpent/", "/serpent/mobile/") : pathPrefix;
    return `${prefix}${pad}.${ext}`;
  };

  const posterSrc = getFramePath(1);

  useEffect(() => {
    // Low-RAM fallback: skip preloading on devices with < 4GB RAM
    if (typeof navigator !== "undefined" && "deviceMemory" in navigator) {
      const memory = (navigator as { deviceMemory?: number }).deviceMemory;
      if (memory && memory < 4) {
        // Load only the poster frame
        const img = new Image();
        img.src = getFramePath(1);
        img.onload = () => {
          imagesRef.current = [img];
          setLoadedCount(1);
        };
        return;
      }
    }

    // Pre-allocate the array
    const images: (HTMLImageElement | null)[] = new Array(totalFrames).fill(null);
    let mounted = true;
    let loaded = 0;

    function loadChunk(startIndex: number) {
      if (!mounted) return;

      const end = Math.min(startIndex + CHUNK_SIZE, totalFrames);
      const promises: Promise<void>[] = [];

      for (let i = startIndex; i < end; i++) {
        const frameNum = i + 1; // 1-based
        const img = new Image();

        promises.push(
          new Promise<void>((resolve) => {
            img.onload = () => {
              images[i] = img;
              loaded++;
              if (mounted) {
                setLoadedCount(loaded);
              }
              resolve();
            };
            img.onerror = () => {
              // Skip failed frames, don't block the sequence
              resolve();
            };
            img.src = getFramePath(frameNum);
          })
        );
      }

      // After this chunk loads, start the next chunk
      Promise.all(promises).then(() => {
        if (mounted && end < totalFrames) {
          loadChunk(end);
        }
        // Update the ref with loaded images (filter nulls for safety)
        imagesRef.current = images.filter((img): img is HTMLImageElement => img !== null);
      });
    }

    // Start loading from frame 1
    loadChunk(0);

    return () => {
      mounted = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [totalFrames, isMobile]);

  const readyThreshold = Math.min(MIN_FRAMES_FOR_READY, totalFrames);
  const isReady = loadedCount >= readyThreshold;
  const progress = totalFrames > 0 ? loadedCount / totalFrames : 0;

  return {
    images: imagesRef.current,
    progress,
    isReady,
    posterSrc,
  };
}
