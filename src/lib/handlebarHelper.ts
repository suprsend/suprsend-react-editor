import * as Handlebars from 'handlebars';
import get from 'lodash.get';
import moment from 'moment-timezone';
import getPath from 'get-value';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyVal = any;

type OperatorFn = (l: AnyVal, r: AnyVal) => boolean;
type OperatorMap = Record<string, OperatorFn>;

function defaultHelper() {
  Handlebars.registerHelper('default', function (value, defaultValue) {
    if (arguments.length < 3) {
      throw new Error("Handlerbars Helper 'default' needs 2 parameters");
    }
    return ['', null, undefined].includes(value) ? defaultValue : value;
  });
}

function compareHelper() {
  Handlebars.registerHelper(
    'compare',
    function (this: AnyVal, lvalue, operator, rvalue, options) {
      if (arguments.length < 3) {
        throw new Error("Handlerbars Helper 'compare' needs 2 parameters");
      }

      if (options === undefined) {
        options = rvalue;
        rvalue = operator;
        operator = '===';
      }

      const operators: OperatorMap = {
        '==': (l, r) => l == r,
        '===': (l, r) => l === r,
        '!=': (l, r) => l != r,
        '!==': (l, r) => l !== r,
        '<': (l, r) => l < r,
        '>': (l, r) => l > r,
        '<=': (l, r) => l <= r,
        '>=': (l, r) => l >= r,
        typeof: (l, r) => typeof l == r,
      };

      if (!operators[operator as string]) {
        throw new Error(
          "Handlerbars Helper 'compare' doesn't know the operator " + operator
        );
      }

      const result = operators[operator as string](lvalue, rvalue);

      if (result) {
        return options.fn(this);
      } else {
        return options.inverse(this);
      }
    }
  );
}

function conditionHelper() {
  Handlebars.registerHelper(
    'condition',
    function (lvalue, operator, rvalue, options) {
      if (arguments.length < 3) {
        throw new Error("Handlerbars Helper 'condition' needs 2 parameters");
      }

      if (options === undefined) {
        options = rvalue;
        rvalue = operator;
        operator = '===';
      }

      const operators: OperatorMap = {
        '==': (l, r) => l == r,
        '===': (l, r) => l === r,
        '!=': (l, r) => l != r,
        '!==': (l, r) => l !== r,
        '<': (l, r) => l < r,
        '>': (l, r) => l > r,
        '<=': (l, r) => l <= r,
        '>=': (l, r) => l >= r,
      };

      if (!operators[operator as string]) {
        throw new Error(
          "Handlerbars Helper 'compare' doesn't know the operator " + operator
        );
      }

      return operators[operator as string](lvalue, rvalue);
    }
  );
}

function andHelper() {
  Handlebars.registerHelper('and', function (...params) {
    // remove last param as it contains handlebar internal object
    params.pop();
    let val = true;
    for (let i = 0; i < params.length; i++) {
      if (!params[i]) {
        val = false;
        break;
      }
    }
    return val;
  });
}

function orHelper() {
  Handlebars.registerHelper('or', function (...params) {
    // remove last param as it contains handlebar internal object
    params.pop();
    let val = false;
    for (let i = 0; i < params.length; i++) {
      if (params[i]) {
        val = true;
        break;
      }
    }
    return val;
  });
}

function joinHelper() {
  Handlebars.registerHelper('join', function (array, separator) {
    if (array === undefined) {
      throw new Error('Mockdata for the variable inside join is not found');
    } else if (typeof array === 'string' || array === null) {
      return array;
    } else {
      if (Array.isArray(array)) {
        for (const item of array) {
          if (item !== null && typeof item === 'object') {
            throw new Error(
              'Handlebars helper "join" array items cannot be object'
            );
          }
        }
      } else {
        throw new Error(
          'Handlebars helper "join" variable value should be array'
        );
      }
    }

    separator = typeof separator === 'string' ? separator : ', ';
    return array.filter(Boolean).join(separator);
  });
}

function lengthHelper() {
  Handlebars.registerHelper('length', function (value) {
    if (!value) return 0;
    if (typeof value === 'object' && typeof value.hash === 'object') {
      throw new Error(
        "Handlebars helper 'length' variable value should be array"
      );
    }
    if (Array.isArray(value)) {
      const removeNullValues = value.filter(Boolean);
      return removeNullValues.length;
    } else if (value && typeof value === 'string') {
      return value.length;
    }
    return 0;
  });
}

