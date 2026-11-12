/** Standard successful API response shape. */
export interface ApiResponse<T> {
    data: T;
    message?: string;
}
/** Standard paginated API response shape. */
export interface PaginatedResponse<T> extends ApiResponse<T[]> {
    pagination: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
    };
}
/** Standard API error response shape. */
export interface ApiErrorResponse {
    message: string;
    code?: string;
    details?: unknown;
}
export * from './schemas/index.js';
export * from './constants/index.js';
