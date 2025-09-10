

export type Role =
  | 'GIS Coordinator'
  | 'GIS Lead'
  | 'GIS Specialist'
  | 'Geodatabase Specialist'
  | 'GIS Analyst';

export type KpiCategory = 'Business Growth' | 'People Development' | 'Operational Process' | 'Customer' | 'General';
export type KpiStatus = 'On Track' | 'At Risk' | 'Off Track' | 'Not Started' | 'Completed';
export type KpiTargetType = 'Number' | 'Percentage';
export type KpiFrequency = 'Annually' | 'Monthly' | 'Quarterly';


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
  weight: number;
  targetType: KpiTargetType;
  frequency: KpiFrequency;
  startDate: string;
  endDate: string;
}

export interface User {
  name: string;
  email: string;
  nickname: string;
  role: Role;
  location: string;
  avatar: string;
  status?: string;
}

export interface StatusPost {
    id: string;
    username: string;
    avatar: string;
    status: string;
    timestamp: number;
    // Adding more flexible fields to accommodate different data structures
    [key: string]: any;
}

export type FileType = 'CSV' | 'Excel' | 'PDF' | 'Image' | 'GIS' | 'Word' | 'PowerPoint' | 'application/octet-stream' | 'application/pdf' | 'image/jpeg' | 'image/png' | 'image/gif' | 'text/csv' | 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' | 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' | 'application/vnd.ms-powerpoint' | 'application/vnd.openxmlformats-officedocument.presentationml.presentation' | 'application/vnd.google-earth.kml+xml' | 'application/vnd.google-earth.kmz';


export interface ManagedFile {
  id: string;
  name: string;
  type: string;
  size: number;
  uploadedAt: Date;
  url?: string;
  file?: File;
  progress: number;
  status: 'pending' | 'uploading' | 'completed' | 'error';
  uploadTask?: any;
  storagePath?: string;
}

export interface BusinessUnit {
  id: string;
  name: string;
  address: string;
  coordinates: { lat: number; lng: number };
}

export interface WeatherData {
  dayOfWeek: string;
  date: string;
  temp: number;
  minTemp: number;
  maxTemp: number;
  condition: string;
  humidity: number;
  windSpeed: number;
  icon: React.ComponentType<{ className?: string, displayName?: string }>;
  isToday: boolean;
}

export interface ActivityLog {
    id: string;
    activityType: 'user_signin' | 'profile_update' | 'file_upload' | 'kpi_update' | 'filter_change' | 'user_signout' | 'test_connection';
    user: Partial<User>;
    weather?: {
      condition: string;
      temperature: number;
    };
    file?: Partial<ManagedFile>;
    kpi?: Partial<Kpi>;
    filter_settings?: {
        role: Role | 'All',
        category: KpiCategory | 'All',
        status: KpiStatus | 'All',
        date: string | null,
    },
    filter_interaction?: {
        type: string;
        value: string;
        tab: string;
    },
    timestamp: string;
    duration?: number; // Session duration in minutes
    details?: any; // For flexible data like test_connection
  }

declare global {
    interface Window {
        initializeCharts: () => void;
        initializeComparisonChart: () => void;
        toggleChartType: (chartName: 'category' | 'trend') => void;
        changeTrendView: (view: 'daily' | 'monthly' | 'quarterly') => void;
        initializeUploadArea: () => void;
        showAllFiles: () => void;
        clearAllFiles: () => void;
        resetUploadArea: () => void;
        toggleFileView: (view: 'grid' | 'list') => void;
        filterFiles: () => void;
        sortFiles: () => void;
        resetFileFilters: () => void;
        uploadFromUrl: () => void;
        closeUrlUploadModal: () => void;
        removeFile: (fileId: string, event?: MouseEvent) => void;
        editFile: (fileId: string, event?: MouseEvent) => void;
        downloadFile: (fileId: string, event?: MouseEvent) => void;
        previewFile: (fileId: string, event?: MouseEvent) => void;
        handleFileSelect: (e: Event) => void;
        createFileDownload: (originalFile: File, fileName: string) => boolean;
        showFilePreviewModal: (file: any) => void;
        closeFilePreviewModal: () => void;
        triggerBrowseFiles: () => void;
        editSelectedFile: (event?: MouseEvent) => void;
        deleteSelectedFile: (event?: MouseEvent) => void;
    }
}