function uniqueHelper() {
  Handlebars.registerHelper('unique', function (obj, key_string) {
    const uniqueArray: AnyVal[] = [];
    if (obj === undefined) {
      throw new Error('Mockdata for the variable inside unique is not found');
    } else if (obj === null) {
      return;
    } else {
      if (Array.isArray(obj)) {
        obj.forEach((item) => {
          let value = item;
          if (item !== null && typeof item === 'object') {
            if (typeof key_string !== 'string') {
              throw new Error(
                'In handlerbars helper "unique", if array item is object then pass key string as third parameter'
              );
            }
            value = get(item, key_string);
          }
          if (value !== null && !uniqueArray.includes(value)) {
            uniqueArray.push(value);
          }
        });
      } else {
        throw new Error(
          "Handlerbars helper 'unique' first parameter should be array"
        );
      }
    }
    return uniqueArray;
  });
}

function itemAtHelper() {
  Handlebars.registerHelper('itemAt', function (array, idx) {
    if (array === undefined) {
      throw new Error('Mockdata for the variable inside itemAt is not found');
    } else if (array === null) {
      return;
    } else {
      if (Array.isArray(array) || typeof array === 'string') {
        if (typeof idx === 'number') {
          idx = +idx;
        } else {
          throw new Error(
            'Handlebars helper "itemAt" index parameter should be number'
          );
        }

        let result;
        if (idx < 0) {
          result = array[array.length + idx];
        }
        if (idx < array.length) {
          result = array[idx];
        }
        if (
          result !== null &&
          typeof result === 'object' &&
          !Array.isArray(result)
        ) {
          throw new Error(
            'Handlebars helper "itemAt" array items cannot be object'
          );
        }
        return result;
      } else {
        throw new Error(
          'Handlebars helper "itemAt" first parameter should be array'
        );
      }
    }
  });
}

function listAggHelper() {
  Handlebars.registerHelper('list-agg', function (obj, key_string) {
    const eachArray: AnyVal[] = [];
    if (obj === undefined) {
      throw new Error('Mockdata for the variable inside list-agg is not found');
    } else if (obj === null) {
      return;
    } else {
      if (Array.isArray(obj)) {
        obj.forEach((item) => {
          let value = item;
          if (item !== null && typeof item === 'object') {
            if (typeof key_string !== 'string') {
              throw new Error(
                'In handlerbars helper "list-agg", if array item is object then pass key string as third parameter'
              );
            }
            value = get(item, key_string);
          }
          eachArray.push(value);
        });
      } else {
        throw new Error(
          "Handlerbars helper 'list-agg' first parameter should be array"
        );
      }
    }
    return eachArray;
  });
}

function isNumber(a: AnyVal): a is number {
  return typeof a === 'number';
}

function addHelper() {
  Handlebars.registerHelper('add', function (...params) {
    params.pop();
    const operands: number[] = [];

    if (params.length <= 0) {
      throw new TypeError(
        'Handlebars helper "add" should have atleast one input'
      );
    }

    params.forEach((item) => {
      if (Array.isArray(item)) {
        item.forEach((nItem: AnyVal) => {
          if (isNumber(nItem) || nItem === null) {
            operands.push(nItem);
          } else {
            throw new TypeError(
              'Handlebars helper "add" arguments should be a number'
            );
          }
        });
      } else {
        if (isNumber(item) || item === null) {
          operands.push(item);
        } else {
          throw new TypeError(
            'Handlebars helper "add" arguments should be a number'
          );
        }
      }
    });

    return operands.reduce((partial, a) => Number(partial) + Number(a));
  });
}

function subtractHelper() {
  Handlebars.registerHelper('subtract', function (...params) {
    params.pop();
    const operands: number[] = [];

    if (params.length <= 0) {
      throw new TypeError(
        'Handlebars helper "subtract" should have atleast one input'
      );
    }

    params.forEach((item) => {
      if (Array.isArray(item)) {
        item.forEach((nItem: AnyVal) => {
          if (isNumber(nItem) || nItem === null) {
            operands.push(nItem);
          } else {
            throw new TypeError(
              'Handlebars helper "subtract" arguments should be a number'
            );
          }
        });
      } else {
        if (isNumber(item) || item === null) {
          operands.push(item);
        } else {
          throw new TypeError(
            'Handlebars helper "subtract" arguments should be a number'
          );
        }
      }
    });

    return operands.reduce((partial, a) => Number(partial) - Number(a));
  });
}

function multiplyHelper() {
  Handlebars.registerHelper('multiply', function (...params) {
    params.pop();
    const operands: number[] = [];

    if (params.length <= 0) {
      throw new TypeError(
        'Handlebars helper "multiply" should have atleast one input'
      );
    }

    params.forEach((item) => {
      if (Array.isArray(item)) {
        item.forEach((nItem: AnyVal) => {
          if (isNumber(nItem)) {
            operands.push(nItem);
          } else {
            if (nItem !== null) {
              throw new TypeError(
                'Handlebars helper "multiply" arguments should be a number'
              );
            }
          }
        });
      } else {
        if (isNumber(item)) {
          operands.push(item);
        } else {
          if (item !== null) {
            throw new TypeError(
              'Handlebars helper "multiply" arguments should be a number'
            );
          }
        }
      }
    });

    if (operands.length > 0) {
      return operands.reduce((partial, a) => Number(partial) * Number(a));
    } else {
      return 0;
    }
  });
}

