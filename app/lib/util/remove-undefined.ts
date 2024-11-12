export const removeUndefined = <T>(obj: T): T => {
  if (Array.isArray(obj)) {
    return obj.map(removeUndefined) as unknown as T;
  } else if (obj !== null && typeof obj === 'object') {
    const cleanedObject = Object.entries(obj).reduce((acc, [key, value]) => {
      const cleanedValue = removeUndefined(value);
      if (cleanedValue !== undefined && (typeof cleanedValue !== 'object' || (typeof cleanedValue === 'object' && cleanedValue !== null && Object.keys(cleanedValue).length > 0))) {
        acc[key] = cleanedValue;
      }
      return acc;
    }, {} as any);

    return (Object.keys(cleanedObject).length === 0 ? undefined : cleanedObject) as unknown as T;
  }
  return obj;
};

export const removeNull = <T>(obj: T): T => {
  if (Array.isArray(obj)) {
    return obj.map(removeNull) as unknown as T;
  } else if (obj !== null && typeof obj === 'object') {
    const cleanedObject = Object.entries(obj).reduce((acc, [key, value]) => {
      const cleanedValue = removeNull(value);
      if (cleanedValue !== null && (typeof cleanedValue !== 'object' || (typeof cleanedValue === 'object' && cleanedValue !== null && Object.keys(cleanedValue).length > 0))) {
        acc[key] = cleanedValue;
      }
      return acc;
    }, {} as any);

    return (Object.keys(cleanedObject).length === 0 ? undefined : cleanedObject) as unknown as T;
  }
  return obj;
};

export const removeEmptyValues = <T>(obj: T): T => {
  if (typeof obj !== 'object' || obj === null) return obj;
  if (Array.isArray(obj)) return obj.map(removeEmptyValues) as unknown as T;

  const entries = Object.entries(obj).map(([key, value]) => {
    if (typeof value === 'string' && value === '') {
      return [key, undefined];
      // } else if (typeof value === 'number' && value === 0) {
      //   return [key, undefined];
    } else if (typeof value === 'object' && value !== null) {
      return [key, removeEmptyValues(value)];
    } else {
      return [key, value];
    }
  });

  return Object.fromEntries(entries) as T;
};
