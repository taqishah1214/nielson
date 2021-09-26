import { Component, Input } from '@angular/core';

@Component({
  selector: 'action-btn',
  template: '<button [disabled]="disabled" [class.disable-save]="disabled" id="{{id}}" type="submit" class="btn btn-primary" [ngClass]="ngClass">{{buttonText | uppercase}}</button>',
  styles: ['button { font-weight: 600; }']
})
export class ActionBtnComponent {

  @Input() buttonText: string;
  @Input() disabled: boolean;
  @Input() ngClass: string;
  @Input() id: string;
}
