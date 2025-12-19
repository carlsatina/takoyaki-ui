import { ref } from 'vue'

const getSalesByhour = async(startDate, endDate, token) => {
    const response = ref(null)
    const error = ref(null)

    const bearer = "Bearer " + token
    try {
        const reqOptions = {
            method: "GET",
            headers: {"Content-Type":"application/json", "Authorization":bearer}
        }
        // const data = await fetch("http://localhost:5000/services", reqOptions)
        const data = await fetch(import.meta.env.VITE_BACKEND_API + `/api/v1/reports/hour?startDate=${startDate}&endDate=${endDate}`, reqOptions)
        response.value = await data.json()

    } catch (err) {
        console.log("error: ", err)
        error.value = err
    }
    return { response, error }
}

export default getSalesByhour