export const snakeToCamel = (str: string): string => {
  return str.replace(/_([a-z0-9])/g, (_, letter) => letter.toUpperCase());
};

export const camelToSnake = (str: string): string => {
  return str.replace(/[A-Z]/g, (letter) => `_${letter.toLowerCase()}`);
};

const isObject = (item: unknown): item is Record<string, unknown> => {
  return Boolean(
    item !== null &&
      typeof item === "object" &&
      !Array.isArray(item) &&
      !(item instanceof Date),
  );
};

export const toCamelCaseKeys = <T>(input: unknown): T => {
  if (Array.isArray(input)) {
    return input.map((item) => toCamelCaseKeys(item)) as unknown as T;
  }

  if (isObject(input)) {
    const result: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(input)) {
      const camelKey = snakeToCamel(key);
      result[camelKey] = toCamelCaseKeys(value);
    }
    return result as T;
  }

  return input as T;
};

export const toSnakeCaseKeys = <T>(input: unknown): T => {
  if (Array.isArray(input)) {
    return input.map((item) => toSnakeCaseKeys(item)) as unknown as T;
  }

  if (isObject(input)) {
    const result: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(input)) {
      const snakeKey = camelToSnake(key);
      result[snakeKey] = toSnakeCaseKeys(value);
    }
    return result as T;
  }

  return input as T;
};
