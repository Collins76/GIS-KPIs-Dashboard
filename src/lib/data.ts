
import type { Kpi, Role, ManagedFile, BusinessUnit, WeatherData } from '@/lib/types';
import { Cloudy, Sun, CloudRain, Zap, CloudSun, Wind, Droplets, CloudDrizzle, Waves } from 'lucide-react';
import { format, addDays } from 'date-fns';

// Add display names for using them in class names
Sun.displayName = 'Sun';
CloudSun.displayName = 'CloudSun';
CloudRain.displayName = 'CloudRain';
CloudDrizzle.displayName = 'CloudDrizzle';
Cloudy.displayName = 'Cloudy';
Zap.displayName = 'Zap';


export const roles: Role[] = [
  'GIS Coordinator',
  'GIS Lead',
  'GIS Specialist',
  'Geodatabase Specialist',
  'GIS Analyst',
];

export const kpis: Kpi[] = [
  // GIS Coordinator
  { id: 'COORD-01', role: 'GIS Coordinator', title: "Develop and implement a comprehensive 2 GIS strategy to support Ikeja Electric's business goals.", category: 'Business Growth', target: '2', metric: 'Number of strategic initiatives from the GIS strategy that have been successfully implemented', dataSource: 'Project Management Dashboard & Reports', progress: 0, status: 'Not Started', weight: 15, targetType: 'Number', frequency: 'Annually', startDate: '2025-01-01', endDate: '2025-12-31' },
  { id: 'COORD-02', role: 'GIS Coordinator', title: 'Full integration of GIS data to ensure 100% accuracy in capturing all IE network assets.', category: 'Business Growth', target: '100', metric: 'Percentage Achieved / Planned', dataSource: 'GDB Folders', progress: 0, status: 'Not Started', weight: 15, targetType: 'Percentage', frequency: 'Monthly', startDate: '2025-01-01', endDate: '2025-12-31' },
  { id: 'COORD-03', role: 'GIS Coordinator', title: 'Provide technical and mentorship training to GIS Leads, Specialists and Analysts.', category: 'People Development', target: '4', metric: 'Conduct at least one in every quarter technical training or knowledge-sharing session for the team', dataSource: 'Training Reports', progress: 0, status: 'Not Started', weight: 15, targetType: 'Number', frequency: 'Quarterly', startDate: '2025-01-01', endDate: '2025-12-31' },
  { id: 'COORD-04', role: 'GIS Coordinator', title: 'Complete 100% of GIS projects within agreed timelines to support organizational objectives.', category: 'Operational Process', target: '100', metric: 'Projects completed on time / Total projects x 100', dataSource: 'GIS Project Dashboard', progress: 0, status: 'Not Started', weight: 15, targetType: 'Percentage', frequency: 'Monthly', startDate: '2025-01-01', endDate: '2025-12-31' },
  { id: 'COORD-05', role: 'GIS Coordinator', title: 'Identifies and implement one outstanding new technologies to improve network efficiency and reliability.', category: 'Customer', target: '1', metric: 'The contribution influences both quantitative and qualitative value, leading to cost savings and enhancing the overall impact on the business', dataSource: 'GIS Project Dashboard', progress: 0, status: 'Not Started', weight: 20, targetType: 'Number', frequency: 'Annually', startDate: '2025-01-01', endDate: '2025-12-31' },
  // GIS Lead
  { id: 'LEAD-01', role: 'GIS Lead', title: 'Complete 100% of GIS projects within agreed timelines to support organizational objectives', category: 'Operational Process', target: '100', metric: 'Project Completion Rate', dataSource: 'JIRA', progress: 0, status: 'Not Started', weight: 25, targetType: 'Percentage', frequency: 'Monthly', startDate: '2025-01-01', endDate: '2025-12-31' },
  { id: 'LEAD-02', role: 'GIS Lead', title: 'Provide technical and mentorship training to GIS Specialists and Analysts.', category: 'People Development', target: '2', metric: 'Workshops Held', dataSource: 'Training Calendar', progress: 0, status: 'Not Started', weight: 20, targetType: 'Number', frequency: 'Monthly', startDate: '2025-01-01', endDate: '2025-12-31' },
  { id: 'LEAD-03', role: 'GIS Lead', title: 'Ensure the accuracy and quality of all GIS data and map products delivered by the team.', category: 'Operational Process', target: '99', metric: 'Error Rate < 1%', dataSource: 'QC Logs', progress: 0, status: 'Not Started', weight: 25, targetType: 'Percentage', frequency: 'Quarterly', startDate: '2025-01-01', endDate: '2025-12-31' },
  { id: 'LEAD-04', role: 'GIS Lead', title: 'Full integration of GIS data to ensure 100% accuracy in capturing all IE network assets.', category: 'Operational Process', target: '100', metric: 'Asset Capture %', dataSource: 'Asset Register', progress: 0, status: 'Not Started', weight: 15, targetType: 'Percentage', frequency: 'Monthly', startDate: '2025-01-01', endDate: '2025-12-31' },
  { id: 'LEAD-05', role: 'GIS Lead', title: 'Identifies and implement one outstanding new technologies to improve network efficiency and reliability.', category: 'Business Growth', target: '1', metric: 'Tech Pilot', dataSource: 'R&D Reports', progress: 0, status: 'Not Started', weight: 15, targetType: 'Number', frequency: 'Annually', startDate: '2025-01-01', endDate: '2025-12-31' },
  // GIS Specialist
  { id: 'SPEC-01', role: 'GIS Specialist', title: 'Complete 100% of GIS projects within agreed timelines to support organizational objectives.', category: 'Operational Process', target: '100', metric: 'Task Completion', dataSource: 'Asana', progress: 0, status: 'Not Started', weight: 30, targetType: 'Percentage', frequency: 'Monthly', startDate: '2025-01-01', endDate: '2025-12-31' },
  { id: 'SPEC-02', role: 'GIS Specialist', title: 'Provide technical and mentorship training to GIS Analysts.', category: 'People Development', target: '5', metric: 'Mentees Supported', dataSource: 'Mentorship Program', progress: 0, status: 'Not Started', weight: 15, targetType: 'Number', frequency: 'Quarterly', startDate: '2025-01-01', endDate: '2025-12-31' },
  { id: 'SPEC-03', role: 'GIS Specialist', title: 'Full integration of GIS data to ensure 100% accuracy in capturing all IE network assets.', category: 'Operational Process', target: '99.5', metric: 'Data Integrity Score', dataSource: 'Database Audits', progress: 0, status: 'Not Started', weight: 25, targetType: 'Percentage', frequency: 'Monthly', startDate: '2025-01-01', endDate: '2025-12-31' },
  { id: 'SPEC-04', role: 'GIS Specialist', title: 'Resolve 100% of GIS technical issues within 24 hours.', category: 'Customer', target: '24', metric: 'Avg. Resolution Time', dataSource: 'Helpdesk Tickets', progress: 0, status: 'Not Started', weight: 20, targetType: 'Number', frequency: 'Monthly', startDate: '2025-01-01', endDate: '2025-12-31' },
  { id: 'SPEC-05', role: 'GIS Specialist', title: 'Identifies and implement one outstanding new technologies to improve network efficiency and reliability.', category: 'Business Growth', target: '1', metric: 'Proposals Submitted', dataSource: 'Internal Submissions', progress: 0, status: 'Not Started', weight: 10, targetType: 'Number', frequency: 'Annually', startDate: '2025-01-01', endDate: '2025-12-31' },
  // Geodatabase Specialist
  { id: 'GEO-01', role: 'Geodatabase Specialist', title: 'Ensure the integrity, security, and optimal performance of the enterprise geodatabase.', category: 'Operational Process', target: '99.9', metric: 'DB Uptime', dataSource: 'Server Logs', progress: 0, status: 'Not Started', weight: 30, targetType: 'Percentage', frequency: 'Monthly', startDate: '2025-01-01', endDate: '2025-12-31' },
  { id: 'GEO-02', role: 'Geodatabase Specialist', title: 'Provide technical and mentorship training to GIS Analysts.', category: 'People Development', target: '3', metric: 'Docs Created', dataSource: 'Confluence', progress: 0, status: 'Not Started', weight: 15, targetType: 'Number', frequency: 'Quarterly', startDate: '2025-01-01', endDate: '2025-12-31' },
  { id: 'GEO-03', role: 'Geodatabase Specialist', title: 'Ensure the accuracy and quality of all GIS data during maintenance window with the commercial department.', category: 'Operational Process', target: '0', metric: 'Data Loss Incidents', dataSource: 'Backup Logs', progress: 0, status: 'Not Started', weight: 25, targetType: 'Number', frequency: 'Monthly', startDate: '2025-01-01', endDate: '2025-12-31' },
  { id: 'GEO-04', role: 'Geodatabase Specialist', title: 'Full integration of GIS data to ensure 100% accuracy in capturing all IE network assets.', category: 'Operational Process', target: '100', metric: 'Sync Status', dataSource: 'ETL Logs', progress: 0, status: 'Not Started', weight: 15, targetType: 'Percentage', frequency: 'Monthly', startDate: '2025-01-01', endDate: '2025-12-31' },
  { id: 'GEO-05', role: 'Geodatabase Specialist', title: 'Identifies and implement one outstanding new technologies to improve network efficiency and reliability.', category: 'Business Growth', target: '1', metric: 'Optimizations Implemented', dataSource: 'Change Log', progress: 0, status: 'Not Started', weight: 15, targetType: 'Number', frequency: 'Annually', startDate: '2025-01-01', endDate: '2025-12-31' },
  // GIS Analyst
  { id: 'ANLST-01', role: 'GIS Analyst', title: 'Capture, process, and integrate spatial and non-spatial data from various sources into the GIS database.', category: 'Operational Process', target: '500', metric: 'Assets Processed', dataSource: 'Data Entry Logs', progress: 0, status: 'Not Started', weight: 30, targetType: 'Number', frequency: 'Monthly', startDate: '2025-01-01', endDate: '2025-12-31' },
  { id: 'ANLST-02', role: 'GIS Analyst', title: 'Perform quality assurance checks on all incoming and existing GIS data to ensure accuracy and completeness.', category: 'Operational Process', target: '98', metric: 'Error Rate < 2%', dataSource: 'QA Checklists', progress: 0, status: 'Not Started', weight: 25, targetType: 'Percentage', frequency: 'Monthly', startDate: '2025-01-01', endDate: '2025-12-31' },
  { id: 'ANLST-03', role: 'GIS Analyst', title: 'Full integration of GIS data to ensure 100% accuracy in capturing all IE network assets.', category: 'Operational Process', target: '100', metric: 'Sync Rate', dataSource: 'Field App Logs', progress: 0, status: 'Not Started', weight: 20, targetType: 'Percentage', frequency: 'Monthly', startDate: '2025-01-01', endDate: '2025-12-31' },
  { id: 'ANLST-04', role: 'GIS Analyst', title: 'Resolve 100% of GIS technical issues within 24 hours.', category: 'Customer', target: '24', metric: 'Response Time', dataSource: 'Email/Helpdesk', progress: 0, status: 'Not Started', weight: 15, targetType: 'Number', frequency: 'Monthly', startDate: '2025-01-01', endDate: '2025-12-31' },
  { id: 'ANLST-05', role: 'GIS Analyst', title: 'Identifies and implement one outstanding new technologies to improve network efficiency and reliability.', category: 'Business Growth', target: '1', metric: 'Scripts Developed', dataSource: 'Git Repo', progress: 0, status: 'Not Started', weight: 10, targetType: 'Number', frequency: 'Annually', startDate: '2025-01-01', endDate: '2025-12-31' },
];


