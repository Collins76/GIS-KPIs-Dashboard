export type Role =
  | 'GIS Coordinator'
  | 'GIS Lead'
  | 'GIS Specialist'
  | 'Geodatabase Specialist'
  | 'GIS Analyst';

export type KpiCategory = 'Business Growth' | 'People Development' | 'Operational Process' | 'Customer';
export type KpiStatus = 'On Track' | 'At Risk' | 'Off Track' | 'Not Started';

export interface Kpi {
  id: string;
  role: Role;
  title: string;
  category: KpiCategory;
  target: string;
  metric: string;
  dataSource: string;
  progress: number;
  status: KpiStatus;
}

export interface User {
  name: string;
  email: string;
  role: Role;
  location: string;
  avatar: string;
}

export type FileType = 'CSV' | 'Excel' | 'PDF' | 'Image' | 'GIS' | 'Word' | 'PowerPoint';

export interface ManagedFile {
  id: string;
  name: string;
  type: FileType;
  size: string;
  uploadedAt: string;
  url: string;
}

export interface BusinessUnit {
  id: string;
  name: string;
  address: string;
  coordinates: { lat: number; lng: number };
}

export interface WeatherData {
  day: string;
  temp: number;
  icon: React.ComponentType<{ className?: string }>;
}
