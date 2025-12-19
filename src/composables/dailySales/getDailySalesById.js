import { ref } from 'vue'

const getDailySalesById = async (id, token) => {
  const response = ref(null)
  const error = ref(null)

  const bearer = 'Bearer ' + token
  try {
    const reqOptions = {
      method: 'GET',
      headers: { 'Content-Type': 'application/json', Authorization: bearer }
    }

    const data = await fetch(import.meta.env.VITE_BACKEND_API + '/api/v1/daily-sales/' + id, reqOptions)
    response.value = await data.json()
  } catch (err) {
    error.value = err
  }

  return { response, error }
}

export default getDailySalesById
