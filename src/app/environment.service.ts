import { Injectable } from '@angular/core';

export enum Environment {
  Local = 'local',
  Production = 'production',
}

@Injectable({ providedIn: 'root' })
export class EnvironmentService {
  public envProperties = {
    env: Environment.Production,
    apiHost: 'https://zerothindex.co.in/e-tution/api/index.php/web/',
    imgUrl: 'https://zerothindex.co.in/',
    webHost: 'https://zerothindex.co.in',
  };

  get env() {
    return this.envProperties.env;
  }
  get apiHost(): string {
    return this.envProperties.apiHost;
  }
  get imgUrl(): string {
    return this.envProperties.imgUrl;
  }
  get webhost(): string {
    return this.envProperties.webHost;
  }

  constructor() {
    this.assignEnvValue();
  }

  assignEnvValue() {
    if (typeof window !== 'undefined' && window.location) {
      const hostname = window.location.hostname;
      const origin = window.location.origin;

      if (hostname === 'localhost' || hostname === '127.0.0.1') {
        /*
        | -------------------------------------------------------------------
        | LOCAL ENVIRONMENT CONFIGURATION (Commented)
        | -------------------------------------------------------------------
        */
        this.envProperties = {
          env: Environment.Local,
          apiHost: 'http://localhost:8000/index.php/web/',
          imgUrl: 'http://localhost:8000/',
          webHost: 'http://localhost:4200',
        };
      } else {
        // PRODUCTION ENVIRONMENT CONFIGURATION FOR HOSTINGER
        this.envProperties = {
          env: Environment.Production,
          apiHost: origin + '/e-tution/api/index.php/web/',
          imgUrl: origin + '/',
          webHost: origin,
        };
      }
    }
  }
}
