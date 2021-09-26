import {
  Component,
  Input,
  Output,
  EventEmitter,
  ViewChild,
} from '@angular/core';
import { MenuItem, SelectItem, SelectItemGroup } from 'primeng/api';

@Component({
  selector: 'multi-select',
  styleUrls: ['./multi-select.component.scss'],
  templateUrl: './multi-select.component.html',
})
export class MultiSelectComponent {
  isViewSelected = false;
  @Input() virtualScroll: boolean;
  @Input() closeBtn: boolean;
  @Input() addBtn: boolean;
  @ViewChild('mSelect') dropdown: any;
  @Input() items: Array<any>;
  @Input() showToggleAll: boolean;
  @Input() caption: string;
  @Input() singularCaption: string;
  @Input() pluralCaption: string;
  @Input() id: string;
  @Input() disabled: boolean;
  @Input() set defaultValue(value: Array<string>) {
    this.selected = value || [];
  }

  @Output() addClicked = new EventEmitter();
  @Output() closeClicked = new EventEmitter();
  @Output() valueChange = new EventEmitter();
  selected: Array<string> = [];
  dropdownlistShowed = false;
  allItems: Array<any>;
  constructor() {}

  onModelChange(event) {
    if (
      !event.length &&
      this.dropdown.filterInputChild.nativeElement.value !== ''
    ) {
      const searchValue = this.dropdown.filterInputChild.nativeElement.value
        .toString()
        .toLowerCase();
      const filtered = this.selected.filter(
        (item) => item.toString().toLowerCase().indexOf(searchValue) < 0
      );
      this.selected = filtered;
    } else if (!event.length) { this.selected = []; } else if (event.length < this.selected.length) {
      const filtered = this.selected.filter((x) => event.includes(x));
      if (!filtered.length) {  this.selected = Array.from(new Set(this.selected.concat(event))); } else { this.selected = filtered; }
    } else { this.selected = Array.from(new Set(this.selected.concat(event))); }
  }

  onAdd(event) {
    this.dropdown.hide();
    this.selected = [];
    this.addClicked.emit();
    this.stopPropagation(event);
  }

  onClose(event) {
    this.dropdown.hide();
    this.closeClicked.emit();
    this.stopPropagation(event);
  }

  show(event) {
    this.dropdown.show();
    this.stopPropagation(event);

  }

  clearAll() {
    this.selected = [];
    this.valueChange.emit([]);
  }

  updatevalue(val) {
    this.valueChange.emit(this.selected);
  }

  viewSelected(value: boolean, event) {
    if (!this.allItems) {
      this.allItems = this.items;
    }
    if (value) {
      this.items = this.items.filter((e) => this.selected.includes(e.value));
    } else {
      this.items = this.allItems;
      this.isViewSelected = false;
    }
    this.stopPropagation(event);
  }

  stopPropagation(event) {
    event.stopPropagation();
  }

  onShowHidePanel(show) {
    this.dropdownlistShowed = show;
    const itemWrap = document.querySelector('.p-multiselect-items-wrapper');
    if (itemWrap) { itemWrap.classList.remove('p-multiselect-border'); }
    if (show) {
      const parentBlockWidth = this.dropdown.el.nativeElement.offsetWidth;
      const dropdownPanel = document.querySelectorAll('.p-multiselect-panel.p-component:not(.tree-select-panel)');
      if (this.showToggleAll && itemWrap) { itemWrap.classList.add('p-multiselect-border'); }
      setTimeout(() => {
        for (let index = 0; index < dropdownPanel.length; index++) {
          const element = dropdownPanel[index];
          element['style'].width = `${parentBlockWidth - 2}px`;
          const left = element['style'].left.substr(0, element['style'].left.length - 2);
          element['style'].left = `${Number(left) + 1}px`;
        }
      }, 0);
    }
  }
}
