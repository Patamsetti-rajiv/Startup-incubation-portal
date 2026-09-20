export type ApplicationStatus = 'Under Review' | 'Approved & Deployed' | 'Needs Revision';

export interface Application {
  id: string;
  startup_name: string;
  founder_name: string;
  email: string;
  requirements: string;
  pitch_deck_url: string;
  status: ApplicationStatus;
  created_at: string;
  updated_at: string;
}

export interface ApplicationInput {
  startup_name: string;
  founder_name: string;
  email: string;
  requirements: string;
  pitch_deck_url: string;
}
