import toast from "react-hot-toast"

const BASE_URL = "/api/users"

export const userService = {

    getAllData: async () => {
        try {
            const response = await fetch(BASE_URL)
            const result = await response.json()

            if (response.ok) {
                return result.data
            }
        } catch (error) {
            console.error("Error fetching users:", error)
            toast.error("Failed to fetch users")
        }
    },

    updateData: async (id, data) => {
        try {
            const response = await fetch(BASE_URL, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ id, ...data }),
            })

            if (!response.ok) {
                toast.error("Failed to update user")
            }
        } catch (error) {
            console.error("Error updating user:", error)
            toast.error("Failed to update user")
        }
    },

    deleteData: async (id) => {
        try {
            const response = await fetch(BASE_URL, {
                method: "DELETE",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ id }),
            })

            if (!response.ok) {
                toast.error("Failed to delete user")
            }
        } catch (error) {
            console.error("Error deleting user:", error)
            toast.error("Failed to delete user")
        }
    }
}
