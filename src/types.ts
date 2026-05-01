/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface Activity {
  id: string;
  name: string;
  progress: number;
  material: string;
  pending: string;
  date: string | null;
  duration: number;
  who: string;
  section: string;
}

export interface Section {
  id: string;
  name: string;
  description?: string;
}

export interface MaintenanceData {
  title: string;
  subtitle: string;
  activities: Activity[];
  sections: Section[];
  deadline: string;
}
