import { useRef, useState, useCallback } from 'react';
import { Label } from '@/components/ui/label';
import CodeMirrorEditor, {
  type CodeMirrorEditorHandle,
  type CodeMirrorEditorProps,
} from './CodeMirrorEditor';
import { EmojiPickerTrigger } from './EmojiPicker';

// --- Types ---

interface CodeEditorWithEmojiProps extends CodeMirrorEditorProps {
  label?: string;
  mandatory?: boolean;
}

// --- Component ---

export default function CodeEditorWithEmoji({
  label,
  mandatory = true,
  value = '',
  onChange,
  ...rest
}: CodeEditorWithEmojiProps) {
  const editorRef = useRef<CodeMirrorEditorHandle>(null);
  const savedCursorRef = useRef<number>(value.length);
  const [emojiOpen, setEmojiOpen] = useState(false);

  const handleUpdate = useCallback(
    (update: import('@codemirror/view').ViewUpdate) => {
      savedCursorRef.current = update.state.selection.main.head;
      rest.onUpdate?.(update);
    },
    [rest.onUpdate]
  );

  const insertEmoji = useCallback(
    (unicode: string) => {
      const view = editorRef.current?.getView();
      const pos = savedCursorRef.current;
      const nextPos = pos + unicode.length;

      if (view) {
        view.dispatch({
          changes: { from: pos, to: pos, insert: unicode },
          selection: { anchor: nextPos },
        });
        savedCursorRef.current = nextPos;
        setEmojiOpen(false);
        requestAnimationFrame(() => view.focus());
      } else {
        const newValue = value.slice(0, pos) + unicode + value.slice(pos);
        onChange?.(newValue);
        savedCursorRef.current = nextPos;
        setEmojiOpen(false);
      }
    },
    [value, onChange]
  );

  return (
    <>
      {label && (
        <Label>
          {label}
          {mandatory && <span className="suprsend-text-destructive">*</span>}
        </Label>
      )}
      <div className="suprsend-flex suprsend-gap-1 suprsend-items-start suprsend-mt-1">
        <div className="suprsend-flex-1 suprsend-min-w-0">
          <CodeMirrorEditor
            ref={editorRef}
            value={value}
            onChange={onChange}
            {...rest}
            onUpdate={handleUpdate}
          />
        </div>

        <EmojiPickerTrigger
          open={emojiOpen}
          onOpenChange={setEmojiOpen}
          onEmojiClick={insertEmoji}
          align="end"
          triggerClassName="suprsend-mt-2"
        />
      </div>
    </>
  );
}
