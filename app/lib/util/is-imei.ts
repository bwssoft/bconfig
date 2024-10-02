function isIMEI(s: any) {
  var etal = /^[0-9]{15}$/;
  if (!etal.test(s))
    return false;
  let sum = 0, mul = 2, l = 14;
  for (let i = 0; i < l; i++) {
    let digit = s.substring(l - i - 1, l - i);
    let tp = parseInt(digit, 10) * mul;
    if (tp >= 10)
      sum += (tp % 10) + 1;
    else
      sum += tp;
    if (mul == 1)
      mul++;
    else
      mul--;
  }
  let chk = ((10 - (sum % 10)) % 10);
  if (chk != parseInt(s.substring(14, 15), 10))
    return false;
  return true;
}

export { isIMEI }