function divideHelper() {
  Handlebars.registerHelper('divide', function (a, b) {
    if (!isNumber(a)) {
      throw new TypeError(
        'Handlebars helper "divide" first argument should be a number'
      );
    }
    if (!isNumber(b)) {
      throw new TypeError(
        'Handlebars helper "divide" second argument should be a number'
      );
    }
    return Number(a) / Number(b);
  });
}

function moduloHelper() {
  Handlebars.registerHelper('mod', function (a, b) {
    if (!isNumber(a)) {
      throw new TypeError(
        'Handlebars helper "mod" first argument should be a number'
      );
    }
    if (!isNumber(b)) {
      throw new TypeError(
        'Handlebars helper "mod" second argument should be a number'
      );
    }
    return Number(a) % Number(b);
  });
}

function dateTimeFormatHelper() {
  Handlebars.registerHelper(
    'datetime-format',
    function (datetime, format, timezone) {
      let mDateTime = null;
      if (datetime === 'now') {
        mDateTime = moment();
      } else {
        mDateTime = moment.utc(datetime);
      }
      if (!mDateTime.isValid()) {
        throw new TypeError(
          'Handlebars helper "datetime-format" first argument should be valid datetime'
        );
      }
      if (typeof format !== 'string') {
        throw new TypeError(
          'Handlebars helper "datetime-format" second argument should be valid moment.js format'
        );
      }
      if (typeof timezone === 'string') {
        if (moment.tz.zone(timezone)) {
          return mDateTime.tz(timezone).format(format);
        } else {
          throw new TypeError(
            'Handlebars helper "datetime-format" timezone is invalid'
          );
        }
      } else {
        return mDateTime.format(format);
      }
    }
  );
}

function roundHelper() {
  Handlebars.registerHelper('round', function (num) {
    if (!isNumber(num)) {
      throw new TypeError(
        'Handlebars helper "round" argument should be a number'
      );
    }
    return Math.round(num);
  });
}

function jsonStringify() {
  Handlebars.registerHelper('jsonStringify', function (obj) {
    if (obj === undefined) {
      throw new TypeError(
        'Mockdata for the variable inside jsonStringify is not found'
      );
    }
    return new Handlebars.SafeString(JSON.stringify(obj));
  });
}

function jsonParse() {
  Handlebars.registerHelper('jsonParse', function (jsonString) {
    try {
      return JSON.parse(jsonString);
    } catch (error) {
      throw new TypeError(
        `Invalid JSON string provided to jsonParse: ${error instanceof Error ? error.message : error}`
      );
    }
  });
}

function jsonPath() {
  Handlebars.registerHelper('jsonPath', function (object, prop) {
    if (typeof prop !== 'string') {
      throw new TypeError(
        'Path to get value in object is not valid in jsonPath'
      );
    }
    return getPath(object, prop);
  });
}

function lowercase() {
  Handlebars.registerHelper('lowercase', function (value) {
    if (!value || typeof value !== 'string') return '';
    return value?.toLowerCase();
  });
}

function uppercase() {
  Handlebars.registerHelper('uppercase', function (value) {
    if (!value || typeof value !== 'string') return '';
    return value?.toUpperCase();
  });
}

function capitalize() {
  Handlebars.registerHelper('capitalize', function (value) {
    if (!value || typeof value !== 'string') return '';
    return value.charAt(0).toUpperCase() + value.slice(1);
  });
}

function resolvePath(object: AnyVal, path: string): AnyVal {
  if (object === null || object === undefined) {
    return undefined;
  }

  if (typeof path !== 'string') {
    return undefined;
  }

  if (Object.hasOwn(object, path)) {
    return object[path];
  }

  return traversePath(object, path);
}

function traversePath(obj: AnyVal, remainingPath: string): AnyVal {
  if (obj === null || obj === undefined || typeof obj !== 'object') {
    return undefined;
  }

  if (remainingPath === '') {
    return obj;
  }

  if (Object.hasOwn(obj, remainingPath)) {
    return obj[remainingPath];
  }

  const parts = remainingPath.split('.');

  for (let i = 1; i <= parts.length; i++) {
    const key = parts.slice(0, i).join('.');
    const rest = parts.slice(i).join('.');

    if (Object.hasOwn(obj, key)) {
      if (rest === '') {
        return obj[key];
      } else {
        const result: AnyVal = traversePath(obj[key], rest);
        if (result !== undefined) {
          return result;
        }
      }
    }
  }

  return undefined;
}

