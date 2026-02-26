'use client';

import * as React from 'react';
import Select, {
  type GroupBase,
  type Options,
  type OptionsOrGroups,
  type Props as SelectProps,
  type SelectInstance,
  type ControlProps,
  type MenuProps,
  type MenuListProps,
  type OptionProps,
  type MultiValueProps,
  type DropdownIndicatorProps,
  type ClearIndicatorProps,
  type NoticeProps,
  type GroupHeadingProps,
  type LoadingIndicatorProps,
  type ValueContainerProps,
  type PlaceholderProps,
} from 'react-select';
import AsyncSelect from 'react-select/async';
import CreatableSelect from 'react-select/creatable';
import AsyncCreatableSelect from 'react-select/async-creatable';
import { Check, ChevronDown, Loader2, X } from 'lucide-react';

import { cn } from '@/lib/utils';

/* -------------------------------------------------------------------------- */
/*                                   Types                                    */
/* -------------------------------------------------------------------------- */

export type DefaultOption = {
  label: string;
  value: string;
};

export interface ReactSelectProps<
  Option = DefaultOption,
  IsMulti extends boolean = false,
  Group extends GroupBase<Option> = GroupBase<Option>,
> extends SelectProps<Option, IsMulti, Group> {
  variant?: 'default' | 'async' | 'creatable' | 'async-creatable';
  /** Async: function that returns a promise of options */
  loadOptions?: (
    inputValue: string,
    callback: (options: OptionsOrGroups<Option, Group>) => void
  ) => Promise<OptionsOrGroups<Option, Group>> | void;
  /** Async: default options shown before user searches. `true` auto-loads via loadOptions('') */
  defaultOptions?: OptionsOrGroups<Option, Group> | boolean;
  /** Async: cache loaded results */
  cacheOptions?: boolean;
  /** Creatable: callback when a new option is created */
  onCreateOption?: (inputValue: string) => void;
  /** Creatable: custom label for the "create new" option */
  formatCreateLabel?: (inputValue: string) => React.ReactNode;
  /** Creatable: whether the current input is a valid new option */
  isValidNewOption?: (
    inputValue: string,
    value: Options<Option>,
    options: OptionsOrGroups<Option, Group>
  ) => boolean;
  /** Creatable: position of the create option in the menu */
  createOptionPosition?: 'first' | 'last';
  /** Creatable: allow creating while async results load */
  allowCreateWhileLoading?: boolean;
  /** Creatable: return data shape for a newly created option */
  getNewOptionData?: (inputValue: string, optionLabel: React.ReactNode) => Option;
}

/* -------------------------------------------------------------------------- */
/*                     Shared component prop type aliases                     */
/* -------------------------------------------------------------------------- */

/* eslint-disable @typescript-eslint/no-explicit-any */
type AnyGroup = GroupBase<any>;
type SharedControlProps = ControlProps<any, boolean, AnyGroup>;
type SharedMenuProps = MenuProps<any, boolean, AnyGroup>;
type SharedMenuListProps = MenuListProps<any, boolean, AnyGroup>;
type SharedOptionProps = OptionProps<any, boolean, AnyGroup>;
type SharedMultiValueProps = MultiValueProps<any, boolean, AnyGroup>;
type SharedDropdownIndicatorProps = DropdownIndicatorProps<any, boolean, AnyGroup>;
type SharedClearIndicatorProps = ClearIndicatorProps<any, boolean, AnyGroup>;
type SharedNoticeProps = NoticeProps<any, boolean, AnyGroup>;
type SharedGroupHeadingProps = GroupHeadingProps<any, boolean, AnyGroup>;
type SharedLoadingIndicatorProps = LoadingIndicatorProps<any, boolean, AnyGroup>;
type SharedPlaceholderProps = PlaceholderProps<any, boolean, AnyGroup>;
type SharedValueContainerProps = ValueContainerProps<any, boolean, AnyGroup>;
/* eslint-enable @typescript-eslint/no-explicit-any */

/* -------------------------------------------------------------------------- */
/*                          Styled Component Overrides                        */
/* -------------------------------------------------------------------------- */

