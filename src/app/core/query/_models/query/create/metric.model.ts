export class Metric {
    id: number;
    metricName: string;
    customName: string;
    clear() {
        this.id = null;
        this.metricName = '';
        this.customName = '';
    }
}
