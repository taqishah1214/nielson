import { Component, OnInit } from '@angular/core';
import { ILoadingOverlayAngularComp } from 'ag-grid-angular';

@Component({
  selector: 'app-grid-loading-overlay',
  templateUrl: './grid-loading-overlay.component.html',
  styleUrls: ['./grid-loading-overlay.component.scss']
})
export class GridLoadingOverlayComponent implements ILoadingOverlayAngularComp {
  private params: any;

  agInit(params): void {
    this.params = 'params';
  }
}