export const businessUnits: BusinessUnit[] = [
    { id: 'bu1', name: 'CHQ', address: 'Corporate Headquarters, Alausa', coordinates: { lat: 6.6189, lng: 3.3595 } },
    { id: 'bu2', name: 'Akowonjo BU', address: 'Akowonjo Business Unit', coordinates: { lat: 6.5739, lng: 3.3039 } },
    { id: 'bu3', name: 'Abule Egba BU', address: 'Abule Egba Business Unit', coordinates: { lat: 6.6433, lng: 3.2945 } },
    { id: 'bu4', name: 'Ikeja BU', address: 'Ikeja Business Unit', coordinates: { lat: 6.6018, lng: 3.3515 } },
    { id: 'bu5', name: 'Ikorodu BU', address: 'Ikorodu Business Unit', coordinates: { lat: 6.6159, lng: 3.5073 } },
    { id: 'bu6', name: 'Oshodi BU', address: 'Oshodi Business Unit', coordinates: { lat: 6.5562, lng: 3.3421 } },
    { id: 'bu7', name: 'Shomolu BU', address: 'Shomolu Business Unit', coordinates: { lat: 6.5413, lng: 3.3705 } }
];

export const files: ManagedFile[] = [
    { id: 'file1', name: 'Network_Assets_Q3.csv', type: 'CSV', size: '2.5 MB', uploadedAt: '2023-10-28', url: '#' },
    { id: 'file2', name: 'Feeder_Analysis.xlsx', type: 'Excel', size: '5.1 MB', uploadedAt: '2023-10-27', url: '#' },
    { id: 'file3', name: 'Project_Charter.pdf', type: 'PDF', size: '1.2 MB', uploadedAt: '2023-10-26', url: '#' },
    { id: 'file4', name: 'Substation_Photo.jpg', type: 'Image', size: '4.8 MB', uploadedAt: '2023-10-25', url: 'https://picsum.photos/800/600' },
    { id: 'file5', 'name': 'Ikeja_Boundary.shp', 'type': 'GIS', 'size': '12.3 MB', 'uploadedAt': '2023-10-24', url: '#' },
    { id: 'file6', name: 'Monthly_Report.docx', type: 'Word', size: '0.8 MB', uploadedAt: '2023-10-23', url: '#' },
    { id: 'file7', name: 'GIS_Strategy.pptx', type: 'PowerPoint', size: '8.9 MB', uploadedAt: '2023-10-22', url: '#' }
];

