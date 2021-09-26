import {
  Component,
  OnInit,
  ChangeDetectionStrategy,
  forwardRef,
  OnDestroy,
  Injector,
  EventEmitter,
  Output,
  Input,
  ViewChild,
  ChangeDetectorRef,
} from '@angular/core';
import {
  NG_VALIDATORS,
  NG_VALUE_ACCESSOR,
  ControlValueAccessor,
  FormControl,
  FormGroup,
  FormBuilder,
  Validators,
} from '@angular/forms';
import { AppComponentBase } from 'src/app/core/app-component-base';
import { Subscription, Subject } from 'rxjs';
import { FilterOptionValues } from 'src/app/core/query/_models/query/create/filterOptionValue.model';
import { QueryService } from 'src/app/core/query/_services/query.service';
import { Dimension } from 'src/app/core/query/_models/query/create/dimensions.model';
import { Metric } from 'src/app/core/query/_models/query/create/metric.model';
import {
  FCRootObject,
  FilterCriteria,
  SelectedGroup,
} from 'src/app/core/query/_models/query/create/dimensionValue.model';
import { SelectItem } from 'primeng/api';
import { MatSelect } from '@angular/material/select';
import { Attribute } from 'src/app/core/query/_models/query/create/attribute.model';
import { MultiSelectComponent } from 'src/app/core/theme_component/multi-select/multi-select.component';
import * as moment from 'moment';