function StyledControl({ children, innerRef, innerProps, isFocused }: SharedControlProps) {
  return (
    <div
      ref={innerRef}
      {...innerProps}
      className={cn(
        'suprsend-flex suprsend-min-h-9 suprsend-w-full suprsend-items-center suprsend-justify-between suprsend-gap-1 suprsend-rounded-md suprsend-border suprsend-border-input suprsend-bg-transparent suprsend-px-3 suprsend-py-1.5 suprsend-text-sm suprsend-shadow-sm suprsend-ring-offset-background',
        isFocused && 'suprsend-outline-none suprsend-ring-1 suprsend-ring-ring'
      )}
    >
      {children}
    </div>
  );
}

function StyledMenu({ children, innerRef, innerProps }: SharedMenuProps) {
  return (
    <div
      ref={innerRef}
      {...innerProps}
      className="suprsend-relative suprsend-z-50 suprsend-mt-1 suprsend-min-w-[8rem] suprsend-overflow-hidden suprsend-rounded-md suprsend-border suprsend-bg-popover suprsend-text-popover-foreground suprsend-shadow-md"
    >
      {children}
    </div>
  );
}

function StyledMenuList({ children, innerRef, innerProps }: SharedMenuListProps) {
  return (
    <div
      ref={innerRef}
      {...innerProps}
      className="suprsend-max-h-60 suprsend-overflow-y-auto suprsend-p-1"
    >
      {children}
    </div>
  );
}

function StyledOption({ innerRef, innerProps, isFocused, isSelected, label }: SharedOptionProps) {
  return (
    <div
      ref={innerRef}
      {...innerProps}
      className={cn(
        'suprsend-relative suprsend-flex suprsend-w-full suprsend-cursor-default suprsend-select-none suprsend-items-center suprsend-rounded-sm suprsend-py-1.5 suprsend-pl-2 suprsend-pr-8 suprsend-text-sm suprsend-outline-none',
        isFocused && 'suprsend-bg-accent suprsend-text-accent-foreground'
      )}
    >
      {label}
      {isSelected && (
        <span className="suprsend-absolute suprsend-right-2 suprsend-flex suprsend-h-3.5 suprsend-w-3.5 suprsend-items-center suprsend-justify-center">
          <Check className="suprsend-h-4 suprsend-w-4" />
        </span>
      )}
    </div>
  );
}

function StyledValueContainer({ children, innerProps }: SharedValueContainerProps) {
  return (
    <div
      {...innerProps}
      className="suprsend-relative suprsend-flex suprsend-flex-1 suprsend-flex-wrap suprsend-items-center suprsend-gap-1 suprsend-overflow-hidden"
    >
      {children}
    </div>
  );
}

function StyledPlaceholder({ children, innerProps }: SharedPlaceholderProps) {
  return (
    <div
      {...innerProps}
      className="suprsend-absolute suprsend-top-1/2 suprsend-left-0 -suprsend-translate-y-1/2 suprsend-text-muted-foreground suprsend-pointer-events-none"
    >
      {children}
    </div>
  );
}

function StyledMultiValue({ children, removeProps }: SharedMultiValueProps) {
  return (
    <div className="suprsend-inline-flex suprsend-items-center suprsend-rounded-md suprsend-border suprsend-bg-secondary suprsend-text-xs suprsend-font-medium suprsend-text-secondary-foreground">
      <span className="suprsend-px-1.5 suprsend-py-0.5">{children}</span>
      <div
        {...removeProps}
        className="suprsend-flex suprsend-items-center suprsend-px-1 suprsend-py-0.5 suprsend-rounded-r-md suprsend-cursor-pointer suprsend-opacity-60 hover:suprsend-opacity-100"
      >
        <X className="suprsend-h-3 suprsend-w-3" />
      </div>
    </div>
  );
}

function StyledMultiValueRemove() {
  return null;
}

function StyledDropdownIndicator({ innerProps }: SharedDropdownIndicatorProps) {
  return (
    <div {...innerProps} className="suprsend-flex suprsend-items-center">
      <ChevronDown className="suprsend-h-4 suprsend-w-4 suprsend-opacity-50" />
    </div>
  );
}

