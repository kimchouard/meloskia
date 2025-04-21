class Logger {
  namespace: string = '';
  enabled: boolean = true;

  constructor(namespace: string, enabled: boolean) {
    this.namespace = namespace;
    this.enabled = enabled;
  }

  info = (...args: unknown[]) => {
    if (!this.enabled) {
      return;
    }

    if (!this.namespace) {
      console.log(...args);
    }

    console.log(`[${this.namespace}]`, ...args);
  };

  spawn = (namespace: string, enabled: boolean) => {
    return new Logger(namespace, enabled);
  };
}

export default new Logger('', true);
