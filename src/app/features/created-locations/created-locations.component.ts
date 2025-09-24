import {
  afterNextRender, AfterRenderRef,
  ChangeDetectionStrategy,
  Component, computed,
  inject, OnDestroy,
  signal,
  TemplateRef,
  viewChild,
  WritableSignal
} from '@angular/core';
import {PdfMakerService} from '../../core/services';
import {INITIAL_FILTER_PAYLOAD, mockPDFRecords} from '../../shared/constants/common-constants';
import {GenericTableComponent} from '../../shared/components/generic-table/generic-table.component';
import {ItemFilter, TableColumn} from '../../shared';
import {CreatedLocation, CreatedLocationColumnType, CreatedLocationResponse} from './models/created-location.model';
import {genericCasting} from '../../shared/helpers/helpers';
import {CustomStatusComponent} from '../../shared/components/custom-status/custom-status.component';
import {CopyToClipboardComponent} from '../../shared/components/copy-to-clipboard/copy-to-clipboard.component';
import {TableActionBulkComponent} from '../../shared/components/table-action-bulk/table-action-bulk.component';
import {Button} from 'primeng/button';
import {GenericTableCacheService} from '../../shared/services';
import {HubFiltersComponent} from '../../shared/components/hub-filters/hub-filters.component';
import {ConfirmationService, MessageService} from 'primeng/api';
import {HubFilters} from '../../shared/components/hub-filters/models/hub-filters.model';
import {DialogService} from 'primeng/dynamicdialog';
import {LoadingDialogComponent} from '../../shared/dialogs/loading-dialog/loading-dialog.component';
import {LoadingDialogService} from '../../shared/services/loading-dialog.service';
import {catchError, EMPTY, tap} from 'rxjs';
import {LocationsService} from './services/locations.service';
import {TitleWithIconComponent} from '../../shared/components/title-with-icon/title-with-icon.component';
import {ComponentStateComponent} from '../../shared/components/component-state/component-state.component';

