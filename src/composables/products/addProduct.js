import { ref } from 'vue'

const addProduct = async(products, packaging, token) => {
    const response = ref(null)
    const error = ref(null)

    const bearer = "Bearer " + token

    console.log("packaing: ", packaging)
    try {
        const reqOptions = {
            method: "POST",
            headers: {"Content-Type":"application/json", "Authorization":bearer},
            body: JSON.stringify({
                Products: products,
                Packaging: packaging
            })
        }
        // const data = await fetch("http://localhost:5000/services", reqOptions)
        const data = await fetch(import.meta.env.VITE_BACKEND_API + '/api/v1/products/', reqOptions)

        response.value = await data.json()

    } catch (err) {
        error.value = err
    }
    return { response, error }
}

export default addProduct