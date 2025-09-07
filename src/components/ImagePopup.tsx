import { X } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ImagePopupProps {
  src: string;
  alt: string;
  isOpen: boolean;
  onClose: () => void;
}

const ImagePopup = ({ src, alt, isOpen, onClose }: ImagePopupProps) => {
  if (!isOpen) return null;

  return (
    <div className="popup-overlay" onClick={onClose}>
      <div className="popup-content" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-foreground">{alt}</h3>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="text-muted-foreground hover:text-foreground"
          >
            <X className="h-5 w-5" />
          </Button>
        </div>
        
        <div className="aspect-video w-full overflow-hidden rounded-lg">
          <img
            src={src}
            alt={alt}
            className="w-full h-full object-cover"
          />
        </div>
      </div>
    </div>
  );
};

export default ImagePopup;