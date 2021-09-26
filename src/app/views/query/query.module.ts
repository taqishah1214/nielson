import { NgModule } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { CreateQueryComponent } from './create-query/create-query.component';
import { QueryRoutingModule } from './query-routing.module';
import { QueryService } from 'src/app/core/query/_services/query.service';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatOptionModule, NativeDateModule } from '@angular/material/core';
import { A11yModule } from '@angular/cdk/a11y';
import { ClipboardModule } from '@angular/cdk/clipboard';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { PortalModule } from '@angular/cdk/portal';
import { ScrollingModule } from '@angular/cdk/scrolling';
import { CdkStepperModule } from '@angular/cdk/stepper';
import { CdkTableModule } from '@angular/cdk/table';
import { CdkTreeModule } from '@angular/cdk/tree';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatBadgeModule } from '@angular/material/badge';
import { MatBottomSheetModule } from '@angular/material/bottom-sheet';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatChipsModule } from '@angular/material/chips';
import { MatStepperModule } from '@angular/material/stepper';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatDividerModule } from '@angular/material/divider';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatGridListModule } from '@angular/material/grid-list';
import { MatNativeDateModule, MatRippleModule } from '@angular/material/core';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatRadioModule } from '@angular/material/radio';
import { MatSelectModule } from '@angular/material/select';
import { MatSliderModule } from '@angular/material/slider';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatSortModule } from '@angular/material/sort';
import { MatTableModule } from '@angular/material/table';
import { MatTabsModule } from '@angular/material/tabs';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatTreeModule } from '@angular/material/tree';
import { MatMenuModule } from '@angular/material/menu';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { LayoutModule } from '@angular/cdk/layout';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgxMatSelectSearchModule } from 'ngx-mat-select-search';
import { UtilsModule } from 'src/app/core/query/_base/shared/utils.module';
import { ListQueriesComponent } from './list-queries/list-queries.component';
import { ClientService } from 'src/app/core/query/_services/client.service';
import { QueryMenuComponent } from './list-queries/query-menu/query-menu.component';
import { DuplicateQueryComponent } from './list-queries/duplicate-query/duplicate-query.component';
import { SpinnerOverlayService } from 'src/app/core/query/_services/spinner-overlay.service';
import { QueryTooltipComponent } from './list-queries/tooltip/query-tooltip.component';
import { MultiSelectModule } from 'primeng/multiselect';
import { SharedModule } from '../../shared/shared.module';
import { QueryConfigComponent } from './create-query/query-config/query-config.component';
import { QueryFilterOptionComponent } from './create-query/query-filter-option/query-filter-option.component';
import { AgGridModule } from 'ag-grid-angular';

@NgModule({
  declarations: [
    QueryMenuComponent,
    CreateQueryComponent,
    ListQueriesComponent,
    DuplicateQueryComponent,
    QueryTooltipComponent,
    QueryConfigComponent,
    QueryFilterOptionComponent
  ],
  imports: [
    CommonModule,
    UtilsModule,
    QueryRoutingModule,
    MatInputModule,
    MatFormFieldModule,
    MatMenuModule,
    MatButtonModule,
    MatCardModule,
    LayoutModule,
    MatToolbarModule,
    MatSidenavModule,
    MatIconModule,
    MatListModule,
    MatOptionModule,
    A11yModule,
    ClipboardModule,
    CdkStepperModule,
    CdkTableModule,
    CdkTreeModule,
    DragDropModule,
    MatAutocompleteModule,
    MatBadgeModule,
    MatBottomSheetModule,
    MatButtonToggleModule,
    MatCheckboxModule,
    MatChipsModule,
    MatStepperModule,
    MatDatepickerModule,
    MatDialogModule,
    MatDividerModule,
    MatExpansionModule,
    MatGridListModule,
    MatNativeDateModule,
    MatPaginatorModule,
    MatProgressBarModule,
    MatProgressSpinnerModule,
    MatRadioModule,
    NativeDateModule,
    MatRippleModule,
    MatSelectModule,
    MatSliderModule,
    MatSlideToggleModule,
    MatSnackBarModule,
    MatSortModule,
    MatTableModule,
    MatTabsModule,
    MatTooltipModule,
    MatTreeModule,
    PortalModule,
    ScrollingModule,
    FormsModule,
    ReactiveFormsModule,
    NgxMatSelectSearchModule,
    MultiSelectModule,
    SharedModule,
    AgGridModule.withComponents([])
  ],
  providers: [
    QueryService,
    ClientService,
    DatePipe,
    SpinnerOverlayService,
    {
      provide: MatDialogRef,
      useValue: {},
    },
  ],
})
export class QueryModule {}
