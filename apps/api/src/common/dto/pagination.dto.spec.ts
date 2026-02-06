import { PaginationDto } from './pagination.dto';

describe('PaginationDto', () => {
  it('should have default values', () => {
    const dto = new PaginationDto();
    expect(dto.page).toBe(1);
    expect(dto.limit).toBe(10);
    expect(dto.sortBy).toBe('createdAt');
    expect(dto.sortOrder).toBe('desc');
  });

  it('should calculate skip correctly', () => {
    const dto = new PaginationDto();
    dto.page = 2;
    dto.limit = 10;
    expect(dto.skip).toBe(10);

    dto.page = 3;
    dto.limit = 20;
    expect(dto.skip).toBe(40);
  });

  it('should return correct take value', () => {
    const dto = new PaginationDto();
    dto.limit = 20;
    expect(dto.take).toBe(20);
  });

  it('should allow setting custom values', () => {
    const dto = new PaginationDto();
    dto.page = 5;
    dto.limit = 50;
    dto.sortBy = 'name';
    dto.sortOrder = 'asc';

    expect(dto.page).toBe(5);
    expect(dto.limit).toBe(50);
    expect(dto.sortBy).toBe('name');
    expect(dto.sortOrder).toBe('asc');
  });
});
