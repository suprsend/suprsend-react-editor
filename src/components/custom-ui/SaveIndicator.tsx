import { RefreshCw, CircleCheck } from '@/assets/icons';

interface SaveIndicatorProps {
  isSaving: boolean;
  isSaved: boolean;
}

export default function SaveIndicator({ isSaving, isSaved }: SaveIndicatorProps) {
  if (!isSaving && !isSaved) return null;

  return (
    <div className="suprsend-absolute suprsend-top-2 suprsend-right-6 suprsend-z-10">
      {isSaving ? (
        <div className="suprsend-flex suprsend-items-center suprsend-text-muted-foreground suprsend-gap-1">
          <RefreshCw className="suprsend-h-3.5 suprsend-w-3.5 suprsend-animate-spin" />
          <p className="suprsend-text-xs suprsend-font-medium">Saving</p>
        </div>
      ) : (
        <div className="suprsend-flex suprsend-items-center suprsend-gap-1">
          <CircleCheck className="suprsend-h-3.5 suprsend-w-3.5 suprsend-text-emerald-500" />
          <p className="suprsend-text-xs suprsend-font-medium suprsend-text-muted-foreground">
            Saved
          </p>
        </div>
      )}
    </div>
  );
}
