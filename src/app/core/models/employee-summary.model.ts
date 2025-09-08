export interface EmployeeSummaryColumn {
  id: string;
  columnCode: string;
  title: string;
  visibility: boolean;
  systemColumn: boolean;
}

export interface EmployeeSummaryMetadata {
  columns: EmployeeSummaryColumn[];
}

export interface EmployeeSummaryData {
  id: string;
  employee_number: string;
  employee_name: string;
  joining_date: string;
  subscription_percentage: string;
  employee_saving_type: string;
  subscription_months: string;
  employee_contribution: string;
  withdrawals: string;
  net_saving_remaining: string;
  earnings: string;
  earnings_distributed: string;
  net_earnings_remaining: string;
  total_saving_balance: string;
  stc_contribution_provision: string;
  data_date: string;
}

export interface EmployeeSummaryResponse {
  metadata: EmployeeSummaryMetadata;
  data: EmployeeSummaryData;
}

export interface SummaryCard {
  label: string;
  value: string;
  iconClass?: string;
  iconUrl?: string;
  isVisible?: boolean;
}

export interface DetailsCard {
  label: string;
  value: string;
  highlight?: boolean;
  type?: 'currency' | 'percentage';
  isVisible?: boolean;
}
