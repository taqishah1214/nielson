import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PrimaryBtnComponent } from 'src/app/core/theme_component/primary-btn/primary-btn.component';
import { CancelBtnComponent } from 'src/app/core/theme_component/cancel-btn/cancel-btn.component';
import { SingleSelectComponent } from '../core/theme_component/single-select/single-select.component';
import {MultiSelectModule} from 'primeng/multiselect';
import { DropdownModule } from 'primeng/dropdown';
import {FormsModule} from '@angular/forms';
import { MultiSelectComponent } from '../core/theme_component/multi-select/multi-select.component';
import { ListFilterPipe } from '../core/theme_component/multi-select/multi-select-filter.pipe';
import { TreeSelectComponent } from '../core/theme_component/tree-select/tree-select.component';
import { ActionBtnComponent } from '../core/theme_component/action-btn/action-btn.component';
import { CheckboxModule } from 'primeng/checkbox';

const WIDGETS = [
  PrimaryBtnComponent,
  ActionBtnComponent,
  CancelBtnComponent,
  SingleSelectComponent,
  MultiSelectComponent,
  TreeSelectComponent,
  ListFilterPipe
];


@NgModule({
  declarations: [
    ...WIDGETS
  ],
  imports: [
    CommonModule,
    MultiSelectModule,
    DropdownModule,
    FormsModule,
    CheckboxModule
  ],
  exports : [
    ...WIDGETS
  ]
})
export class SharedModule { }