function StyledClearIndicator({ innerProps }: SharedClearIndicatorProps) {
  return (
    <div {...innerProps} className="suprsend-flex suprsend-items-center suprsend-cursor-pointer">
      <X className="suprsend-h-4 suprsend-w-4 suprsend-opacity-50 hover:suprsend-opacity-100" />
    </div>
  );
}

function StyledNoOptionsMessage({ innerProps }: SharedNoticeProps) {
  return (
    <div {...innerProps} className="suprsend-py-6 suprsend-text-center suprsend-text-sm suprsend-text-muted-foreground">
      No options found.
    </div>
  );
}

function StyledLoadingMessage({ innerProps }: SharedNoticeProps) {
  return (
    <div {...innerProps} className="suprsend-py-6 suprsend-text-center suprsend-text-sm suprsend-text-muted-foreground">
      Loading...
    </div>
  );
}

function StyledGroupHeading({ children }: SharedGroupHeadingProps) {
  return (
    <div className="suprsend-px-2 suprsend-py-1.5 suprsend-text-sm suprsend-font-semibold">
      {children}
    </div>
  );
}

function StyledLoadingIndicator({ innerProps }: SharedLoadingIndicatorProps) {
  return (
    <div {...innerProps}>
      <Loader2 className="suprsend-h-4 suprsend-w-4 suprsend-animate-spin suprsend-text-muted-foreground" />
    </div>
  );
}

function StyledIndicatorSeparator() {
  return null;
}

const sharedComponents = {
  Control: StyledControl,
  ValueContainer: StyledValueContainer,
  Menu: StyledMenu,
  MenuList: StyledMenuList,
  Option: StyledOption,
  MultiValue: StyledMultiValue,
  MultiValueRemove: StyledMultiValueRemove,
  DropdownIndicator: StyledDropdownIndicator,
  ClearIndicator: StyledClearIndicator,
  NoOptionsMessage: StyledNoOptionsMessage,
  LoadingMessage: StyledLoadingMessage,
  GroupHeading: StyledGroupHeading,
  LoadingIndicator: StyledLoadingIndicator,
  IndicatorSeparator: StyledIndicatorSeparator,
  Placeholder: StyledPlaceholder,
};

/* -------------------------------------------------------------------------- */
/*                             Main Wrapper Component                         */
/* -------------------------------------------------------------------------- */

const selectVariants = {
  default: Select,
  async: AsyncSelect,
  creatable: CreatableSelect,
  'async-creatable': AsyncCreatableSelect,
} as const;

function ReactSelectInner<
  Option = DefaultOption,
  IsMulti extends boolean = false,
  Group extends GroupBase<Option> = GroupBase<Option>,
>(
  {
    variant = 'default',
    components: customComponents,
    styles: customStyles,
    unstyled = true,
    ...rest
  }: ReactSelectProps<Option, IsMulti, Group>,
  ref: React.Ref<unknown>
) {
  const Component = selectVariants[variant] as typeof Select;

  const baseStyles = {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    input: (provided: any) => ({
      ...provided,
      border: 'none',
      outline: 'none',
      boxShadow: 'none',
      background: 'transparent',
      padding: 0,
      margin: 0,
      '& input': {
        border: 'none !important',
        outline: 'none !important',
        boxShadow: 'none !important',
      },
    }),
    ...customStyles,
  };

  return (
    <Component
      ref={ref as React.Ref<SelectInstance<Option, IsMulti, Group>>}
      unstyled={unstyled}
      components={
        { ...sharedComponents, ...customComponents } as Partial<
          typeof customComponents
        >
      }
      styles={baseStyles}
      {...rest}
    />
  );
}

export const ReactSelect = React.forwardRef(ReactSelectInner) as <
  Option = DefaultOption,
  IsMulti extends boolean = false,
  Group extends GroupBase<Option> = GroupBase<Option>,
>(
  props: ReactSelectProps<Option, IsMulti, Group> & {
    ref?: React.Ref<unknown>;
  }
) => React.ReactElement | null;

(ReactSelect as { displayName?: string }).displayName = 'ReactSelect';
