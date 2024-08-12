import { AutoTest } from "../parser/E34G";
import { ISerialPort } from "./serial";

export interface IAutoTestLog {
  id: string
  port: ISerialPort;
  imei: string
  iccid?: string
  et: string
  is_successful: boolean;
  metadata: TestMetadata;
  auto_test_analysis: AutoTestAnalysis
  auto_test_hints: AutoTestHints
  last_auto_test_result: AutoTest
  created_at: Date
}

export interface AutoTestAnalysis {
  GPS: boolean
  GPSf: boolean
  GSM: boolean
  LTE: boolean
  IN1: boolean
  IN2: boolean
  OUT: boolean
  ACEL: boolean
  VCC: boolean
  SIMHW: boolean
  CHARGER: boolean
  MEM: boolean
}

export interface AutoTestHints {
  GPS?: string
  GPSf?: string
  GSM?: string
  LTE?: string
  IN1?: string
  IN2?: string
  OUT?: string
  ACEL?: string
  VCC?: string
  SIMHW?: string
  CHARGER?: string
  MEM: string
}

export interface TestMetadata {
  port: ISerialPort
  init_time_configuration: number
  end_time_configuration: number
  commands_sent: {
    init_time_command: number
    end_time_command?: number
    request: string
    response?: string
  }[]
}