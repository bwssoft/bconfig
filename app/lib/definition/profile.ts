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
        port?: string
      }
      secondary?: {
        ip?: string
        port?: string
      }
    }
    dns?: {
      address?: string
      port?: string
    }
    apn?: {
      address?: string
      user?: string
      password?: string
    }
    timezone?: number
    lock_type?: number
    data_transmission?: {
      on?: string
      off?: string
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