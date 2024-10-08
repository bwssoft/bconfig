import { IProfile } from "../lib/definition";

export const functions = [
  {
    label: "Detecção de jammer",
    name: "jammer_detection",
    data: [{ label: "Ligado", value: true }, { label: "Desligado", value: false }]
  },
  {
    label: "Anti-Furto",
    name: "anti_theft",
    data: [{ label: "Ligado", value: true }, { label: "Desligado", value: false }]
  },
  {
    label: "Posição de LBS",
    name: "lbs_position",
    data: [{ label: "Ligado", value: true }, { label: "Desligado", value: false }]
  },
  {
    label: "Indicar LED",
    name: "led",
    data: [{ label: "Ligado", value: true }, { label: "Desligado", value: false }]
  },
];

export const optional_functions = [
  {
    label: "Limpar Buffer",
    name: "clear_buffer",
    data: [{ label: "Ligado", value: true }, { label: "Desligado", value: false }]
  },
  {
    label: "Resetar Horímetro",
    name: "clear_horimeter",
    data: [{ label: "Ligado", value: true }, { label: "Desligado", value: false }]
  },
];

export const lockType = [{ label: "Progressivo", value: 1 }, { label: "Instantâneo", value: 2 }, { label: "Inverso", value: 3 }]

export const timezones = [
  { label: "(UTC-12:00) Linha Internacional de Data Oeste", value: -12 },
  { label: "(UTC-11:00) Samoa", value: -11 },
  { label: "(UTC-10:00) Havaí", value: -10 },
  { label: "(UTC-09:00) Alasca", value: -9 },
  { label: "(UTC-08:00) Pacífico", value: -8 },
  { label: "(UTC-07:00) Montanha", value: -7 },
  { label: "(UTC-06:00) Central", value: -6 },
  { label: "(UTC-05:00) Leste", value: -5 },
  { label: "(UTC-04:00) Atlântico", value: -4 },
  { label: "(UTC-03:00) Brasília", value: -3 },
  { label: "(UTC-02:00) Meio-Atlântico", value: -2 },
  { label: "(UTC-01:00) Açores", value: -1 },
  { label: "(UTC+00:00) Padrão (UTC)", value: 0 },
  { label: "(UTC+01:00) Europa Ocnameental", value: 1 },
  { label: "(UTC+02:00) Europa Central", value: 2 },
  { label: "(UTC+03:00) Moscou", value: 3 },
  { label: "(UTC+04:00) Geórgia", value: 4 },
  { label: "(UTC+05:00) Paquistão", value: 5 },
  { label: "(UTC+06:00) Cazaquistão", value: 6 },
  { label: "(UTC+07:00) Indochina", value: 7 },
  { label: "(UTC+08:00) China", value: 8 },
  { label: "(UTC+09:00) Japão", value: 9 },
  { label: "(UTC+10:00) Austrália Oriental", value: 10 },
  { label: "(UTC+11:00) Ilhas Salomão", value: 11 },
  { label: "(UTC+12:00) Nova Zelândia", value: 12 },
  { label: "(UTC+13:00) Tonga", value: 13 },
  { label: "(UTC+14:00) Kiribati", value: 14 }
];

export const accelerometerSensitivity = [
  { value: 0, label: 0 },
  { value: 1, label: 1 },
  { value: 2, label: 2 },
  { value: 3, label: 3 },
  { value: 4, label: 4 },
  { value: 5, label: 5 },
  { value: 6, label: 6 },
  { value: 7, label: 7 },
  { value: 8, label: 8 },
  { value: 9, label: 9 },
  { value: 10, label: 10 }
];


export const economyMode = [
  { value: 0, label: "Desligado" },
  { value: 1, label: "Meia Economia" },
  { value: 2, label: "Economia Máxima" }
]

export const communicationType = [
  { value: "TCP", label: "TCP" },
  { value: "UDP", label: "UDP" },
]

export const protocolType = [
  { value: "E3", label: "E3" },
  { value: "GT06", label: "GT06" },
]

export const jammerDetection = [
  { value: 0, label: "Desligado" },
  { value: 1, label: "Ligado" },
]

export const input1 = [
  { value: 1, label: "Ignição" },
  { value: 2, label: "SOS" },
]

export const input2 = [
  { value: 1, label: "Monitora" },
  { value: 2, label: "SOS" },
  { value: 3, label: "Módulo" },
]

export const configMapped: { [key in keyof IProfile["config"]]: string } = {
  accelerometer_sensitivity: "Sensibilidade do Acelerômetro",
  ip: "Ip",
  apn: "Apn",
  cornering_position_update: "Atualização de posição em curva",
  data_transmission: "Tempo de transmissão",
  dns: "Dns",
  economy_mode: "Modo de Economia",
  keep_alive: "Tempo de TX",
  lbs_position: "Posição LBS",
  led: "Led",
  lock_type: "Tipo de Bloqueio",
  odometer: "Hodômetro",
  password: "Senha",
  timezone: "Fuso horário",
  virtual_ignition: "Ignição Virtual",
  sensitivity_adjustment: "Ajuste de sensibilidade",

  accel: "Acelerômetro",
  communication_type: "Tipo de comunicação",
  protocol_type: "Tipo do protocolo",
  anti_theft: "Anti-Furto",
  horimeter: "Horímetro",
  jammer_detection: "Detecção de Jammer",
  clear_buffer: "Limpar Buffer",
  clear_horimeter: "Resetar Horímetro",
  input_1: "Entrada 1",
  input_2: "Entrada 2",
  angle_adjustment: "Ajuste de ângulo",
  lock_type_progression: "Definir progressão",
  ignition_by_voltage: "Ignição por voltagem"
}