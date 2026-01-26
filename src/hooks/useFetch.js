import { useState, useEffect } from 'react'

// Simple data fetching hook
export function useFetch(fetchFn, deps = []) {
    const [data, setData] = useState(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)

    async function load() {
        setLoading(true)
        setError(null)

        try {
            const result = await fetchFn()
            setData(result)
        } catch (err) {
            setError(err.message || 'Произошла ошибка')
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        load()
    }, deps)

    return { data, loading, error, refetch: load }
}

// Mutation hook for POST/PUT/DELETE
export function useMutation(mutationFn) {
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState(null)

    async function mutate(...args) {
        setLoading(true)
        setError(null)

        try {
            const result = await mutationFn(...args)
            return result
        } catch (err) {
            setError(err.message || 'Произошла ошибка')
            throw err
        } finally {
            setLoading(false)
        }
    }

    return { mutate, loading, error }
}
