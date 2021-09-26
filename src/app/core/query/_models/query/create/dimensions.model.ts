export class Dimension {
    id: number;
    dimensionName: string;
    customName: string;
    clear() {
        this.id = 0;
        this.dimensionName = '';
        this.customName = '';
    }
}
