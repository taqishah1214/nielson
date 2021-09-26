import { Component, Inject, Injector, ChangeDetectorRef, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { FormGroup, Validators, FormBuilder } from '@angular/forms';
import { QueryService } from 'src/app/core/query/_services/query.service';
import { ClientService } from 'src/app/core/query/_services/client.service';
import { DuplicateQueryDialogModel } from 'src/app/core/query/_models/query/list/duplicateQueryDialog.model';
import { DuplicateQuery } from 'src/app/core/query/_models/query/list/duplicateQuery.model';
import { DatePipe } from '@angular/common';
import { Router } from '@angular/router';
import { AppComponentBase } from 'src/app/core/app-component-base';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';

@Component({
  selector: 'app-duplicate-query',
  templateUrl: './duplicate-query.component.html',
  styleUrls: ['./duplicate-query.component.scss'],
})
export class DuplicateQueryComponent extends AppComponentBase implements OnInit {
  title: string;
  message: string;
  buttonTitle: string;
  duplicateQuery: FormGroup;
  active: boolean;
  validateName = true;
  id: number;
  clientId: string;
  currentDate = new Date();
  constructor(
    private _queryService: QueryService,
    private _datePipe: DatePipe,
    private _clientService: ClientService,
    public dialogRef: MatDialogRef<DuplicateQueryComponent>,
    @Inject(MAT_DIALOG_DATA) public data: DuplicateQueryDialogModel,
    private _fb: FormBuilder,
    private _router: Router,
    private cdr: ChangeDetectorRef,
    private injector: Injector
  ) {
    super(injector);
    // Update view with given values
    this.title = data.title;
    this.clientId = data.clientId;
    this.message = data.message;
    this.buttonTitle = data.buttonTitle;
    this.id = data.id;

  }
  ngOnInit(): void {
    this.duplicateQuery = this._fb.group({
      name: [
        this._clientService.getUserName() +
        ' - ' +
        this._datePipe.transform(this.currentDate, 'MMM dd yyyy'),
        Validators.required,
      ],
    });
    this.duplicateQuery.controls.name.valueChanges.pipe(
      debounceTime(600),
      distinctUntilChanged())
      .subscribe(value => {
        this.validateQueryName();
      });
    this.validateQueryName();
  }

  redirectToCreate() {
    this._router.navigate(['app/query/create'], {
      state: { data: { id: this.id } },
    });
    this.onDismiss();
  }

  validateQueryName(): void {
    this.loader.show();
    this.validateName = true;
    const queryName = this.duplicateQuery.controls.name.value.trim();
    if (queryName === '' || queryName == null) {
      this.loader.hide();
      this.cdr.detectChanges();
      return;
    } else {
      this._queryService
        .validateQueryName(this.clientId, queryName)
        .subscribe((result) => {
          if (result.status === 200) {
            this.active = true;
            this.validateName = true;
            this.duplicateQuery.controls.name.setErrors({ invalid: true });
          }
          if (result.status === 404) {
            this.active = false;
            this.validateName = false;
            this.duplicateQuery.controls.name.setErrors(null);
          }
          this.loader.hide();
          this.cdr.detectChanges();
        },
          (err) => {
            this.loader.hide();
          }
        );
    }
  }

  save(): void {
    // Close the dialog, return true
    this.loader.show();
    const duplicateQuery = new DuplicateQuery();
    duplicateQuery.queryName = this.duplicateQuery.controls.name.value.trim();
    this._queryService
      .duplicateQuery(
        this._clientService.getClientId(),
        this.id,
        duplicateQuery
      )
      .subscribe((result) => {
        this.notify.success(
          `${this.duplicateQuery.controls.name.value} saved and scheduled. Results will be emailed.`
        );
        this.dialogRef.close(true);
        this.loader.hide();
      },
        (err) => { this.loader.hide(); });
  }

  onDismiss(): void {
    // Close the dialog, return false
    this.dialogRef.close(false);
  }
}