@Component({
  selector: 'query-filter-option',
  templateUrl: './query-filter-option.component.html',
  styleUrls: ['./query-filter-option.component.scss'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => QueryFilterOptionComponent),
      multi: true,
    },
    {
      provide: NG_VALIDATORS,
      useExisting: forwardRef(() => QueryFilterOptionComponent),
      multi: true,
    },
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class QueryFilterOptionComponent
  extends AppComponentBase
  implements OnInit, ControlValueAccessor, OnDestroy {
  filterOptionForm: FormGroup;
  isDatevalid = true;
  subscriptions: Subscription[] = [];
  @Output() isValid: EventEmitter<Boolean> = new EventEmitter(false);
  @Input() clientId: string;
  @Input() queryId;
  @Input() duplicate: boolean;
  @Output() getSelectedGroup: EventEmitter<SelectedGroup[]> = new EventEmitter(
    false
  );
  todayDate = moment().startOf('day');
  protected _onDestroy = new Subject<void>();
  dimensions: Dimension[];
  dimensionSet: SelectItem[];
  public dimensionFilterCtrl: FormControl = new FormControl();
  attributes: Attribute[];
  attributesForDropdown: SelectItem[];
  selectedAttributes: string[];
  metrics: Metric[];
  metricsForDropdown: SelectItem[];
  selectedMetrics: string[];
  metricViewSelected = false;
  fCRootObject: FCRootObject;
  selectedGroups: SelectedGroup[];
  dimensionValues: SelectItem[];
  values: SelectItem[];
  weekDays: SelectItem[];
  monthDays: SelectItem[];
  queryRunOptions: SelectItem[];
  selections: any[];
  selectedValues: any[] = [];
  applyValues: any[] = [];
  validateDate = true;
  initialStartDate = moment();
  initialEndDate = moment();
  initialRunDate = moment();
  initialFrequncy: string;
  isForEditOrDuplicate = false;
  @Input() filterOptionValues: FilterOptionValues;
  @ViewChild('multiSelect', { static: true }) multiSelect: MatSelect;
  @ViewChild('singleSelect', { static: true }) singleSelect: MatSelect;
  @ViewChild('criteria') criteria: MultiSelectComponent;
  isDimensionDisable: boolean;
  weekDaysEnum: any = {
    monday: 1,
    tuesday: 2,
    wednesday: 3,
    thursday: 4,
    friday: 5,
    saturday: 6,
    sunday: 7,
  };
  constructor(
    private injector: Injector,
    private _fb: FormBuilder,
    private _queryService: QueryService,
    private cdr: ChangeDetectorRef
  ) {
    super(injector);
  }
  ngOnDestroy() {
    this.subscriptions.forEach((s) => s.unsubscribe());
    this._onDestroy.next();
    this._onDestroy.complete();
  }

  onChange: any = () => {};
  onTouched: any = () => {};

  validate(_: FormControl) {}

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

  get value(): FilterOptionValues {
    return this.filterOptionForm.value;
  }

  set value(value: FilterOptionValues) {
    this.filterOptionForm.setValue(value);
    this.onChange(value);
    this.onTouched();
  }

  ngOnInit(): void {
    this.filterOptionForm = this._fb.group({
      dimension: [''],
      dimensionValueMultiCtrl: [''],
      attributeMultiCtrl: ['', Validators.required],
      metricMultiCtrl: ['', Validators.required],
      selectionMultiCtrl: [[]],
      frequency: ['', Validators.required],
      runOnceDate: [''],
      scheduleStartDate: [''],
      scheduleEndDate: [''],
      weekSelector: [''],
      monthSelector: [''],
    });
    this.filterOptionForm.controls.weekSelector.setValue('monday');
    this.filterOptionForm.controls.monthSelector.setValue('01');
    this.filterOptionForm.valueChanges.subscribe(() => {
      if (!this.isDatevalid) {
        this.validateDates();
      }
      this.isValid.emit(this.filterOptionForm.valid);
    });
    this.subscriptions.push(
      this.filterOptionForm.valueChanges.subscribe((value) => {
        this.onChange(value);
        this.onTouched();
      })
    );
    this.getDimension();
    this.getAttributes();
    this.getMetrics();
    if (this.queryId > 0 || this.duplicate) {
      this.validateDate = false;
      this.mapDetails(this.filterOptionValues);
    }
    this.selectedGroups = [];

    this.weekDays = [
      { label: 'Monday', value: 'monday' },
      { label: 'Tuesday', value: 'tuesday' },
      { label: 'Wednesday', value: 'wednesday' },
      { label: 'Thursday', value: 'thursday' },
      { label: 'Friday', value: 'friday' },
      { label: 'Saturday', value: 'saturday' },
      { label: 'Sunday', value: 'sunday' },
    ];

    this.monthDays = [
      { label: '1', value: '01' },
      { label: '2', value: '02' },
      { label: '3', value: '03' },
      { label: '4', value: '04' },
      { label: '5', value: '05' },
      { label: '6', value: '06' },
      { label: '7', value: '07' },
      { label: '8', value: '08' },
      { label: '9', value: '09' },
      { label: '10', value: '10' },
      { label: '11', value: '11' },
      { label: '12', value: '12' },
      { label: '13', value: '13' },
      { label: '14', value: '14' },
      { label: '15', value: '15' },
      { label: '16', value: '16' },
      { label: '17', value: '17' },
      { label: '18', value: '18' },
      { label: '19', value: '19' },
      { label: '20', value: '20' },
      { label: '21', value: '21' },
      { label: '22', value: '22' },
      { label: '23', value: '23' },
      { label: '24', value: '24' },
      { label: '25', value: '25' },
      { label: '26', value: '26' },
      { label: '27', value: '27' },
      { label: '28', value: '28' },
      { label: '29', value: '29' },
      { label: '30', value: '30' },
      { label: '31', value: '31' },
    ];

    this.queryRunOptions = [
      { label: 'Run Once', value: 'Runonce' },
      { label: 'Daily', value: 'Daily' },
      { label: 'Weekly', value: 'Weekly' },
      { label: 'Monthly', value: 'Monthly' },
    ];
  }

  emitForm() {
    // emit form validity
    let validity = false;
    if (this.filterOptionForm.valid) {
      validity = true;
    }
    this.isValid.emit(validity);
  }

  mapDetails(details: FilterOptionValues) {
    // Map Info For Edit Case
    this.isForEditOrDuplicate = true;
    this.initialEndDate = details.scheduleEndDate
      ? moment(details.scheduleEndDate)
      : null;
    this.initialStartDate = details.scheduleStartDate
      ? moment(details.scheduleStartDate)
      : null;
    this.initialRunDate = details.runOnceDate
      ? moment(details.runOnceDate)
      : null;
    this.initialFrequncy = details.frequency;
    this.mapSelectionGroup(details.filterCriteria);
    this.filterOptionForm.patchValue({
      attributeMultiCtrl: details.attributes,
      metricMultiCtrl: details.metrics,
      frequency: details.frequency,
      weekSelector: details.weekSelector
        ? details.weekSelector
        : this.filterOptionForm.controls.weekSelector.value,
      monthSelector: details.monthSelector
        ? details.monthSelector
        : this.filterOptionForm.controls.monthSelector.value,
      scheduleStartDate: details.scheduleStartDate
        ? moment(details.scheduleStartDate)
        : null,
      scheduleEndDate: details.scheduleEndDate
        ? moment(details.scheduleEndDate)
        : null,
      runOnceDate: details.runOnceDate ? moment(details.runOnceDate) : null,
    });
    // Set Selected Attributes For MultiSelect Dropdown
    this.selectedAttributes = [];
    this.filterOptionForm.controls.attributeMultiCtrl.value.forEach((value) => {
      this.selectedAttributes.push(value.customName);
    });
    // Set Selected Metrices For MultiSelect Dropdown
    this.selectedMetrics = [];
    this.filterOptionForm.controls.metricMultiCtrl.value.forEach((value) => {
      this.selectedMetrics.push(value.customName);
    });
  }

  mapSelectionGroup(filterCriteria: SelectedGroup[]) {
    // map selection dropdown values
    this.selections = [];
    filterCriteria.forEach((p) => {
      this.selections.push({
        label: p.customName,
        value: p.customName,
        childOptions: p.dimensionValues.map((str) => ({
          label: str,
          value: str,
        })),
        selectedChildOptions: p.dimensionValues.map((str) => str),
      });
    });
    this.selectedValues = this.selections;
  }

  getDimension(): void {
    this.loader.show();
    this.isDimensionDisable = true;
    this._queryService.getDimensions(this.clientId).subscribe(
      (result) => {
        this.dimensions = result;
        this.dimensionSet = result.map((str) => ({
          label: str.customName,
          value: str,
        }));
        // Set First Element Selected as Default
        if (this.dimensions.length > 0) {
          this.filterOptionForm.controls.dimension.setValue(this.dimensions[0]);
          this.getDimensionValue(this.dimensions[0]);
        }
      },
      (err) => {
        this.loader.hide();
      }
    );
  }

  getAttributes(): void {
    this.loader.show();
    this._queryService.getAttributes(this.clientId).subscribe((result) => {
      this.attributes = result;
      // Set Properties For MultiSelect Dropdown
      this.attributesForDropdown = result.map((str) => ({
        label: str.customName,
        value: str.customName,
      }));
    });
  }

  getMetrics(): void {
    this.loader.show();
    this._queryService.getMetrics(this.clientId).subscribe((result) => {
      this.metrics = result;
      // Set Properties For MultiSelect Dropdown
      this.metricsForDropdown = result.map((str) => ({
        label: str.customName,
        value: str.customName,
      }));
    });
  }

  getDimensionValue(dimension: any): void {
    this.loader.show();
    this.clearAllValues();
    this.getFilterCriteriaObj();
    this.dimensionValues = [];
    this._queryService
      .getDimensionValues(
        this.clientId,
        dimension.dimensionName,
        this.fCRootObject
      )
      .subscribe(
        (result) => {
          // get filter criteria value and filter value which is already selected in selection dropdown
          if (this.selections) {
            const findDimension = this.selections.find((p) =>
              p.label.match(dimension.customName)
            );
            if (findDimension !== undefined) {
              result = result.filter(
                (v) =>
                  !findDimension.childOptions.map((v2) => v2.value).includes(v)
              );
            }
          }
          this.values = result.map((str) => ({
            label: str,
            value: str,
          }));
          this.dimensionValues = this.values;
          this.isDimensionDisable = false;
          this.cdr.detectChanges();
          this.loader.hide();
        },
        (err) => {
          this.loader.hide();
        }
      );
  }

  clearAllValues() {
    if (this.criteria) {
      this.criteria.clearAll();
    }
  }

  clearValues(value: string[]): void {
    this.dimensionValues = this.dimensionValues.filter((p) =>
      p.value.indexOf(value.find((p2) => p.value === p2))
    );
    this.filterOptionForm.controls.dimensionValueMultiCtrl.setValue([]);
  }

  addSelections() {
    const selectionValues = [...this.selectedValues];
    // when click on add the values of filter criteria will be added into Selection dropdown
    const values = this.filterOptionForm.controls.dimensionValueMultiCtrl.value;
    const dimension = this.filterOptionForm.controls.dimension.value;
    if (this.selections !== undefined) {
      const findIndexDimension = this.selections.findIndex((p) =>
        p.label.match(dimension.customName)
      );
      if (findIndexDimension !== -1) {
        values.forEach((element) => {
          this.selections[findIndexDimension].childOptions.push({
            label: element,
            value: element,
          });
          this.selections[findIndexDimension].selectedChildOptions.push(
            element
          );
        });

        this.clearValues(values);
      } else {
        this.selections.push({
          label: dimension.customName,
          value: dimension.customName,
          childOptions: values.map((str) => ({
            label: str,
            value: str,
          })),
          selectedChildOptions: values.map((str) => str),
        });
        this.selections.forEach((p) => {
          if (p.childOptions) {
            selectionValues.push(p.value);
            p.childOptions.forEach((element) => {
              selectionValues.push(element.value);
            });
          }
        });
        this.clearValues(values);
      }
    } else {
      this.selections = [];
      this.selections.push({
        label: dimension.customName,
        value: dimension.customName,
        childOptions: values.map((str) => ({
          label: str,
          value: str,
        })),
        selectedChildOptions: values.map((str) => str),
      });

      this.selections.forEach((p) => {
        if (p.childOptions) {
          selectionValues.push(p.value);
          p.childOptions.forEach((element) => {
            selectionValues.push(element.value);
          });
        }
      });
      this.clearValues(values);
    }

    this.selectedValues = [...this.selections];
  }

  getFilterCriteriaObj() {
    // creating filter criteria object
    this.fCRootObject = new FCRootObject();
    this.fCRootObject.filterCriteria = [];
    if (this.selections !== undefined) {
      this.selections.forEach((element) => {
        const criteria = new FilterCriteria();
        if (this.dimensions) {
          const filterDimension = this.dimensions.filter(
            (p) => p.customName === element.label
          )[0];
          if (filterDimension) {
            criteria.customName = filterDimension.customName;
            criteria.dimensionName = filterDimension.dimensionName;
            criteria.id = filterDimension.id;
            element.childOptions.forEach((value) => {
              if (criteria.dimensionValues === undefined) {
                criteria.dimensionValues = [];
              }
              criteria.dimensionValues.push(value.value);
            });
            this.fCRootObject.filterCriteria.push(criteria);
          }
        }
      });
      this.updateSelectionFormValue();
    }
  }

  applyChanges() {
    this.selections = [...this.applyValues];
    this.getDimensionValue(this.filterOptionForm.controls.dimension.value);
  }

  emitSelectedValue() {
    this.getSelectedGroup.emit(this.selectedGroups);
  }

  getSelectedWeekDay(event?) {
    // Set Query Run Options (Weekly) From Dropdown
    if (event) {
      this.filterOptionForm.controls.weekSelector.setValue(event);
    }
    this.validateDateFrequency();
  }
  getSelectedMonthDay(event?) {
    // Set Query Run Options (Monthly) Value From Dropdown
    if (event) {
      this.filterOptionForm.controls.monthSelector.setValue(event);
    }
    this.validateDateFrequency();
  }
  getQueryRunOption(event) {
    // Set Query Run Options From Dropdown
    this.filterOptionForm.controls.frequency.setValue(event);
    this.resetFrequencyDates();
    this.frequencyValidation(event);
  }
  getSelectedDimensionValue(event) {
    this.filterOptionForm.controls.dimension.setValue(event);
    this.getDimensionValue(event);
  }
  filterCriteriaUpdate(event) {
    this.filterOptionForm.controls.dimensionValueMultiCtrl.setValue(event);
  }
  filterAttributeUpdate(event) {
    const selectedAttributes = [];
    event.forEach((value) => {
      const item = this.attributes.filter((x) => x.customName === value)[0];
      if (item) {
        const obj = new Attribute();
        obj.id = item.id;
        obj.customName = item.customName;
        obj.dimensionName = item.dimensionName;
        selectedAttributes.push(obj);
      }
    });
    // Set Attributes Values Selected In Dropdown
    this.filterOptionForm.controls.attributeMultiCtrl.setValue(
      selectedAttributes
    );
  }
  filterMetricUpdate(event) {
    const selectedMetrices = [];
    event.forEach((value) => {
      const item = this.metrics.filter((x) => x.customName === value)[0];
      if (item) {
        const obj = new Metric();
        obj.id = item.id;
        obj.customName = item.customName;
        obj.metricName = item.metricName;
        selectedMetrices.push(obj);
      }
    });
    // Set Metric Values Selected In Dropdown
    this.filterOptionForm.controls.metricMultiCtrl.setValue(selectedMetrices);
  }

  selectionUpdate(val) {
    this.applyValues = [...val];
    this.getFilterCriteriaObj();
    this.updateSelectionFormValue();
  }

  updateSelectionFormValue() {
    this.filterOptionForm.controls.selectionMultiCtrl.setValue(
      this.fCRootObject.filterCriteria
    );
  }

  isInitialDateChanged(): boolean {
    if (this.isForEditOrDuplicate) {
      if (
        this.initialFrequncy === this.filterOptionForm.controls.frequency.value
      ) {
        if (
          (this.initialEndDate &&
            this.filterOptionForm.controls.scheduleEndDate.value?.diff(
              this.initialEndDate
            )) ||
          this.filterOptionForm.controls.scheduleStartDate.value?.diff(
            this.initialStartDate
          )
        ) {
          return true;
        } else if (
          this.initialRunDate &&
          this.filterOptionForm.controls.runOnceDate.value?.diff(
            this.initialRunDate
          )
        ) {
          return true;
        } else {
          return false;
        }
      } else {
        return true;
      }
    } else {
      return true;
    }
  }

  onOpenRunQueryDate() {
    this.validateDate = true;
    if (this.isInitialDateChanged()) {
      this.isDatevalid = false;
    }
    this.emitForm();
  }
  validateRunOnceDate() {
    this.filterOptionForm.controls.runOnceDate.setErrors(null);
    this.validateDate = false;
    this.emitForm();
  }

  validateDateFrequency() {
    const frequency = this.filterOptionForm.value.frequency;
    const startDate = this.filterOptionForm.controls.scheduleStartDate.value
      ?._d;
    const endDate = this.filterOptionForm.controls.scheduleEndDate.value?._d;

    switch (frequency.toString().toLowerCase()) {
      case 'weekly':
        if (startDate && endDate) {
          const days = this.getDaysBetweenDates(
            this.filterOptionForm.controls.scheduleStartDate.value._d,
            this.filterOptionForm.controls.scheduleEndDate.value._d,
            'days'
          );
          if (
            days.includes(
              this.weekDaysEnum[this.filterOptionForm.value.weekSelector]
            )
          ) {
            if (
              !(
                this.filterOptionForm.controls.scheduleStartDate.hasError(
                  'equalDates'
                ) ||
                this.filterOptionForm.controls.scheduleStartDate.hasError(
                  'smallerDate'
                )
              )
            ) {
              this.setDateError(null);
            }
          } else {
            this.setDateError({ datesFrequency: true });
          }
        }
        break;
      case 'monthly':
        if (startDate && endDate) {
          const months = this.getDaysBetweenDates(
            this.filterOptionForm.controls.scheduleStartDate.value._d,
            this.filterOptionForm.controls.scheduleEndDate.value._d,
            'date'
          );
          if (
            months.includes(
              parseInt(this.filterOptionForm.value.monthSelector, 10)
            )
          ) {
            if (
              !(
                this.filterOptionForm.controls.scheduleStartDate.hasError(
                  'equalDates'
                ) ||
                this.filterOptionForm.controls.scheduleStartDate.hasError(
                  'smallerDate'
                )
              )
            ) {
              this.setDateError(null);
            }
          } else {
            this.setDateError({ datesFrequency: true });
          }
        }
        break;
      default:
        break;
    }
  }

  getDaysBetweenDates(startDate, endDate, field = 'days') {
    const days = [];
    let currentDate = startDate;

    while (currentDate <= endDate) {
      if (field === 'days') {
        days.push(currentDate.getDay());
      } else if (field === 'date') {
        days.push(currentDate.getDate());
      }
      currentDate = this.addDays(currentDate, 1);
    }
    return days;
  }

  addDays(currentDate, days) {
    const date = new Date(currentDate.valueOf());
    date.setDate(date.getDate() + days);
    return date;
  }

  validateDates() {
    // query run option date validation
    if (this.isInitialDateChanged()) {
      if (
        this.filterOptionForm.controls.scheduleEndDate.value &&
        this.filterOptionForm.controls.scheduleStartDate.value
      ) {
        if (
          this.filterOptionForm.controls.scheduleEndDate.value.diff(
            this.filterOptionForm.controls.scheduleStartDate.value
          ) === 0
        ) {
          this.setDateError({ equalDates: true });
        } else if (
          this.filterOptionForm.controls.scheduleEndDate.value <
          this.filterOptionForm.controls.scheduleStartDate.value
        ) {
          this.setDateError({ invalidDates: true });
        } else if (
          this.filterOptionForm.controls.scheduleStartDate.value <
            this.todayDate ||
          this.filterOptionForm.controls.scheduleEndDate.value < this.todayDate
        ) {
          this.setDateError({ smallerDate: true });
        } else {
          this.setDateError(null);
        }
      }
    } else {
      this.validateDate = false;
      this.emitForm();
    }
  }

  resetFrequencyDates() {
    // when frequncy option changed the date will reset
    if (
      this.initialFrequncy &&
      this.initialFrequncy === this.filterOptionForm.controls.frequency.value
    ) {
      switch (this.initialFrequncy) {
        case 'Runonce': {
          this.filterOptionForm.controls.runOnceDate.setValue(
            this.initialRunDate
          );
          break;
        }
        case 'Daily': {
          this.filterOptionForm.controls.scheduleStartDate.setValue(
            this.initialStartDate
          );
          this.filterOptionForm.controls.scheduleEndDate.setValue(
            this.initialEndDate
          );
          break;
        }
        case 'Weekly': {
          this.filterOptionForm.controls.scheduleStartDate.setValue(
            this.initialStartDate
          );
          this.filterOptionForm.controls.scheduleEndDate.setValue(
            this.initialEndDate
          );
          break;
        }
        case 'Monthly': {
          this.filterOptionForm.controls.scheduleStartDate.setValue(
            this.initialStartDate
          );
          this.filterOptionForm.controls.scheduleEndDate.setValue(
            this.initialEndDate
          );
          break;
        }
        default: {
          break;
        }
      }
    } else {
      this.filterOptionForm.controls.runOnceDate.setValue(null);
      this.filterOptionForm.controls.scheduleStartDate.setValue(null);
      this.filterOptionForm.controls.scheduleEndDate.setValue(null);
      this.filterOptionForm.controls.runOnceDate.setErrors(null);
      this.filterOptionForm.controls.scheduleEndDate.setErrors(null);
      this.filterOptionForm.controls.scheduleStartDate.setErrors(null);
    }
  }

  setDateError(value: any) {
    // remove or set date error
    this.isDatevalid = value ? false : true;
    this.filterOptionForm.controls.scheduleEndDate.setErrors(value);
    this.filterOptionForm.controls.scheduleStartDate.setErrors(value);
    this.emitForm();
  }

  frequencyValidation(event) {
    // when time query run option change, the validattion will change for days/start and end date as well
    if (event === 'Runonce') {
      this.setDateError(null);
      this.filterOptionForm.controls['runOnceDate'].setValidators([
        Validators.required,
      ]);
      this.filterOptionForm.controls['runOnceDate'].updateValueAndValidity();
      this.filterOptionForm.controls['monthSelector'].clearValidators();
      this.filterOptionForm.controls['monthSelector'].updateValueAndValidity();
      this.filterOptionForm.controls['weekSelector'].clearValidators();
      this.filterOptionForm.controls['weekSelector'].updateValueAndValidity();
      this.filterOptionForm.controls['scheduleStartDate'].clearValidators();
      this.filterOptionForm.controls[
        'scheduleStartDate'
      ].updateValueAndValidity();
      this.filterOptionForm.controls['scheduleEndDate'].clearValidators();
      this.filterOptionForm.controls[
        'scheduleEndDate'
      ].updateValueAndValidity();
    } else if (event === 'Daily') {
      this.validateDates();
      this.filterOptionForm.controls['scheduleStartDate'].setValidators([
        Validators.required,
      ]);
      this.filterOptionForm.controls[
        'scheduleStartDate'
      ].updateValueAndValidity();
      this.filterOptionForm.controls['scheduleEndDate'].setValidators([
        Validators.required,
      ]);
      this.filterOptionForm.controls[
        'scheduleEndDate'
      ].updateValueAndValidity();
      this.filterOptionForm.controls['monthSelector'].clearValidators();
      this.filterOptionForm.controls['monthSelector'].updateValueAndValidity();
      this.filterOptionForm.controls['weekSelector'].clearValidators();
      this.filterOptionForm.controls['weekSelector'].updateValueAndValidity();
      this.filterOptionForm.controls['runOnceDate'].clearValidators();
      this.filterOptionForm.controls['runOnceDate'].updateValueAndValidity();
    } else if (event === 'Weekly') {
      this.validateDates();
      this.filterOptionForm.controls['weekSelector'].setValidators([
        Validators.required,
      ]);
      this.filterOptionForm.controls['weekSelector'].updateValueAndValidity();
      this.filterOptionForm.controls['scheduleStartDate'].setValidators([
        Validators.required,
      ]);
      this.filterOptionForm.controls[
        'scheduleStartDate'
      ].updateValueAndValidity();
      this.filterOptionForm.controls['scheduleEndDate'].setValidators([
        Validators.required,
      ]);
      this.filterOptionForm.controls[
        'scheduleEndDate'
      ].updateValueAndValidity();
      this.filterOptionForm.controls['runOnceDate'].clearValidators();
      this.filterOptionForm.controls['runOnceDate'].updateValueAndValidity();
      this.filterOptionForm.controls['monthSelector'].clearValidators();
      this.filterOptionForm.controls['monthSelector'].updateValueAndValidity();
    } else {
      this.validateDates();
      this.filterOptionForm.controls['monthSelector'].setValidators([
        Validators.required,
      ]);
      this.filterOptionForm.controls['monthSelector'].updateValueAndValidity();
      this.filterOptionForm.controls['scheduleStartDate'].setValidators([
        Validators.required,
      ]);
      this.filterOptionForm.controls[
        'scheduleStartDate'
      ].updateValueAndValidity();
      this.filterOptionForm.controls['scheduleEndDate'].setValidators([
        Validators.required,
      ]);
      this.filterOptionForm.controls[
        'scheduleEndDate'
      ].updateValueAndValidity();
      this.filterOptionForm.controls['runOnceDate'].clearValidators();
      this.filterOptionForm.controls['runOnceDate'].updateValueAndValidity();
      this.filterOptionForm.controls['weekSelector'].clearValidators();
      this.filterOptionForm.controls['weekSelector'].updateValueAndValidity();
    }
  }
}
