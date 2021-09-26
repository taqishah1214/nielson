import { Overlay, OverlayRef } from '@angular/cdk/overlay';
import { ComponentPortal } from '@angular/cdk/portal';
import { Injectable } from '@angular/core';
import { LoaderComponent } from '../../../shared/components/loader/loader.component';
@Injectable({
  providedIn: 'root',
})
export class SpinnerOverlayService {
  private overlayRef: OverlayRef = null;
  private isAttached = false;

  constructor(private overlay: Overlay) {}

  public show(message = '') {
    // Returns an OverlayRef (which is a PortalHost)

    if (!this.overlayRef) {
      this.overlayRef = this.overlay.create();
    }

    // Create ComponentPortal that can be attached to a PortalHost
    if (!this.isAttached) {
      const spinnerOverlayPortal = new ComponentPortal(LoaderComponent);
      const component = this.overlayRef.attach(spinnerOverlayPortal); // Attach ComponentPortal to PortalHost
      this.isAttached = true;
    }
  }

  public hide() {
    // detached current overlay
    if (!!this.overlayRef) {
      this.overlayRef.detach();
      this.isAttached = false;
    }
  }
}
