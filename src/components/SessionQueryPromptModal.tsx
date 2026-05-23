import { Button } from '@/components/ui/button';
import { ROUTES } from '@/constants';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { FileText } from 'lucide-react';
import { Link } from 'react-router-dom';

interface SessionQueryPromptModalProps {
  open: boolean;
  onDismiss: () => void;
}

const SessionQueryPromptModal = ({
  open,
  onDismiss,
}: SessionQueryPromptModalProps) => {
  return (
    <Dialog
      open={open}
      onOpenChange={(nextOpen) => {
        if (!nextOpen) onDismiss();
      }}
    >
      <DialogContent className="sm:max-w-md">
        <DialogHeader className="text-center sm:text-center">
          <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-primary/10">
            <FileText className="h-7 w-7 text-primary" />
          </div>
          <DialogTitle className="text-xl">Need legal guidance?</DialogTitle>
          <DialogDescription className="text-base">
            Start a query in a few minutes. Tell us what you need and we will
            help you move forward with clarity.
          </DialogDescription>
        </DialogHeader>
        <Button className="w-full" asChild>
            <Link to={ROUTES.user.newCase} onClick={onDismiss}>
            Raise a query
          </Link>
        </Button>
        <Button variant="ghost" className="w-full" onClick={onDismiss}>
          Maybe later
        </Button>
      </DialogContent>
    </Dialog>
  );
};

export default SessionQueryPromptModal;
