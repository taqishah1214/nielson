import { Attribute } from './attribute.model';
import { Metric } from './metric.model';
import { SelectedGroup } from './dimensionValue.model';


export class CreateOrEditQuery {
    configurationSet: string;
    queryDescription: string;
    conversionType: string;
    reportBreakdown: string;
    dateRangeType: string;
    dateRangeValue: string;
    reportOption: string;
    queryName: string;
    reportFormat = 'csv';
    filterStartDate: string;
    filterEndDate: string;
    attributes: Attribute[];
    metrics: Metric[];
    frequencyType: string;
    frequencySelector: string;
    scheduleStartDate: string;
    scheduleEndDate: string;
    isAttributeListEdited: boolean;
    isMetricListEdited: boolean;
    filterCriteria: SelectedGroup[];

    clear() {
        this.configurationSet = '';
        this.conversionType = '';
        this.reportBreakdown = '';
        this.dateRangeType = '';
        this.dateRangeValue = '';
        this.reportOption = '';
        this.queryName = '';
        this.queryDescription = '';
        this.frequencyType = '';
        this.filterEndDate = '';
        this.filterStartDate = '';
        this.frequencySelector = '';
        this.scheduleEndDate = '';
        this.scheduleStartDate = '';
        this.isAttributeListEdited = false;
        this.isMetricListEdited = false;
    }
}