export const initialWeatherData: WeatherData[] = [
  { dayOfWeek: 'Mon', date: 'Jul 29', temp: 29, minTemp: 24, maxTemp: 33, condition: 'Partly Cloudy', icon: CloudSun, humidity: 75, windSpeed: 12, isToday: true },
  { dayOfWeek: 'Tue', date: 'Jul 30', temp: 31, minTemp: 25, maxTemp: 35, condition: 'Sunny', icon: Sun, humidity: 70, windSpeed: 10, isToday: false },
  { dayOfWeek: 'Wed', date: 'Jul 31', temp: 28, minTemp: 23, maxTemp: 31, condition: 'Light Rain', icon: CloudRain, humidity: 85, windSpeed: 15, isToday: false },
  { dayOfWeek: 'Thu', date: 'Aug 1', temp: 27, minTemp: 22, maxTemp: 30, condition: 'Cloudy', icon: Cloudy, humidity: 80, windSpeed: 13, isToday: false },
  { dayOfWeek: 'Fri', date: 'Aug 2', temp: 30, minTemp: 24, maxTemp: 34, condition: 'Partly Cloudy', icon: CloudSun, humidity: 72, windSpeed: 11, isToday: false },
  { dayOfWeek: 'Sat', date: 'Aug 3', temp: 26, minTemp: 23, maxTemp: 29, condition: 'Thunderstorm', icon: Zap, humidity: 90, windSpeed: 18, isToday: false },
];


export const weatherData: WeatherData[] = initialWeatherData;
