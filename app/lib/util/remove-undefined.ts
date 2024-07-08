export const removeUndefined = (obj: any): any => {
  if (Array.isArray(obj)) {
    return obj.map(removeUndefined);
  } else if (obj !== null && typeof obj === 'object') {
    return Object.entries(obj).reduce((acc, [key, value]) => {
      const cleanedValue = removeUndefined(value);
      if (cleanedValue !== undefined) {
        acc[key] = cleanedValue;
      }
      return acc;
    }, {} as any);
  }
  return obj;
};