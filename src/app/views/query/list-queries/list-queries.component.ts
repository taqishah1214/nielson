import {
  Component,
  OnInit,
  Injector,
  AfterViewInit,
  OnDestroy,
} from '@angular/core';
import { QueryService } from 'src/app/core/query/_services/query.service';
import { ClientService } from 'src/app/core/query/_services/client.service';
import { Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { ConfirmDialogComponent } from '../../../shared/components/confirm-dialog/confirm-dialog.component';
import { ConfirmDialogModel } from 'src/app/core/query/_base/shared/models/common-components-modal/confirmDialog.model';
import { QueryMenuComponent } from './query-menu/query-menu.component';
import { GridLoadingOverlayComponent } from '../../../shared/components/grid-loading-overlay/grid-loading-overlay.component';
import { QueryTooltipComponent } from './tooltip/query-tooltip.component';
import { nullFormatter } from 'src/app/core/query/_base/layout/helpers/null-formatter.helper';
import { AppComponentBase } from 'src/app/core/app-component-base';

@Component({
  selector: 'app-list-queries',
  templateUrl: './list-queries.component.html',
  styleUrls: ['./list-queries.component.scss'],
})
export class ListQueriesComponent
  extends AppComponentBase
  implements OnInit, AfterViewInit, OnDestroy {
  columnDefs;
  isRowSelectable;
  loadingOverlayComponent;
  hasError = false;

  public gridOptions = {
    rowClassRules: {
      'ag-row-selected': function (params) {
        return params.node.isOwnerLoggedIn === true;
      },
    },
    context: {
      componentParent: this,
    },
  };

  frameworkComponents;
  tooltipShowDelay;

  private gridApi;

  rowData: any;

  deleteSelected = false;

  deleteQueries: string[];

  searchValue;
  icons: { filter: string };

  constructor(
    private _queryService: QueryService,
    private _router: Router,
    private _clientService: ClientService,
    public dialog: MatDialog,
    private injector: Injector
  ) {
    super(injector);
  }
  ngOnDestroy(): void {
    window.onresize = null;
  }

  ngOnInit(): void {
    // define columns
    this.columnDefs = [
      {
        // uses the default column properties
        headerName: 'Name',
        field: 'queryName',
        suppressMovable: true,
        // Define Sorting Procedure
        comparator: this.caseInSensitiveComparator,
        // enable sorting
        sortable: true,
        // explicitly configure the Set Filter
        filter: 'agSetColumnFilter',
        // filter params (button, behaviour)

        //// explicitly configure the Tab in the Filter
        menuTabs: ['filterMenuTab'],
        // render HTML
        cellRenderer: (params) => {
          if (!params.data.ownerLoggedIn) {
            return (
              `
         <div ref="eWrapper" class="ag-wrapper ag-input-wrapper ag-checkbox-input-wrapper disabled-checkbox">
             <input ref="eInput" [disabled]  type="checkbox" >
         </div>
     ` + params.data.queryName
            );
          } else {
            return params.data.queryName;
          }
        },
        // enable Row Checkbox
        checkboxSelection: true,
        // enable header checkbox
        headerCheckboxSelection: true,
        // checkbox will update its state based only on filtered rows.
        headerCheckboxSelectionFilteredOnly: true,
        minWidth: 250,
        tooltipField: 'queryName',
        // explicitly configure the tooltip
        tooltipComponent: 'queryTooltip',
        tooltipComponentParams: { for: 'name' },
        // explicitly configure the menu icon on column
        icons: { menu: '<img src=\'assets/svgs/filter.svg\'\'>', filter: '' },
      },
      {
        headerName: 'Last Saved',
        field: 'lastUpdated',
        suppressMovable: true,
        // Define Sorting Procedure
        comparator: this.dateComparer,
        sortable: true,
        sort: 'desc',
        width: 130,
        getQuickFilterText: () => '',
        filter: 'agSetColumnFilter',

        menuTabs: ['filterMenuTab'],
        icons: { menu: '<img src=\'assets/svgs/filter.svg\'>' },
        // render -- for blanks
        valueFormatter: nullFormatter,
      },
      {
        headerName: 'Owner',
        field: 'owner',
        suppressMovable: true,
        comparator: this.caseInSensitiveComparator,
        sortable: true,
        width: 250,
        getQuickFilterText: () => '',
        filter: 'agSetColumnFilter',

        menuTabs: ['filterMenuTab'],
        tooltipField: 'owner',
        tooltipComponent: 'queryTooltip',
        tooltipComponentParams: { for: 'owner' },
        icons: { menu: '<img src=\'assets/svgs/filter.svg\'>' },
      },
      {
        headerName: 'Frequency',
        field: 'frequency',
        suppressMovable: true,
        sortable: true,
        width: 250,
        getQuickFilterText: () => '',
        filter: 'agSetColumnFilter',
        menuTabs: ['filterMenuTab'],
        tooltipField: 'frequency',
        tooltipComponent: 'queryTooltip',
        tooltipComponentParams: { for: 'frequency' },
        icons: { menu: '<img src=\'assets/svgs/filter.svg\'>' },
        valueFormatter: nullFormatter,
      },
      {
        headerName: 'Next Run',
        field: 'nextRun',
        suppressMovable: true,
        // Define Sorting Procedure
        comparator: this.dateComparer,
        sortable: true,
        width: 100,
        getQuickFilterText: () => '',
        filter: 'agSetColumnFilter',

        menuTabs: ['filterMenuTab'],
        icons: { menu: '<img src=\'assets/svgs/filter.svg\'>' },
        valueFormatter: nullFormatter,
      },
      {
        headerName: 'Last Run',
        field: 'lastRun',
        suppressMovable: true,
        // Define Sorting Procedure
        comparator: this.dateComparer,
        sortable: true,
        width: 100,
        getQuickFilterText: () => '',
        filter: 'agSetColumnFilter',

        menuTabs: ['filterMenuTab'],
        icons: { menu: '<img src=\'assets/svgs/filter.svg\'>' },
        valueFormatter: nullFormatter,
      },
      {
        headerName: '',
        suppressMovable: true,
        width: 50,
        menuTabs: [],
        // render component in cell
        cellRendererFramework: QueryMenuComponent,
        cellStyle: { overflow: 'inherit !important' },
      },
    ];

    this.icons = {
      filter: '',
    };
    this.tooltipShowDelay = 0;
    this.isRowSelectable = function (rowNode) {
      return rowNode.data ? rowNode.data.ownerLoggedIn === true : false;
    };

    this.frameworkComponents = {
      gridLoadingOverlay: GridLoadingOverlayComponent,
      queryTooltip: QueryTooltipComponent,
    };

    this.loadingOverlayComponent = 'gridLoadingOverlay';
    this.listQueries();
  }

  ngAfterViewInit(): void {
    const body = document.body;
    body.addEventListener('click', (e) => {
      const filterheader = document.querySelectorAll(
        '.ag-header-cell.ag-header-cell-sortable:not(.ag-header-cell-filtered)'
      );
      for (let index = 0; index < filterheader.length; index++) {
        const element = filterheader[index];
        const filterIcon = element.querySelector(
          '.ag-header-icon.ag-header-cell-menu-button > img'
        );
        filterIcon['src'] = 'assets/svgs/filter.svg';
      }
    });
  }

  filterOpened(e) {
    const filterHeaderIcon = document.querySelector(
      '.ag-header-cell.ag-column-menu-visible .ag-header-icon.ag-header-cell-menu-button > img'
    );
    if (filterHeaderIcon) {
      filterHeaderIcon['src'] = 'assets/svgs/filter-hover.svg';
    }
  }

  dateComparer(date1, date2) {
    // Compare Dates For Sorting
    let date1Number = 0;
    let date2Number = 0;
    if (!date1 || !date1.trim()) {
      date1Number = 0;
    } else {
      date1 = new Date(date1);
      const year1Number = date1.getFullYear();
      const month1Number = date1.getMonth() + 1;
      const day1Number = date1.getDate();
      date1Number = year1Number * 10000 + month1Number * 100 + day1Number;
    }
    if (!date2 || !date2.trim()) {
      date2Number = 0;
    } else {
      date2 = new Date(date2);
      const year2Number = date2.getFullYear();
      const month2Number = date2.getMonth() + 1;
      const day2Number = date2.getDate();
      date2Number = year2Number * 10000 + month2Number * 100 + day2Number;
    }
    if (date1Number === 0 && date2Number === 0) {
      return 0;
    }
    if (date1Number === 0) {
      return -1;
    }
    if (date2Number === 0) {
      return 1;
    }
    return date1Number - date2Number;
  }

  caseInSensitiveComparator = (valueA, valueB) => {
    return valueA.toLowerCase().localeCompare(valueB.toLowerCase());
  }
  listQueries() {
    // Get Query Data for API
    this._queryService.listQueries(this._clientService.getClientId()).subscribe(
      (result) => {
        this.rowData = result;
      },
      (err) => {
        this.hasError = true;
      }
    );
  }

  onFilterChanged(event) {
    // Get Last Updated Filter Instance
    let isFilterActive = this.gridApi.getFilterInstance('lastUpdated')
      .setFilterParams.column.filterActive;
    // Update Last Updated Filter Icon
    if (isFilterActive) {
      this.columnDefs.filter((x) => x.field === 'lastUpdated')[0].icons = {
        menu: '<img src=\'assets/svgs/filter-fill.svg\'>',
      };
    } else {
      this.columnDefs.filter((x) => x.field === 'lastUpdated')[0].icons = {
        menu: '<img src=\'assets/svgs/filter.svg\'>',
      };
    }
    // Get queryName Filter Instance
    isFilterActive = this.gridApi.getFilterInstance('queryName').setFilterParams
      .column.filterActive;
    // Update queryName Filter Icon
    if (isFilterActive) {
      this.columnDefs.filter((x) => x.field === 'queryName')[0].icons = {
        menu: '<img src=\'assets/svgs/filter-fill.svg\'>',
      };
    } else {
      this.columnDefs.filter((x) => x.field === 'queryName')[0].icons = {
        menu: '<img src=\'assets/svgs/filter.svg\'>',
      };
    }
    // Get owner Filter Instance
    isFilterActive = this.gridApi.getFilterInstance('owner').setFilterParams
      .column.filterActive;
    // Update owner Filter Icon
    if (isFilterActive) {
      this.columnDefs.filter((x) => x.field === 'owner')[0].icons = {
        menu: '<img src=\'assets/svgs/filter-fill.svg\'>',
      };
    } else {
      this.columnDefs.filter((x) => x.field === 'owner')[0].icons = {
        menu: '<img src=\'assets/svgs/filter.svg\'>',
      };
    }
    // Get frequency Filter Instance
    isFilterActive = this.gridApi.getFilterInstance('frequency').setFilterParams
      .column.filterActive;
    // Update frequency Filter Icon
    if (isFilterActive) {
      this.columnDefs.filter((x) => x.field === 'frequency')[0].icons = {
        menu: '<img src=\'assets/svgs/filter-fill.svg\'>',
      };
    } else {
      this.columnDefs.filter((x) => x.field === 'frequency')[0].icons = {
        menu: '<img src=\'assets/svgs/filter.svg\'>',
      };
    }
    // Get nextRun Filter Instance
    isFilterActive = this.gridApi.getFilterInstance('nextRun').setFilterParams
      .column.filterActive;
    // Update nextRun Filter Icon
    if (isFilterActive) {
      this.columnDefs.filter((x) => x.field === 'nextRun')[0].icons = {
        menu: '<img src=\'assets/svgs/filter-fill.svg\'>',
      };
    } else {
      this.columnDefs.filter((x) => x.field === 'nextRun')[0].icons = {
        menu: '<img src=\'assets/svgs/filter.svg\'>',
      };
    }
    // Get lastRun Filter Instance
    isFilterActive = this.gridApi.getFilterInstance('lastRun').setFilterParams
      .column.filterActive;
    // Update lastRun Filter Icon
    if (isFilterActive) {
      this.columnDefs.filter((x) => x.field === 'lastRun')[0].icons = {
        menu: '<img src=\'assets/svgs/filter-fill.svg\'>',
      };
    } else {
      this.columnDefs.filter((x) => x.field === 'lastRun')[0].icons = {
        menu: '<img src=\'assets/svgs/filter.svg\'>',
      };
    }

    this.gridApi.setColumnDefs(this.columnDefs);
  }
  confirmDialog(): void {
    // confirm dialog for delete query
    let message = '';
    if (this.deleteQueries.length > 1) {
      message = this.deleteQueries.length + ` queries will be removed.`;
    } else {
      message = `1 query will be removed.`;
    }
    const dialogData = new ConfirmDialogModel(
      'Delete Query?',
      message,
      'Delete'
    );
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      data: dialogData,
    });
    dialogRef.afterClosed().subscribe((dialogResult) => {
      if (dialogResult) {
        this.deleteByIds();
      }
    });
  }

  onGridReady(params) {
    // grid ready call back
    this.gridApi = params.api;
    this.gridApi.sizeColumnsToFit();
    if (this.hasError) {
      this.gridApi.hideOverlay();
    }
    window.onresize = () => {
      this.gridApi.sizeColumnsToFit();
    };
  }

  getContextMenuItems(params) {
    const result = ['copy', 'copyWithHeaders', 'paste'];
    return result;
  }
  onRowDataChanged(params) {
    // detect change in row data
    this.gridApi.onFilterChanged();
  }

  quickSearch() {
    // for quick filter
    this.gridApi.setQuickFilter(this.searchValue);
  }

  navigateToCreateQuery() {
    // to route create query page
    this._router.navigate(['/app/query/create']);
  }

  onSelectionChanged(event) {
    // called when one or more rows are selected or deselected
    let selectedQueries = [];
    this.deleteQueries = [];
    selectedQueries = this.gridApi.getSelectedRows();
    selectedQueries.forEach((element) => {
      this.deleteQueries.push(element.queryId);
    });
  }

  deleteByIds() {
    // to delete selected queries
    this.loader.show();
    this._queryService
      .deleteQueries(this._clientService.getClientId(), this.deleteQueries)
      .subscribe(
        (result) => {
          if (this.deleteQueries.length > 1) {
            this.notify.success(`Queries have been deleted successfully.`);
          } else {
            this.notify.success(`Query has been deleted successfully.`);
          }
          this.loader.hide();
          this.listQueries();
        },
        (err) => {
          this.loader.hide();
        }
      );
  }
}
