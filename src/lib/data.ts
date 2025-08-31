import type { Kpi, Role, ManagedFile, BusinessUnit, WeatherData } from '@/lib/types';
import { Cloudy, Sun, CloudRain, Zap, CloudSun } from 'lucide-react';

export const roles: Role[] = [
  'GIS Coordinator',
  'GIS Lead',
  'GIS Specialist',
  'Geodatabase Specialist',
  'GIS Analyst',
];

export const kpis: Kpi[] = [
  // GIS Coordinator
  { id: 'COORD-01', role: 'GIS Coordinator', title: "Develop and implement a comprehensive 2 GIS strategy to support Ikeja Electric's business goals.", category: 'Business Growth', target: '1 Strategy Document', metric: 'Completed Strategy', dataSource: 'Project Plan', progress: 85, status: 'On Track' },
  { id: 'COORD-02', role: 'GIS Coordinator', title: 'Full integration of GIS data to ensure 100% accuracy in capturing all IE network assets.', category: 'Operational Process', target: '100% Accuracy', metric: 'Data Accuracy %', dataSource: 'QA Reports', progress: 92, status: 'On Track' },
  { id: 'COORD-03', role: 'GIS Coordinator', title: 'Provide technical and mentorship training to GIS Leads, Specialists and Analysts.', category: 'People Development', target: '4 Sessions/Quarter', metric: 'Training Sessions', dataSource: 'HR Records', progress: 50, status: 'At Risk' },
  { id: 'COORD-04', role: 'GIS Coordinator', title: 'Complete 100% of GIS projects within agreed timelines to support organizational objectives.', category: 'Operational Process', target: '100% On-Time', metric: 'Project Completion Rate', dataSource: 'Project Management Tool', progress: 75, status: 'On Track' },
  { id: 'COORD-05', role: 'GIS Coordinator', title: 'Identifies and implement one outstanding new technologies to improve network efficiency and reliability.', category: 'Business Growth', target: '1 New Technology', metric: 'Implemented Tech', dataSource: 'Innovation Log', progress: 25, status: 'Off Track' },
  // GIS Lead
  { id: 'LEAD-01', role: 'GIS Lead', title: 'Complete 100% of GIS projects within agreed timelines to support organizational objectives', category: 'Operational Process', target: '100% On-Time', metric: 'Project Completion Rate', dataSource: 'JIRA', progress: 95, status: 'On Track' },
  { id: 'LEAD-02', role: 'GIS Lead', title: 'Provide technical and mentorship training to GIS Specialists and Analysts.', category: 'People Development', target: '2 Workshops/Month', metric: 'Workshops Held', dataSource: 'Training Calendar', progress: 100, status: 'On Track' },
  { id: 'LEAD-03', role: 'GIS Lead', title: 'Ensure the accuracy and quality of all GIS data and map products delivered by the team.', category: 'Operational Process', target: '<1% Error Rate', metric: 'Error Rate', dataSource: 'QC Logs', progress: 98, status: 'On Track' },
  { id: 'LEAD-04', role: 'GIS Lead', title: 'Full integration of GIS data to ensure 100% accuracy in capturing all IE network assets.', category: 'Operational Process', target: '100% Asset Capture', metric: 'Asset Capture %', dataSource: 'Asset Register', progress: 88, status: 'At Risk' },
  { id: 'LEAD-05', role: 'GIS Lead', title: 'Identifies and implement one outstanding new technologies to improve network efficiency and reliability.', category: 'Business Growth', target: '1 New Technology', metric: 'Tech Pilot', dataSource: 'R&D Reports', progress: 60, status: 'On Track' },
  // GIS Specialist
  { id: 'SPEC-01', role: 'GIS Specialist', title: 'Complete 100% of GIS projects within agreed timelines to support organizational objectives.', category: 'Operational Process', target: '100% On-Time', metric: 'Task Completion', dataSource: 'Asana', progress: 90, status: 'On Track' },
  { id: 'SPEC-02', role: 'GIS Specialist', title: 'Provide technical and mentorship training to GIS Analysts.', category: 'People Development', target: '5 Mentees', metric: 'Mentees Supported', dataSource: 'Mentorship Program', progress: 80, status: 'On Track' },
  { id: 'SPEC-03', role: 'GIS Specialist', title: 'Full integration of GIS data to ensure 100% accuracy in capturing all IE network assets.', category: 'Operational Process', target: '99.5% Data Integrity', metric: 'Integrity Score', dataSource: 'Database Audits', progress: 99, status: 'On Track' },
  { id: 'SPEC-04', role: 'GIS Specialist', title: 'Resolve 100% of GIS technical issues within 24 hours.', category: 'Customer', target: '<24hr Resolution', metric: 'Avg. Resolution Time', dataSource: 'Helpdesk Tickets', progress: 30, status: 'Off Track' },
  { id: 'SPEC-05', role: 'GIS Specialist', title: 'Identifies and implement one outstanding new technologies to improve network efficiency and reliability.', category: 'Business Growth', target: '1 Tech Proposal', metric: 'Proposals Submitted', dataSource: 'Internal Submissions', progress: 100, status: 'On Track' },
  // Geodatabase Specialist
  { id: 'GEO-01', role: 'Geodatabase Specialist', title: 'Ensure the integrity, security, and optimal performance of the enterprise geodatabase.', category: 'Operational Process', target: '99.9% Uptime', metric: 'DB Uptime', dataSource: 'Server Logs', progress: 99, status: 'On Track' },
  { id: 'GEO-02', role: 'Geodatabase Specialist', title: 'Provide technical and mentorship training to GIS Analysts.', category: 'People Development', target: '3 Training Docs', metric: 'Docs Created', dataSource: 'Confluence', progress: 66, status: 'On Track' },
  { id: 'GEO-03', role: 'Geodatabase Specialist', title: 'Ensure the accuracy and quality of all GIS data during maintenance window with the commercial department.', category: 'Operational Process', target: 'Zero data loss', metric: 'Data Loss Incidents', dataSource: 'Backup Logs', progress: 100, status: 'On Track' },
  { id: 'GEO-04', role: 'Geodatabase Specialist', title: 'Full integration of GIS data to ensure 100% accuracy in capturing all IE network assets.', category: 'Operational Process', target: '100% sync', metric: 'Sync Status', dataSource: 'ETL Logs', progress: 95, status: 'On Track' },
  { id: 'GEO-05', role: 'Geodatabase Specialist', title: 'Identifies and implement one outstanding new technologies to improve network efficiency and reliability.', category: 'Business Growth', target: '1 DB Optimization', metric: 'Optimizations Implemented', dataSource: 'Change Log', progress: 45, status: 'At Risk' },
  // GIS Analyst
  { id: 'ANLST-01', role: 'GIS Analyst', title: 'Capture, process, and integrate spatial and non-spatial data from various sources into the GIS database.', category: 'Operational Process', target: '500 assets/week', metric: 'Assets Processed', dataSource: 'Data Entry Logs', progress: 110, status: 'On Track' },
  { id: 'ANLST-02', role: 'GIS Analyst', title: 'Perform quality assurance checks on all incoming and existing GIS data to ensure accuracy and completeness.', category: 'Operational Process', target: '<2% Error Rate', metric: 'Error Rate', dataSource: 'QA Checklists', progress: 97, status: 'On Track' },
  { id: 'ANLST-03', role: 'GIS Analyst', title: 'Full integration of GIS data to ensure 100% accuracy in capturing all IE network assets.', category: 'Operational Process', target: '100% Field Data Sync', metric: 'Sync Rate', dataSource: 'Field App Logs', progress: 85, status: 'On Track' },
  { id: 'ANLST-04', role: 'GIS Analyst', title: 'Resolve 100% of GIS technical issues within 24 hours.', category: 'Customer', target: '<24hr Response', metric: 'Response Time', dataSource: 'Email/Helpdesk', progress: 92, status: 'On Track' },
  { id: 'ANLST-05', role: 'GIS Analyst', title: 'Identifies and implement one outstanding new technologies to improve network efficiency and reliability.', category: 'Business Growth', target: '1 New Script/Tool', metric: 'Scripts Developed', dataSource: 'Git Repo', progress: 70, status: 'On Track' },
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

export const weatherData: WeatherData[] = [
    { day: 'Today', temp: 29, icon: CloudSun },
    { day: 'Tue', temp: 31, icon: Sun },
    { day: 'Wed', temp: 28, icon: CloudRain },
    { day: 'Thu', temp: 27, icon: Zap },
    { day: 'Fri', temp: 30, icon: Cloudy },
];
