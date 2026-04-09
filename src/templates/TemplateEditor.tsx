import { useEffect } from 'react';
import { TabBar } from './channels/ChannelsTab';
import EmailChannel from '@/templates/channels/email';
import IOSPushChannel from '@/templates/channels/iospush';
import WebpushChannel from '@/templates/channels/webpush';
import MSTeamsChannel from '@/templates/channels/msteams';
import SlackChannel from '@/templates/channels/slack';
import AndroidPushChannel from '@/templates/channels/androidpush';
import WhatsappChannel from '@/templates/channels/whatsapp';
import SMSChannel from '@/templates/channels/sms';
import InboxChannel from '@/templates/channels/inbox';
import TestButton from '@/templates/TestModal';
import CommitButton from '@/templates/Commit';
import type {
  ChannelId,
  ChannelActionsProps,
  SuprSendTemplateEditorProps,
} from '@/types';
import { useTemplateEditorContext } from '@/lib/TemplateEditorContext';
import {
  useMockData,
  useVariantDetails,
  useTranslationLocaleData,
  isHttpError,
} from '@/apis';
import { FileX, Loader2, Pencil, X } from '@/assets/icons';
import { Button } from '@/components/ui/button';

function ChannelActions({
  isLive,
  hideActionButtons,
  hideTestButton,
  onCommit,
  setMode,
}: ChannelActionsProps) {
  if (hideActionButtons) return null;
  return (
    <>
      {!isLive && (
        <Button
          variant="outline"
          className="suprsend-gap-1 !suprsend-py-0 !suprsend-h-8"
          onClick={() => setMode('live')}
        >
          <X className="suprsend-h-3.5 suprsend-w-3.5 suprsend-text-muted-foreground" />
          <span className="suprsend-text-sm">Exit</span>
        </Button>
      )}
      {!hideTestButton && <TestButton />}
      {isLive ? (
        <Button
          variant="outline"
          className="suprsend-gap-1 !suprsend-py-0 !suprsend-h-8"
          onClick={() => setMode('draft')}
        >
          <Pencil className="suprsend-h-3.5 suprsend-w-3.5 suprsend-text-muted-foreground" />
          <span className="suprsend-text-sm">Edit</span>
        </Button>
      ) : (
        <CommitButton onCommit={onCommit ?? (() => {})} />
      )}
    </>
  );
}

export default function SuprSendTemplateEditor({
  hideChannelsTab = false,
  hideActionButtons = false,
  hideTestButton = false,
  onCommit,
}: SuprSendTemplateEditorProps) {
  const {
    channels,
    templateSlug,
    variantId,
    isLive,
    setMode,
    selectedChannel,
    setSelectedChannel,
    translationLocale,
  } = useTemplateEditorContext();

  const { data: variantData, error: variantError } = useVariantDetails({
    chanelSlug: selectedChannel as string,
    templateSlug,
    variantId,
  });

  const { data: mockData } = useMockData({ templateSlug });
  const { data: translationLocaleData } =
    useTranslationLocaleData(translationLocale);

  const variables: Record<string, unknown> = {
    ...(mockData?.transformed_data ?? {}),
    ...(translationLocaleData?.translations && {
      __translations: translationLocaleData.translations,
    }),
  };

  useEffect(() => {
    if (channels.length > 0) {
      setSelectedChannel(channels[0]);
    }
  }, [channels]);

  const isNotFound = isHttpError(variantError) && variantError.status === 404;

  if (isNotFound) {
    return (
      <div className="suprsend-flex suprsend-flex-col suprsend-items-center suprsend-mt-32 suprsend-h-full suprsend-min-h-[400px] suprsend-text-sm">
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
      <div className="suprsend-flex suprsend-h-full suprsend-items-center suprsend-justify-center suprsend-bg-background suprsend-z-10 suprsend-text-sm">
        <Loader2
          className="suprsend-h-6 suprsend-w-6 suprsend-text-muted-foreground"
          style={{ animation: 'spin 1s linear infinite' }}
        />
      </div>
    );
  }
  return (
    <div className="suprsend-h-full suprsend-flex suprsend-flex-col suprsend-text-sm">
      {!hideChannelsTab && (
        <TabBar
          channels={channels}
          selectedChannel={selectedChannel}
          onTabClick={(id) => setSelectedChannel(id as ChannelId)}
          ChannelsTabActionComponent={
            <ChannelActions
              isLive={isLive}
              hideActionButtons={hideActionButtons}
              hideTestButton={hideTestButton}
              onCommit={onCommit}
              setMode={setMode}
            />
          }
        />
      )}
      <div className="suprsend-flex-1 suprsend-min-h-0 suprsend-overflow-hidden">
        {selectedChannel === 'email' && (
          <EmailChannel variantData={variantData} variables={variables} />
        )}
        {selectedChannel === 'sms' && (
          <SMSChannel variantData={variantData} variables={variables} />
        )}
        {selectedChannel === 'inbox' && (
          <InboxChannel variantData={variantData} variables={variables} />
        )}
        {selectedChannel === 'whatsapp' && (
          <WhatsappChannel variantData={variantData} variables={variables} />
        )}
        {selectedChannel === 'slack' && (
          <SlackChannel variantData={variantData} variables={variables} />
        )}
        {selectedChannel === 'ms_teams' && (
          <MSTeamsChannel variantData={variantData} variables={variables} />
        )}
        {selectedChannel === 'androidpush' && (
          <AndroidPushChannel variantData={variantData} variables={variables} />
        )}
        {selectedChannel === 'iospush' && (
          <IOSPushChannel variantData={variantData} variables={variables} />
        )}
        {selectedChannel === 'webpush' && (
          <WebpushChannel variantData={variantData} variables={variables} />
        )}
      </div>
    </div>
  );
}
