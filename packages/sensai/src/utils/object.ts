export const subtract = (before: object, after: object): object => {
  const result: Record<string, any> = {};
  for (const key in before) {
    const beforeValue = (before as Record<string, any>)[key];
    if (!(key in after)) {
      result[key] = beforeValue;
      continue;
    }

    const afterValue = (after as Record<string, any>)[key];
    if (typeof beforeValue !== "object" || beforeValue === null) {
      if (beforeValue !== afterValue) {
        result[key] = beforeValue;
        continue;
      }
    } else if (typeof afterValue !== "object" || afterValue === null) {
      result[key] = beforeValue;
      continue;
    } else {
      const nestedDiff = subtract(beforeValue, afterValue);
      if (Object.keys(nestedDiff).length > 0) {
        result[key] = beforeValue;
        continue;
      }
    }
  }

  return result;
};

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
