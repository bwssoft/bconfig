import _ from 'lodash';

// Função para identificar se os dois objetos são iguais
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

export function checkWithDifference(obj1: any, obj2: any) {
  const _isEqual = isEqual(obj1, obj2)
  const difference = getDifferences(obj1, obj2)
  return {
    isEqual: _isEqual,
    difference
  }
}


