export interface Proposal {
  id: number;
  job_title: string;
  job_details: string;
  proposal: string;
  used_memory: Record<string, unknown>;
  created_at: string;
}

export interface PaginationInfo {
  page: number;
  page_size: number;
  total_pages: number;
  total_items: number;
  has_next: boolean;
  has_prev: boolean;
}
