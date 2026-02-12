import { 
  mapRowSelectionToIds, 
  updateColumnFilters, 
  getSortParams, 
  getActiveFiltersCount 
} from './table-logic.handlers';

describe('table-logic.handlers', () => {
  describe('mapRowSelectionToIds', () => {
    it('should map row selection object to array of IDs', () => {
      const selection = { '1': true, '2': false, '3': true };
      expect(mapRowSelectionToIds(selection)).toEqual(['1', '3']);
    });

    it('should return empty array for empty selection', () => {
      expect(mapRowSelectionToIds({})).toEqual([]);
    });
  });

  describe('updateColumnFilters', () => {
    it('should add a new filter if not present', () => {
      const current = [{ id: 'status', value: ['active'] }];
      const result = updateColumnFilters(current, 'type', ['machine']);
      expect(result).toEqual([
        { id: 'status', value: ['active'] },
        { id: 'type', value: ['machine'] }
      ]);
    });

    it('should update existing filter if present', () => {
      const current = [{ id: 'status', value: ['active'] }];
      const result = updateColumnFilters(current, 'status', ['inactive']);
      expect(result).toEqual([{ id: 'status', value: ['inactive'] }]);
    });

    it('should remove filter if value is empty array', () => {
      const current = [{ id: 'status', value: ['active'] }];
      const result = updateColumnFilters(current, 'status', []);
      expect(result).toEqual([]);
    });
  });

  describe('getSortParams', () => {
    it('should return desc for descending sort', () => {
      const sorting = [{ id: 'name', desc: true }];
      expect(getSortParams(sorting)).toEqual({ sortBy: 'name', sortOrder: 'desc' });
    });

    it('should return asc for ascending sort', () => {
      const sorting = [{ id: 'name', desc: false }];
      expect(getSortParams(sorting)).toEqual({ sortBy: 'name', sortOrder: 'asc' });
    });

    it('should return undefined for empty sorting', () => {
      expect(getSortParams([])).toEqual({ sortBy: undefined, sortOrder: undefined });
    });
  });

  describe('getActiveFiltersCount', () => {
    it('should count filters and search', () => {
      const filters = [{ id: 'status', value: ['active'] }];
      expect(getActiveFiltersCount(filters, 'test')).toBe(2);
    });

    it('should only count filters if search is empty', () => {
      const filters = [{ id: 'status', value: ['active'] }];
      expect(getActiveFiltersCount(filters, '')).toBe(1);
    });
  });
});
