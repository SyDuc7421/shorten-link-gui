/** Shared, app-wide types only. Feature types live in the feature folder. */

export type Nullable<T> = T | null;

export interface Paginated<T> {
  items: T[];
  page: number;
  pageSize: number;
  total: number;
}
