// Handles login button click: sends login request to backend and redirects on success
document.getElementById("login").addEventListener("click", async (e) => {
    e.preventDefault(); // Prevent default form submission
    let email = document.getElementById("emailTB").value; // Get email from input
    let password = document.getElementById("passwordTB").value; // Get password from input
    console.log(password);
    console.log(email);

    try {
        // Send login request to backend
        const response = await fetch(`/auth/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({email , password}),
        });
        const data = await response.json();
        console.log(data);

        if (response.ok) {
            // Redirect to admin dashboard on successful login
            window.location.href = "/admin/dashboard";
        } else {
            // Show error message from backend
            alert(`${data.message}`);
        }

    } catch (error) {
        // Log error if request fails
        console.log(error);
    }
})