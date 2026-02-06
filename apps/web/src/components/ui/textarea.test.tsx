import { render } from '@testing-library/react';
import { Textarea } from './textarea';

describe('Textarea Component', () => {
  it('renders correctly', () => {
    const { getByPlaceholderText } = render(<Textarea placeholder="Nhập ghi chú..." />);
    
    const textarea = getByPlaceholderText('Nhập ghi chú...');
    expect(textarea).toBeInTheDocument();
    expect(textarea).toHaveClass('flex min-h-[80px] w-full');
  });
});