import { IProfile } from "./profile";
import { ISerialPort } from "./serial";

export interface IConfigurationLog {
  id: string
  port: ISerialPort;
  imei: string
  iccid?: string
  et: string
  desired_profile: DeviceProfile;
  actual_profile?: DeviceProfile;
  actual_native_profile?: DeviceNativeProfile;
  is_configured: boolean;
  not_configured: { [key in keyof IProfile["config"]]: { value1: any; value2: any } };
  metadata: ConfigurationMetadata;
  profile_id: string
  profile_name: string
  created_at: Date
  user_id: string
}


export type ConfigurationMetadata = {
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
export type DeviceProfile = IProfile["config"]
export type DeviceNativeProfile = {
  check?: string
  dns?: string
  cxip?: string
}