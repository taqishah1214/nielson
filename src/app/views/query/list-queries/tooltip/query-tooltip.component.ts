import { Component } from '@angular/core';
import { ITooltipAngularComp } from 'ag-grid-angular';

@Component({
  selector: 'tooltip-component',
  template: `
    <div class="custom-tooltip" *ngIf="stringLenght > 45">
      <p *ngIf="for === 'name'">
        <span>{{ queryName }}</span>
        <span>{{ queryDescription }}</span>
      </p>
      <p *ngIf="for === 'owner'">
        <span>{{ owner }}</span>
      </p>
      <p *ngIf="for === 'frequency'">
        <span>{{ frequency }}</span>
      </p>
    </div>
  `,
  styles: [
    `
      :host {
        position: absolute;
        pointer-events: none;
      }
      :host.ag-tooltip-hiding {
        opacity: 0;
      }
    `,
  ],
})
export class QueryTooltipComponent implements ITooltipAngularComp {
  data: any;
  queryName: '';
  queryDescription: '';
  owner: '';
  frequency: '';
  stringLenght: any;
  for: any;

  agInit(params): void {
    this.data = params.api.getDisplayedRowAtIndex(params.rowIndex).data;
    this.for = params.for;
    if (this.for === 'name') {
      this.queryName = this.data.queryName;
      this.queryDescription = this.data.queryDescription;
      this.stringLenght = 100;
    } else if (this.for === 'owner') {
      this.owner = this.data.owner;
      this.stringLenght = this.owner.length;
    } else {
      this.frequency = this.data.frequency;
      this.stringLenght = this.frequency.length;
    }
  }
}
