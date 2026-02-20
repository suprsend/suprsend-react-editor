import { Info, X } from 'lucide-react';

interface TopBannerProps {
  editorType: string;
  designEditorType: string;
}

function DesignEditorBanner() {
  return (
    <div className="suprsend-px-3 suprsend-bg-blue-50 suprsend-text-gray-700 suprsend-text-xs suprsend-py-1.5 suprsend-flex suprsend-items-center suprsend-justify-between suprsend-my-1 suprsend-rounded">
      <div className="suprsend-flex suprsend-items-center suprsend-gap-2">
        <Info className="suprsend-w-3.5 suprsend-h-3.5 suprsend-text-gray-600" />
        <span>
          For devices that block HTML emails, we'll automatically create and
          send a plain text version using your email content.
        </span>
      </div>
      <X className="suprsend-w-3.5 suprsend-h-3.5 suprsend-text-gray-600" />
    </div>
  );
}

function HTMLEditorBanner() {
  return (
    <div className="suprsend-px-3 suprsend-bg-blue-50 suprsend-text-gray-700 suprsend-text-xs suprsend-py-1.5 suprsend-flex suprsend-items-center suprsend-justify-between suprsend-my-1 suprsend-rounded">
      <div className="suprsend-flex suprsend-items-center suprsend-gap-2">
        <Info className="suprsend-w-3.5 suprsend-h-3.5 suprsend-text-gray-600" />
        <span>
          All html tags and CSS properties aren't allowed by certain email
          clients and will strip your email.{' '}
          <a
            href="https://docs.suprsend.com"
            target="_blank"
            rel="noopener noreferrer"
            className="suprsend-underline"
          >
            Refer to documentation.
          </a>
        </span>
      </div>
      <X className="suprsend-w-3.5 suprsend-h-3.5 suprsend-text-gray-600" />
    </div>
  );
}

export function EditorTopBanner({
  editorType,
  designEditorType,
}: TopBannerProps) {
  if (editorType === 'design_editor') {
    if (designEditorType === 'design') {
      return <DesignEditorBanner />;
    } else if (designEditorType === 'html') {
      return <HTMLEditorBanner />;
    } else {
      return null;
    }
  }
  return null;
}
