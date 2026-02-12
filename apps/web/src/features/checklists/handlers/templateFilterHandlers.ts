import {
  type ChecklistTemplate,
  type QueryTemplateParams,
  ChecklistCycle,
  ChecklistStatus,
} from '../types/checklist.types';

/**
 * Filter templates based on search query and filters
 */
export const filterTemplates = (
  templates: ChecklistTemplate[],
  searchQuery: string,
  filters: {
    cycle: ChecklistCycle[];
    status: ChecklistStatus[];
  }
): ChecklistTemplate[] => {
  return templates.filter((template) => {
    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      const matchesSearch =
        template.code.toLowerCase().includes(query) ||
        template.name.toLowerCase().includes(query);

      if (!matchesSearch) return false;
    }

    // Cycle filter
    if (filters.cycle.length > 0 && !filters.cycle.includes(template.cycle)) {
      return false;
    }

    // Status filter
    if (filters.status.length > 0 && !filters.status.includes(template.status)) {
      return false;
    }

    return true;
  });
};

/**
 * Build query params from filter state
 */
export const buildQueryParams = (
  filters: {
    cycle: ChecklistCycle[];
    status: ChecklistStatus[];
  },
  searchQuery: string,
  page: number = 1,
  limit: number = 20
): QueryTemplateParams => {
  const params: QueryTemplateParams = {
    page,
    limit,
  };

  if (searchQuery) {
    params.search = searchQuery;
  }

  // Note: Backend only supports single cycle filter
  if (filters.cycle.length === 1) {
    params.cycle = filters.cycle[0];
  }

  // Note: Backend only supports single status filter
  if (filters.status.length === 1) {
    params.status = filters.status[0];
  }

  return params;
};

/**
 * Count templates by status
 */
export const countByStatus = (
  templates: ChecklistTemplate[]
): Record<ChecklistStatus, number> => {
  return templates.reduce(
    (acc, template) => {
      acc[template.status] = (acc[template.status] || 0) + 1;
      return acc;
    },
    {
      [ChecklistStatus.DRAFT]: 0,
      [ChecklistStatus.ACTIVE]: 0,
      [ChecklistStatus.INACTIVE]: 0,
    } as Record<ChecklistStatus, number>
  );
};
