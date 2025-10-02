// Handles logout button click: sends logout request to backend and redirects on success
document.getElementById("logoutbtn").addEventListener("click", async (e) => {
    e.preventDefault(); // Prevent default link behavior

    try {
        // Send logout request to backend
        const response = await fetch('http://localhost:3000/auth/logout', {
            method: 'POST',
            credentials: 'include', // Send cookies for session
            headers: { 'Content-Type': 'application/json' }
        });

        const data = await response.json();
        console.log(data);

        if (response.ok) {
            // Redirect to login page on successful logout
            window.location.href = "/login";
        } else {
            // Show error if logout fails
            alert("Logout failed");
        }
    } catch (err) {
        // Log error if request fails
        console.error("Logout error:", err);
    }
});
