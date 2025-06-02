export const merge = (before: object, toMerge: object): object => {
  const result = { ...before } as Record<string, any>;

  for (const key in toMerge) {
    const toMergeValue = (toMerge as Record<string, any>)[key];

    if (!(key in result)) {
      result[key] = toMergeValue;
      continue;
    }

    const beforeValue = result[key];

    // Handle arrays by merging unique values
    if (Array.isArray(beforeValue) && Array.isArray(toMergeValue)) {
      const uniqueValues = new Set([...beforeValue, ...toMergeValue]);
      result[key] = Array.from(uniqueValues);
      continue;
    }

    // Handle objects by recursively merging
    if (
      typeof beforeValue === "object" &&
      beforeValue !== null &&
      typeof toMergeValue === "object" &&
      toMergeValue !== null &&
      !Array.isArray(beforeValue) &&
      !Array.isArray(toMergeValue)
    ) {
      result[key] = merge(beforeValue, toMergeValue);
      continue;
    }

    // For primitives, the toMerge value overwrites
    result[key] = toMergeValue;
  }

  return result;
};
