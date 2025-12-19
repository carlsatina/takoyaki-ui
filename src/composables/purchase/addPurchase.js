import { ref } from 'vue'

const addPurchase = async(purchase, purchaseItems, token) => {
    const response = ref(null)
    const error = ref(null)

    const bearer = "Bearer " + token
    try {
        const reqOptions = {
            method: "POST",
            headers: {"Content-Type":"application/json", "Authorization":bearer},
            body: JSON.stringify({
                purchase: purchase,
                purchaseItems: purchaseItems
            })
        }
        // const data = await fetch("http://localhost:5000/services", reqOptions)
        const data = await fetch(import.meta.env.VITE_BACKEND_API + '/api/v1/purchase/', reqOptions)

        response.value = await data.json()

    } catch (err) {
        error.value = err
    }
    return { response, error }
}

export default addPurchase