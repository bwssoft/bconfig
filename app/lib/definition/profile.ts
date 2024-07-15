export interface IProfile {
  id: string
  name: string
  model: "E3+" | "E3+4G"
  created_at: Date
  config: {
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
    timezone?: number
    lock_type?: number
    data_transmission?: {
      on?: number
      off?: number
    }
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
  }
}