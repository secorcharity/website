# SECOR e.V. – Website

Static presentation and donation website for SECOR e.V. (Olching, VR 211601).
Languages: Romanian, German, English (switch in the header).

## Editing donation details
Open `assets/main.js` and fill in `SECOR_CONFIG` at the top:
- `bank.iban`, `bank.bic`, `bank.bankName` – SECOR e.V. bank account
- `paypalUrl` – PayPal donate link
- `facebookUrl` – Facebook page
- `romania` – Romanian partner (name, CIF, IBAN, Form 230 link)

Fields left empty show a "coming soon" note on the site.

## Texts
Romanian text lives in `index.html`; German and English in `assets/i18n.js` (same keys as the `data-i18n` attributes).

Hosted with GitHub Pages; no build step, no cookies, fonts self-hosted.
