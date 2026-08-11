import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject } from 'rxjs';

export enum Environment {
  Local = 'local',
}

@Injectable({ providedIn: 'root' })
export class EnvironmentService {
  public envProperties = {
    env: '',
    apiHost: 'https://zerothindex.co.in/e-tution/api/index.php/web/',
    imgUrl: 'https://zerothindex.co.in/',
    webHost: '',
  };
  public envRecieved = new BehaviorSubject<boolean>(false);

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

  constructor(private http: HttpClient) {
    this.assignEnvValue('');
  }

  private checkingHostType(): void {}

  assignEnvValue(res: any) {
    const domainName = window && window.location && window.location.hostname;
    const pathname = window && window.location && window.location.pathname;
    if (/^.*localhost.*/.test(domainName)) {
      this.envProperties.env = Environment.Local;
      // this.envProperties.apiHost = 'https://tutorconnect.edquill.com/admin/';
      // this.envProperties.imgUrl = 'https://tutorconnect.edquill.com/';
      // this.envProperties.webHost = 'https://tutorconnect.edquill.com';
    } else {
      // this.envProperties.apiHost = 'https://' + domainName + pathname;
      // this.envProperties.imgUrl = 'https://' + domainName + '/';
      // this.envProperties.webHost = 'https://' + domainName;
    }
  }
}
