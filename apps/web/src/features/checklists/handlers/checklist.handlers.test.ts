// No imports needed for jest globals
import { createChecklistHandlers } from './checklist.handlers';

describe('checklist.handlers', () => {
  const navigate = jest.fn();
  const actions = {
    duplicate: {
      mutate: jest.fn((id, options) => {
        options?.onSuccess?.({ id: 'new-id' });
      }),
    },
    deactivate: {
      mutate: jest.fn(),
    },
  } as any;

  beforeEach(() => {
    jest.clearAllMocks();
    window.confirm = jest.fn(() => true);
  });

  it('should navigate to checklists list on handleGoBack', () => {
    const handlers = createChecklistHandlers(navigate, actions);
    handlers.handleGoBack();
    expect(navigate).toHaveBeenCalledWith('/checklists');
  });

  it('should navigate to edit page on handleEdit', () => {
    const handlers = createChecklistHandlers(navigate, actions);
    handlers.handleEdit('123');
    expect(navigate).toHaveBeenCalledWith('/checklists/123/edit');
  });

  it('should call duplicate mutation and navigate on handleCopy', () => {
    const handlers = createChecklistHandlers(navigate, actions);
    handlers.handleCopy('123');
    expect(actions.duplicate.mutate).toHaveBeenCalledWith('123', expect.any(Object));
    expect(navigate).toHaveBeenCalledWith('/checklists/new-id');
  });

  it('should call deactivate mutation when confirmed on handleDeactivate', () => {
    const handlers = createChecklistHandlers(navigate, actions);
    handlers.handleDeactivate('123');
    expect(window.confirm).toHaveBeenCalled();
    expect(actions.deactivate.mutate).toHaveBeenCalledWith('123');
  });

  it('should not call deactivate mutation when not confirmed', () => {
    window.confirm = vi.fn(() => false);
    const handlers = createChecklistHandlers(navigate, actions);
    handlers.handleDeactivate('123');
    expect(actions.deactivate.mutate).not.toHaveBeenCalled();
  });
});
