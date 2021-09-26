import { Injector } from '@angular/core';
import { SpinnerOverlayService } from 'src/app/core/query/_services/spinner-overlay.service';
import { NotifyService } from './query/_services/notify.service';

export abstract class AppComponentBase {
  loader: SpinnerOverlayService;
  notify: NotifyService;

  constructor(injector: Injector) {
    this.loader = injector.get(SpinnerOverlayService);
    this.notify = injector.get(NotifyService);

  }


}
