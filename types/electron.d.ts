interface ElectronWindow extends Window {
    electron: {
      ipcRenderer: {
        send(channel: string, data?: any): void;
        on(channel: string, func: Function): void;
        once(channel: string, func: Function): void;
      };
    };
  }
  
  declare global {
    interface Window extends ElectronWindow {}
  }
  
  export {}
  
  