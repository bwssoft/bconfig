import _ from 'lodash';

// Função para identificar se os dois objetos são iguais
export const isEqual = (obj1: any, obj2: any) => _.isEqual(obj1, obj2);

export const isSubset = (obj1: any, obj2: any): boolean => {
  return _.every(obj1, (value, key) => {
    if (_.isObject(value) && _.isObject(obj2[key])) {
      return isSubset(value, obj2[key]);
    }
    return _.isEqual(value, obj2[key]);
  });
};


// Função para identificar as propriedades diferentes entre dois objetos
export function getDifferences(obj1: any, obj2: any): any {
  return _.reduce(obj1, (result, value, key) => {
    if (!_.isEqual(value, obj2[key])) {
      result[key] = { value1: value, value2: obj2[key] };
    }
    return result;
  }, {} as any);
}

export function getSubsetDifferences(obj1: any, obj2: any): any {
  return _.reduce(obj1, (result, value, key) => {
    if (_.isObject(value) && _.isObject(obj2[key])) {
      const nestedDifferences = getSubsetDifferences(value, obj2[key]);
      if (!_.isEmpty(nestedDifferences)) {
        result[key] = nestedDifferences;
      }
    } else if (!_.isEqual(value, obj2[key])) {
      result[key] = { value1: value, value2: obj2[key] };
    }
    return result;
  }, {} as any);
}

export function checkWithDifference(obj1: any, obj2: any) {
  const _isEqual = isSubset(obj1, obj2)
  const difference = getSubsetDifferences(obj1, obj2)
  return {
    isEqual: _isEqual,
    difference
  }
}


