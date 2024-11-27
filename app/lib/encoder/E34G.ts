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

type LockTypeProgression = {
  n1: number
  n2: number
}

type IgnitionByVoltage = {
  t1: number
  t2: number
}

type Encoder =
  | { command: "apn"; args: APN }
  | { command: "ip"; args: IP }
  | { command: "dns"; args: DNS }
  | { command: "password"; args: Password }
  | { command: "timezone"; args: Timezone };

export class E34GEncoder {

  static encoder(props: Encoder) {
    const { command, args } = props;
    const commands = E34GEncoder.commands();
    return commands[command](args as any);
  }

  //comands
  static apn(props: APN): string | undefined {
    if (!props?.address) {
      return undefined
    }
    return `APN*${props.address}*${props.user ?? ""}*${props.password ?? ""}`
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
    if (typeof props !== "number" || Number.isNaN(props) || (props < 0 || props > 2)) {
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

  static virtual_ignition_by_voltage(props: boolean): string | undefined {
    if (typeof props !== "boolean") {
      return undefined
    }
    return `VOLTAGE${props ? "ON" : "OFF"}`
  }

  static virtual_ignition_by_movement(props: boolean): string | undefined {
    if (typeof props !== "boolean") {
      return undefined
    }
    return `ACCEL${props ? "ON" : "OFF"}`
  }

  static communication_type(props: string): string | undefined {
    if (!["TCP", "UDP"].includes(props)) {
      return undefined
    }
    return props
  }

  static protocol_type(props: string): string | undefined {
    if (!["E3+", "GT06"].includes(props)) {
      return undefined
    }
    return `CHGPROT${props}`
  }

  static anti_theft(props: boolean): string | undefined {
    if (typeof props !== "boolean") {
      return undefined
    }
    return `AF${props ? "ON" : "OFF"}`
  }

  static horimeter(props: number): string | undefined {
    if (typeof props !== "number" || Number.isNaN(props) || props === 0) {
      return undefined
    }
    return `HR${props}`
  }

  static jammer_detection(props: boolean): string | undefined {
    if (typeof props !== "boolean") {
      return undefined
    }
    return `JD${props ? 1 : 0}`
  }

  static clear_buffer(props: boolean): string | undefined {
    if (typeof props !== "boolean" || props === false) {
      return undefined
    }
    return "CLEARBUFFER"
  }

  static clear_horimeter(props: boolean): string | undefined {
    if (typeof props !== "boolean" || props === false) {
      return undefined
    }
    return "CLEARHORIMETER"
  }

  static input_1(props: number): string | undefined {
    if (props !== 1 && props !== 2) {
      return undefined
    }
    if (props === 1) {
      return "MASTER1"
    }
    if (props === 2) {
      return "SLAVE1"
    }
    return undefined
  }

  static input_2(props: number): string | undefined {
    if (props !== 1 && props !== 2 && props !== 3) {
      return undefined
    }
    if (props === 1) {
      return "MASTER2"
    }
    if (props === 2) {
      return "SLAVE2"
    }
    if (props === 3) {
      return "NEGATIVE2"
    }
    return undefined
  }

  static angle_adjustment(props: number): string | undefined {
    if (typeof props !== "number" || Number.isNaN(props)) {
      return undefined
    }
    return `TDET${props}`
  }

  static lock_type_progression(props: LockTypeProgression): string | undefined {
    if (!props?.n1 || !props?.n2) {
      return undefined
    }
    return `DC*${props.n1}*${props.n2}`
  }


  static ignition_by_voltage(props: IgnitionByVoltage): string | undefined {
    if (!props?.t1 || !props?.t2) {
      return undefined
    }
    return `VOLTAGE*${props.t1}*${props.t2}`
  }

  static max_speed(props: number): string | undefined {
    if (typeof props !== "number" || Number.isNaN(props)) {
      return undefined
    }
    return `SPEED${props}`
  }

  /*
  * @example 30
  */
  static ack(props: number): string | undefined {
    if (typeof props !== "number" || Number.isNaN(props)) {
      return undefined
    }
    return `SETACK${props}`
  }

  static ignition_status_hb(props: boolean): string | undefined {
    if (typeof props !== "boolean") {
      return undefined
    }
    return `ISHB${props ? "ON" : "OFF"}`
  }


  static commands() {
    return {
      apn: E34GEncoder.apn,
      ip: E34GEncoder.ip,
      dns: E34GEncoder.dns,
      password: E34GEncoder.password,
      timezone: E34GEncoder.timezone,
      lock_type: E34GEncoder.lock_type,
      data_transmission: E34GEncoder.data_transmission,
      odometer: E34GEncoder.odometer,
      keep_alive: E34GEncoder.keep_alive,
      accelerometer_sensitivity: E34GEncoder.accelerometer_sensitivity,
      economy_mode: E34GEncoder.economy_mode,
      sensitivity_adjustment: E34GEncoder.sensitivity_adjustment,
      lbs_position: E34GEncoder.lbs_position,
      cornering_position_update: E34GEncoder.cornering_position_update,
      led: E34GEncoder.led,
      virtual_ignition: E34GEncoder.virtual_ignition,

      virtual_ignition_by_movement: E34GEncoder.virtual_ignition_by_movement,
      virtual_ignition_by_voltage: E34GEncoder.virtual_ignition_by_voltage,
      communication_type: E34GEncoder.communication_type,
      protocol_type: E34GEncoder.protocol_type,
      anti_theft: E34GEncoder.anti_theft,
      horimeter: E34GEncoder.horimeter,
      jammer_detection: E34GEncoder.jammer_detection,
      clear_buffer: E34GEncoder.clear_buffer,
      clear_horimeter: E34GEncoder.clear_horimeter,
      input_1: E34GEncoder.input_1,
      input_2: E34GEncoder.input_2,
      angle_adjustment: E34GEncoder.angle_adjustment,
      lock_type_progression: E34GEncoder.lock_type_progression,
      ignition_by_voltage: E34GEncoder.ignition_by_voltage,
      max_speed: E34GEncoder.max_speed,
      ack: E34GEncoder.ack,
      ignition_status_hb: E34GEncoder.ignition_status_hb
    }
  }

}

// const status = "BATTERY EXTERNAL:11.49V;BATT_INT:0%;ACC:ON;GPRS:Ok;GPS:0;GSM:20;HR: ;Buffer Memory:0;Tech:4G E_UTRAN;IP:143.198.247.1;Port:2000;ENGINE MODE1"

// const check =  "Sim=VAZIO SOS=PANIC APN=bws.br,bws,bws TZ=W0 HB=60,7200 MG=0 TX=300 BJ=0 ACCMODE=1 TDET=20 WKMODE=0 DD=0 OD=120 SDMS=2 TUR=1 PROT_COM=TCP DK=0 JD=1 LBS=ON OUT_MODE=2 LED=1 IV=1 ACC=1 GPRS=2G GPS=V PROT=E3+ DC=1500,8000 Voltage=13.50,12.50 AF=OFF GS=120 ACK=30 IN2_MODE=1 MQ=OFF"
