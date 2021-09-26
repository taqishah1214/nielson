import { SelectedGroup } from './dimensionValue.model';
import { Metric } from './metric.model';
import { Attribute } from './attribute.model';

export class FilterOptionValues {
  dimension: string;
  dimensionValues: string;
  attributes: Attribute[];
  metrics: Metric[];
  selections: string;
  frequency: string;
  runOnceDate: Date;
  scheduleStartDate: Date;
  scheduleEndDate: Date;
  weekSelector: string;
  monthSelector: string;
  filterCriteria: SelectedGroup[];
}
