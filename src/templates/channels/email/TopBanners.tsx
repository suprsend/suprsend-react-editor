import { useState } from 'react';
import { Info, X, RefreshCw, Pencil } from '@/assets/icons';
import { Button } from '@/components/ui/button';

const LS_HTML_BANNER = 'ss_email_banner_html_dismissed';

interface TopBannerProps {
  editorType: string;
  designEditorType: string;
  plainTextMode?: 'auto' | 'custom';
  showPlainText?: boolean;
  onEditManually?: () => void;
  onResetToAuto?: () => void;
}

function HTMLEditorBanner() {
  const [visible, setVisible] = useState(
    () => localStorage.getItem(LS_HTML_BANNER) !== 'true'
  );

  if (!visible) return null;
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
      <X
        className="suprsend-w-3.5 suprsend-h-3.5 suprsend-text-gray-600 suprsend-cursor-pointer suprsend-shrink-0"
        onClick={() => {
          localStorage.setItem(LS_HTML_BANNER, 'true');
          setVisible(false);
        }}
      />
    </div>
  );
}

function AutoPlainTextBanner({
  onEditManually,
}: {
  onEditManually?: () => void;
}) {
  return (
    <div className="suprsend-px-3 suprsend-bg-blue-50 suprsend-text-blue-800 suprsend-text-xs suprsend-py-1.5 suprsend-flex suprsend-items-center suprsend-justify-between suprsend-my-1 suprsend-rounded">
      <div className="suprsend-flex suprsend-items-center suprsend-gap-2">
        <Info className="suprsend-w-3.5 suprsend-h-3.5 suprsend-shrink-0" />
        <span>
          Auto-generated from your design. Updates each time you save.
          Sent alongside HTML and displayed when HTML is blocked in the
          email client.
        </span>
      </div>
      {onEditManually && (
        <Button
          variant="outline"
          size="sm"
          className="suprsend-shrink-0 suprsend-ml-4 suprsend-text-xs"
          onClick={onEditManually}
        >
          Edit manually
        </Button>
      )}
    </div>
  );
}

function CustomPlainTextBanner({
  onResetToAuto,
}: {
  onResetToAuto?: () => void;
}) {
  return (
    <div className="suprsend-px-3 suprsend-bg-amber-50 suprsend-text-amber-800 suprsend-text-xs suprsend-py-1.5 suprsend-flex suprsend-items-center suprsend-justify-between suprsend-my-1 suprsend-rounded">
      <div className="suprsend-flex suprsend-items-center suprsend-gap-2">
        <Pencil className="suprsend-w-3.5 suprsend-h-3.5 suprsend-shrink-0" />
        <span>
          Custom plain text. Won't update when you change your design.
          Sent alongside HTML and displayed when HTML is blocked in the
          email client.
        </span>
      </div>
      {onResetToAuto && (
        <Button
          variant="outline"
          size="sm"
          className="suprsend-shrink-0 suprsend-ml-4 suprsend-text-xs"
          onClick={onResetToAuto}
        >
          Reset to auto
        </Button>
      )}
    </div>
  );
}

export function PlainTextBanner({
  onFetchFromHtml,
}: {
  onFetchFromHtml?: () => Promise<void>;
}) {
  return (
    <div className="suprsend-px-3 suprsend-bg-blue-50 suprsend-text-gray-700 suprsend-text-xs suprsend-py-1.5 suprsend-flex suprsend-items-center suprsend-justify-between suprsend-my-1 suprsend-rounded">
      <div className="suprsend-flex suprsend-items-center suprsend-gap-2">
        <Info className="suprsend-w-3.5 suprsend-h-3.5 suprsend-text-gray-600 suprsend-shrink-0" />
        <span>
          Plain text (If left blank) is auto-generated from HTML on every commit
        </span>
      </div>
      <Button
        variant="outline"
        size="sm"
        className="suprsend-shrink-0 suprsend-ml-4 suprsend-gap-1.5 suprsend-text-xs"
        onClick={onFetchFromHtml}
      >
        <RefreshCw className="suprsend-w-3 suprsend-h-3" />
        Fetch from HTML
      </Button>
    </div>
  );
}

export function EditorTopBanner({
  editorType,
  designEditorType,
  plainTextMode,
  showPlainText,
  onEditManually,
  onResetToAuto,
}: TopBannerProps) {
  // When toggle is ON and showing plain text in design/html mode
  if (showPlainText) {
    if (plainTextMode === 'auto') {
      return <AutoPlainTextBanner onEditManually={onEditManually} />;
    }
    return <CustomPlainTextBanner onResetToAuto={onResetToAuto} />;
  }

  // When showing the editor (toggle OFF)
  if (editorType === 'design_editor' && designEditorType === 'html') {
    return <HTMLEditorBanner />;
  }
  return null;
}
