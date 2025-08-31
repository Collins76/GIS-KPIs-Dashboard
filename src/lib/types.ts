
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
  dayOfWeek: string;
  date: string;
  temp: number;
  minTemp: number;
  maxTemp: number;
  condition: string;
  humidity: number;
  windSpeed: number;
  icon: React.ComponentType<{ className?: string }>;
  isToday: boolean;
}

declare global {
    interface Window {
        initializeCharts: () => void;
        initializeComparisonChart: () => void;
        toggleChartType: (chartName: 'category' | 'trend') => void;
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
