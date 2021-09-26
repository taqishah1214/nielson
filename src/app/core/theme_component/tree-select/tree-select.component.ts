import {
  Component,
  ViewEncapsulation,
  Input,
  Output,
  EventEmitter,
  ViewChild,
} from '@angular/core';
import { MenuItem, SelectItem, SelectItemGroup } from 'primeng/api';

@Component({
  selector: 'tree-select',
  styleUrls: ['./tree-select.component.scss'],
  templateUrl: './tree-select.component.html',
})
export class TreeSelectComponent {
  dropdownlistShowed = false;
  public selectedOptions: Array<any> = new Array<any>();
  public treeOptions: Array<any> = new Array<any>();
  public selectedItemsLabel = '';
  apply = true;
  @Input() singularCaption: string;
  @Input() pluralCaption: string;
  @Input() caption: string;
  @Input() set options(value: Array<any>) {
    this.treeOptions = value;
    if (value && value.length) {
      this.selectedOptions = [...value];
      value.forEach((val) => {
        this.selectedOptions.push(val.label);
      });
    }
  }
  @Input() disabled: boolean;
  @Input() set selected(value: Array<any>) {
    if (value !== this.selectedOptions) {
      this.populate(value);
    }
  }
  @Output() valueChanged: EventEmitter<any> = new EventEmitter<any>();
  @Output() applyChange: EventEmitter<any> = new EventEmitter<any>();
  @ViewChild('tSelect') treeDropdown: any;

  public onChangeMultiSelect($event) {
    if ($event.itemValue) {
      let checked = false;

      if ($event.originalEvent.target.innerHTML !== '') {
        checked =
          $event.originalEvent.target.children[0].className.indexOf(
            'pi-check'
          ) > -1
            ? true
            : false;
      } else {
        checked =
          $event.originalEvent.target.className.indexOf('pi-check') > -1
            ? true
            : false;
      }

      this.handleMultiSelectOptionClicked($event, checked);
    }
  }

  private populate(items: Array<any>) {
    if (this.treeOptions?.length && items?.length) {
      const labels = [];
      this.treeOptions.forEach((opt) => {
        const selectedOption = items.filter(
          (item) => opt.label === item.label && opt.value === item.value
        );
        if (selectedOption && selectedOption?.length) {
          if (
            selectedOption[0].childOptions.length === opt.childOptions.length
          ) {
            if (
              selectedOption[0].selectedChildOptions.length ===
              selectedOption[0].childOptions.length
            ) {
              labels.push(selectedOption[0].label);
            }
          }
          opt.selectedChildOptions = [
            ...selectedOption[0].selectedChildOptions,
          ];
        }
      });
      this.selectedOptions = Array.from(new Set([...items, ...labels]));
      this.getSelectedItemsLabel();
      this.propogateSelectedItems();
    }
  }

  private handleMultiSelectOptionClicked(event, checked) {
    this.apply = false;
    let elementChecked = false;
    elementChecked = !checked;
    if (elementChecked) {
      this.selectedOptions = Array.from(
        new Set([...this.selectedOptions, ...[event.itemValue]])
      );

      this.treeOptions.forEach((option) => {
        if (
          option.label === event.itemValue &&
          option.value === event.itemValue
        ) {
          option.selectedChildOptions = option.childOptions.map(
            (child) => child.label
          );

          let exitsts = false;
          for (let index = 0; index < this.selectedOptions.length; index++) {
            const element = this.selectedOptions[index];
            if (
              element.label === option.label &&
              element.value === option.value
            ) {
              exitsts = true;
              this.selectedOptions[index] = { ...option };
              break;
            }
          }

          if (!exitsts) {
            this.selectedOptions.push(option);
          }
        }
      });
    } else {
      this.treeOptions.forEach((option) => {
        if (
          option.label === event.itemValue &&
          option.value === event.itemValue
        ) {
          option.selectedChildOptions = [];
        }
      });

      let idx;
      for (let index = 0; index < this.selectedOptions.length; index++) {
        const element = this.selectedOptions[index];
        if (
          element.label === event.itemValue &&
          element.value === event.itemValue
        ) {
          idx = index;
          break;
        }
      }
      const indexed = this.itemIndexFromList(event.itemValue);
      if (indexed) {
        this.selectedOptions.splice(indexed, 1);
      }
    }
    this.propogateSelectedItems();
  }

  itemIndexFromList(item) {
    let index;
    this.selectedOptions.forEach((element, idx) => {
      if (item === element || item === element?.label) {
        index = idx;
      }
    });

    return index;
  }

  removeChildItems(option) {
    const indexes = [];

    option.childOptions.forEach((element, idx) => {
      if (!option.selectedChildOptions.includes(element.label)) {
        indexes.push(idx);
      }
    });

    for (let index = 0; index < indexes.length; index++) {
      const element = indexes[index];
      option.childOptions.splice(element, 1);
    }
  }

