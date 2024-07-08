import _ from 'lodash';

export const isEqual = (obj1: any, obj2: any) => _.isEqual(obj1, obj2);

// Função para identificar as propriedades diferentes
export function getDifferences(obj1: any, obj2: any): any {
  return _.reduce(obj1, (result, value, key) => {
    if (!_.isEqual(value, obj2[key])) {
      result[key] = { value1: value, value2: obj2[key] };
    }
    return result;
  }, {} as any);
}