function translationHelper() {
  Handlebars.registerHelper('t', function (key, options) {
    if (typeof key !== 'string') {
      return key || '';
    }

    const rootData = options.data.root;

    const translationSets = rootData.__translations;

    if (!translationSets) {
      throw new Error(
        `translation helper 't' cannot be used when translations are disabled.`
      );
    }

    const preferredTranslations = translationSets.preferred || {};
    const defaultTranslations = translationSets.default || {};

    const locales = translationSets.locales || [];
    const localeStr = locales.length > 0 ? locales.join(' and ') : '';

    if (
      Object.keys(preferredTranslations).length === 0 &&
      Object.keys(defaultTranslations).length === 0
    ) {
      throw new Error(`translation data is empty for locales- ${localeStr})`);
    }

    let namespace = 'common';
    let lookupKey = key;

    const colonIndex = key.indexOf(':');
    if (colonIndex !== -1) {
      namespace = key.substring(0, colonIndex);
      lookupKey = key.substring(colonIndex + 1);
    }

    let templateString;

    const preferredNamespace = preferredTranslations[namespace];
    if (preferredNamespace) {
      templateString = resolvePath(preferredNamespace, lookupKey);
    }

    if (templateString === undefined) {
      const defaultNamespace = defaultTranslations[namespace];
      if (defaultNamespace) {
        templateString = resolvePath(defaultNamespace, lookupKey);
      }
    }

    // handle pluralization
    const count = options.hash.count;

    // Helper function to get plural template with fallback logic
    function getPluralTemplate(preferredBase: AnyVal, defaultBase: AnyVal, pluralForm: string) {
      // Try preferred language first
      if (typeof preferredBase === 'object' && preferredBase[pluralForm]) {
        return preferredBase[pluralForm];
      }
      // Try default language
      if (typeof defaultBase === 'object' && defaultBase[pluralForm]) {
        return defaultBase[pluralForm];
      }
      // Fallback to 'other' form if specific form not found
      if (pluralForm !== 'other') {
        if (typeof preferredBase === 'object' && preferredBase['other']) {
          return preferredBase['other'];
        }
        if (typeof defaultBase === 'object' && defaultBase['other']) {
          return defaultBase['other'];
        }
      }
      return undefined;
    }

    // Get base translation objects once
    const preferredBase = resolvePath(preferredNamespace, lookupKey);
    const defaultBase = resolvePath(defaultTranslations[namespace], lookupKey);

    if (typeof preferredBase === 'object' || typeof defaultBase === 'object') {
      let pluralTemplateString;

      if (typeof count === 'number') {
        // Determine plural form based on count
        let pluralForm;
        if (count === 0) {
          pluralForm = 'zero';
        } else if (count === 1) {
          pluralForm = 'one';
        } else {
          pluralForm = 'other';
        }

        pluralTemplateString = getPluralTemplate(
          preferredBase,
          defaultBase,
          pluralForm
        );
      } else if (count === undefined || count === null) {
        pluralTemplateString = getPluralTemplate(
          preferredBase,
          defaultBase,
          'zero'
        );
      }

      if (pluralTemplateString !== undefined) {
        templateString = pluralTemplateString;
      }
    }

    if (templateString === undefined || typeof templateString !== 'string') {
      throw new Error(
        `translation key "${key}" not found in translation file for locales- ${localeStr}`
      );
    }

    const compiledTemplate = Handlebars.compile(templateString, {
      noEscape: false,
      strict: true,
    });
    const renderContext = { ...options.hash };

    // Check for missing variables before rendering
    const missingVariables: string[] = [];
    const variablePattern = /\{\{([^}]+)\}\}/g;
    let match;
    while ((match = variablePattern.exec(templateString)) !== null) {
      const variableName = match[1].trim();
      // Skip Handlebars helpers and built-in variables
      if (
        !variableName.includes(' ') &&
        !variableName.startsWith('@') &&
        !variableName.startsWith('#')
      ) {
        if (renderContext[variableName] === undefined) {
          missingVariables.push(variableName);
        }
      }
    }

    if (missingVariables.length > 0) {
      throw new Error(
        `variable keys (${missingVariables.join(', ')}) missing in translation file for locales-${localeStr}`
      );
    }

    return compiledTemplate(renderContext);
  });
}

export default function initCustomHelpers() {
  defaultHelper();
  compareHelper();
  conditionHelper();
  andHelper();
  orHelper();
  joinHelper();
  lengthHelper();
  uniqueHelper();
  itemAtHelper();
  addHelper();
  subtractHelper();
  multiplyHelper();
  divideHelper();
  moduloHelper();
  dateTimeFormatHelper();
  roundHelper();
  listAggHelper();
  jsonStringify();
  jsonParse();
  lowercase();
  uppercase();
  capitalize();
  jsonPath();
  translationHelper();
}
