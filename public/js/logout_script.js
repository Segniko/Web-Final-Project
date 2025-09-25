document.getElementById("logoutbtn").addEventListener("click", async (e) => {
    e.preventDefault();

    try {
        const response = await fetch('http://localhost:3000/auth/logout', {  // <-- correct port
            method: 'POST',
            credentials: 'include',
            headers: { 'Content-Type': 'application/json' }
        });

        const data = await response.json();
        console.log(data);

        if (response.ok) {
            window.location.href = "/login";
        } else {
            alert("Logout failed");
        }
    } catch (err) {
        console.error("Logout error:", err);
    }
});
