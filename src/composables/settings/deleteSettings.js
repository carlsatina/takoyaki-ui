import { ref } from 'vue'

const deleteSettings = async (id, token) => {
  const response = ref(null)
  const error = ref(null)
  const bearer = 'Bearer ' + token

  try {
    const reqOptions = {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json', Authorization: bearer }
    }
    const data = await fetch(import.meta.env.VITE_BACKEND_API + '/api/v1/settings/' + id, reqOptions)
    response.value = await data.json()
  } catch (err) {
    error.value = err
  }

  return { response, error }
}

export default deleteSettings
