export interface ISerialPort {
  readonly readable: ReadableStream<Uint8Array> | null;
  readonly writable: WritableStream<Uint8Array> | null;
  open(options: SerialOptions): Promise<void>;
  close(): Promise<void>;
  forget(): Promise<void>;
  getInfo(): SerialPortInfo;
  setSignals(signals?: SerialOutputSignals): Promise<void>;
  getSignals(): Promise<SerialInputSignals>;
  addEventListener(
    type: 'connect' | 'disconnect',
    listener: (this: ISerialPort, ev: Event) => any,
    options?: boolean | AddEventListenerOptions
  ): void;
  removeEventListener(
    type: 'connect' | 'disconnect',
    listener: (this: ISerialPort, ev: Event) => any,
    options?: boolean | EventListenerOptions
  ): void;
}

interface SerialOptions {
  baudRate: number;
  dataBits?: 7 | 8;
  stopBits?: 1 | 2;
  parity?: 'none' | 'even' | 'odd';
  bufferSize?: number;
  flowControl?: 'none' | 'hardware';
}

interface SerialPortInfo {
  usbVendorId?: number;
  usbProductId?: number;
}

interface SerialOutputSignals {
  dataTerminalReady?: boolean;
  requestToSend?: boolean;
  break?: boolean;
}

interface SerialInputSignals {
  dataCarrierDetect: boolean;
  clearToSend: boolean;
  ringIndicator: boolean;
  dataSetReady: boolean;
}

//=========================================

interface Serial {
  getPorts(): Promise<ISerialPort[]>;
  requestPort(options?: SerialPortRequestOptions): Promise<ISerialPort>;
  addEventListener(
    type: 'connect' | 'disconnect',
    listener: (this: Navigator, ev: Event) => any,
    options?: boolean | AddEventListenerOptions
  ): void;
  removeEventListener(
    type: 'connect' | 'disconnect',
    listener: (this: Navigator, ev: Event) => any,
    options?: boolean | EventListenerOptions
  ): void;
}

interface SerialPortRequestOptions {
  filters?: SerialPortFilter[];
}

interface SerialPortFilter {
  usbVendorId?: number;
  usbProductId?: number;
}


export interface INavigator extends Navigator {
  serial: Serial;
}