  public onChangeChildOptionCheckbox(option) {
    if (option.childOptions.length !== option.selectedChildOptions.length) {
      const idx = this.itemIndexFromList(option.label);
      if (idx) {
        this.selectedOptions.splice(this.itemIndexFromList(option.label), 1);
      }
    } else if (
      option.childOptions.length === option.selectedChildOptions.length
    ) {
      const idx = this.itemIndexFromList(option.label);
      if (!idx || this.itemIndexFromList(option.label) < 0) {
        this.selectedOptions.push(option.label);
      }
    }

    for (let index = 0; index < this.selectedOptions.length; index++) {
      const element = this.selectedOptions[index];
      if (element.label === option.label && element.value === option.value) {
        this.selectedOptions[index] = { ...option };
        break;
      }
    }
    this.getSelectedItemsLabel();
    this.propogateSelectedItems();
  }

  public propogateSelectedItems() {
    const prpogateObjects = [];
    this.treeOptions.forEach((opt) => {
      if (opt.childOptions.length === opt.selectedChildOptions.length) {
        prpogateObjects.push(opt);
      } else if (opt.selectedChildOptions.length) {
        const childItems = opt.childOptions.filter((child) =>
          opt.selectedChildOptions.includes(child.label)
        );
        const optn = { ...opt, childOptions: childItems };
        prpogateObjects.push(optn);
      }
    });
    this.valueChanged.emit(prpogateObjects);
  }

  public onClickChildOptionChecbox(event) {
    this.apply = false;
    event.stopPropagation();
  }

  public onClickChildOptionContainer(event) {
    event.stopPropagation();
  }

  public getSelectedItemsLabel() {
    if (this.selectedOptions.length > 1) {
      let num = 0;
      let index;
      this.selectedOptions.forEach((itm, idx) => {
        if (itm.selectedChildOptions) {
          if (itm.childOptions.length === itm.selectedChildOptions.length) {
            num = num + 1;
            index = idx;
          } else {
            num += itm?.selectedChildOptions?.length || 0;
          }
        } else {
          num = num + 0;
        }
      });
      return num === 1
        ? this.selectedOptions[index]?.label || this.selectedOptions[0].label
        : num;
    }

    return this.selectedOptions.length > 0 ? this.selectedOptions[0].label : '';
  }

  public getSelectedItemsCount() {
    let num = 0;
    if (this.selectedOptions.length) {
      this.selectedOptions.forEach((itm) => {
        if (itm.selectedChildOptions) {
          num = num + itm.selectedChildOptions.length;
        }
      });
    }
    return num;
  }

  public onMultiSelectPanelHide() {
    const selectedresults = {
      parentOptions: [],
      childOptions: [],
    };
    this.treeOptions.forEach((option) => {
      if (option.childOptions.length === option.selectedChildOptions.length) {
        selectedresults.parentOptions.push(option);
      } else {
        option.selectedChildOptions.forEach((childOption) => {
          selectedresults.childOptions.push(childOption);
        });
      }
    });
  }

  public onApplyChanges(event) {
    this.treeDropdown.hide();
    this.applyChange.emit();
    this.apply = true;
    this.stopPropagation(event);
  }

  stopPropagation(event) {
    event.stopPropagation();
  }

  clearAll() {
    this.selectedOptions = [];
    this.treeOptions.forEach((opt) => {
      opt.selectedChildOptions = [];
    });
    this.apply = false;
    this.valueChanged.emit([]);
  }

  onShowHidePanel(show) {
    this.dropdownlistShowed = show;
    if (show) {
      const dropdownPanels = document.querySelectorAll(
        '.p-multiselect-panel.p-component'
      );
      const dropdownPanel = dropdownPanels[dropdownPanels.length - 1];
      const panelWidth = dropdownPanel['offsetWidth'];
      dropdownPanel['classList'].add('tree-select-panel');
      setTimeout(() => {
        const parentBlockWidth = this.treeDropdown.el.nativeElement.offsetWidth;
        dropdownPanel['style'].width = `${parentBlockWidth - 2}px`;
        let leftaddup = 1;
        if (panelWidth > dropdownPanel['offsetWidth']) {
          leftaddup =
            panelWidth -
            dropdownPanel['style'].width.substr(
              0,
              dropdownPanel['style'].width.length - 2
            );
        }
        const left = dropdownPanel['style'].left.substr(
          0,
          dropdownPanel['style'].left.length - 2
        );
        dropdownPanel['style'].left = `${Number(left) + Number(leftaddup)}px`;
      }, 0);
    } else {
      const dropdownPanel = document.querySelector(
        '.p-multiselect-panel.p-component.tree-select-panel'
      );
      dropdownPanel['classList'].remove('tree-select-panel');
    }
  }
}
