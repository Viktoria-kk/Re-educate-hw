import { PaginationDto } from './dto/pagination.dto';

export function paginate<T>(data: T[], total: number, query: PaginationDto) {
  return {
    data,
    total,
    page: query.page,
    limit: query.limit,
    totalPages: Math.ceil(total / query.limit),
  };
}
