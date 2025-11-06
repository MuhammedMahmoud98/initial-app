import { LocationBase, TableColumn } from '../../../shared';


export interface AssignedLocationType {
    id: number;
    user: {
        id: number;
        email: string;
        employeeId: string;
        name: string;
    };
    location: {
        id: number;
        code: string;
    };
    createdAt: string; 
}
export type AssignedLocationTypesResponse = LocationBase<AssignedLocationType>;
export type AssignedLocationColumnType = TableColumn<AssignedLocationType>;
