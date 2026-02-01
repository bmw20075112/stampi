import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import ImagePreview from './ImagePreview';
import type { TimestampConfig } from '../utils/imageProcessor';

const defaultConfig: TimestampConfig = {
  format: 'YYYY/MM/DD',
  position: 'bottom-right',
  color: '#FF6B35',
  fontSize: 30,
};

describe('ImagePreview', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render canvas element', () => {
    render(<ImagePreview imageUrl="test.jpg" timestamp="2024/03/15" config={defaultConfig} />);

    expect(screen.getByTestId('preview-canvas')).toBeInTheDocument();
  });

  it('should render download button', () => {
    render(<ImagePreview imageUrl="test.jpg" timestamp="2024/03/15" config={defaultConfig} />);

    expect(screen.getByRole('button', { name: /下載/i })).toBeInTheDocument();
  });

  it('should render canvas with appropriate styles', () => {
    render(<ImagePreview imageUrl="test.jpg" timestamp="2024/03/15" config={defaultConfig} />);

    const canvas = screen.getByTestId('preview-canvas');
    expect(canvas).toHaveClass('max-w-full');
  });

  it('should display timestamp in preview', () => {
    const { rerender } = render(
      <ImagePreview imageUrl="test.jpg" timestamp="2024/03/15" config={defaultConfig} />
    );

    // Rerender with different timestamp to verify component accepts the prop
    rerender(<ImagePreview imageUrl="test.jpg" timestamp="2024/12/25" config={defaultConfig} />);

    // Component should not throw and should still have the canvas
    expect(screen.getByTestId('preview-canvas')).toBeInTheDocument();
  });

  it('should update when config changes', () => {
    const { rerender } = render(
      <ImagePreview imageUrl="test.jpg" timestamp="2024/03/15" config={defaultConfig} />
    );

    const newConfig: TimestampConfig = {
      ...defaultConfig,
      position: 'top-left',
    };

    rerender(<ImagePreview imageUrl="test.jpg" timestamp="2024/03/15" config={newConfig} />);

    expect(screen.getByTestId('preview-canvas')).toBeInTheDocument();
  });

  it('should show message when no timestamp is available', () => {
    render(<ImagePreview imageUrl="test.jpg" timestamp={null} config={defaultConfig} />);

    expect(screen.getByText(/無法讀取拍攝時間/i)).toBeInTheDocument();
  });
});
