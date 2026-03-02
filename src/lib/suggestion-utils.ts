// --- Types ---

export interface CaretCoordinates {
  top: number;
  left: number;
}

export interface DataTypeSection {
  id: string;
  label: string;
}

// --- Constants ---

export const DATA_TYPE_SECTIONS: DataTypeSection[] = [
  { id: 'data', label: 'Input Payload' },
  { id: '$actor', label: 'Actor' },
  { id: '$recipient', label: 'Recipient' },
  { id: '$brand', label: 'Tenant' },
  { id: 'preference', label: 'Preference' },
];

export const CustomHelpers: Record<string, string> = {
  default: "{{default key 'default_value'}}",
  compare:
    "{{#compare key '==' 'value'}}true_block{{else}}false_block{{/compare}}",
  if: '{{#if key}}true_block{{else}}false_block{{/if}}',
  each: '{{#each array_object}} {{variable_key}} {{/each}}',
  'datetime-format': "{{datetime-format variable 'format string' 'timezone'}}",
  add: '{{add number1 number2}}',
  subtract: '{{subtract number1 number2}}',
  multiply: '{{multiply number1 number2}}',
  divide: '{{divide number1 number2}}',
  round: '{{round float}}',
  mod: '{{mod dividend divisor}}',
  unique: "{{unique variable 'key' }}",
  itemAt: '{{itemAt variable index }}',
  join: "{{join variable 'separator'}}",
  length: '{{length variable}}',
  jsonStringify: '{{jsonStringify json}}',
  jsonParse: "{{jsonParse 'jsonString'}}",
  jsonPath: "{{jsonPath object 'path'}}",
  lowercase: "{{lowercase 'string'}}",
  uppercase: "{{uppercase 'string'}}",
  capitalize: "{{capitalize 'string'}}",
};

export const HELPER_NAMES = new Set(Object.keys(CustomHelpers));

// --- Utility functions ---

export function isEmpty(obj: unknown): boolean {
  if (obj == null) return true;
  if (typeof obj === 'object') return Object.keys(obj as object).length === 0;
  return false;
}

export function validObjectKey(str: string): boolean {
  return /^[A-Za-z0-9_$]*$/.test(str);
}

export function flatten(
  data: Record<string, unknown>
): Record<string, unknown> {
  const result: Record<string, unknown> = {};

  function recurse(cur: unknown, prop: string) {
    if (Object(cur) !== cur) {
      result[prop] = cur;
    } else if (Array.isArray(cur)) {
      const length = cur.length;
      for (let i = 0; i < length; i++) {
        recurse(cur[i], `${prop}.[0]`);
      }
      if (length === 0) {
        result[prop] = [];
      }
    } else {
      let isEmptyObj = true;
      for (const p in cur as Record<string, unknown>) {
        isEmptyObj = false;
        let newKey = p;
        if (prop) {
          newKey = validObjectKey(newKey) ? `${prop}.${p}` : `${prop}.[${p}]`;
        }
        recurse((cur as Record<string, unknown>)[p], newKey);
      }
      if (isEmptyObj && prop) {
        result[prop] = {};
      }
    }
  }

  const modifiedData: Record<string, unknown> = {};
  for (const key in data) {
    if (validObjectKey(key)) {
      modifiedData[key] = data[key];
    } else {
      modifiedData[`[${key}]`] = data[key];
    }
  }

  recurse(modifiedData, '');
  return result;
}

export function getLabel(value: string): string | null {
  if (!value) return null;

  const splitDotted = value.split('.');
  splitDotted.forEach((item, index) => {
    if (item.startsWith('[') && item !== '[0]') {
      splitDotted[index] = item.substring(1, item.length - 1);
    }
  });

  let formattedValue = splitDotted.join('.');
  formattedValue = formattedValue.split('.[0]').join('[]');
  formattedValue = formattedValue.split('.').join(' > ');

  return formattedValue;
}

export function getOptionsList({
  variables,
  selectedSection,
}: {
  variables: Record<string, unknown>;
  selectedSection: string;
}): Record<string, unknown> {
  if (selectedSection === 'custom_helpers') {
    return CustomHelpers;
  } else if (selectedSection === 'preference') {
    return {
      $embedded_preference_url: '{{$embedded_preference_url}}',
      $hosted_preference_url: '{{$hosted_preference_url}}',
    };
  } else if (selectedSection === 'data') {
    if (variables.$batched_events_count) {
      return flatten({
        $batched_events: variables.$batched_events,
        $batched_events_count: variables.$batched_events_count,
      } as Record<string, unknown>);
    }
    const filtered: Record<string, unknown> = {};
    for (const key of Object.keys(variables)) {
      if (!key.startsWith('$')) {
        filtered[key] = variables[key];
      }
    }
    return flatten(filtered);
  } else {
    const selectedVariables = variables?.[selectedSection];
    if (isEmpty(selectedVariables)) return {};
    return flatten({
      [selectedSection]: selectedVariables,
    } as Record<string, unknown>);
  }
}

export function replaceBetween(
  input: string,
  start: number,
  end: number,
  what: string
): string {
  return input.substring(0, start) + what + input.substring(end);
}

export function isValidVariable(
  handlebar: string,
  flattenedVars: Record<string, unknown>
): boolean {
  const content = handlebar.slice(2, -2).trim();

  // Block helper syntax (#if, /if, else)
  if (
    content.startsWith('#') ||
    content.startsWith('/') ||
    content === 'else'
  ) {
    return true;
  }

  // Known helper function (first word matches a helper name)
  const firstWord = content.split(/\s+/)[0];
  if (HELPER_NAMES.has(firstWord)) return true;

  // Preference URLs
  if (
    content === '$embedded_preference_url' ||
    content === '$hosted_preference_url'
  ) {
    return true;
  }

  return content in flattenedVars;
}

export function shouldShowSuggestions(
  text: string,
  caretPos: number
): boolean {
  const strippedValue = text.slice(0, caretPos);
  const startBracketIndex = strippedValue.lastIndexOf('{{');
  const endBracketIndex = strippedValue.lastIndexOf('}}');
  const leftCharacter = strippedValue[caretPos - 1];

  if (leftCharacter === '}') return false;
  return startBracketIndex > endBracketIndex;
}

export function variablesToUnlayerMergeTags(
  variables: Record<string, unknown>
): Record<string, unknown> {
  const result: Record<string, unknown> = {};

  for (const section of DATA_TYPE_SECTIONS) {
    const options = getOptionsList({ variables, selectedSection: section.id });
    if (Object.keys(options).length === 0) continue;

    const sectionMergeTags: Record<string, unknown> = {};
    for (const key of Object.keys(options)) {
      const label = getLabel(key);
      if (!label || !key) continue;
      sectionMergeTags[key] = {
        name: label,
        value: `{{${key}}}`,
      };
    }

    result[section.id] = {
      name: section.label,
      mergeTags: sectionMergeTags,
    };
  }

  return result;
}
