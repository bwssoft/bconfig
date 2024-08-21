type APN = {
  address: string
  user: string
  password: string
}

type IP = {
  primary?: {
    ip: string
    port: string
  }
  secondary?: {
    ip: string
    port: string
  }
}

type DNS = {
  address: string
  port: string
}

type Password = {
  old: string
  new: string
}

type DataTransmission = {
  on: string
  off: string
}

type Timezone = number

type Encoder =
  | { command: "apn"; args: APN }
  | { command: "ip"; args: IP }
  | { command: "dns"; args: DNS }
  | { command: "password"; args: Password }
  | { command: "timezone"; args: Timezone };

export class E3Encoder {

  static encoder(props: Encoder) {
    const { command, args } = props;
    const commands = E3Encoder.commands();
    return commands[command](args as any);
  }

  //comands
  static apn(props: APN): string | undefined {
    if (!props?.address || !props?.user || !props?.password) {
      return undefined
    }
    return `APN*${props.address}*${props.user}*${props.password}`
  }

  static ip(props: IP): string[] | undefined {
    const result: string[] = [];

    if (props?.primary && props?.primary?.ip && props?.primary?.port) {
      result.push(`IP1#${props.primary.ip}#${props.primary.port}#`);
    }

    if (props?.secondary && props?.secondary?.ip && props?.secondary?.port) {
      result.push(`IP2#${props.secondary.ip}#${props.secondary.port}#`);
    }

    if (result.length === 0) {
      return undefined
    }

    return result;
  }

  static dns(props: DNS): string | undefined {
    if (!props?.address || !props?.port) {
      return undefined
    }
    return `DNS#${props.address}#${props.port}#`
  }

  static password(props: Password): string | undefined {
    if (!props?.old || !props?.new) {
      return undefined
    }
    return `MODIFYPW${props.old}${props.new}`
  }

  static timezone(props: Timezone): string | undefined {
    if (typeof props !== "number") return undefined
    if (props < 0) {
      return `TZW${props * -1}`
    }
    return `TZE${props}`
  }

  static lock_type(props: number): string | undefined {
    if (typeof props !== "number" || (props > 3 || props < 1)) {
      return undefined
    }
    return `MODE${props}`
  }

  static data_transmission(props: DataTransmission): string[] | undefined {
    const result = []
    if (props?.on) {
      result.push(`HB${props.on}`)
    }
    if (props?.off) {
      result.push(`SHB${props.off}`)
    }

    if (result.length === 0) {
      return undefined
    }

    return result
  }

  static odometer(props: number): string | undefined {
    if (typeof props !== "number" || Number.isNaN(props) || props === 0) {
      return undefined
    }
    return `DK${props}`
  }

  static keep_alive(props: number): string | undefined {
    if (typeof props !== "number" || Number.isNaN(props) || props === 0) {
      return undefined
    }
    return `TX${props}`
  }

  static accelerometer_sensitivity(props: number): string | undefined {
    if (typeof props !== "number" || Number.isNaN(props) || (props < 0 || props > 10)) {
      return undefined
    }
    return `SENSE${props}`
  }

  static economy_mode(props: string): string | undefined {
    if (typeof props !== "number" || Number.isNaN(props) || (props < 0 || props > 1)) {
      return undefined
    }
    return `SDMS${props}`
  }

  static sensitivity_adjustment(props: number): string | undefined {
    if (typeof props !== "number" || Number.isNaN(props) || (props < 60 || props > 2000)) {
      return undefined
    }
    return `GS${props}`
  }

  static lbs_position(props: boolean): string | undefined {
    if (typeof props !== "boolean") {
      return undefined
    }
    return `LBS${props ? "ON" : "OFF"}`
  }

  static cornering_position_update(props: boolean): string | undefined {
    if (typeof props !== "boolean") {
      return undefined
    }
    return `TURNDET${props ? "ON" : "OFF"}`
  }

  static ignition_alert_power_cut(props: boolean): string | undefined {
    if (typeof props !== "boolean") {
      return undefined
    }
    return `BJ${props ? 1 : 0}`
  }

  static gprs_failure_alert(props: boolean): string | undefined {
    if (typeof props !== "boolean") {
      return undefined
    }
    return `JD${props ? 1 : 0}`
  }

  static led(props: boolean): string | undefined {
    if (typeof props !== "boolean") {
      return undefined
    }
    return `LED${props ? "ON" : "OFF"}`
  }

  static virtual_ignition(props: boolean): string | undefined {
    if (typeof props !== "boolean") {
      return undefined
    }
    return `IV${props ? "ON" : "OFF"}`
  }

  static work_mode(props: string): string | undefined {
    if (!["SLAVE", "MASTER", "NEGATIVE"].includes(props)) {
      return undefined
    }
    return props
  }

  static operation_mode(props: boolean): string | undefined {
    if (typeof props !== "boolean") {
      return undefined
    }
    return `WKMODE${props ? "1" : "0"}`
  }

  static commands() {
    return {
      apn: E3Encoder.apn,
      ip: E3Encoder.ip,
      dns: E3Encoder.dns,
      password: E3Encoder.password,
      timezone: E3Encoder.timezone,
      lock_type: E3Encoder.lock_type,
      data_transmission: E3Encoder.data_transmission,
      odometer: E3Encoder.odometer,
      keep_alive: E3Encoder.keep_alive,
      accelerometer_sensitivity: E3Encoder.accelerometer_sensitivity,
      economy_mode: E3Encoder.economy_mode,
      sensitivity_adjustment: E3Encoder.sensitivity_adjustment,
      lbs_position: E3Encoder.lbs_position,
      cornering_position_update: E3Encoder.cornering_position_update,
      ignition_alert_power_cut: E3Encoder.ignition_alert_power_cut,
      gprs_failure_alert: E3Encoder.gprs_failure_alert,
      led: E3Encoder.led,
      virtual_ignition: E3Encoder.virtual_ignition,
      work_mode: E3Encoder.work_mode,
      operation_mode: E3Encoder.operation_mode,
    }
  }

}

// const check = "Sim=89883030000101192190 SOS= APN=bws.br,bws,bws TZ=W0 HB=60,1800 MG=0 TX=180 BJ=0 ACCMODE=1 TDET=0 WKMODE=0 DD=0 OD=0 ZD=7 AC=0,0 SDMS=2 TUR=1 PR=1 DK=1726 JD=48 LBS=* MODE=1 LED=1 IV=1 ACC=1 GPRS:4G E_UTRAN GPS:V PROT=E3+ DC:100,2000 Voltage:13.40,12.90 AF:OFF GS:80";

// const status = "BATTERY EXTERNAL:11.49V;BATT_INT:0%;ACC:ON;GPRS:Ok;GPS:0;GSM:20;HR: ;Buffer Memory:0;Tech:4G E_UTRAN;IP:143.198.247.1;Port:2000;ENGINE MODE1"
