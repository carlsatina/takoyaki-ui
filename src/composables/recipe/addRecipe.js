import { ref } from 'vue'

const addRecipe = async(recipe, ingredients, token) => {
    const response = ref(null)
    const error = ref(null)

    const bearer = "Bearer " + token
    try {
        const reqOptions = {
            method: "POST",
            headers: {"Content-Type":"application/json", "Authorization":bearer},
            body: JSON.stringify({
                name: recipe.name,
                ingredients: ingredients
            })
        }
        // const data = await fetch("http://localhost:5000/services", reqOptions)
        const data = await fetch(import.meta.env.VITE_BACKEND_API + '/api/v1/recipe/', reqOptions)

        response.value = await data.json()

    } catch (err) {
        error.value = err
    }
    return { response, error }
}

export default addRecipe