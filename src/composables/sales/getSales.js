import { ref } from 'vue'

const getSales = async(token, limit = null, includeItems = false, startDate = null, endDate = null, paymentMode = null) => {
    const response = ref(null)
    const error = ref(null)

    const bearer = "Bearer " + token
    try {
        // Build query parameters
        const params = new URLSearchParams()
        if (limit) params.append('limit', limit)
        if (includeItems) params.append('includeItems', 'true')
        if (startDate) params.append('startDate', startDate)
        if (endDate) params.append('endDate', endDate)
        if (paymentMode) params.append('paymentMode', paymentMode)
        
        const queryString = params.toString() ? `?${params.toString()}` : ''
        
        const reqOptions = {
            method: "GET",
            headers: {"Content-Type":"application/json", "Authorization":bearer}
        }
        
        const data = await fetch(import.meta.env.VITE_BACKEND_API + '/api/v1/sales/getSales' + queryString, reqOptions)
        response.value = await data.json()

    } catch (err) {
        error.value = err
    }
    return { response, error }
}

export default getSales
