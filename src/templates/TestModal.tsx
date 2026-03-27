import { useState, useMemo, useEffect, useCallback } from 'react';
import {
  FlaskConical,
  Send,
  CircleCheck,
  Loader2,
  Info,
} from '@/assets/icons';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { useTemplateEditorContext } from '@/lib/TemplateEditorContext';
import { useChannelVariantMockTest } from '@/apis';
import type { ChannelId, TestButtonProps, TestModalIdentity } from '@/types';

// Maps channel id to identity $key
const CHANNEL_ID_TO_KEY: Record<string, string> = {
  email: '$email',
  sms: '$sms',
  whatsapp: '$whatsapp',
  slack: '$slack',
  ms_teams: '$ms_teams',
  androidpush: '$androidpush',
  iospush: '$iospush',
  webpush: '$webpush',
  inbox: '$inbox',
};

const IDENTITY_TYPE_MAP: Record<string, string> = {
  $email: 'email',
  $sms: 'sms',
  $whatsapp: 'whatsapp',
  $slack: 'slack',
  $ms_teams: 'ms_teams',
  $androidpush: 'androidpush',
  $iospush: 'iospush',
  $webpush: 'webpush',
  $inbox: 'inbox',
};

const CHANNEL_LABELS: Record<ChannelId, string> = {
  email: 'Email',
  sms: 'SMS',
  whatsapp: 'WhatsApp',
  slack: 'Slack',
  ms_teams: 'MS Teams',
  androidpush: 'Android Push',
  iospush: 'iOS Push',
  webpush: 'Web Push',
  inbox: 'In-app Inbox',
};

function getDisplayValue(entry: Record<string, unknown>): string {
  if (entry.value) return String(entry.value);
  if (entry.value_json) return JSON.stringify(entry.value_json);
  return '';
}

function parseChannelIdentities(
  identityData: Record<string, unknown> | null,
  channelId: string
) {
  if (!identityData || !channelId) return [];
  const key = CHANNEL_ID_TO_KEY[channelId];
  if (!key) return [];
  const values = identityData[key];
  if (!Array.isArray(values)) return [];
  return values.map((entry: Record<string, unknown>, idx: number) => ({
    idx,
    display: getDisplayValue(entry),
    raw: entry,
  }));
}

function buildIdentitiesForChannel(
  identityData: Record<string, unknown> | null,
  channelId: string,
  selectedStates: Record<number, boolean>
): TestModalIdentity[] {
  if (!identityData) return [];
  const key = CHANNEL_ID_TO_KEY[channelId];
  if (!key) return [];
  const values = identityData[key];
  if (!Array.isArray(values)) return [];

  const identityType = IDENTITY_TYPE_MAP[key];
  return values
    .filter((_: unknown, idx: number) => selectedStates[idx] !== false)
    .map((entry: Record<string, unknown>) => {
      const identity: TestModalIdentity = { identity_type: identityType };
      if (entry.value_json) {
        identity.value_json = entry.value_json as Record<string, unknown>;
      } else if (entry.value) {
        identity.value = String(entry.value);
      }
      if (entry.id_provider) identity.id_provider = String(entry.id_provider);
      return identity;
    });
}

interface TestModalContentProps {
  selectedChannel: ChannelId;
  identityData: Record<string, unknown> | null;
  onTestSent?: () => void;
}

