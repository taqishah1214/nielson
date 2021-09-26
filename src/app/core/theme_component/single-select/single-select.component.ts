import {
  Component,
  Input,
  Output,
  EventEmitter,
  ViewChild,
  AfterViewInit,
} from '@angular/core';
import { SelectItemGroup, MenuItem, SelectItem } from 'primeng/api';

@Component({
  selector: 'single-select',
  styleUrls: ['./single-select.component.scss'],
  templateUrl: './single-select.component.html',
})
export class SingleSelectComponent implements AfterViewInit {
  @ViewChild('sSelect') dropdown: any;
  @Input() caption: string;
  @Input() items: Array<any> = [];
  @Input() filter = false;
  @Output() valueChange = new EventEmitter();
  @Input() selected: any;
  @Input() id: string;
  @Input() autoDisplayFirst: boolean;
  @Input() disabled: boolean;
  @Input() required = false;
  dropdownlistShowed = false;

  constructor() { }

  ngAfterViewInit(): void {
    if (!this.selected) {
      if (this.required) {
        this.dropdown.el.nativeElement.querySelector(
          'span'
        ).innerHTML = `${this.caption} <span class="starick-color">*</span>`;
      } else {
        this.dropdown.el.nativeElement.querySelector(
          'span'
        ).innerHTML = `${this.caption}`;
      }
    }
  }

  show(event) {
    this.dropdown.show();
    this.stopPropagation(event);

  }


  stopPropagation(event) {
    event.stopPropagation();
  }

  updatevalue(val) {
    this.valueChange.emit(val.value);
  }

  onShowHidePanel(show) {
    this.dropdownlistShowed = show;
    if (show) {
      const parentBlockWidth = this.dropdown.el.nativeElement.querySelector(
        '.single-select.p-dropdown.p-component.p-dropdown-open'
      ).clientWidth;
      const dropdownPanel = document.querySelector(
        '.p-dropdown-panel.p-component'
      );
      dropdownPanel['style'].width = `${parentBlockWidth}px`;
      setTimeout(() => {
        const left = dropdownPanel['style'].left;
        dropdownPanel['style'].left = `${Number(left.substring(0, left.length - 2)) + 1
          }px`;
      }, 0);
    }
  }
}
