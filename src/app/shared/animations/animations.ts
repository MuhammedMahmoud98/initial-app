import {
  trigger,
  transition,
  style,
  animate
} from '@angular/animations';

export const smoothRemoveAnimation = trigger('smoothRemove', [
  transition(':leave', [
    style({ height: '*', opacity: 1 }),
    animate('300ms ease', style({ height: '0px', opacity: 0 }))
  ])
]);
