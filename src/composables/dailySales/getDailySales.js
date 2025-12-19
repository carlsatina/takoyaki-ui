import { ref } from 'vue'

const getDailySales = async (token, staffId = null) => {
  const response = ref(null)
  const error = ref(null)

  const bearer = 'Bearer ' + token
  try {
    const params = new URLSearchParams()
    if (staffId) params.append('staff_id', staffId)

    const query = params.toString() ? `?${params.toString()}` : ''
    const reqOptions = {
      method: 'GET',
      headers: { 'Content-Type': 'application/json', Authorization: bearer }
    }

    const data = await fetch(import.meta.env.VITE_BACKEND_API + '/api/v1/daily-sales' + query, reqOptions)
    response.value = await data.json()
  } catch (err) {
    error.value = err
  }

  return { response, error }
}

export default getDailySales