@Component({
  selector: 'app-created-locations',
  imports: [
    GenericTableComponent,
    CustomStatusComponent,
    CopyToClipboardComponent,
    TableActionBulkComponent,
    Button,
    HubFiltersComponent,
    TitleWithIconComponent,
    ComponentStateComponent,
  ],
  providers: [DialogService],
  standalone: true,
  templateUrl: './created-locations.component.html',
  styleUrl: './created-locations.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CreatedLocationsComponent implements OnDestroy {
  // INJECTIONS
  readonly #pdfMakerService: PdfMakerService = inject(PdfMakerService);
  readonly genericTableCacheService: GenericTableCacheService = inject(GenericTableCacheService);
  protected readonly confirmationService: ConfirmationService = inject(ConfirmationService);
  readonly #locationsService: LocationsService = inject(LocationsService);
  readonly #dialogService: DialogService = inject(DialogService);
  readonly loadingDialogService = inject(LoadingDialogService);
  readonly #messageService: MessageService = inject(MessageService);

  // SIGNALS
  columns: WritableSignal<TableColumn<CreatedLocation>[]> = signal([]);
  selectedItemsCounter = signal(0);
  items = signal<CreatedLocation[]>([]);
  locationsPayload = signal<ItemFilter>(INITIAL_FILTER_PAYLOAD);
  // SIGNAL STATES
  isEmptyState = signal(false);
  isErrorState = signal(false);
  isApplyingFilter = signal(false);

  // VIEW CHILDREN
  qrStatusCustomColumn = viewChild<TemplateRef<{$implicit: CreatedLocation}>>('qrStatusCustomColumn');
  codeCustomColumn = viewChild<TemplateRef<{$implicit: CreatedLocation}>>('codeCustomColumn');
  districtCustomColumn = viewChild<TemplateRef<{$implicit: CreatedLocation}>>('districtCustomColumn');

  // CASTING
  protected readonly genericCasting = genericCasting<CreatedLocation>;

  init: AfterRenderRef = afterNextRender(() => {
    this.getCreatedLocations();
  });

  ngOnDestroy(): void {
    this.genericTableCacheService.resetCache();
  }

  createTableColumns(): CreatedLocationColumnType[] {
    return [
      {field: 'district', template: this.districtCustomColumn()},
      {field: 'category'},
      {field: 'building'},
      {field: 'floor'},
      {field: 'zone'},
      {field: 'code', template: this.codeCustomColumn()},
      {field: '', template: this.qrStatusCustomColumn(), columnWidth: '200px'},
    ]
  }

  getCreatedLocations(): void {
    this.#locationsService.getCreatedLocations(this.locationsPayload()).pipe(
      tap((createdLocations: CreatedLocationResponse) => {
        console.log(createdLocations, 'CREATED LOCATIONS FROM API');
        if (createdLocations) {
          this.genericTableCacheService.totalAvailableItems.set(createdLocations.totalElements);
          this.items.set(createdLocations.content);
          this.isEmptyState.set(false);
          this.isErrorState.set(false);
        } else {
          this.handleEmptyState();
        }
      }),
      catchError(() => {
        this.handleErrorState();
        return EMPTY;
      }),
    ).subscribe();
  }

  updateFilterPayload(newFilters: HubFilters | ItemFilter): void {
    this.locationsPayload.update((current) => ({...current, ...newFilters}));
    console.log(this.locationsPayload(), 'UPDATED PAYLOAD');
  }

  async printMock() {
    try {
      await this.#pdfMakerService.generatePdfSingleColumn(mockPDFRecords, mockPDFRecords.length);
      console.log('PDF generated successfully');
    } catch (error) {
      console.error('Error generating PDF:', error);
    }
  }


  mockItems = computed(() =>  {
    return {
      'content': [
        {
          'id': 1,
          'district': 'KL',
          'category': 'Office',
          'building': 'Tower A',
          'floor': '3',
          'zone': 'North',
          'code': 'LOC001',
          'qrCode': '',
          'typeTitle': 'Branch Office',
          'typeCode': 'BO'
        },
        {
          'id': 2,
          'district': 'KL',
          'category': 'Office',
          'building': 'Tower B',
          'floor': '5',
          'zone': 'East',
          'code': 'LOC002',
          'qrCode': 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==',
          'typeTitle': 'Head Quarters',
          'typeCode': 'HQ'
        },
        {
          'id': 3,
          'district': 'Selangor',
          'category': 'Warehouse',
          'building': 'Storage Complex A',
          'floor': '1',
          'zone': 'South',
          'code': 'LOC003',
          'qrCode': 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAC+gGBNxmk7gAAAABJRU5ErkJggg==',
          'typeTitle': 'Distribution Center',
          'typeCode': 'DC'
        },
        {
          'id': 4,
          'district': 'Penang',
          'category': 'Retail',
          'building': 'Plaza Mall',
          'floor': '2',
          'zone': 'West',
          'code': 'LOC004',
          'qrCode': 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M/wHwAEhAJ/wlseKgAAAABJRU5ErkJggg==',
          'typeTitle': 'Retail Store',
          'typeCode': 'RS'
        },
        {
          'id': 5,
          'district': 'Johor',
          'category': 'Manufacturing',
          'building': 'Factory Building 1',
          'floor': '1',
          'zone': 'North',
          'code': 'LOC005',
          'qrCode': 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8/5+hHgAHggJ/PchI7wAAAABJRU5ErkJggg==',
          'typeTitle': 'Production Facility',
          'typeCode': 'PF'
        },
        {
          'id': 6,
          'district': 'KL',
          'category': 'Office',
          'building': 'Business Center',
          'floor': '7',
          'zone': 'Central',
          'code': 'LOC006',
          'qrCode': 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYGBgAAAABQAB6MzFdgAAAABJRU5ErkJggg==',
          'typeTitle': 'Regional Office',
          'typeCode': 'RO'
        },
        {
          'id': 7,
          'district': 'Sabah',
          'category': 'Warehouse',
          'building': 'Logistics Hub',
          'floor': '2',
          'zone': 'East',
          'code': 'LOC007',
          'qrCode': 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP4/5+BAAAEgAGAhkI+7QAAAABJRU5ErkJggg==',
          'typeTitle': 'Logistics Center',
          'typeCode': 'LC'
        },
        {
          'id': 8,
          'district': 'Sarawak',
          'category': 'Office',
          'building': 'Corporate Tower',
          'floor': '12',
          'zone': 'North',
          'code': 'LOC008',
          'qrCode': 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPjPAAAABgABogQKpwAAAABJRU5ErkJggg==',
          'typeTitle': 'Corporate Office',
          'typeCode': 'CO'
        },
        {
          'id': 9,
          'district': 'Kedah',
          'category': 'Retail',
          'building': 'Shopping Complex',
          'floor': '3',
          'zone': 'West',
          'code': 'LOC009',
          'qrCode': 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8/x+BAAAEhAGAeI4xfQAAAABJRU5ErkJggg==',
          'typeTitle': 'Retail Outlet',
          'typeCode': 'RO'
        },
        {
          'id': 10,
          'district': 'Perak',
          'category': 'Manufacturing',
          'building': 'Industrial Park A',
          'floor': '1',
          'zone': 'South',
          'code': 'LOC010',
          'qrCode': 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+P+fAQAEgwJ/PdI05wAAAABJRU5ErkJggg==',
          'typeTitle': 'Manufacturing Plant',
          'typeCode': 'MP'
        },
        {
          'id': 11,
          'district': 'KL',
          'category': 'Office',
          'building': 'Sky Tower',
          'floor': '15',
          'zone': 'Central',
          'code': 'LOC011',
          'qrCode': 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYGD4DwABBgABpI8xvAAAAABJRU5ErkJggg==',
          'typeTitle': 'Executive Office',
          'typeCode': 'EO'
        },
        {
          'id': 12,
          'district': 'Selangor',
          'category': 'Warehouse',
          'building': 'Distribution Center B',
          'floor': '1',
          'zone': 'East',
          'code': 'LOC012',
          'qrCode': 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP4/58BAAAEhAGAd4IxfQAAAABJRU5ErkJggg==',
          'typeTitle': 'Fulfillment Center',
          'typeCode': 'FC'
        },
        {
          'id': 13,
          'district': 'Melaka',
          'category': 'Retail',
          'building': 'Heritage Mall',
          'floor': '1',
          'zone': 'South',
          'code': 'LOC013',
          'qrCode': 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPj/HwAEhAGALI4xfQAAAABJRU5ErkJggg==',
          'typeTitle': 'Flagship Store',
          'typeCode': 'FS'
        },
        {
          'id': 14,
          'district': 'Negeri Sembilan',
          'category': 'Office',
          'building': 'Tech Park Building',
          'floor': '4',
          'zone': 'West',
          'code': 'LOC014',
          'qrCode': 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8/5+hHgAHggJ/PchI7wAAAABJRU5ErkJggg==',
          'typeTitle': 'Tech Hub',
          'typeCode': 'TH'
        },
        {
          'id': 15,
          'district': 'Pahang',
          'category': 'Manufacturing',
          'building': 'Assembly Plant',
          'floor': '2',
          'zone': 'North',
          'code': 'LOC015',
          'qrCode': 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYGBgAAAABQAB6MzFdgAAAABJRU5ErkJggg==',
          'typeTitle': 'Assembly Line',
          'typeCode': 'AL'
        },
        {
          'id': 16,
          'district': 'Terengganu',
          'category': 'Office',
          'building': 'Coastal Tower',
          'floor': '8',
          'zone': 'East',
          'code': 'LOC016',
          'qrCode': 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP4/5+BAAAEgAGAhkI+7QAAAABJRU5ErkJggg==',
          'typeTitle': 'Branch Office',
          'typeCode': 'BO'
        },
        {
          'id': 17,
          'district': 'Kelantan',
          'category': 'Retail',
          'building': 'Central Market',
          'floor': '1',
          'zone': 'Central',
          'code': 'LOC017',
          'qrCode': 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPjPAAAABgABogQKpwAAAABJRU5ErkJggg==',
          'typeTitle': 'Market Store',
          'typeCode': 'MS'
        },
        {
          'id': 18,
          'district': 'Perlis',
          'category': 'Warehouse',
          'building': 'Storage Facility C',
          'floor': '1',
          'zone': 'North',
          'code': 'LOC018',
          'qrCode': 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8/x+BAAAEhAGAeI4xfQAAAABJRU5ErkJggg==',
          'typeTitle': 'Storage Unit',
          'typeCode': 'SU'
        },
        {
          'id': 19,
          'district': 'KL',
          'category': 'Office',
          'building': 'Innovation Center',
          'floor': '6',
          'zone': 'West',
          'code': 'LOC019',
          'qrCode': 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+P+fAQAEgwJ/PdI05wAAAABJRU5ErkJggg==',
          'typeTitle': 'Innovation Lab',
          'typeCode': 'IL'
        },
        {
          'id': 20,
          'district': 'KL',
          'category': 'Office',
          'building': 'Innovation Center',
          'floor': '6',
          'zone': 'West',
          'code': 'LOC019',
          'qrCode': 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+P+fAQAEgwJ/PdI05wAAAABJRU5ErkJggg==',
          'typeTitle': 'Innovation Lab',
          'typeCode': 'IL'
        }]}.content
  });

  mockItems2 = computed(() => {
    return [
      {
        id: 21,
        district: 'Johor',
        category: 'Office',
        building: 'Harbor Tower',
        floor: '10',
        zone: 'South',
        code: 'LOC021',
        qrCode: '',
        typeTitle: 'Operations Office',
        typeCode: 'OO'
      },
      {
        id: 22,
        district: 'Penang',
        category: 'Retail',
        building: 'Island Mall',
        floor: '2',
        zone: 'North',
        code: 'LOC022',
        qrCode: '',
        typeTitle: 'Retail Branch',
        typeCode: 'RB'
      },
      {
        id: 23,
        district: 'Selangor',
        category: 'Warehouse',
        building: 'Mega Storage B',
        floor: '1',
        zone: 'East',
        code: 'LOC023',
        qrCode: '',
        typeTitle: 'Storage Hub',
        typeCode: 'SH'
      },
      {
        id: 24,
        district: 'Kedah',
        category: 'Manufacturing',
        building: 'Industrial Zone Plant 1',
        floor: '1',
        zone: 'West',
        code: 'LOC024',
        qrCode: '',
        typeTitle: 'Production Plant',
        typeCode: 'PP'
      },
      {
        id: 25,
        district: 'Sabah',
        category: 'Office',
        building: 'Seaside Tower',
        floor: '5',
        zone: 'Central',
        code: 'LOC025',
        qrCode: '',
        typeTitle: 'Branch Office',
        typeCode: 'BO'
      },
      {
        id: 26,
        district: 'Sarawak',
        category: 'Warehouse',
        building: 'Logistics Park',
        floor: '2',
        zone: 'South',
        code: 'LOC026',
        qrCode: '',
        typeTitle: 'Distribution Hub',
        typeCode: 'DH'
      },
      {
        id: 27,
        district: 'KL',
        category: 'Retail',
        building: 'Downtown Plaza',
        floor: '1',
        zone: 'Central',
        code: 'LOC027',
        qrCode: '',
        typeTitle: 'Showroom',
        typeCode: 'SR'
      },
      {
        id: 28,
        district: 'Perak',
        category: 'Office',
        building: 'Techno Tower',
        floor: '9',
        zone: 'North',
        code: 'LOC028',
        qrCode: '',
        typeTitle: 'IT Office',
        typeCode: 'IT'
      },
      {
        id: 29,
        district: 'Melaka',
        category: 'Retail',
        building: 'Heritage Square',
        floor: '2',
        zone: 'East',
        code: 'LOC029',
        qrCode: '',
        typeTitle: 'Retail Store',
        typeCode: 'RS'
      },
      {
        id: 30,
        district: 'Negeri Sembilan',
        category: 'Warehouse',
        building: 'Supply Depot',
        floor: '1',
        zone: 'West',
        code: 'LOC030',
        qrCode: '',
        typeTitle: 'Supply Chain Hub',
        typeCode: 'SCH'
      },
      {
        id: 31,
        district: 'Pahang',
        category: 'Manufacturing',
        building: 'Automotive Plant',
        floor: '3',
        zone: 'South',
        code: 'LOC031',
        qrCode: '',
        typeTitle: 'Assembly Plant',
        typeCode: 'AP'
      },
      {
        id: 32,
        district: 'Terengganu',
        category: 'Retail',
        building: 'Coastal Mall',
        floor: '2',
        zone: 'North',
        code: 'LOC032',
        qrCode: '',
        typeTitle: 'Outlet Store',
        typeCode: 'OS'
      },
      {
        id: 33,
        district: 'Kelantan',
        category: 'Warehouse',
        building: 'Central Storage',
        floor: '1',
        zone: 'Central',
        code: 'LOC033',
        qrCode: '',
        typeTitle: 'Bulk Storage',
        typeCode: 'BS'
      },
      {
        id: 34,
        district: 'Perlis',
        category: 'Office',
        building: 'State Tower',
        floor: '6',
        zone: 'East',
        code: 'LOC034',
        qrCode: '',
        typeTitle: 'Admin Office',
        typeCode: 'AO'
      },
      {
        id: 35,
        district: 'Johor',
        category: 'Retail',
        building: 'Southern Galleria',
        floor: '4',
        zone: 'South',
        code: 'LOC035',
        qrCode: '',
        typeTitle: 'Flagship Store',
        typeCode: 'FS'
      },
      {
        id: 36,
        district: 'Penang',
        category: 'Manufacturing',
        building: 'Electronics Plant',
        floor: '2',
        zone: 'North',
        code: 'LOC036',
        qrCode: '',
        typeTitle: 'Electronics Facility',
        typeCode: 'EF'
      },
      {
        id: 37,
        district: 'KL',
        category: 'Office',
        building: 'Capital Tower',
        floor: '20',
        zone: 'Central',
        code: 'LOC037',
        qrCode: '',
        typeTitle: 'Headquarters',
        typeCode: 'HQ'
      },
      {
        id: 38,
        district: 'Sarawak',
        category: 'Retail',
        building: 'Borneo Mall',
        floor: '1',
        zone: 'East',
        code: 'LOC038',
        qrCode: '',
        typeTitle: 'Retail Outlet',
        typeCode: 'RO'
      },
      {
        id: 39,
        district: 'Sabah',
        category: 'Warehouse',
        building: 'Freight Hub',
        floor: '1',
        zone: 'West',
        code: 'LOC039',
        qrCode: '',
        typeTitle: 'Freight Storage',
        typeCode: 'FS'
      },
      {
        id: 40,
        district: 'Selangor',
        category: 'Office',
        building: 'Innovation Tower',
        floor: '11',
        zone: 'North',
        code: 'LOC040',
        qrCode: '',
        typeTitle: 'Innovation Office',
        typeCode: 'IO'
      }
    ];
  });


  onSelectedItemsChange(selectedItemsIds: number[]) {
    this.selectedItemsCounter.set(selectedItemsIds.length);
    console.log(selectedItemsIds, 'FROM CREATED LOCATIONS');
  }

  testtt() {
    this.confirmationService.confirm({
      message: 'Are you sure?',
      header: 'Confirmation',
      closable: false,
      closeOnEscape: true,
    })
  }

  onFilterValueChanges(filterValues: HubFilters) {
    this.isApplyingFilter.set(!!filterValues.filter);
    this.updateFilterPayload(filterValues);
    this.getCreatedLocations();
  }

  openDialog(): void {
    const dialogRef = this.#dialogService.open(LoadingDialogComponent, {
      showHeader: false,
      modal: true,
      width: '400px',
      height: '400px'
    });

    this.loadingDialogService.setProgressValue(this.loadingDialogService.progressValue() + 20);

    setTimeout(() => {
      dialogRef.close();
    }, 3000);

    dialogRef.onClose.pipe(
      tap(() => this.openToaster())
    ).subscribe();
  }

  openToaster(): void {
    this.#messageService.add({severity:'success', summary: 'Success', detail: 'Message Content', life: 30000000});
  }

  onPageChange(currentPage: number) {
    console.log(currentPage, 'CURRENT PAGE FROM CREATED LOCATIONS');
    this.updateFilterPayload({page: currentPage} as ItemFilter);
    this.getCreatedLocations();
  }

  handleEmptyState(): void {
    this.isEmptyState.set(true);
    this.isErrorState.set(false);
    this.genericTableCacheService.totalAvailableItems.set(0);
  }

  handleErrorState(): void {
    this.isErrorState.set(true);
    this.isEmptyState.set(false);
    this.genericTableCacheService.totalAvailableItems.set(0);
  }
}
