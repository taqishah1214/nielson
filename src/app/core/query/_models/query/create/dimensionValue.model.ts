    export class DimensionValue {
        value: string;
    }

    export class Value {
        value: string[];
    }

export class SelectedGroup {
    id: number;
    customName: string;
    dimensionName: string;
    dimensionValues: string[];
    clear() {
        this.id = 0;
        this.customName = '';
        this.dimensionName = '';
        this.dimensionValues = [];
    }
}

export class FilterCriteria {
    id: number;
    dimensionName: string;
    customName: string;
    dimensionValues: string[];
}

export class FCRootObject {
    filterCriteria: FilterCriteria[];
}
