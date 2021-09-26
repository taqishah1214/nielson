import { enableProdMode } from '@angular/core';
import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';

import { AppModule } from './app/app.module';
import { environment } from './environments/environment';

import 'ag-grid-enterprise';
import { LicenseManager } from 'ag-grid-enterprise';


if (environment.production) {
  LicenseManager.setLicenseKey('license key here');
  enableProdMode();
}

platformBrowserDynamic().bootstrapModule(AppModule)
  .catch(err => console.error(err));
