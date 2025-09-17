export interface User {
  id: number;
  name: string;
  nameAr: string;
  username: string;
  image: string;
  mobilePhoneNumber: string;
  officePhoneNumber: string;
  title: string;
  titleAr: string;
  department: string;
  departmentAr: string;
  locale: string;
  organizationId: string;
  lastPostedAt: string;
  contractTypeId: string;
  generalDepartmentId: string;
  sectorId: string;
  gradeId: string;
  locationId: string;
  genderId: string;
  roles: Role[];
  delegationStartDate: string;
  delegationEndDate: string;
  'is-qr-code-admin': boolean;
}

export interface Role {
  id: number;
  name: string;
}
