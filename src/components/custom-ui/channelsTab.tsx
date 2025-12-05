import { type ReactNode } from 'react';
import {
  MoreVertical,
  Trash2,
  Plus,
  FileText,
  FlaskConical,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface TabOption {
  id: string | number;
  label: string;
  icon?: ReactNode;
  onClick: () => void;
}

interface TabBarProps {
  options: TabOption[];
  selectedId: string | number;
  onTabClick?: (id: string | number) => void;
}

interface TabItemProps {
  tab: TabOption;
  isSelected: boolean;
  onTabClick?: (id: string | number) => void;
}

function TabItem({ tab, isSelected, onTabClick }: TabItemProps) {
  const icon = tab.icon;

  const handleClick = () => {
    onTabClick?.(tab.id);
  };

  return (
    <div
      className={cn(
        'suprsend-relative suprsend-flex suprsend-items-center suprsend-gap-2 suprsend-py-1.5 suprsend-pl-3 suprsend-text-sm suprsend-font-medium suprsend-cursor-pointer',
        isSelected ? 'suprsend-text-primary' : 'suprsend-text-muted-foreground'
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
  );
}

function ActionButtons() {
  return (
    <div className="suprsend-flex suprsend-items-center suprsend-self-end suprsend-gap-2 suprsend-mr-2 suprsend-mb-1">
      <Button variant="outline" className="!suprsend-py-0 !suprsend-h-8">
        <FileText className="suprsend-h-2.5 suprsend-w-2.5" />
      </Button>

      <Button
        variant="outline"
        className="suprsend-gap-1 !suprsend-py-0 !suprsend-h-8"
      >
        <FlaskConical className="suprsend-h-2.5 suprsend-w-2.5" />
        <span className="suprsend-text-xs">Test</span>
      </Button>
    </div>
  );
}

export function TabBar({ options, selectedId, onTabClick }: TabBarProps) {
  return (
    <div className="suprsend-flex suprsend-items-center suprsend-justify-between suprsend-flex-grow suprsend-gap-4 suprsend-border-b suprsend-border-border suprsend-overflow-x-scroll">
      <div className="suprsend-flex suprsend-items-center suprsend-mt-5">
        {options?.map((tab) => (
          <TabItem
            key={tab.id}
            tab={tab}
            isSelected={selectedId === tab.id}
            onTabClick={onTabClick}
          />
        ))}

        <button
          onClick={() => {}}
          className="suprsend-ml-2 suprsend-p-1 suprsend-rounded hover:suprsend-bg-accent"
        >
          <Plus className="suprsend-size-5 suprsend-text-muted-foreground" />
        </button>
      </div>

      <ActionButtons />
    </div>
  );
}
