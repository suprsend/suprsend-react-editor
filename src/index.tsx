import { useState } from 'react';
import './index.css';
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

export function SuprSendTemplateEditor() {
  const [selectedChannel, setSelectedChannel] = useState<string | number>(
    'email'
  );

  return (
    <div>
      <TabBar
        options={CHANNELS}
        selectedChannel={selectedChannel}
        onTabClick={(id) => setSelectedChannel(id)}
      />
      {selectedChannel === 'email' && <EmailChannel />}
    </div>
  );
}
