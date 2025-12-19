import { ref } from 'vue'

const editExpense = async(expense, token) => {
    const response = ref(null)
    const error = ref(null)

    const bearer = "Bearer " + token
    try {
        const reqOptions = {
            method: "PUT",
            headers: {"Content-Type":"application/json", "Authorization":bearer},
            body: JSON.stringify({
                expense: expense
            })
        }
        // const data = await fetch("http://localhost:5000/services", reqOptions)
        const data = await fetch(import.meta.env.VITE_BACKEND_API + '/api/v1/expense/' + expense.id, reqOptions)

        response.value = await data.json()

    } catch (err) {
        error.value = err
    }
    return { response, error }
}

export default editExpense