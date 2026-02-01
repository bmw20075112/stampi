import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import useExifData from './useExifData'

vi.mock('exifr', () => ({
  default: {
    parse: vi.fn(),
  },
}))

import exifr from 'exifr'

describe('useExifData', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should return null date when no file is provided', () => {
    const { result } = renderHook(() => useExifData(null))

    expect(result.current.date).toBeNull()
    expect(result.current.loading).toBe(false)
    expect(result.current.error).toBeNull()
  })

  it('should read DateTimeOriginal from EXIF', async () => {
    const mockDate = new Date('2024-03-15T14:30:00')
    vi.mocked(exifr.parse).mockResolvedValue({
      DateTimeOriginal: mockDate,
    })

    const file = new File(['test'], 'test.jpg', { type: 'image/jpeg' })
    const { result } = renderHook(() => useExifData(file))

    expect(result.current.loading).toBe(true)

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    expect(result.current.date).toEqual(mockDate)
    expect(result.current.error).toBeNull()
  })

  it('should fallback to CreateDate when DateTimeOriginal is not available', async () => {
    const mockDate = new Date('2024-03-15T10:00:00')
    vi.mocked(exifr.parse).mockResolvedValue({
      CreateDate: mockDate,
    })

    const file = new File(['test'], 'test.jpg', { type: 'image/jpeg' })
    const { result } = renderHook(() => useExifData(file))

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    expect(result.current.date).toEqual(mockDate)
  })

  it('should fallback to ModifyDate when DateTimeOriginal and CreateDate are not available', async () => {
    const mockDate = new Date('2024-03-15T08:00:00')
    vi.mocked(exifr.parse).mockResolvedValue({
      ModifyDate: mockDate,
    })

    const file = new File(['test'], 'test.jpg', { type: 'image/jpeg' })
    const { result } = renderHook(() => useExifData(file))

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    expect(result.current.date).toEqual(mockDate)
  })

  it('should return null when no EXIF date is available', async () => {
    vi.mocked(exifr.parse).mockResolvedValue({})

    const file = new File(['test'], 'test.png', { type: 'image/png' })
    const { result } = renderHook(() => useExifData(file))

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    expect(result.current.date).toBeNull()
  })

  it('should return null when EXIF parsing returns null', async () => {
    vi.mocked(exifr.parse).mockResolvedValue(null)

    const file = new File(['test'], 'test.png', { type: 'image/png' })
    const { result } = renderHook(() => useExifData(file))

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    expect(result.current.date).toBeNull()
  })

  it('should handle EXIF parsing errors', async () => {
    vi.mocked(exifr.parse).mockRejectedValue(new Error('Parse error'))

    const file = new File(['test'], 'test.jpg', { type: 'image/jpeg' })
    const { result } = renderHook(() => useExifData(file))

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    expect(result.current.date).toBeNull()
    expect(result.current.error).toBe('Parse error')
  })

  it('should show loading state while parsing', () => {
    vi.mocked(exifr.parse).mockImplementation(
      () => new Promise((resolve) => setTimeout(() => resolve({}), 100))
    )

    const file = new File(['test'], 'test.jpg', { type: 'image/jpeg' })
    const { result } = renderHook(() => useExifData(file))

    expect(result.current.loading).toBe(true)
  })
})
