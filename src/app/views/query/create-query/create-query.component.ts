import {
  Component,
  OnInit,
  ViewChild,
  OnDestroy,
  Injector,
  ChangeDetectorRef,
  ChangeDetectionStrategy,
  AfterViewChecked,
} from '@angular/core';
import { QueryService } from 'src/app/core/query/_services/query.service';
import { CreateOrEditQuery } from 'src/app/core/query/_models/query/create/createOrEditQuery.model';
import { FormGroup, FormBuilder } from '@angular/forms';
import { Subject } from 'rxjs';
import { SelectedGroup } from 'src/app/core/query/_models/query/create/dimensionValue.model';
import {
  MomentDateAdapter,
  MAT_MOMENT_DATE_ADAPTER_OPTIONS,
} from '@angular/material-moment-adapter';
import {
  DateAdapter,
  MAT_DATE_FORMATS,
  MAT_DATE_LOCALE,
} from '@angular/material/core';
import { APP_DATE_FORMATS } from 'src/app/core/query/_base/layout/helpers/format-datepicker.helper';
import { ClientService } from 'src/app/core/query/_services/client.service';
import { Router, ActivatedRoute } from '@angular/router';
import { DatePipe } from '@angular/common';
import { AppComponentBase } from 'src/app/core/app-component-base';
import { QueryConfigComponent } from './query-config/query-config.component';
import { ConfigFormValues } from 'src/app/core/query/_models/query/create/configValue.model';
import { FilterOptionValues } from 'src/app/core/query/_models/query/create/filterOptionValue.model';
import * as moment from 'moment';

