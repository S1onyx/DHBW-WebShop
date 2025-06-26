const identifier = document.getElementById("verification-email");

window.onload = function() {
    const savedIdentifier = sessionStorage.getItem("identifier");
    if(savedIdentifier) {
        identifier.textContent = savedIdentifier;
    }
}

document.getElementById("resent-verification-contaier").addEventListener('click', (event) => {
    if (event.target !== document.getElementById("resent-verification-contaier")) {
        document.getElementById("resent-success").style.display = "none";
        document.getElementById("resent-error").style.display = "none";
    }
})

document.getElementById("resent-verification-form").addEventListener("submit", async function (event) {
    event.preventDefault();

    const identifierContent = identifier.textContent;


    const body = { email: identifierContent};

    const resentSuccess = document.getElementById("resent-success");
    const resentError = document.getElementById("resent-error");

    try {
        const res = await fetch(`http://${window.ROOT_URL}:3000/api/auth/resend-verification`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            credentials: 'include',
            body: JSON.stringify(body)
        });

        const json = await res.json();
        if (json.success) {
            resentSuccess.textContent = 'Resent Verification E-Mail.';
            resentSuccess.style.display = "block";
        } else {
            resentError.textContent = json.error || 'E-Mail is wrong.';
            resentError.style.display = "block";
        }
    } catch (err) {
        resentError.textContent = 'Serverfehler while requesting resent.';
        resentError.style.display = "block";
    }
})

document.getElementById("back-to-login").addEventListener("click", function (event) {
    event.preventDefault();

    window.location.href = "login";
})