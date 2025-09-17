import {
  ChangeDetectionStrategy,
  Component, computed,
  inject,
  signal,
  TemplateRef,
  viewChild,
  WritableSignal
} from '@angular/core';
import {PdfMakerService} from '../../core/services';
import {mockPDFRecords} from '../../shared/constants/common-constants';
import {GenericTableComponent} from '../../shared/components/generic-table/generic-table.component';
import {TableColumn} from '../../shared';
import {CreatedLocation, CreatedLocationColumnType} from './models/created-location.model';
import {genericCasting} from '../../shared/helpers/helpers';
import {CustomStatusComponent} from '../../shared/components/custom-status/custom-status.component';
import {CopyToClipboardComponent} from '../../shared/components/copy-to-clipboard/copy-to-clipboard.component';
import {TableActionBulkComponent} from '../../shared/components/table-action-bulk/table-action-bulk.component';
import {Button} from 'primeng/button';
import {GenericTableCacheService} from '../../shared/services';
import {HubFiltersComponent} from '../../shared/components/hub-filters/hub-filters.component';
import {ConfirmationService} from 'primeng/api';
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
    ComponentStateComponent
  ],
  standalone: true,
  templateUrl: './created-locations.component.html',
  styleUrl: './created-locations.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CreatedLocationsComponent {
  // INJECTIONS
  readonly #pdfMakerService: PdfMakerService = inject(PdfMakerService);
  readonly genericTableCacheService: GenericTableCacheService = inject(GenericTableCacheService);
  protected readonly confirmationService: ConfirmationService = inject(ConfirmationService);

  // SIGNALS
  columns: WritableSignal<TableColumn<CreatedLocation>[]> = signal([]);
  selectedItemsCounter = signal(0);
  totalAvailableItems = signal(3400);
  isApplyingBulkSelection = signal(false);

  // VIEW CHILDREN
  qrStatusCustomColumn = viewChild<TemplateRef<{$implicit: CreatedLocation}>>('qrStatusCustomColumn');
  codeCustomColumn = viewChild<TemplateRef<{$implicit: CreatedLocation}>>('codeCustomColumn');

  // CASTING
  protected readonly genericCasting = genericCasting<CreatedLocation>;

  createTableColumns(): CreatedLocationColumnType[] {
    return [
      {field: 'district'},
      {field: 'category'},
      {field: 'building'},
      {field: 'floor'},
      {field: 'zone'},
      {field: 'code', template: this.codeCustomColumn()},
      {field: '', template: this.qrStatusCustomColumn(), columnWidth: '200px'},
    ]
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
  })

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
}
