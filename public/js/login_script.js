document.getElementById("login").addEventListener("click", async (e) => {
    e.preventDefault();
    let email = document.getElementById("emailTB").value;
    let password = document.getElementById("passwordTB").value;
    console.log(password);
    console.log(email);

    try {
        const response = await fetch(`http://localhost:3000/auth/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({email , password}),
        });
        const data = await response.json();
        console.log(data);

        if (response.ok) {
            window.location.href = "/home";
        } else {
            alert(`${data.message}`);
        }

    } catch (error) {
        console.log(error);
    }
})