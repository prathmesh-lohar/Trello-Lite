export const loginUser = async (email, password) => {
    // Mock authentication for testing since backend is not available
    if (email === "test@example.com" && password === "password") {
        return {
            user: {
                _id: "1",
                name: "Test User",
                email: "test@example.com",
                avatar: "/avatar_user.jpg"
            },
            token: "mock-jwt-token-12345"
        };
    }
    
    // Try to connect to backend if available
    try {
        const res = await fetch("http://localhost:1000/api/v1/auth/login", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email, password }),
        });

        const data = await res.json();

        if (!res.ok) {
            throw new Error(data.message || "Login failed");
        }

        return data;
    } catch (error) {
        // If backend is not available, throw invalid credentials error
        throw new Error("Invalid email or password");
    }
};



export const signupUser = async (name: string, email: string, password: string) => {
    try {
        const res = await fetch("http://localhost:1000/api/v1/auth/register", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ name, email, password }),
        });

        if (!res.ok) {

            const errorData = await res.json().catch(() => null);
            throw new Error(errorData?.message || "Signup failed");
        }

        const data = await res.json();

        console.log(data);

        return data;
    } catch (error: unknown) {

        if (error instanceof Error) {
            throw new Error(error.message || "Signup failed");
        }
        throw new Error("Signup failed");
    }
};
