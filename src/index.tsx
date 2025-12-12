import './index.css';
import { useState } from 'react';
import { GitCommitHorizontal } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { TabBar } from '@/components/custom-ui/channelsTab';
import EmailChannel from '@/components/channels/email';
import AndroidPushIcon from '@/assets/androidPushChannel.svg?react';
import EmailIcon from '@/assets/emailChannel.svg?react';
import InappIcon from '@/assets/inboxChannel.svg?react';
import IOSPushIcon from '@/assets/iosPushChannel.svg?react';
import MSTeamsIcon from '@/assets/maTeamsChannel.svg?react';
import SlackIcon from '@/assets/slackChannel.svg?react';
import SMSIcon from '@/assets/smsChannel.svg?react';
import WebpushIcon from '@/assets/webPushChannel.svg?react';
import WhatsappIcon from '@/assets/whatsappChannel.svg?react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';

type ChannelId =
  | 'android'
  | 'email'
  | 'inapp'
  | 'ios'
  | 'msteams'
  | 'slack'
  | 'sms'
  | 'webpush'
  | 'whatsapp';

interface Channel {
  id: ChannelId;
  label: string;
  icon: React.ReactNode;
  onClick: () => void;
}

const CHANNELS: Channel[] = [
  {
    id: 'android',
    label: 'Android Push',
    icon: <AndroidPushIcon className="suprsend-w-3.5 suprsend-h-3.5" />,
    onClick: () => {},
  },
  {
    id: 'email',
    label: 'Email',
    icon: <EmailIcon className="suprsend-w-3.5 suprsend-h-3.5" />,
    onClick: () => {},
  },
  {
    id: 'inapp',
    label: 'In-app Inbox',
    icon: <InappIcon className="suprsend-w-3.5 suprsend-h-3.5" />,
    onClick: () => {},
  },
  {
    id: 'ios',
    label: 'iOS Push',
    icon: <IOSPushIcon className="suprsend-w-3.5 suprsend-h-3.5" />,
    onClick: () => {},
  },
  {
    id: 'msteams',
    label: 'MS Teams',
    icon: <MSTeamsIcon className="suprsend-w-3.5 suprsend-h-3.5" />,
    onClick: () => {},
  },
  {
    id: 'slack',
    label: 'Slack',
    icon: <SlackIcon className="suprsend-w-3.5 suprsend-h-3.5" />,
    onClick: () => {},
  },
  {
    id: 'sms',
    label: 'SMS',
    icon: <SMSIcon className="suprsend-w-3.5 suprsend-h-3.5" />,
    onClick: () => {},
  },
  {
    id: 'webpush',
    label: 'Web Push',
    icon: <WebpushIcon className="suprsend-w-3.5 suprsend-h-3.5" />,
    onClick: () => {},
  },
  {
    id: 'whatsapp',
    label: 'Whatsapp',
    icon: <WhatsappIcon className="suprsend-w-3.5 suprsend-h-3.5" />,
    onClick: () => {},
  },
];

interface SuprSendTemplateEditorProps {
  ChannelsTabActionComponent?: React.ComponentType;
  hideChannelsTab?: boolean;
  liveMode?: boolean;
}

export function SuprSendTemplateEditor({
  ChannelsTabActionComponent,
  hideChannelsTab = false,
  liveMode = false,
}: SuprSendTemplateEditorProps) {
  const [selectedChannel, setSelectedChannel] = useState<string | number>(
    'email'
  );

  return (
    <div>
      {!hideChannelsTab && (
        <TabBar
          options={CHANNELS}
          selectedChannel={selectedChannel}
          onTabClick={(id) => setSelectedChannel(id)}
          ChannelsTabActionComponent={ChannelsTabActionComponent}
          liveMode={liveMode}
        />
      )}
      {selectedChannel === 'email' && <EmailChannel />}
    </div>
  );
}

export function CommitTemplate({ onCommit }: { onCommit: () => void }) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <>
      <Button
        type="button"
        className="suprsend-h-7 suprsend-rounded suprsend-flex suprsend-items-center suprsend-gap-1.5"
        onClick={() => {
          setIsModalOpen(true);
        }}
      >
        <GitCommitHorizontal className="suprsend-h-3.5 suprsend-w-3.5" />
        <span className="suprsend-text-sm suprsend-font-medium">Commit</span>
      </Button>
      <CommitModal
        open={isModalOpen}
        onOpenChange={setIsModalOpen}
        onCommit={onCommit}
      />
    </>
  );
}

interface CommitModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCommit: () => void;
}

function CommitModal({ open, onOpenChange, onCommit }: CommitModalProps) {
  const [description, setDescription] = useState('');
  const [selectedFiles, setSelectedFiles] = useState<Record<string, boolean>>({
    'Email > Default Variant': true,
    'Email > Variant 1': true,
  } as Record<string, boolean>);

  const handleFileToggle = (file: string) => {
    setSelectedFiles((prev) => ({
      ...prev,
      [file]: !prev[file],
    }));
  };

  const handleCommit = () => {
    // Handle commit logic here
    console.log('Committing with description:', description);
    console.log('Selected files:', selectedFiles);
    onOpenChange(false);
    onCommit();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="suprsend-sm:suprsend-max-w-[600px]">
        <DialogHeader className="suprsend-pb-4">
          <DialogTitle>Commit changes</DialogTitle>
        </DialogHeader>
        <div className="suprsend-space-y-6">
          <div className="suprsend-space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              placeholder="A brief description about what changed"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="suprsend-min-h-[100px]"
            />
          </div>
          <div className="suprsend-space-y-3">
            <p className="suprsend-text-sm suprsend-text-muted-foreground">
              Below 2 files have been updated. Select the ones you want to
              commit
            </p>
            <div className="suprsend-space-y-3">
              {Object.keys(selectedFiles).map((file) => (
                <div
                  key={file}
                  className="suprsend-flex suprsend-items-center suprsend-space-x-3"
                >
                  <Checkbox
                    id={file}
                    checked={selectedFiles[file]}
                    onCheckedChange={() => handleFileToggle(file)}
                  />
                  <Label
                    htmlFor={file}
                    className="suprsend-text-sm suprsend-font-normal suprsend-cursor-pointer"
                  >
                    {file}
                  </Label>
                </div>
              ))}
            </div>
          </div>
        </div>
        <DialogFooter className="suprsend-pt-6">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleCommit}>Commit</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