@Component({
  selector: 'app-create-query',
  templateUrl: './create-query.component.html',
  styleUrls: ['./create-query.component.scss'],
  providers: [
    {
      provide: DateAdapter,
      useClass: MomentDateAdapter,
      deps: [MAT_DATE_LOCALE, MAT_MOMENT_DATE_ADAPTER_OPTIONS],
    },

    { provide: MAT_DATE_FORMATS, useValue: APP_DATE_FORMATS },
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CreateQueryComponent extends AppComponentBase
  implements OnInit, OnDestroy, AfterViewChecked {
  configFormValues: ConfigFormValues;
  filterOptionValues: FilterOptionValues;
  collapse = false;
  createOrEditQuery: CreateOrEditQuery = new CreateOrEditQuery();
  protected _onDestroy = new Subject<void>();
  selectedGroups: SelectedGroup[];
  expandIcon = false;
  createQueryForm: FormGroup;
  todayDate: Date = new Date();
  clientId: string;
  queryId = 0;
  duplicate: boolean;
  btnSave = 'Save';
  isReady: boolean;
  @ViewChild(QueryConfigComponent) queryConfigComponent: QueryConfigComponent;
  configFormValid = false;
  filterOptionValid = false;
  maxDate = moment();

  constructor(
    private route: ActivatedRoute,
    private _fb: FormBuilder,
    private _queryService: QueryService,
    private _clientService: ClientService,
    private _router: Router,
    private _datePipe: DatePipe,
    private injector: Injector,
    private cdr: ChangeDetectorRef
  ) {
    super(injector);
    this.createQueryForm = this._fb.group({
      queryFOForm: [],
      queryConfigForm: [],
    });
  }

  ngOnInit(): void {
    this.clientId = this._clientService.getClientId();
    this.checkQueryId();
    if (this.queryId > 0) {
      this.duplicate = this._router.url.includes('create') ? true : false;
      this.btnSave = this.duplicate ? 'Save' : 'Update';
      this.getById(this.queryId);
    } else {
      this.isReady = true;
      this.selectedGroups = [];
    }
  }

  configFormState(event) {
    this.configFormValid = event;
    this.cdr.detectChanges();
  }

  filterOptionFormState(event) {
    this.filterOptionValid = event;
    this.cdr.detectChanges();
  }

  ngAfterViewChecked() {
    this.cdr.detectChanges();
  }

  checkQueryId() {
    // get query id
    if (!isNaN(parseInt(this.route.snapshot.paramMap.get('id'), 10))) {
      this.queryId = parseInt(this.route.snapshot.paramMap.get('id'), 10);
      return;
    } else if (history.state.data?.id) {
      this.queryId = history.state.data?.id;
      return;
    }
    return;
  }
  ngOnDestroy() {
    this._onDestroy.next();
    this._onDestroy.complete();
  }

  getById(id: number) {
    // get query details o edit/duplicate
    this._queryService.getQueryById(this.clientId, id).subscribe((result) => {
      this.mapDetails(result);
      this.cdr.detectChanges();
      this.isReady = true;
    });
  }

  mapDetails(details: CreateOrEditQuery) {
    // map the detail in create query page on edit and duplicate
    // map the detail for query configuration form
    this.configFormValues = new ConfigFormValues();
    this.configFormValues.queryName = details.queryName;
    this.configFormValues.description = details.queryDescription;
    this.configFormValues.configurationSet = details.configurationSet;
    this.configFormValues.conversionType = details.conversionType;
    this.configFormValues.breakdown = details.reportBreakdown;
    if (details.dateRangeType === 'predefined') {
      this.configFormValues.timePeriod = details.dateRangeValue;
    } else if (details.dateRangeType === 'lastndays') {
      this.configFormValues.timePeriod = details.dateRangeType;
      this.configFormValues.days = details.dateRangeValue;
    } else {
      this.configFormValues.timePeriod = details.dateRangeType;
      this.configFormValues.timeperiodStart = new Date(details.filterStartDate);
      this.configFormValues.timeperiodEnd = new Date(details.filterEndDate);
    }
    // map the detail for query filter option form
    this.filterOptionValues = new FilterOptionValues();
    this.filterOptionValues.filterCriteria = details.filterCriteria;
    this.filterOptionValues.attributes = details.attributes;
    this.filterOptionValues.metrics = details.metrics;
    switch (details.frequencyType) {
      case 'Weekly':
        this.filterOptionValues.frequency = details.frequencyType;
        this.filterOptionValues.weekSelector = details.frequencySelector;
        this.filterOptionValues.scheduleStartDate = new Date(
          details.scheduleStartDate
        );
        this.filterOptionValues.scheduleEndDate = new Date(
          details.scheduleEndDate
        );
        break;
      case 'Monthly':
        this.filterOptionValues.frequency = details.frequencyType;
        this.filterOptionValues.monthSelector = details.frequencySelector;
        this.filterOptionValues.scheduleStartDate = new Date(
          details.scheduleStartDate
        );
        this.filterOptionValues.scheduleEndDate = new Date(
          details.scheduleEndDate
        );
        break;
      case 'Daily':
        this.filterOptionValues.frequency = details.frequencyType;
        this.filterOptionValues.scheduleStartDate = new Date(
          details.scheduleStartDate
        );
        this.filterOptionValues.scheduleEndDate = new Date(
          details.scheduleEndDate
        );
        break;
      case 'Runonce':
        this.filterOptionValues.frequency = details.frequencyType;
        this.filterOptionValues.runOnceDate = new Date(
          details.scheduleStartDate
        );
        break;
      default:
        break;
    }
    this.selectedGroups = details.filterCriteria;
    this.queryId = this._router.url.includes('create') ? 0 : this.queryId;
  }

  getMaxDate(event) {
    this.maxDate = event;
  }

  saveQuery() {
    this.loader.show();
    // get detail from query configuration form
    const queryConfigForm = this.createQueryForm.controls.queryConfigForm.value;
    // get detail from query filter option form
    const queryFOForm = this.createQueryForm.controls.queryFOForm.value;
    // map the detail of both form in createOrEditQuery model
    this.createOrEditQuery.queryName = queryConfigForm.queryName;
    this.createOrEditQuery.queryDescription = queryConfigForm.description;
    this.createOrEditQuery.configurationSet = queryConfigForm.configurationSet;
    this.createOrEditQuery.conversionType = queryConfigForm.conversionType;
    this.createOrEditQuery.reportBreakdown = queryConfigForm.breakdown;
    if (
      queryConfigForm.timePeriod === 'yesterday' ||
      queryConfigForm.timePeriod === 'MTD' ||
      queryConfigForm.timePeriod === 'QTD'
    ) {
      this.createOrEditQuery.dateRangeType = 'predefined';
      this.createOrEditQuery.dateRangeValue = queryConfigForm.timePeriod;
    } else if (queryConfigForm.timePeriod === 'lastndays') {
      this.createOrEditQuery.dateRangeType = queryConfigForm.timePeriod;
      this.createOrEditQuery.dateRangeValue = queryConfigForm.days;
    } else {
      this.createOrEditQuery.dateRangeType = queryConfigForm.timePeriod;
      this.createOrEditQuery.dateRangeValue = queryConfigForm.timePeriod;
      this.createOrEditQuery.filterStartDate = this.transformDate(
        queryConfigForm.timeperiodStart
      );
      this.createOrEditQuery.filterEndDate = this.transformDate(
        queryConfigForm.timeperiodEnd
      );
    }
    this.createOrEditQuery.attributes = queryFOForm.attributeMultiCtrl;
    this.createOrEditQuery.metrics = queryFOForm.metricMultiCtrl;
    this.createOrEditQuery.frequencyType = queryFOForm.frequency;

    switch (this.createOrEditQuery.frequencyType) {
      case 'Weekly':
        this.createOrEditQuery.frequencySelector = queryFOForm.weekSelector;
        this.createOrEditQuery.scheduleEndDate = this.transformDate(
          queryFOForm.scheduleEndDate
        );
        this.createOrEditQuery.scheduleStartDate = this.transformDate(
          queryFOForm.scheduleStartDate
        );
        break;
      case 'Monthly':
        this.createOrEditQuery.frequencySelector = queryFOForm.monthSelector;
        this.createOrEditQuery.scheduleEndDate = this.transformDate(
          queryFOForm.scheduleEndDate
        );
        this.createOrEditQuery.scheduleStartDate = this.transformDate(
          queryFOForm.scheduleStartDate
        );
        break;
      case 'Daily':
        this.createOrEditQuery.frequencySelector = '';
        this.createOrEditQuery.scheduleEndDate = this.transformDate(
          queryFOForm.scheduleEndDate
        );
        this.createOrEditQuery.scheduleStartDate = this.transformDate(
          queryFOForm.scheduleStartDate
        );
        break;
      case 'Runonce':
        this.createOrEditQuery.frequencySelector = '';
        this.createOrEditQuery.scheduleEndDate = '';
        this.createOrEditQuery.scheduleStartDate = this.transformDate(
          queryFOForm.runOnceDate
        );
        break;
      default:
        break;
    }
    this.createOrEditQuery.filterCriteria = queryFOForm.selectionMultiCtrl;
    if (this.queryId > 0) {

      if (JSON.stringify(this.filterOptionValues.attributes) !== JSON.stringify(queryFOForm.attributeMultiCtrl)) {
        this.createOrEditQuery.isAttributeListEdited = true;
      } else {
        this.createOrEditQuery.isAttributeListEdited = false;
      }
      if (JSON.stringify(this.filterOptionValues.metrics) !== JSON.stringify(queryFOForm.metricMultiCtrl)) {
        this.createOrEditQuery.isMetricListEdited = true;
      } else {
        this.createOrEditQuery.isMetricListEdited = false;
      }
      this._queryService
        .editQuery(this.clientId, this.queryId, this.createOrEditQuery)
        .subscribe((result) => {
          this.loader.hide();
          this.navigateToQueryListing();
          this.notify.success(
            `${queryConfigForm.queryName} saved and scheduled. Results will be emailed at the next run date or you can select Run Query.`
          );
        });
    } else {
      this.createOrEditQuery.isAttributeListEdited = true;
      this.createOrEditQuery.isMetricListEdited = true;

      this._queryService
        .saveQuery(this.clientId, this.createOrEditQuery)
        .subscribe((result) => {
          this.loader.hide();
          this.navigateToQueryListing();
          this.notify.success(
            `${queryConfigForm.queryName} saved and scheduled. Results will be emailed at the next run date or you can select Run Query.`
          );
        });
    }
  }

  navigateToQueryListing() {
    this._router.navigate(['/app/query']);
  }

  getSelectedGroup(event) {
    this.selectedGroups = event;
  }

  transformDate(date: Date) {
    return this._datePipe.transform(date, 'yyyy-MM-dd');
  }
}
