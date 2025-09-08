import { Component, inject, signal } from '@angular/core';
import { API_CONSTANTS } from '../../../shared';
import { UserService } from '../../services';
import { ButtonModule } from 'primeng/button';

@Component({
  selector: 'app-hub-search',
  standalone: true,
  imports: [ButtonModule],
  templateUrl: './hub-search.component.html',
  styleUrls: ['./hub-search.component.scss'],
})
export class HubSearchComponent {
  readonly userService = inject(UserService);
  imageHostUrl = signal(API_CONSTANTS.IMAGE_HOST);
  igateHostUrl = signal(API_CONSTANTS.IGATE_HOST);
  keyword = signal('name');
  searchText = signal('');
  usersList = signal([]);

  employeeSearch(querySearch: string) {
    this.userService
      .searchUsersByEmailOrName(API_CONSTANTS.USERS_SEARCH, querySearch)
      .subscribe(() => {
        this.usersList.set([]);
      });
  }

  selectEvent(item: { email: string; name: string }) {
    window.location.href = '/profile/' + item.email;
  }

  onChangeSearch(val: string) {
    this.employeeSearch(val);
  }
}
