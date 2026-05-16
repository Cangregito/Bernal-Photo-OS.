'use client';

import React, { useState, useRef, ChangeEvent, DragEvent } from 'react';
import { UploadCloud, Loader2, X, Image as ImageIcon } from 'lucide-react';
import { createBrowserClient } from '@supabase/ssr';
import Image from 'next/image';

interface ImageUploaderProps {
  onUpload: (url: string) => void;
  defaultValue?: string;
  bucket?: string;
  folder?: string;
}

export function ImageUploader({ onUpload, defaultValue, bucket = 'media', folder = 'uploads' }: ImageUploaderProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [preview, setPreview] = useState<string | null>(defaultValue || null);
  const [error, setError] = useState<string | null>(null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      void processFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      void processFile(e.target.files[0]);
    }
  };

  const processFile = async (file: File) => {
    if (!file.type.startsWith('image/')) {
      setError('Por favor sube un archivo de imagen válido (JPG, PNG, WEBP).');
      return;
    }
    
    // Create local preview immediately
    const objectUrl = URL.createObjectURL(file);
    setPreview(objectUrl);
    setIsUploading(true);
    setError(null);

    try {
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
      const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
      const supabase = createBrowserClient(supabaseUrl, supabaseAnonKey);

      // Create unique filename
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random().toString(36).substring(2, 15)}_${Date.now()}.${fileExt}`;
      const filePath = `${folder}/${fileName}`;

      // Upload to Supabase Storage
      const { data, error: uploadError } = await supabase.storage
        .from(bucket)
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false,
        });

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: publicUrlData } = supabase.storage
        .from(bucket)
        .getPublicUrl(data.path);

      onUpload(publicUrlData.publicUrl);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error desconocido al subir imagen';
      setError(`Error: ${msg}`);
      setPreview(defaultValue || null); // Revert on error
    } finally {
      setIsUploading(false);
    }
  };

  const clearImage = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setPreview(null);
    onUpload('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="w-full">
      <div
        onClick={() => !isUploading && fileInputRef.current?.click()}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`relative flex min-h-[200px] w-full cursor-pointer flex-col items-center justify-center overflow-hidden rounded-xl border-2 border-dashed transition-colors ${
          isDragging
            ? 'border-emerald-500 bg-emerald-500/10'
            : preview
            ? 'border-zinc-800 bg-zinc-950/50 hover:border-zinc-700'
            : 'border-zinc-800 bg-zinc-900/50 hover:border-emerald-500/50 hover:bg-zinc-900'
        }`}
      >
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          accept="image/*"
          className="hidden"
          disabled={isUploading}
        />

        {preview ? (
          <div className="group relative h-full w-full">
            <Image
              src={preview}
              alt="Preview"
              fill
              className="object-cover"
              unoptimized={preview.startsWith('blob:')}
            />
            {/* Overlay for actions */}
            <div className="absolute inset-0 flex items-center justify-center bg-black/60 opacity-0 transition-opacity group-hover:opacity-100">
              {isUploading ? (
                <div className="flex flex-col items-center gap-2 text-white">
                  <Loader2 className="h-8 w-8 animate-spin" />
                  <span className="text-sm font-medium">Subiendo...</span>
                </div>
              ) : (
                <div className="flex flex-col items-center gap-2">
                  <button
                    onClick={clearImage}
                    className="flex h-10 w-10 items-center justify-center rounded-full bg-red-500 text-white shadow-lg transition-transform hover:scale-110 hover:bg-red-600"
                  >
                    <X className="h-5 w-5" />
                  </button>
                  <span className="text-xs font-medium text-white shadow-black drop-shadow-md">
                    Eliminar
                  </span>
                </div>
              )}
            </div>
            {isUploading && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/60">
                <div className="flex flex-col items-center gap-2 text-white">
                  <Loader2 className="h-8 w-8 animate-spin" />
                  <span className="text-sm font-medium">Subiendo...</span>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center space-y-4 p-6 text-center">
            <div className="rounded-full bg-zinc-800/50 p-4">
              <UploadCloud className="h-8 w-8 text-emerald-500" />
            </div>
            <div>
              <p className="text-sm font-medium text-zinc-200">
                Arrastra una imagen o haz clic
              </p>
              <p className="mt-1 text-xs text-zinc-500">
                Soporta JPG, PNG, WEBP de alta calidad.
              </p>
            </div>
          </div>
        )}
      </div>

      {error && (
        <p className="mt-2 text-sm text-red-500 flex items-center gap-1">
          <X className="h-4 w-4" /> {error}
        </p>
      )}
    </div>
  );
}
