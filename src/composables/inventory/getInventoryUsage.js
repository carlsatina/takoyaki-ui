import { ref } from 'vue'

const getInventoryUsage = async (token, startDate, endDate) => {
  const response = ref(null)
  const error = ref(null)
  const bearer = 'Bearer ' + token

  try {
    const params = new URLSearchParams()
    if (startDate) params.append('startDate', startDate)
    if (endDate) params.append('endDate', endDate)

    const reqOptions = {
      method: 'GET',
      headers: { 'Content-Type': 'application/json', Authorization: bearer }
    }
    const data = await fetch(`${import.meta.env.VITE_BACKEND_API}/api/v1/inventory/usage?${params.toString()}`, reqOptions)
    response.value = await data.json()
  } catch (err) {
    error.value = err
  }

  return { response, error }
}

export default getInventoryUsage
