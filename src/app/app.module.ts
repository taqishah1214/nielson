import { BrowserModule } from '@angular/platform-browser';
import { NgModule, Injector } from '@angular/core';
import { AppRoutingModule } from './app-routing.module';

import { SharedModule } from './shared/shared.module';

import { AppComponent } from './app.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { HttpUtilsService } from './core/query/_base/shared/utils/http-utils.service';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { GridLoadingOverlayComponent } from './shared/components/grid-loading-overlay/grid-loading-overlay.component';
import { LoaderComponent } from './shared/components/loader/loader.component';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { NotifyComponent } from './shared/components/notify/notify.component';

export let AppInjector: Injector;

@NgModule({
  declarations: [
    AppComponent,
    GridLoadingOverlayComponent,
    LoaderComponent,
    NotifyComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    BrowserAnimationsModule,
    HttpClientModule,
    MatProgressSpinnerModule,
    MatProgressBarModule,
    MatCardModule,
    MatButtonModule,
    SharedModule,
  ],
  providers: [HttpUtilsService, NotifyComponent,  { provide: Window, useValue: window }],
  exports: [MatInputModule, MatFormFieldModule],
  bootstrap: [AppComponent],
  entryComponents: [LoaderComponent, NotifyComponent],
})
export class AppModule {
  constructor(private injector: Injector) {
    AppInjector = this.injector;
  }
}
