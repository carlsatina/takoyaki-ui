import { ref } from 'vue'

const updateInventoryStock = async (id, current_stock, token) => {
  const response = ref(null)
  const error = ref(null)
  const bearer = 'Bearer ' + token

  try {
    const reqOptions = {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', Authorization: bearer },
      body: JSON.stringify({ current_stock })
    }
    const data = await fetch(`${import.meta.env.VITE_BACKEND_API}/api/v1/inventory/${id}/stock`, reqOptions)
    response.value = await data.json()
  } catch (err) {
    error.value = err
  }

  return { response, error }
}

export default updateInventoryStock
