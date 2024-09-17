export function xlsxFitToColumn(arrayOfArray: any[]) {
  // get maximum character of each column
  return arrayOfArray[0].map((a: any, i: any) => ({ wch: Math.max(...arrayOfArray.map(a2 => a2[i] ? a2[i].toString().length : 0)) }));
}