function TestModalContent({
  selectedChannel,
  identityData,
  onTestSent,
}: TestModalContentProps) {
  const {
    templateSlug,
    variantId,
    recipientDistinctId,
    tenantId,
    notificationCategory,
    channels,
  } = useTemplateEditorContext();

  const distinctId = recipientDistinctId || '';

  const channelVariantMockTest = useChannelVariantMockTest();

  // Identities for the selected channel
  const channelIdentities = useMemo(
    () => parseChannelIdentities(identityData, selectedChannel),
    [identityData, selectedChannel]
  );

  const [identityStates, setIdentityStates] = useState<
    Record<number, boolean>
  >({});

  // Reset identity states when channel identities change
  useEffect(() => {
    const newStates: Record<number, boolean> = {};
    channelIdentities.forEach((i) => {
      newStates[i.idx] = true;
    });
    setIdentityStates(newStates);
  }, [channelIdentities]);

  const [isTestSent, setIsTestSent] = useState(false);
  const isSending = channelVariantMockTest.isPending;

  const channelLabel =
    CHANNEL_LABELS[selectedChannel] || selectedChannel;

  const handleSendTest = useCallback(async () => {
    if (!distinctId) return;

    const identities = buildIdentitiesForChannel(
      identityData,
      selectedChannel,
      identityStates
    );

    try {
      await channelVariantMockTest.mutateAsync({
        templateSlug,
        channel: selectedChannel,
        variantId,
        payload: {
          distinct_id: distinctId,
          identities,
          ...(notificationCategory && { category: notificationCategory }),
          ...(tenantId && { tenant_id: tenantId }),
        },
      });
      setIsTestSent(true);
      onTestSent?.();
    } catch {
      // error is available via channelVariantMockTest.error
    }
  }, [
    distinctId,
    identityData,
    selectedChannel,
    identityStates,
    templateSlug,
    variantId,
    notificationCategory,
    tenantId,
    onTestSent,
  ]);

  return (
    <div className="suprsend-space-y-4">
      <h2 className="suprsend-text-sm suprsend-font-semibold suprsend-leading-none suprsend-tracking-tight">
        Send Test
      </h2>

      <div className="suprsend-space-y-4">
        {/* Channel - disabled, shows the selected channel from context */}
        <div className="suprsend-space-y-1.5">
          <Label className="suprsend-text-xs">Channel</Label>
          <div className="suprsend-flex suprsend-h-9 suprsend-w-full suprsend-items-center suprsend-rounded-md suprsend-border suprsend-border-input suprsend-bg-muted suprsend-px-3 suprsend-text-sm suprsend-opacity-70">
            {channelLabel}
          </div>
        </div>

        {/* Variant - disabled, shows the current variantId */}
        <div className="suprsend-space-y-1.5">
          <Label className="suprsend-text-xs">Variant</Label>
          <div className="suprsend-flex suprsend-h-9 suprsend-w-full suprsend-items-center suprsend-rounded-md suprsend-border suprsend-border-input suprsend-bg-muted suprsend-px-3 suprsend-text-sm suprsend-opacity-70">
            {variantId}
          </div>
        </div>

        {/* Recipient - disabled, shows recipientDistinctId */}
        <div className="suprsend-space-y-1.5">
          <Label className="suprsend-text-xs">Recipient</Label>
          <div className="suprsend-flex suprsend-h-9 suprsend-w-full suprsend-items-center suprsend-rounded-md suprsend-border suprsend-border-input suprsend-bg-muted suprsend-px-3 suprsend-text-sm suprsend-opacity-70">
            {distinctId || '-'}
          </div>
        </div>

        {/* Channel identities */}
        {distinctId && selectedChannel && (
          <div className="suprsend-space-y-2">
            <Label className="suprsend-text-xs">
              {channelLabel} identities
            </Label>
            {channelIdentities.length > 0 ? (
              <div className="suprsend-space-y-0">
                {channelIdentities.map((identity) => (
                  <div
                    key={identity.idx}
                    className="suprsend-flex suprsend-items-center suprsend-gap-2 suprsend-py-1.5 first:suprsend-pt-0"
                  >
                    <Checkbox
                      checked={identityStates[identity.idx] ?? true}
                      onCheckedChange={(checked) => {
                        setIdentityStates((prev) => ({
                          ...prev,
                          [identity.idx]: checked === true,
                        }));
                      }}
                      className="suprsend-h-3.5 suprsend-w-3.5"
                    />
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <span className="suprsend-text-xs suprsend-text-foreground suprsend-truncate suprsend-max-w-[380px] suprsend-block">
                            {identity.display}
                          </span>
                        </TooltipTrigger>
                        <TooltipContent>{identity.display}</TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>
                ))}
              </div>
            ) : (
              <p className="suprsend-text-xs suprsend-text-muted-foreground">
                No {channelLabel.toLowerCase()} identities found for this
                recipient
              </p>
            )}
          </div>
        )}

        {/* Notification Category - disabled */}
        <div className="suprsend-space-y-1.5">
          <div className="suprsend-flex suprsend-items-center suprsend-gap-1">
            <Label className="suprsend-text-xs">
              Notification Category
            </Label>
            <TooltipProvider delayDuration={0}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <span>
                    <Info className="suprsend-h-3 suprsend-w-3 suprsend-text-muted-foreground" />
                  </span>
                </TooltipTrigger>
                <TooltipContent>
                  This is used to fetch vendor configuration
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
          <div className="suprsend-flex suprsend-h-9 suprsend-w-full suprsend-items-center suprsend-rounded-md suprsend-border suprsend-border-input suprsend-bg-muted suprsend-px-3 suprsend-text-sm suprsend-opacity-70">
            {notificationCategory || '-'}
          </div>
        </div>

        {/* Tenant ID - disabled */}
        <div className="suprsend-space-y-1.5">
          <Label className="suprsend-text-xs">Tenant ID</Label>
          <div className="suprsend-flex suprsend-h-9 suprsend-w-full suprsend-items-center suprsend-rounded-md suprsend-border suprsend-border-input suprsend-bg-muted suprsend-px-3 suprsend-text-sm suprsend-opacity-70">
            {tenantId || '-'}
          </div>
        </div>
      </div>

      {/* Error message */}
      {channelVariantMockTest.isError && (
        <p className="suprsend-text-xs suprsend-text-destructive">
          {(channelVariantMockTest.error as { data?: { message?: string } })
            ?.data?.message || 'Error sending test'}
        </p>
      )}

      {/* Actions */}
      <div className="suprsend-flex suprsend-items-center suprsend-gap-2 suprsend-pt-2">
        <Button
          onClick={handleSendTest}
          className="suprsend-gap-1.5 suprsend-h-7 suprsend-text-xs"
          disabled={
            isSending ||
            !distinctId ||
            !channels.includes(selectedChannel)
          }
        >
          {isSending ? (
            <Loader2
              className="suprsend-h-3.5 suprsend-w-3.5"
              style={{ animation: 'spin 1s linear infinite' }}
            />
          ) : (
            <Send className="suprsend-h-3.5 suprsend-w-3.5" />
          )}
          {isSending ? 'Sending...' : 'Send Test'}
        </Button>
        {isTestSent && (
          <div className="suprsend-flex suprsend-items-center suprsend-gap-1.5 suprsend-text-xs">
            <CircleCheck className="suprsend-h-3.5 suprsend-w-3.5 suprsend-text-green-600" />
            <span className="suprsend-text-green-600">Test sent!</span>
          </div>
        )}
      </div>
    </div>
  );
}

export default function TestButton({
  onTestSent,
  selectedChannel,
  identityData,
}: TestButtonProps & { selectedChannel: ChannelId; identityData: Record<string, unknown> | null }) {
  const [isOpen, setIsOpen] = useState(false);
  const [modalKey, setModalKey] = useState(0);

  const handleOpenChange = (open: boolean) => {
    setIsOpen(open);
    if (!open) {
      setModalKey((prev) => prev + 1);
    }
  };

  return (
    <Popover open={isOpen} onOpenChange={handleOpenChange}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className="suprsend-gap-1 !suprsend-py-0 !suprsend-h-8"
        >
          <FlaskConical className="suprsend-h-3.5 suprsend-w-3.5 suprsend-text-muted-foreground" />
          <span className="suprsend-text-sm">Test</span>
        </Button>
      </PopoverTrigger>
      <PopoverContent
        align="end"
        className="suprsend-w-[420px] suprsend-max-w-[90vw] suprsend-p-4"
      >
        <TestModalContent
          key={modalKey}
          selectedChannel={selectedChannel}
          identityData={identityData}
          onTestSent={onTestSent}
        />
      </PopoverContent>
    </Popover>
  );
}
