import { IconName } from '@ng-icons/core';




export interface loginErrorResponse {
  statusCode: number;
  errors?: string[];
  error?: string;
  message?: string;
}

export interface MenuLayout {
  label: string;
  icon: IconName;
  path: string;
}
