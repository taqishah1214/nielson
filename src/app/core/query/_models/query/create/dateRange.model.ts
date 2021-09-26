export class DateRange {
    startDate: Date;
    endDate: Date;
    clear() {
        this.endDate = new Date();
        this.startDate = new Date();
    }
}
