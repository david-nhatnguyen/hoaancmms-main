import { ReactNode } from 'react';
import { useIsMobile } from '@/hooks/use-mobile';
import { Drawer } from 'vaul';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription 
} from '@/components/ui/dialog';

interface ResponsiveFormSheetProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  children: ReactNode;
  description?: string;
  contentClassName?: string;
}

export function ResponsiveFormSheet({
  isOpen,
  onOpenChange,
  title,
  children,
  description,
  contentClassName
}: ResponsiveFormSheetProps) {
  const isMobile = useIsMobile();

  if (isMobile) {
    return (
      <Drawer.Root open={isOpen} onOpenChange={onOpenChange}>
        <Drawer.Portal>
          <Drawer.Overlay className="fixed inset-0 bg-black/40 z-[60]" />
          <Drawer.Content className={`bg-background flex flex-col rounded-t-[10px] h-[85%] mt-24 fixed bottom-0 left-0 right-0 z-[60] ${contentClassName || ''}`}>
            <div className="p-4 bg-background rounded-t-[10px] flex-1 flex flex-col overflow-hidden">
              <div className="mx-auto w-12 h-1.5 flex-shrink-0 rounded-full bg-muted mb-4" />
              <Drawer.Title className="text-lg font-semibold mb-4">
                {title}
              </Drawer.Title>
              {description && <Drawer.Description className="sr-only">{description}</Drawer.Description>}
              <div className="flex-1 overflow-y-auto">
                {children}
              </div>
            </div>
          </Drawer.Content>
        </Drawer.Portal>
      </Drawer.Root>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className={`sm:max-w-[425px] ${contentClassName || ''}`}>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          {description && <DialogDescription>{description}</DialogDescription>}
        </DialogHeader>
        {children}
      </DialogContent>
    </Dialog>
  );
}
