interface ParsedObject {
  [key: string]: string;
}
export class QuatroG {

  check(input: string) {
    const obj: ParsedObject = {};
    const regex = /(\w+[:=][^ ]+)/g;
    const matches = input.match(regex);

    if (matches) {
      matches.forEach(pair => {
        let key: string | undefined
        let value: string | undefined

        if (pair.includes('=')) {
          [key, value] = pair.split('=');
        } else if (pair.includes(':')) {
          [key, value] = pair.split(':');
        }

        if (key && value !== undefined) {
          obj[key.trim()] = value.trim();
        }
      });
    }

    return obj;
  }

  status(input: string) {
    const obj: ParsedObject = {};
    const keyValuePairs = input.split(';');

    keyValuePairs.forEach(pair => {
      let key: string | undefined;
      let value: string | undefined;

      if (pair.includes(':')) {
        [key, value] = pair.split(':');
      }

      if (key && value !== undefined) {
        obj[key.trim()] = value.trim();
      }
    });

    return obj;

  }

}

// const check = "Sim=89883030000101192190 SOS= APN=bws.br,bws,bws TZ=W0 HB=60,1800 MG=0 TX=180 BJ=0 ACCMODE=1 TDET=0 WKMODE=0 DD=0 OD=0 ZD=7 AC=0,0 SDMS=2 TUR=1 PR=1 DK=1726 JD=48 LBS=* MODE=1 LED=1 IV=1 ACC=1 GPRS:4G E_UTRAN GPS:V PROT=E3+ DC:100,2000 Voltage:13.40,12.90 AF:OFF GS:80";

// const statuss = 'BATTERY EXTERNAL:11.49V;BATT_INT:0%;ACC:ON;GPRS:Ok;GPS:0;GSM:20;HR: ;Buffer Memory:0;Tech:4G E_UTRAN;IP:143.198.247.1;Port:2000;ENGINE MODE1'
