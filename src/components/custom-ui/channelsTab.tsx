import { type ReactNode, useState } from 'react';
import { MoreVertical, Trash2, Plus } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';

interface TabOption {
  id: string | number;
  label: string;
  icon?: ReactNode;
  onClick: () => void;
}

interface TabBarProps {
  options: TabOption[];
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

function TabItem({ tab, isSelected, onTabClick }: TabItemProps) {
  const icon = tab.icon;
  const [disableModalOpen, setDisableModalOpen] = useState(false);

  const handleClick = () => {
    onTabClick?.(tab.id);
  };

  const handleDisableChannel = () => {
    // TODO: Implement disable channel logic
    setDisableModalOpen(false);
  };

  return (
    <>
      <div
        className={cn(
          'suprsend-relative suprsend-flex suprsend-items-center suprsend-gap-2 suprsend-py-1.5 suprsend-pl-3 suprsend-text-sm suprsend-font-medium suprsend-cursor-pointer suprsend-flex-shrink-0',
          isSelected
            ? 'suprsend-text-primary'
            : 'suprsend-text-muted-foreground'
        )}
        onClick={handleClick}
      >
        {icon}
        {tab.label}

        <div className="suprsend-w-6 suprsend-flex suprsend-items-center suprsend-justify-center">
          {isSelected && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  className="suprsend-h-6 suprsend-flex suprsend-items-center suprsend-justify-center suprsend-rounded hover:suprsend-bg-accent"
                  onClick={(e) => e.stopPropagation()}
                >
                  <MoreVertical className="suprsend-size-4" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align="start"
                className="suprsend-min-w-[160px]"
              >
                <DropdownMenuItem
                  onClick={(e) => {
                    e.stopPropagation();
                    setDisableModalOpen(true);
                  }}
                  className="suprsend-text-destructive focus:suprsend-text-destructive"
                >
                  <Trash2 className="suprsend-size-4" />
                  <span>Disable Channel</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>

        {isSelected && (
          <div className="suprsend-absolute suprsend-bottom-0 suprsend-left-0 suprsend-right-0 suprsend-h-[2px] suprsend-bg-primary" />
        )}
      </div>

      <DisableChannelModal
        open={disableModalOpen}
        onOpenChange={setDisableModalOpen}
        channelName={tab.label}
        onConfirm={handleDisableChannel}
      />
    </>
  );
}

function DisableChannelModal({
  open,
  onOpenChange,
  channelName,
  onConfirm,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  channelName: string;
  onConfirm: () => void;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="suprsend-sm:suprsend-max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Disable Channel - {channelName}?</DialogTitle>
        </DialogHeader>
        <div className="suprsend-py-4">
          <p className="suprsend-text-sm suprsend-text-muted-foreground">
            Any updates made to this will be saved automatically. You can
            re-enable this channel anytime and continue where you left off.
          </p>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={() => {
              onConfirm();
            }}
          >
            Disable Channel
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export function TabBar({
  options,
  selectedChannel,
  onTabClick,
  ChannelsTabActionComponent,
  liveMode,
}: TabBarProps) {
  return (
    <div className="suprsend-flex suprsend-items-center suprsend-justify-between suprsend-flex-grow suprsend-gap-4 suprsend-border-b suprsend-border-border">
      <div className="suprsend-flex suprsend-items-center suprsend-mt-5 suprsend-min-w-0 suprsend-flex-1">
        <div className="suprsend-flex suprsend-items-center suprsend-overflow-x-auto suprsend-min-w-0 suprsend-max-w-full">
          {options?.map((tab) => (
            <TabItem
              key={tab.id}
              tab={tab}
              isSelected={selectedChannel === tab.id}
              onTabClick={onTabClick}
            />
          ))}
        </div>

        {!liveMode && (
          <button
            onClick={() => {}}
            className="suprsend-ml-2 suprsend-p-1 suprsend-rounded hover:suprsend-bg-accent suprsend-flex-shrink-0"
          >
            <Plus className="suprsend-size-5 suprsend-text-muted-foreground" />
          </button>
        )}
      </div>
      {ChannelsTabActionComponent && <ChannelsTabActionComponent />}
    </div>
  );
}
