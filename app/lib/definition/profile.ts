export interface IProfile {
  id: string
  name: string
  model: Model
  config: Config
  optional_functions?: Record<string, boolean>
  created_at: Date
}

enum Model {
  "E3+" = "E3+",
  "E3+4G" = "E3+4G"
}

type Config = {
  password?: {
    old?: string
    new?: string
  }
  ip?: {
    primary?: {
      ip?: string
      port?: number
    }
    secondary?: {
      ip?: string
      port?: number
    }
  }
  dns?: {
    address?: string
    port?: number
  }
  apn?: {
    address?: string
    user?: string
    password?: string
  }
  data_transmission?: {
    on?: number
    off?: number
  }
  timezone?: number
  lock_type?: number
  odometer?: number
  keep_alive?: number
  accelerometer_sensitivity?: number
  economy_mode?: number
  lbs_position?: boolean
  cornering_position_update?: boolean
  ignition_alert_power_cut?: boolean
  gprs_failure_alert?: boolean
  led?: boolean
  virtual_ignition?: boolean
  sensitivity_adjustment?: number
  work_mode?: string
  operation_mode?: boolean
  sleep?: number
  max_speed?: number
}