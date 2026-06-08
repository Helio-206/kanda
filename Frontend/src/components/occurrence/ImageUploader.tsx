import { useRef, useState, useCallback } from 'react';
import { Upload, X } from 'lucide-react';

interface ImageUploaderProps {
  file: File | null;
  previewUrl: string | null;
  onChange: (file: File | null, previewUrl: string | null) => void;
}

export default function ImageUploader({ file, previewUrl, onChange }: ImageUploaderProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragOver, setDragOver] = useState(false);

  const handleFile = useCallback(
    (selected: File | null) => {
      if (!selected) {
        onChange(null, null);
        return;
      }
      if (!selected.type.startsWith('image/')) return;
      onChange(selected, URL.createObjectURL(selected));
    },
    [onChange],
  );

  const onDrop = (event: React.DragEvent) => {
    event.preventDefault();
    setDragOver(false);
    const dropped = event.dataTransfer.files[0];
    if (dropped) handleFile(dropped);
  };

  return (
    <div>
      {!previewUrl ? (
        <div
          role="button"
          tabIndex={0}
          onClick={() => inputRef.current?.click()}
          onKeyDown={(e) => e.key === 'Enter' && inputRef.current?.click()}
          onDragOver={(e) => {
            e.preventDefault();
            setDragOver(true);
          }}
          onDragLeave={() => setDragOver(false)}
          onDrop={onDrop}
          className={`rounded-lg border border-dashed p-10 text-center cursor-pointer transition-colors ${
            dragOver
              ? 'border-kanda-primary bg-kanda-primary/5'
              : 'border-kanda-border bg-white hover:border-kanda-primary/50'
          }`}
        >
          <Upload className="mx-auto text-kanda-text-secondary mb-4" size={32} strokeWidth={1.5} />
          <p className="font-medium text-kanda-text-primary">Carregar fotografia do problema</p>
          <p className="text-sm text-kanda-text-secondary mt-2">
            Arraste uma imagem ou clique para seleccionar
          </p>
          <p className="text-xs text-kanda-text-secondary mt-4">
            Formatos aceites: JPG, PNG ou WEBP
          </p>
        </div>
      ) : (
        <div className="relative">
          <img
            src={previewUrl}
            alt="Pré-visualização"
            className="w-full max-h-[360px] object-cover rounded-lg"
          />
          <button
            type="button"
            onClick={() => handleFile(null)}
            className="absolute top-3 right-3 w-10 h-10 flex items-center justify-center bg-kanda-dark/80 text-white border-none cursor-pointer"
            aria-label="Remover imagem"
          >
            <X size={18} />
          </button>
          {file && (
            <p className="text-xs text-kanda-text-secondary mt-2">{file.name}</p>
          )}
        </div>
      )}

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        capture="environment"
        className="hidden"
        onChange={(e) => handleFile(e.target.files?.[0] ?? null)}
      />
    </div>
  );
}
