import { ref } from 'vue'

const addSales = async(cart_items, total, payment_mode, dine_mode, token) => {
    const response = ref(null)
    const error = ref(null)

    const bearer = "Bearer " + token
    try {
        const reqOptions = {
            method: "POST",
            headers: {"Content-Type":"application/json", "Authorization":bearer},
            body: JSON.stringify({
                CartItems: cart_items,
                total_amount: total,
                payment_mode: payment_mode,
                dine_mode: dine_mode
            })
        }
        // const data = await fetch("http://localhost:5000/services", reqOptions)
        const data = await fetch(import.meta.env.VITE_BACKEND_API + '/api/v1/sales/', reqOptions)

        response.value = await data.json()

    } catch (err) {
        error.value = err
    }
    return { response, error }
}

export default addSales