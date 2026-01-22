
export type UserRole = 'donor' | 'hospital';

export interface BaseRequest {
  id: string;
  hospitalName: string;
  hospital: string;
  name:string;
  city: string;
  email:string;
  contact: string;
  urgency: 'Low' | 'Medium' | 'High';
  deadline: string;
  createdAt: string;
}

export interface BloodRequest extends BaseRequest {
  group: any;
  name: any;
  bloodGroup: string;
}

export interface OrganRequest extends BaseRequest {
  organType: string;
}

export interface AvailableOrgan {
  name: string;
  id: string;
  organType: string;
  city: string;
  contact: string;
  hospitalName: string;
  hospital: string;
  createdAt: string;
}

export interface HospitalDetail{
  _id:  null | undefined;
  location: string;
  name: string;
  phone:string;
  email:string;
}

export interface DonationEvent {
  _id: null | undefined;
  city: string;
  id: string;
  title: string;
  startDateTime: string;  // ISO string for start
  endDateTime: string;    // ISO string for end
  location: string;
  contact: string;
  name: string;
  hospital: string;
  createdAt: string;
}

