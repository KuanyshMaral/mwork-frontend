import { renderHook, waitFor } from '@testing-library/react'
import { useFetch, useMutation } from '../hooks/useFetch'

describe('useFetch', () => {
  it('should return initial loading state', () => {
    const mockFetchFn = vi.fn()
    const { result } = renderHook(() => useFetch(mockFetchFn))

    expect(result.current.loading).toBe(true)
    expect(result.current.data).toBe(null)
    expect(result.current.error).toBe(null)
  })

  it('should fetch data successfully', async () => {
    const mockData = { id: 1, name: 'Test' }
    const mockFetchFn = vi.fn().mockResolvedValue(mockData)
    
    const { result } = renderHook(() => useFetch(mockFetchFn))

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    expect(result.current.data).toEqual(mockData)
    expect(result.current.error).toBe(null)
    expect(mockFetchFn).toHaveBeenCalledTimes(1)
  })

  it('should handle fetch error', async () => {
    const errorMessage = 'Network error'
    const mockFetchFn = vi.fn().mockRejectedValue(new Error(errorMessage))
    
    const { result } = renderHook(() => useFetch(mockFetchFn))

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    expect(result.current.data).toBe(null)
    expect(result.current.error).toBe(errorMessage)
  })

  it('should refetch data when calling refetch', async () => {
    const mockData = { id: 1, name: 'Test' }
    const mockFetchFn = vi.fn().mockResolvedValue(mockData)
    
    const { result } = renderHook(() => useFetch(mockFetchFn))

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    // Clear previous calls
    mockFetchFn.mockClear()

    // Call refetch
    await result.current.refetch()

    expect(mockFetchFn).toHaveBeenCalledTimes(1)
    expect(result.current.data).toEqual(mockData)
  })

  it('should run fetch function when dependencies change', async () => {
    const mockData = { id: 1, name: 'Test' }
    const mockFetchFn = vi.fn().mockResolvedValue(mockData)
    
    const { rerender } = renderHook(
      ({ deps }) => useFetch(mockFetchFn, deps),
      { initialProps: { deps: [1] } }
    )

    await waitFor(() => {
      expect(mockFetchFn).toHaveBeenCalledTimes(1)
    })

    // Change dependencies - this should trigger a re-fetch
    rerender({ deps: [2] })

    await waitFor(() => {
      expect(mockFetchFn).toHaveBeenCalledTimes(2)
    }, { timeout: 2000 })
  })
})

describe('useMutation', () => {
  it('should return initial state', () => {
    const mockMutationFn = vi.fn()
    const { result } = renderHook(() => useMutation(mockMutationFn))

    expect(result.current.loading).toBe(false)
    expect(result.current.error).toBe(null)
  })

  it('should execute mutation successfully', async () => {
    const mockData = { success: true }
    const mockMutationFn = vi.fn().mockResolvedValue(mockData)
    
    const { result } = renderHook(() => useMutation(mockMutationFn))

    const response = await result.current.mutate('test-arg')

    expect(result.current.loading).toBe(false)
    expect(result.current.error).toBe(null)
    expect(response).toEqual(mockData)
    expect(mockMutationFn).toHaveBeenCalledWith('test-arg')
  })

  it('should handle mutation error', async () => {
    const errorMessage = 'Mutation failed'
    const mockMutationFn = vi.fn().mockRejectedValue(new Error(errorMessage))
    
    const { result } = renderHook(() => useMutation(mockMutationFn))

    await expect(result.current.mutate()).rejects.toThrow(errorMessage)

    // Wait a tick for state to update
    await new Promise(resolve => setTimeout(resolve, 0))

    expect(result.current.loading).toBe(false)
    expect(result.current.error).toBe(errorMessage)
  })
})
