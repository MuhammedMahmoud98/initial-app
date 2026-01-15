import {ChangeDetectionStrategy, Component, computed, input} from '@angular/core';
import {Tooltip} from 'primeng/tooltip';
import {COMMON_CONSTANTS} from '../../constants/common-constants';

@Component({
  selector: 'app-title-with-icon',
  imports: [
    Tooltip
  ],
  standalone: true,
  templateUrl: './title-with-icon.component.html',
  styleUrl: './title-with-icon.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TitleWithIconComponent {
  itemTitle = input<string | undefined>();
  iconUrl = input.required<string>();
  background = input<string>('transparent');

  // COMPUTED
  titleMaxLength = computed(() =>
    (this.itemTitle()?.length ?? 0) > COMMON_CONSTANTS.CELL_CHAR_MAX_LENGTH ? this.itemTitle()?.slice(0, COMMON_CONSTANTS.CELL_CHAR_MAX_LENGTH).concat('...') : this.itemTitle());

  // CONSTANTS
  protected readonly COMMON_CONSTANTS = COMMON_CONSTANTS;
}
