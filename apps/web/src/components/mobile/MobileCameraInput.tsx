import React, { useRef, useState } from 'react';
import { Camera, X, Image as ImageIcon, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface MobileCameraInputProps {
  onImageCaptured: (file: File) => void;
  label?: string;
  className?: string;
}

export function MobileCameraInput({ onImageCaptured, label = "Chụp ảnh báo cáo", className }: MobileCameraInputProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsProcessing(true);

    // Tạo preview ngay lập tức
    const objectUrl = URL.createObjectURL(file);
    setPreview(objectUrl);
    
    // Giả lập nén ảnh (Trong thực tế nên dùng browser-image-compression ở đây)
    setTimeout(() => {
      onImageCaptured(file);
      setIsProcessing(false);
    }, 500);
  };

  const handleRemove = () => {
    setPreview(null);
    if (inputRef.current) {
      inputRef.current.value = '';
    }
  };

  const triggerCamera = () => {
    inputRef.current?.click();
  };

  return (
    <div className={cn("w-full", className)}>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        capture={"environment" as any} // Fix lỗi TS: Ép kiểu để tránh lỗi type check trên một số phiên bản React
        className="hidden"
        onChange={handleFileChange}
      />

      {!preview ? (
        <Button 
          type="button" 
          variant="outline" 
          className="w-full h-32 border-dashed border-2 flex flex-col gap-2 hover:bg-secondary/50 active:scale-95 transition-transform"
          onClick={triggerCamera}
        >
          <Camera className="h-8 w-8 text-muted-foreground" />
          <span className="text-sm font-medium text-muted-foreground">{label}</span>
        </Button>
      ) : (
        <div className="relative rounded-lg overflow-hidden border bg-background">
          <img 
            src={preview} 
            alt="Preview" 
            className="w-full h-48 object-cover" 
          />
          
          {isProcessing && (
            <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
              <Loader2 className="h-8 w-8 text-white animate-spin" />
            </div>
          )}

          <Button
            type="button"
            variant="destructive"
            size="icon"
            className="absolute top-2 right-2 h-8 w-8 rounded-full shadow-md"
            onClick={handleRemove}
          >
            <X className="h-4 w-4" />
          </Button>
          
          <div className="absolute bottom-2 left-2 bg-black/60 text-white text-xs px-2 py-1 rounded-md flex items-center gap-1">
            <ImageIcon className="h-3 w-3" /> Ảnh đã chụp
          </div>
        </div>
      )}
    </div>
  );
}