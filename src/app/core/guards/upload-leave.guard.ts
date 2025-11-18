import { Injectable } from '@angular/core';
import { CanDeactivate } from '@angular/router';
import { Observable } from 'rxjs';

export interface CanLeaveUploadPage {
    confirmLeavePage: () => Observable<boolean> | boolean;
}

@Injectable({ providedIn: 'root' })
export class UploadLeaveGuard implements CanDeactivate<CanLeaveUploadPage> {
    canDeactivate(component: CanLeaveUploadPage): Observable<boolean> | boolean {
        if (component.confirmLeavePage) {
            return component.confirmLeavePage();
        }
        return true;
    }
}
