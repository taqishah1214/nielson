import { Injectable } from '@angular/core';
import { NotifyComponent } from '../../../shared/components/notify/notify.component';
@Injectable({
  providedIn: 'root',
})
export class NotifyService {
  constructor(private _notifyComponent: NotifyComponent) {}

  info(message: string, title?: string, options?: any): void {
    throw new Error('Method not implemented.');
  }
  warn(message: string, title?: string, options?: any): void {
    throw new Error('Method not implemented.');
  }
  error(message: string, title?: string, options?: any): void {
    throw new Error('Method not implemented.');
  }
  // for success toast
  success(message: string, title?: string, options?: any) {
    this._notifyComponent.openSnackBar(message);
  }
}
