// Funktion zum Anzeigen des Pop-up-Nachricht
export function showPopupMessage(message, duration = 1500) {
    const popup = document.createElement('div');
    popup.textContent = message;
    popup.style.position = 'fixed';
    popup.style.top = '50%';
    popup.style.left = '50%';
    popup.style.transform = 'translate(-50%, -50%)';
    popup.style.background = '#007bff';
    popup.style.color = '#fff';
    popup.style.padding = '18px 36px';
    popup.style.borderRadius = '10px';
    popup.style.fontSize = '1.1rem';
    popup.style.boxShadow = '0 4px 24px rgba(0,0,0,0.12)';
    popup.style.zIndex = '9999';
    popup.style.opacity = '0';
    popup.style.transition = 'opacity 0.2s';

    document.body.appendChild(popup);
    setTimeout(() => { popup.style.opacity = '1'; }, 10);
    setTimeout(() => {
        popup.style.opacity = '0';
        setTimeout(() => popup.remove(), 200);
    }, duration);
}

export async function getCurrentUser() {
    try {
        const res = await fetch(`http://${window.ROOT_URL}:3000/api/users/me`, {
            credentials: 'include',
            headers: { 'Content-Type': 'application/json' }
        });
        return await res.json();
    } catch (err) {
        console.error('Fehler beim Laden des aktuellen Users:', err);
        return null;
    }
}