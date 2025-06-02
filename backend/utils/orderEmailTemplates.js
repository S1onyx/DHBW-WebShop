// backend/utils/orderEmailTemplates.js

function generateOrderConfirmationEmail({ orderId, orderDate, customer, items, totalPrice }) {
  const orderNumber = `WS-${orderDate.getFullYear()}-${String(orderId).padStart(6, '0')}`;

  const rows = items.map(item => `
    <tr>
      <td><img src="${item.url || '#'}" alt="" width="60" height="60" style="object-fit:cover;border-radius:8px;"></td>
      <td>${item.name}</td>
      <td>${item.quantity}×</td>
      <td>${parseFloat(item.price).toFixed(2)} €</td>
    </tr>
  `).join('');

  return {
    to: customer.email,
    subject: `Bestellbestätigung – Bestellung ${orderNumber}`,
    html: `
      <div style="font-family:sans-serif">
        <h2>Vielen Dank für Ihre Bestellung, ${customer.first_name}!</h2>
        <p>Ihre Bestellung <strong>${orderNumber}</strong> vom ${orderDate.toLocaleDateString('de-DE')} wurde erfolgreich aufgegeben.</p>
        <h3>Lieferadresse:</h3>
        <p>${customer.first_name} ${customer.last_name}<br>
        ${customer.street} ${customer.house_number}<br>
        ${customer.postal_code} ${customer.city}, ${customer.country}</p>
        <h3>Bestellte Produkte:</h3>
        <table style="width:100%;border-collapse:collapse;text-align:left">
          <thead><tr><th></th><th>Produkt</th><th>Menge</th><th>Preis</th></tr></thead>
          <tbody>${rows}</tbody>
        </table>
        <h3>Gesamtsumme: ${totalPrice.toFixed(2)} €</h3>
      </div>
    `
  };
}

function generateSellerNotificationEmail({ seller, orderId, orderDate, items }) {
  const orderNumber = `WS-${orderDate.getFullYear()}-${String(orderId).padStart(6, '0')}`;

  const rows = items.map(item => `
    <tr>
      <td>${item.name}</td>
      <td>${item.quantity}×</td>
      <td>${parseFloat(item.price).toFixed(2)} €</td>
    </tr>
  `).join('');

  return {
    to: seller.email,
    subject: `Neuer Verkauf – Bestellung ${orderNumber}`,
    html: `
      <div style="font-family:sans-serif">
        <h2>Hallo ${seller.first_name},</h2>
        <p>In Bestellung <strong>${orderNumber}</strong> vom ${orderDate.toLocaleDateString('de-DE')} wurden folgende deiner Produkte verkauft:</p>
        <table style="width:100%;border-collapse:collapse;text-align:left">
          <thead><tr><th>Produkt</th><th>Menge</th><th>Preis</th></tr></thead>
          <tbody>${rows}</tbody>
        </table>
      </div>
    `
  };
}

module.exports = {
  generateOrderConfirmationEmail,
  generateSellerNotificationEmail
};