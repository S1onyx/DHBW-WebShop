let token;

window.onload = function () {
    const params = new URLSearchParams(window.location.search);

    const token_param = params.get('token');

    if (token_param) {
        token = token_param;
    }
}

document.getElementById("verify-button").addEventListener("click", async (event) => {
    event.preventDefault();

    const verifySuccess = document.getElementById("verify-success");
    const verifyError = document.getElementById("verify-error");

    if(!token) {
        verifyError.textContent = "Couldn't verify.";
        verifyError.style.display = "block";
        return;
    }


    try {
        const res = await fetch(`http://${window.ROOT_URL}:3000/api/auth/verify?token=${encodeURIComponent(token)}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            credentials: 'include'
        });

        const json = await res.json();
        if (json.success) {
            verifySuccess.textContent = 'Verification successful.';
            verifySuccess.style.display = "block";
            setTimeout(() => {
                window.location.href = 'login';
            }, 1000);
        } else {
            verifyError.textContent = json.error || 'Verification not successful.';
            verifyError.style.display = "block";
        }
    } catch (err) {
        verifyError.textContent = 'Serverfehler while verifying';
        verifyError.style.display = "block";
    }
})
