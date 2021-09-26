import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-cancel-btn',
  template: ' <a id="{{id}}"  class="cancel-link">CANCEL</a>'
})
export class CancelBtnComponent {
  @Input() id: string;
}
