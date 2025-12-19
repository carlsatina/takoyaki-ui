import { ref } from 'vue'

const updateSettings = async (id, payload, token) => {
  const response = ref(null)
  const error = ref(null)
  const bearer = 'Bearer ' + token

  try {
    const reqOptions = {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', Authorization: bearer },
      body: JSON.stringify(payload)
    }
    const data = await fetch(import.meta.env.VITE_BACKEND_API + '/api/v1/settings/' + id, reqOptions)
    response.value = await data.json()
  } catch (err) {
    error.value = err
  }

  return { response, error }
}

export default updateSettings
