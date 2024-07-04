
export const functions = [
  {
    name: "Atualização da posição em curva",
    id: 1,
  },
  {
    name: "Indicar LED",
    id: 2,
  },
  {
    name: "Modo de Economia",
    id: 3,
  },

  {
    name: "Alerta de falha de GPRS (SMS)",
    id: 4,
  },
  {
    name: "Alerta de ignição / Corte de alimentação (SMS)",
    id: 5,
  },
  {
    name: "Ignição Virtual",
    id: 6,
  },
  {
    name: "Modo de Trabalho",
    id: 7,
  },
  {
    name: "Posição de LBS",
    id: 8,
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
  { label: "(UTC+00:00) Padrão (UTC)", value: 0 },
  { label: "(UTC+01:00) Europa Ocidental", value: 1 },
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
  { value: 0, label: "GPS Ligado (Em Sleep)" },
  { value: 1, label: "GPS Desligado (Em Sleep)" }
]