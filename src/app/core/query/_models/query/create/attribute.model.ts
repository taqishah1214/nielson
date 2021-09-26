export class Attribute {
    id: number;
    dimensionName: string;
    customName: string;
    clear() {
        this.id = null;
        this.dimensionName = '';
        this.customName = '';
    }
}
