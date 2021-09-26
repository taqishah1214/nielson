import { Component, Input, Injector } from '@angular/core';
import { ICellRendererAngularComp } from 'ag-grid-angular';
import { MatDialog } from '@angular/material/dialog';
import { DuplicateQueryComponent } from '../duplicate-query/duplicate-query.component';
import { DuplicateQueryDialogModel } from 'src/app/core/query/_models/query/list/duplicateQueryDialog.model';
import { QueryService } from 'src/app/core/query/_services/query.service';
import { ClientService } from 'src/app/core/query/_services/client.service';
import { Router } from '@angular/router';
import { AppComponentBase } from 'src/app/core/app-component-base';

@Component({
  selector: 'query-menu',
  templateUrl: './query-menu.component.html',
  styleUrls: ['./query-menu.component.scss'],
})
export class QueryMenuComponent extends AppComponentBase
  implements ICellRendererAngularComp {
  public params: any;
  active = false;
  isEditable: boolean;
  clientId: string;
  constructor(
    public dialog: MatDialog,
    private _router: Router,
    private _queryService: QueryService,
    private _clientService: ClientService,
    private injector: Injector
  ) {
    super(injector);
  }
  agInit(params: any): void {
    this.params = params;
    this.isEditable = this.params.data.ownerLoggedIn;
    this.clientId = this._clientService.getClientId();
  }
  onClick() {
    this.active = !this.active;
  }

  duplicateDialog(): void {
    const message = '';

    const dialogData = new DuplicateQueryDialogModel(
      this.params.data.queryId,
      this.clientId,
      'Save ' + this.params.data.queryName + ' As',
      message,
      'Save'
    );

    const dialogRef = this.dialog.open(DuplicateQueryComponent, {
      data: dialogData,
    });
    dialogRef.afterClosed().subscribe((dialogResult) => {
      if (dialogResult) {
        this.params.context.componentParent.listQueries();
      }
    });
  }

  redirectToEdit() {
    this._router.navigate(['app/query/edit', this.params.data.queryId]);
  }

  runQuery() {
    this._queryService
      .runQuery(this._clientService.getClientId(), this.params.data.queryId)
      .subscribe((result) => {
        this.notify.success(
          `${this.params.data.queryName} run in progress. Result will be emailed.`
        );
      });
  }

  refresh(): boolean {
    return false;
  }
}
