"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import Image, { ImageLoaderProps } from "next/image";
import {
  DndContext,
  closestCenter,
  PointerSensor,
  TouchSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  useSortable,
  rectSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import type { Photo, Music } from "@/lib/db/schema";

function formatFileSize(bytes: number): string {
  if (bytes === 0) return "0 B";
  const units = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  return `${(bytes / Math.pow(1024, i)).toFixed(i === 0 ? 0 : 1)} ${units[i]}`;
}

const seaweedLoader = ({ src }: ImageLoaderProps) =>
  `${process.env.NEXT_PUBLIC_S3_BASE}/${src}`;

function SortablePhoto({
  photo,
  onDelete,
}: {
  photo: Photo;
  onDelete: (id: number) => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({ id: photo.id });
  const style = { transform: CSS.Transform.toString(transform), transition };

  return (
    <div ref={setNodeRef} style={style} className="relative group">
      <div {...attributes} {...listeners} className="cursor-grab active:cursor-grabbing">
        <Image
          loader={seaweedLoader}
          src={photo.src}
          alt={photo.alt}
          width={200}
          height={200}
          className="w-full aspect-square object-cover rounded-lg"
        />
      </div>
      {photo.fileSize > 0 && (
        <span className="absolute bottom-1 left-1 bg-black/60 text-white text-xs px-1.5 py-0.5 rounded">
          {formatFileSize(photo.fileSize)}
        </span>
      )}
      <button
        onClick={() => onDelete(photo.id)}
        className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-6 h-6 text-sm opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
        aria-label="删除照片"
      >
        &times;
      </button>
    </div>
  );
}

export default function AdminPage() {
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [uploading, setUploading] = useState(false);
  const [musicFile, setMusicFile] = useState<Music | null>(null);
  const [musicUploading, setMusicUploading] = useState(false);
  const router = useRouter();
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 200, tolerance: 5 } }),
  );

  const fetchPhotos = useCallback(async () => {
    const res = await fetch("/api/photos");
    setPhotos(await res.json());
  }, []);

  useEffect(() => { fetchPhotos(); }, [fetchPhotos]);

  useEffect(() => {
    fetch("/api/music").then((r) => r.json()).then(setMusicFile);
  }, []);

  async function handleMusicUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setMusicUploading(true);
    const res = await fetch("/api/upload", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ filename: file.name, contentType: file.type, folder: "music" }),
    });
    const { url, key } = await res.json();
    await fetch(url, { method: "PUT", body: file, headers: { "Content-Type": file.type } });
    const music = await fetch("/api/music", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ src: key, fileName: file.name, fileSize: file.size }),
    }).then((r) => r.json());
    setMusicFile(music);
    setMusicUploading(false);
    e.target.value = "";
  }

  async function handleMusicDelete() {
    if (!confirm("确定删除背景音乐？")) return;
    await fetch("/api/music", { method: "DELETE" });
    setMusicFile(null);
  }

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const files = e.target.files;
    if (!files?.length) return;
    setUploading(true);
    for (const file of Array.from(files)) {
      const res = await fetch("/api/upload", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ filename: file.name, contentType: file.type }),
      });
      const { url, key } = await res.json();
      await fetch(url, { method: "PUT", body: file, headers: { "Content-Type": file.type } });
      await fetch("/api/photos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ src: key, alt: "", fileName: file.name, fileSize: file.size }),
      });
    }
    setUploading(false);
    fetchPhotos();
    e.target.value = "";
  }

  async function handleDelete(id: number) {
    if (!confirm("确定删除这张照片？")) return;
    await fetch(`/api/photos/${id}`, { method: "DELETE" });
    setPhotos((prev) => prev.filter((p) => p.id !== id));
  }

  async function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const oldIndex = photos.findIndex((p) => p.id === active.id);
    const newIndex = photos.findIndex((p) => p.id === over.id);
    const reordered = arrayMove(photos, oldIndex, newIndex);
    setPhotos(reordered);
    await fetch("/api/photos/reorder", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ids: reordered.map((p) => p.id) }),
    });
  }

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/admin/login");
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-semibold text-gray-800">xxx</h1>
            <button
              onClick={fetchPhotos}
              className="text-3xl text-gray-400 hover:text-gray-700 transition-colors"
              aria-label="刷新"
            >
              &#x21bb;
            </button>
          </div>
          <button onClick={handleLogout} className="text-sm text-gray-500 hover:text-gray-800">
            退出登录
          </button>
        </div>
        <div className="mb-6 p-4 bg-white rounded-lg border border-gray-200">
          <h2 className="text-sm font-medium text-gray-700 mb-3">背景音乐</h2>
          <div className="flex items-center gap-3">
            <span className="text-sm text-gray-500">
              {musicFile ? `${musicFile.fileName} (${formatFileSize(musicFile.fileSize)})` : "未设置"}
            </span>
            <label className="cursor-pointer text-sm text-blue-600 hover:text-blue-800">
              {musicUploading ? "上传中..." : "上传"}
              <input type="file" accept="audio/*" onChange={handleMusicUpload} className="hidden" disabled={musicUploading} />
            </label>
            {musicFile && (
              <button onClick={handleMusicDelete} className="text-sm text-red-500 hover:text-red-700">
                删除
              </button>
            )}
          </div>
        </div>
        <label className="block mb-6 cursor-pointer">
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-blue-400 transition-colors">
            <p className="text-gray-500">{uploading ? "上传中..." : "点击或拖拽上传照片"}</p>
          </div>
          <input type="file" accept="image/*" multiple onChange={handleUpload} className="hidden" disabled={uploading} />
        </label>
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <SortableContext items={photos.map((p) => p.id)} strategy={rectSortingStrategy}>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {photos.map((photo) => (
                <SortablePhoto key={photo.id} photo={photo} onDelete={handleDelete} />
              ))}
            </div>
          </SortableContext>
        </DndContext>
      </div>
    </div>
  );
}
