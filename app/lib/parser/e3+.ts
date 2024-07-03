interface ParsedObject {
  [key: string]: string;
}
export class E3 {
  static parse(input: string) {
    if (
      input.includes("Sim=") &&
      input.includes("SOS=") &&
      input.includes("APN=") &&
      input.includes("TZ=") &&
      input.includes("HB=")
    ) {
      return this.check(input)
    } else if (
      input.includes("BATTERY EXTERNAL:") &&
      input.includes("BATT_INT:") &&
      input.includes("ACC:")
    ) {
      return this.status(input)
    } else {
      return {}
    }
  }

  static check(input: string) {
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

  static status(input: string) {
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

  static imei(input: string) {
    return input.split("IMEI=")?.[1] ?? undefined
  }
  static iccid(input: string) {
    return input.split("ICCID=")?.[1] ?? undefined
  }
}

// const check = "Sim=89883030000101192190 SOS= APN=bws.br,bws,bws TZ=W0 HB=60,1800 MG=0 TX=180 BJ=0 ACCMODE=1 TDET=0 WKMODE=0 DD=0 OD=0 ZD=7 AC=0,0 SDMS=2 TUR=1 PR=1 DK=1726 JD=48 LBS=* MODE=1 LED=1 IV=1 ACC=1 GPRS:4G E_UTRAN GPS:V PROT=E3+ DC:100,2000 Voltage:13.40,12.90 AF:OFF GS:80";

// const status = "BATTERY EXTERNAL:11.49V;BATT_INT:0%;ACC:ON;GPRS:Ok;GPS:0;GSM:20;HR: ;Buffer Memory:0;Tech:4G E_UTRAN;IP:143.198.247.1;Port:2000;ENGINE MODE1"
