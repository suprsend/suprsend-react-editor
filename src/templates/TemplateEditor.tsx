import { useEffect, useState } from 'react';
import { TabBar } from '@/components/custom-ui/channelsTab';
import EmailChannel from '@/templates/channels/email';
import IOSPushChannel from '@/templates/channels/IOSPush';
import WebpushChannel from '@/templates/channels/webpush';
import MSTeamsChannel from '@/templates/channels/msteams';
import SlackChannel from '@/templates/channels/slack';
import type { SuprSendTemplateEditorProps } from '@/types';
import { useTemplateEditorContext } from '@/lib/TemplateEditorContext';
import { useMockData, useVariantDetails } from '@/apis';
import axios from 'axios';
import { FileX, Loader2 } from 'lucide-react';

export default function SuprSendTemplateEditor({
  hideChannelsTab = false,
}: SuprSendTemplateEditorProps) {
  const { channels, templateSlug, variantId } = useTemplateEditorContext();
  const [selectedChannel, setSelectedChannel] = useState<string | number>(
    channels[0]
  );

  const { data: variantData, error: variantError } = useVariantDetails({
    chanelSlug: channels[0],
    templateSlug,
    variantId,
  });

  // TODO: if mock data api errors then what to do
  const { data: mockData } = useMockData({ templateSlug });

  useEffect(() => {
    if (channels.length > 0) {
      setSelectedChannel(channels[0]);
    }
  }, [channels]);

  const isNotFound =
    axios.isAxiosError(variantError) && variantError.response?.status === 404;

  if (isNotFound) {
    return (
      <div className="suprsend-flex suprsend-flex-col suprsend-items-center suprsend-mt-32 suprsend-h-full suprsend-min-h-[400px]">
        <div className="suprsend-flex suprsend-items-center suprsend-justify-center suprsend-w-16 suprsend-h-16 suprsend-rounded-full suprsend-bg-muted suprsend-mb-4">
          <FileX className="suprsend-w-8 suprsend-h-8 suprsend-text-muted-foreground" />
        </div>
        <h3 className="suprsend-text-base suprsend-font-semibold suprsend-text-foreground suprsend-mb-2">
          Variant not found
        </h3>
        <p className="suprsend-text-sm suprsend-text-muted-foreground suprsend-text-center suprsend-max-w-md">
          The requested variant could not be found. It may have been deleted or
          the URL is incorrect.
        </p>
      </div>
    );
  }
  if (!selectedChannel || !variantData || !mockData) {
    return (
      <div className="suprsend-flex suprsend-h-full suprsend-items-center suprsend-justify-center suprsend-bg-background suprsend-z-10">
        <Loader2
          className="suprsend-h-6 suprsend-w-6 suprsend-text-muted-foreground"
          style={{ animation: 'spin 1s linear infinite' }}
        />
      </div>
    );
  }
  return (
    <div className="suprsend-h-full suprsend-flex suprsend-flex-col">
      {!hideChannelsTab && (
        <TabBar
          channels={channels}
          selectedChannel={selectedChannel}
          onTabClick={(id) => setSelectedChannel(id)}
        />
      )}
      <div className="suprsend-flex-1 suprsend-min-h-0 suprsend-overflow-hidden">
        {selectedChannel === 'email' && (
          <EmailChannel
            variantData={variantData}
            variables={mockData?.transformed_data ?? {}}
          />
        )}
        {selectedChannel === 'sms' && <p>SMS Channel Editor Coming Soon...</p>}
        {selectedChannel === 'inbox' && (
          <p>In-app Inbox Channel Editor Coming Soon...</p>
        )}
        {selectedChannel === 'whatsapp' && (
          <p>WhatsApp Channel Editor Coming Soon...</p>
        )}
        {selectedChannel === 'slack' && (
          <SlackChannel
            variantData={variantData}
            variables={mockData?.transformed_data ?? {}}
          />
        )}
        {selectedChannel === 'ms_teams' && (
          <MSTeamsChannel
            variantData={variantData}
            variables={mockData?.transformed_data ?? {}}
          />
        )}
        {selectedChannel === 'androidpush' && (
          <p>Android Push Channel Editor Coming Soon...</p>
        )}
        {selectedChannel === 'iospush' && (
          <IOSPushChannel
            variantData={variantData}
            variables={mockData?.transformed_data ?? {}}
          />
        )}
        {selectedChannel === 'webpush' && (
          <WebpushChannel
            variantData={variantData}
            variables={mockData?.transformed_data ?? {}}
          />
        )}
      </div>
    </div>
  );
}
