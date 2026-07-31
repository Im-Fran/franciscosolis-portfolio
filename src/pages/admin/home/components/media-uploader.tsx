import React, { useState } from "react";
import { UploadSimple, Trash, Spinner } from "@phosphor-icons/react";
import { Button } from "@/components/ui/button/button.tsx";

interface MediaUploaderProps {
  projectUuid?: string;
  value: string | null;
  onChange: (key: string | null) => void;
}

export const MediaUploader: React.FC<MediaUploaderProps> = ({
  projectUuid,
  value,
  onChange,
}) => {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const mediaUrl = value
    ? value.startsWith("/api/media/") || value.startsWith("http")
      ? value
      : value.startsWith("projects/")
      ? `/api/media/${value}`
      : value
    : null;

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setError(null);

    const formData = new FormData();
    formData.append("file", file);
    if (projectUuid) {
      formData.append("project_uuid", projectUuid);
    }

    try {
      const res = await fetch("/api/admin/projects/upload", {
        method: "POST",
        body: formData,
        credentials: "include",
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || "Error al subir imagen");
      }

      const data = await res.json();
      onChange(data.key);
    } catch (err: any) {
      setError(err.message || "Error al subir la imagen");
    } finally {
      setUploading(false);
    }
  };

  const handleRemove = () => {
    onChange(null);
  };

  return (
    <div className="space-y-2">
      <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-400">
        Media / Asset (R2)
      </label>

      {mediaUrl ? (
        <div className="relative group overflow-hidden rounded-lg border border-neutral-800 bg-neutral-900/50 p-2">
          <div className="relative aspect-video w-full overflow-hidden rounded bg-black/40 flex items-center justify-center">
            {mediaUrl.match(/\.(mp4|webm)$/i) ? (
              <video src={mediaUrl} controls className="h-full w-full object-contain" />
            ) : (
              <img src={mediaUrl} alt="Preview" className="h-full w-full object-contain" />
            )}
          </div>
          <div className="mt-2 flex items-center justify-between gap-2 px-1">
            <span className="text-xs text-neutral-400 truncate max-w-[200px]" title={value || ""}>
              {value}
            </span>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="text-red-400 hover:text-red-300 hover:bg-red-950/40 h-8 px-2"
              onClick={handleRemove}
            >
              <Trash size={16} className="mr-1" />
              Quitar
            </Button>
          </div>
        </div>
      ) : (
        <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-neutral-800 hover:border-neutral-600 rounded-lg cursor-pointer bg-neutral-900/30 hover:bg-neutral-900/60 transition-colors">
          <div className="flex flex-col items-center justify-center pt-5 pb-6">
            {uploading ? (
              <Spinner size={28} className="animate-spin text-accent-400 mb-2" />
            ) : (
              <UploadSimple size={28} className="text-neutral-400 mb-2" />
            )}
            <p className="mb-1 text-xs text-neutral-300">
              <span className="font-semibold">Haz clic para subir</span> o arrastra un archivo
            </p>
            <p className="text-[11px] text-neutral-500">PNG, JPG, GIF, WebP, SVG</p>
          </div>
          <input
            type="file"
            className="hidden"
            accept="image/*,video/mp4"
            disabled={uploading}
            onChange={handleFileChange}
          />
        </label>
      )}

      {error && <p className="text-xs text-red-400">{error}</p>}
    </div>
  );
};
