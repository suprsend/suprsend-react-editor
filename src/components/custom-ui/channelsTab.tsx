import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';
import type { ChannelId } from '@/types';
import {
  AndroidPushIcon,
  EmailIcon,
  InappIcon,
  IOSPushIcon,
  MSTeamsIcon,
  SlackIcon,
  SMSIcon,
  WebpushIcon,
  WhatsappIcon,
} from '@/assets/icons';

interface TabOption {
  id: string | number;
  label: string;
  icon?: ReactNode;
  onClick: () => void;
}

interface TabBarProps {
  channels: ChannelId[];
  selectedChannel: string | number;
  onTabClick?: (id: string | number) => void;
  ChannelsTabActionComponent?: React.ComponentType;
  liveMode?: boolean;
}

interface TabItemProps {
  tab: TabOption;
  isSelected: boolean;
  onTabClick?: (id: string | number) => void;
}

interface Channel {
  id: ChannelId;
  label: string;
  icon: React.ReactNode;
  onClick: () => void;
}

const CHANNELS: Channel[] = [
  {
    id: 'androidpush',
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
    id: 'inbox',
    label: 'In-app Inbox',
    icon: <InappIcon className="suprsend-w-3.5 suprsend-h-3.5" />,
    onClick: () => {},
  },
  {
    id: 'iospush',
    label: 'iOS Push',
    icon: <IOSPushIcon className="suprsend-w-3.5 suprsend-h-3.5" />,
    onClick: () => {},
  },
  {
    id: 'ms_teams',
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

function TabItem({ tab, isSelected, onTabClick }: TabItemProps) {
  return (
    <div
      className={cn(
        'suprsend-relative suprsend-flex suprsend-items-center suprsend-gap-2 suprsend-py-1.5 suprsend-px-3 suprsend-text-sm suprsend-font-medium suprsend-cursor-pointer suprsend-flex-shrink-0',
        isSelected ? 'suprsend-text-primary' : 'suprsend-text-muted-foreground'
      )}
      onClick={() => onTabClick?.(tab.id)}
    >
      {tab.icon}
      {tab.label}

      {isSelected && (
        <div className="suprsend-absolute suprsend-bottom-0 suprsend-left-0 suprsend-right-0 suprsend-h-[2px] suprsend-bg-primary" />
      )}
    </div>
  );
}

export function TabBar({ channels, selectedChannel, onTabClick, ChannelsTabActionComponent }: TabBarProps) {
  const channelMetaData = CHANNELS.filter((channel) =>
    channels.includes(channel.id)
  );

  return (
    <div className="suprsend-flex suprsend-items-center suprsend-justify-between suprsend-gap-4 suprsend-border-b suprsend-border-border">
      <div className="suprsend-flex suprsend-items-center suprsend-mt-5 suprsend-min-w-0 suprsend-flex-1">
        <div className="suprsend-flex suprsend-items-center suprsend-overflow-x-auto suprsend-min-w-0 suprsend-max-w-full">
          {channelMetaData?.map((tab) => (
            <TabItem
              key={tab.id}
              tab={tab}
              isSelected={selectedChannel === tab.id}
              onTabClick={onTabClick}
            />
          ))}
        </div>
      </div>
      {ChannelsTabActionComponent && (
        <div className="suprsend-flex suprsend-items-center suprsend-gap-2 suprsend-px-2 suprsend-shrink-0">
          <ChannelsTabActionComponent />
        </div>
      )}
    </div>
  );
}
