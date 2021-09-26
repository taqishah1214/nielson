import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'listFilter',
  pure: false,
})
export class ListFilterPipe implements PipeTransform {
  transform(items: any[], selected: any, isViewSeleted: any): any {
    if (!isViewSeleted) { return items; }

    return items.filter((item) => selected.indexOf(item['value']) > -1);
  }
}
