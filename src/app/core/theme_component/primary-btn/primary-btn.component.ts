import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-primary-btn',
  template: '<button [disabled]="disabled" [class.disable-save]="disabled" id="{{id}}" class="btn btn-primary" [ngClass]="ngClass">{{buttonText | uppercase}}</button>',
  styles: ['button { font-weight: 600;font-size: 15px; }']
})
export class PrimaryBtnComponent {

  @Input() buttonText: string;
  @Input() disabled: boolean;
  @Input() ngClass: string;
  @Input() id: string;
}
