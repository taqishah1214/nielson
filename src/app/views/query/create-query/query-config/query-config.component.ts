import {
  Component,
  OnInit,
  Injector,
  Input,
  forwardRef,
  ChangeDetectionStrategy,
  OnDestroy,
  EventEmitter,
  Output,
  ChangeDetectorRef,
} from '@angular/core';
import {
  FormGroup,
  FormBuilder,
  Validators,
  NG_VALUE_ACCESSOR,
  NG_VALIDATORS,
  ControlValueAccessor,
  FormControl,
} from '@angular/forms';
import { QueryService } from 'src/app/core/query/_services/query.service';
import { ClientService } from 'src/app/core/query/_services/client.service';
import { DatePipe } from '@angular/common';
import { AppComponentBase } from 'src/app/core/app-component-base';
import { Subscription, Subject } from 'rxjs';
import { Router } from '@angular/router';
import { ConfigFormValues } from 'src/app/core/query/_models/query/create/configValue.model';
import { SelectItem } from 'primeng/api';
import * as moment from 'moment';
import { debounceTime, distinctUntilChanged, map } from 'rxjs/operators';

@Component({
  selector: 'query-config',
  templateUrl: './query-config.component.html',
  styleUrls: ['./query-config.component.scss'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => QueryConfigComponent),
      multi: true,
    },
    {
      provide: NG_VALIDATORS,
      useExisting: forwardRef(() => QueryConfigComponent),
      multi: true,
    },
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class QueryConfigComponent
  extends AppComponentBase
  implements OnInit, ControlValueAccessor, OnDestroy {
  configForm: FormGroup;
  subscriptions: Subscription[] = [];
  todayDate: Date = new Date();
  configurationSets: SelectItem[];
  conversionTypes: SelectItem[];
  breakdown: SelectItem[];
  timePeriod: SelectItem[];
  currentQueryName: string;
  minDate = moment().startOf('day');
  maxDate = moment().startOf('day');
  startDate = moment().startOf('day');
  timePeriodMaxValue: number;
  @Input() clientId: string;
  @Input() queryId;
  @Input() duplicate: boolean;
  @Output() isValid: EventEmitter<Boolean> = new EventEmitter(false);
  @Output() getMaxDate: EventEmitter<any> = new EventEmitter();
  @Input() configFormValues: ConfigFormValues;
  validateName: boolean;
  validateDate = true;
  active = false;
  queryNameUpdate = new Subject<string>();
  initialStartDate = moment();
  initialEndDate = moment();
  isForEditOrDuplicate = false;
  initialTimePeriodValue: string;
  timePeriodsLabel = 'days';
  initialDaysValue: string;
  initialBreakdownValue: string;
  constructor(
    private _queryService: QueryService,
    private _clientService: ClientService,
    private _fb: FormBuilder,
    private _datePipe: DatePipe,
    private _router: Router,
    private injector: Injector,
    private cdr: ChangeDetectorRef
  ) {
    super(injector);
    this.breakdown = [
      { label: 'Daily', value: 'Daily' },
      { label: 'Weekly', value: 'Weekly' },
      { label: 'Monthly', value: 'Monthly' },
    ];
    this.setTimePeriodValue();
  }
  ngOnDestroy() {
    this.subscriptions.forEach((s) => s.unsubscribe());
  }

  onChange: any = () => { };
  onTouched: any = () => { };

  validate(_: FormControl) { }

  registerOnChange(fn) {
    this.onChange = fn;
  }

  writeValue(value) {
    if (value) {
      this.value = value;
    }
  }

  registerOnTouched(fn) {
    this.onTouched = fn;
  }

  get value(): ConfigFormValues {
    return this.configForm.value;
  }

  set value(value: ConfigFormValues) {
    this.configForm.setValue(value);
    this.onChange(value);
    this.onTouched();
  }

  ngOnInit(): void {
    // initialize configuration form
    this.configForm = this._fb.group({
      queryName: [
        this._clientService.getUserName() +
        ' - ' +
        this._datePipe.transform(this.todayDate, 'MMM dd yyyy'),
        Validators.required,
      ],
      description: [''],
      configurationSet: ['', Validators.required],
      conversionType: ['', Validators.required],
      breakdown: ['Daily', Validators.required],
      timePeriod: ['', Validators.required],
      timeperiodStart: [''],
      timeperiodEnd: [''],
      days: [1],
    });

    this.configForm.valueChanges.subscribe(() => {
      this.emitFormStatus();
    });

    // emit value on given change in config form
    this.subscriptions.push(
      this.configForm.valueChanges.subscribe((value) => {
        this.onChange(value);
        this.onTouched();
      })
    );

    if (this.queryId > 0 || this.duplicate) {
      this.validateDate = false;
      this.mapDetails(this.configFormValues);
    } else {
      this.getConfigurationSet();
    }
    this.validateQueryName();
    this.configForm.controls.queryName.valueChanges
      .pipe(debounceTime(600), distinctUntilChanged())
      .subscribe((value) => {
        this.validateQueryName();
      });
    this.getBreakDownMaxValue();
  }

  emitFormStatus() {
    let validity = false;
    if (this.configForm.valid && !this.validateName) {
      validity = true;
    }
    this.isValid.emit(validity);
  }

  mapDetails(details: ConfigFormValues) {
    // it will map the detail in config form
    this.isForEditOrDuplicate = true;
    this.initialEndDate = details.timeperiodEnd
      ? moment(details.timeperiodEnd)
      : null;
    this.initialStartDate = details.timeperiodStart
      ? moment(details.timeperiodStart)
      : null;
    this.currentQueryName = details.queryName;
    this.initialTimePeriodValue = details.timePeriod;
    this.initialDaysValue = details.days;
    this.initialBreakdownValue = details.breakdown;
    this.configForm.patchValue({
      queryName: this._router.url.includes('create')
        ? this.configForm.controls.queryName.value
        : details.queryName,
      description: details.description,
      conversionType: details.conversionType,
      breakdown: details.breakdown,
      timePeriod: details.timePeriod,
      timeperiodStart: moment(details.timeperiodStart),
      timeperiodEnd: moment(details.timeperiodEnd),
      days: details.days ? details.days : 1,
    });
    this.getBreakdownValue(this.configForm.controls.breakdown.value);
    this.getConfigurationSet();
  }

  getConfigurationSet(): void {
    this.loader.show();
    // get configuration sets
    this._queryService.getConfigurationSet(this.clientId).subscribe(
      (result) => {
        this.configurationSets = [];
        this.configurationSets = result.map((str) => ({
          label: str.label,
          value: str.label,
        }));
        // on create set default value
        if (this.queryId === 0 && !this.duplicate) {
          this.configForm.controls.configurationSet.setValue(result[0].label);
        } else {
          this.configForm.controls.configurationSet.setValue(
              this.configFormValues ? this.configFormValues.configurationSet : ''
            );
        }
        this.getConversionTypes(
          this.configForm.controls.configurationSet.value
        );
        this.loader.hide();
      },
      (err) => {
        this.loader.hide();
      }
    );
  }

  getConversionTypes(configurationSet: string): void {
    this.loader.show();
    this._queryService
      .getConversionType(this.clientId, configurationSet)
      .subscribe(
        (result) => {
          this.conversionTypes = result.map((str) => ({
            label: str.label,
            value: str.label,
          }));
          // on create set default value
          if (this.queryId === 0 && !this.duplicate) {
            this.configForm.controls.conversionType.setValue(result[0].label);
          } else {
            this.configForm.controls.conversionType.setValue(
              this.configFormValues ? this.configFormValues.conversionType : ''
            );
          }
          this.getDateRange();
          this.loader.hide();
        },
        (err) => {
          this.loader.hide();
        }
      );
  }
  getDateRange(): void {
    this.loader.show();
    this._queryService
      .getDateRange(
        this.clientId,
        this.configForm.controls.configurationSet.value,
        this.configForm.controls.conversionType.value
      )
      .subscribe(
        (result) => {
          this.startDate = moment(result[0].startDate);
          this.minDate = moment(result[0].endDate).subtract(90, 'days');
          this.maxDate = moment(result[0].endDate);
          // on create set default value
          if (
            (this.queryId === 0 && !this.duplicate) ||
            this.configForm.controls.timePeriod.value !== 'custom'
          ) {
            // subtract 1 day from end date and set the value in timePeriodStart Date
            this.configForm.controls.timeperiodStart.setValue(
              moment(result[0].endDate).subtract(1, 'days')
            );
            this.configForm.controls.timeperiodEnd.setValue(this.maxDate);
          }
          // emit max date value in parent component
          this.getMaxDate.emit(this.maxDate);
          this.loader.hide();
        },
        (err) => {
          this.loader.hide();
        }
      );
  }


  isInitialDateChanged(): boolean {
    if (this.isForEditOrDuplicate) {
      if (this.initialEndDate) {
        if (
          this.configForm.controls.timeperiodStart.value.diff(
            this.initialStartDate
          ) ||
          this.configForm.controls.timeperiodEnd.value.diff(this.initialEndDate)
        ) {
          return true;
        } else {
          return false;
        }
      } else {
        return true;
      }
    } else {
      // this will only trigger on create query
      return true;
    }
  }

  onOpenTimePeriodDates() {
    this.validateDate = true;
    this.emitFormStatus();
  }

  validateDates() {
    if (this.isInitialDateChanged()) {
      if (
        this.configForm.controls.timeperiodEnd.value.diff(
          this.configForm.controls.timeperiodStart.value,
          'days'
        ) > this.getBreakDownMaxValue()) {
        this.setDateError({ limitExceed: true });
      } else if (this.configForm.controls.timeperiodEnd.value.diff(
        this.configForm.controls.timeperiodStart.value,
        'days'
      ) < 0) {
        this.setDateError({ invalidDates: true });
      } else {
        this.setDateError(null);
      }

    } else {
      this.setDateError(null);
    }
  }

  setDateError(value: any) {
    // remove or set date error
    this.configForm.controls.timeperiodEnd.setErrors(value);
    this.configForm.controls.timeperiodEnd.setErrors(value);

    this.configForm.controls.timeperiodStart.setErrors(value);
    this.emitFormStatus();
  }

  validateQueryName(): void {
    this.loader.show();
    this.validateName = true;
    this.emitFormStatus();
    const queryName = this.configForm.controls.queryName.value.trim();
    if (this.queryId > 0 && this.currentQueryName === queryName) {
      this.validateName = false;
      this.active = false;
      this.configForm.controls.queryName.setErrors(null);
      this.emitFormStatus();
      this.loader.hide();
      return;
    }
    if (queryName === '' || queryName == null) {
      this.cdr.detectChanges();
      this.loader.hide();
      return;
    }
    this._queryService
      .validateQueryName(this.clientId, queryName)
      .subscribe((result) => {
        if (result.status === 200) {
          this.active = true;
          this.validateName = true;
          this.configForm.controls.queryName.setErrors({ invalid: true });
        }
        if (result.status === 404) {
          this.active = false;
          this.validateName = false;
          this.configForm.controls.queryName.setErrors(null);
        }
        this.cdr.detectChanges();
        this.emitFormStatus();
        this.loader.hide();
      });
  }

  getConfigurationSetValue(val) {
    // on value change set the value of configuration set and and get conversion type
    this.configForm.controls.configurationSet.setValue(val);
    this.getConversionTypes(val);
  }

  getConversionTypesValue(val) {
    // on value change set the value of conversion type and and get date range
    this.configForm.controls.conversionType.setValue(val);
    this.getDateRange();
  }

  getBreakdownValue(val) {
    // on value change set the value of breakdown
    this.configForm.controls.breakdown.setValue(val);
    if (this.initialDaysValue && this.initialBreakdownValue === this.configForm.controls.breakdown.value) {
      this.configForm.controls.days.setValue(this.initialDaysValue);
    } else {
      this.configForm.controls.days.setValue(1);
    }
    if (val === 'Daily') {
      this.timePeriodsLabel = 'days';
    } else if (val === 'Weekly') {
      this.timePeriodsLabel = 'weeks';
    } else {
      this.timePeriodsLabel = 'months';
    }
    this.setTimePeriodValue();
    this.validateDates();

  }

  setTimePeriodValue() {
    this.timePeriod = [
      { label: 'Yesterday', value: 'yesterday' },
      { label: 'Month to Date', value: 'MTD' },
      { label: 'Quarter to Date', value: 'QTD' },
      { label: 'Last (select number) of ' + this.timePeriodsLabel, value: 'lastndays' },
      { label: 'Custom Start and End Dates', value: 'custom' },
    ];
  }

  getTimePeriodValue(val) {
    // on value change set the value of time period
    this.configForm.controls.timePeriod.setValue(val);
    this.timePeriodValidation(val);
    if (val === 'custom') {
      this.validateDates();
    }
  }

  numberOnly(event): boolean {
    // to ensure that user can only enter positive value
    if (!this.configForm.controls.days.value) {
      if (event.which === 48) {
        return false;
      }
    }
    const charCode = event.which ? event.which : event.keyCode;
    if (charCode > 31 && (charCode < 48 || charCode > 57)) {
      return false;
    }
    return true;
  }

  checkNumber() {
    // 0 will replace with 1 and if the value is greater than 90,52,12, it will replace with with max number
    if (this.configForm.controls.days.value < 0) {
      this.configForm.controls.days.setValue(1);
    }
    if (this.configForm.controls.breakdown.value === 'Daily') {
      if (this.configForm.controls.days.value > 90) {
        this.configForm.controls.days.setValue(90);
      }
    } else if (this.configForm.controls.breakdown.value === 'Weekly') {
      if (this.configForm.controls.days.value > 52) {
        this.configForm.controls.days.setValue(52);
      }
    } else {
      if (this.configForm.controls.days.value > 12) {
        this.configForm.controls.days.setValue(12);
      }
    }
  }


  getBreakDownMaxValue(): number {
    const endDate = this.configForm.controls.timeperiodEnd.value;
    if (this.configForm.controls.breakdown.value === 'Daily') {
      this.timePeriodMaxValue = 90;
      return 90;
    }
    if (this.configForm.controls.breakdown.value === 'Weekly') {
      this.timePeriodMaxValue = 52;
      const weekDiff = moment(endDate).subtract(364, 'days');
      return this.configForm.controls.timeperiodEnd.value.diff(weekDiff, 'days');
    }
    if (this.configForm.controls.breakdown.value === 'Monthly') {
      this.timePeriodMaxValue = 12;
      const monthDiff = moment(endDate).subtract(365, 'days');
      return this.configForm.controls.timeperiodEnd.value.diff(monthDiff, 'days');
    }
  }

  getBreakDownCriteria(): string {
    if (this.configForm.controls.breakdown.value === 'Daily') {
      return 'days';
    }
    if (this.configForm.controls.breakdown.value === 'Weekly') {
      return 'weeks';
    }
    if (this.configForm.controls.breakdown.value === 'Monthly') {
      return 'months';
    }
    this.getBreakDownMaxValue();
  }

  updateMinDate(event) {
    if (this.maxDate.isSameOrAfter(this.configForm.controls.timeperiodEnd.value)
    ) {
      const endDateValue = { ...event.value };
      if (this.configForm.controls.timePeriod.value === 'custom') {
        this.minDate = this.dateLimit(endDateValue);
      }
    }
  }

  dateLimit(endDateValue: any): moment.Moment {
    if (this.configForm.controls.breakdown.value === 'Daily') {
      return moment(endDateValue).subtract(90, 'days');
    } else if (this.configForm.controls.breakdown.value === 'Weekly') {
      return moment(endDateValue).subtract(52, 'weeks');
    } else {
      return moment(endDateValue).subtract(12, 'months');
    }

  }

  timePeriodValidation(event) {
    // when time periods selection change, the validattion will change for days/start and end date as well
    if (event === 'custom') {
      this.configForm.controls['timeperiodStart'].setValidators([
        Validators.required,
      ]);
      this.configForm.controls['timeperiodEnd'].setValidators([
        Validators.required,
      ]);
      this.configForm.controls['timeperiodStart'].updateValueAndValidity();
      this.configForm.controls['timeperiodEnd'].updateValueAndValidity();
      this.configForm.controls['days'].clearValidators();
      this.configForm.controls['days'].updateValueAndValidity();
    } else if (event === 'lastndays') {
      this.configForm.controls['days'].setValidators([Validators.required]);
      this.configForm.controls['days'].updateValueAndValidity();
      this.configForm.controls['timeperiodStart'].clearValidators();
      this.configForm.controls['timeperiodEnd'].clearValidators();
      this.configForm.controls['timeperiodStart'].updateValueAndValidity();
      this.configForm.controls['timeperiodEnd'].updateValueAndValidity();
    } else {
      this.configForm.controls['days'].clearValidators();
      this.configForm.controls['timeperiodStart'].clearValidators();
      this.configForm.controls['timeperiodEnd'].clearValidators();
      this.configForm.controls['days'].updateValueAndValidity();
      this.configForm.controls['timeperiodStart'].updateValueAndValidity();
      this.configForm.controls['timeperiodEnd'].updateValueAndValidity();
    }
  }
}
