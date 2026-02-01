import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import App from './App'

vi.mock('exifr', () => ({
  default: {
    parse: vi.fn(),
  },
}))

import exifr from 'exifr'

describe('App', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    // Mock URL.createObjectURL
    global.URL.createObjectURL = vi.fn(() => 'mock-url')
    global.URL.revokeObjectURL = vi.fn()
  })

  it('should render upload area initially', () => {
    render(<App />)

    expect(screen.getByTestId('upload-area')).toBeInTheDocument()
  })

  it('should render app title', () => {
    render(<App />)

    expect(screen.getByText(/Time Image/i)).toBeInTheDocument()
  })

  it('should show preview and editor after uploading image with EXIF', async () => {
    const mockDate = new Date('2024-03-15T14:30:00')
    vi.mocked(exifr.parse).mockResolvedValue({
      DateTimeOriginal: mockDate,
    })

    render(<App />)

    const file = new File(['test'], 'test.jpg', { type: 'image/jpeg' })
    const input = screen.getByTestId('file-input')

    await userEvent.upload(input, file)

    await waitFor(() => {
      expect(screen.getByTestId('preview-canvas')).toBeInTheDocument()
    })

    expect(screen.getByLabelText(/格式/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/位置/i)).toBeInTheDocument()
  })

  it('should show warning when image has no EXIF data', async () => {
    vi.mocked(exifr.parse).mockResolvedValue(null)

    render(<App />)

    const file = new File(['test'], 'test.png', { type: 'image/png' })
    const input = screen.getByTestId('file-input')

    await userEvent.upload(input, file)

    await waitFor(() => {
      expect(screen.getByText(/無法讀取拍攝時間/i)).toBeInTheDocument()
    })
  })

  it('should update preview when editor config changes', async () => {
    const mockDate = new Date('2024-03-15T14:30:00')
    vi.mocked(exifr.parse).mockResolvedValue({
      DateTimeOriginal: mockDate,
    })

    render(<App />)

    const file = new File(['test'], 'test.jpg', { type: 'image/jpeg' })
    const input = screen.getByTestId('file-input')

    await userEvent.upload(input, file)

    await waitFor(() => {
      expect(screen.getByTestId('preview-canvas')).toBeInTheDocument()
    })

    const positionSelect = screen.getByLabelText(/位置/i)
    await userEvent.selectOptions(positionSelect, 'top-left')

    // Verify the select value changed
    expect(positionSelect).toHaveValue('top-left')
  })

  it('should allow uploading a new image', async () => {
    const mockDate = new Date('2024-03-15T14:30:00')
    vi.mocked(exifr.parse).mockResolvedValue({
      DateTimeOriginal: mockDate,
    })

    render(<App />)

    // Upload first image
    const file1 = new File(['test1'], 'test1.jpg', { type: 'image/jpeg' })
    const input = screen.getByTestId('file-input')
    await userEvent.upload(input, file1)

    await waitFor(() => {
      expect(screen.getByTestId('preview-canvas')).toBeInTheDocument()
    })

    // Should still show the uploader for new uploads
    expect(screen.getByTestId('file-input')).toBeInTheDocument()
  })
})
