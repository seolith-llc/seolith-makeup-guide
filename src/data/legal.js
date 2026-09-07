// Terms of use and Privacy Policy shown in the app. Replace the bracketed placeholders
// before launch and have the text reviewed by a lawyer for your jurisdiction.

export const LEGAL_META = {
  company: '[COMPANY NAME]',
  address: '[COMPANY ADDRESS]',
  contact: '[CONTACT EMAIL]',
  jurisdiction: '[STATE / COUNTRY]',
  effective: '2026-09-07',
  version: 1,
};

export const TERMS = [
  {
    heading: '1. Who we are and what this is',
    paragraphs: [
      'Blendwise ("the app") is an educational makeup guide published by {company}, {address}. You can contact us at {contact}.',
      'By installing or using the app you agree to these Terms and to the Privacy Policy. If you do not agree, do not use the app.',
    ],
  },
  {
    heading: '2. Eligibility',
    paragraphs: [
      'You must be at least {age} years old to use the app, or 16 where local law requires it for consent to analytics. If you are under the age of majority, use the app only with a parent or guardian\'s permission.',
    ],
  },
  {
    heading: '3. Educational content, not professional advice',
    paragraphs: [
      'The instructions, timings, product notes and illustrations are general educational information about cosmetic application. They are not medical, dermatological or allergy advice and are not a substitute for a professional.',
      'Cosmetics can cause irritation or allergic reactions. Always read the manufacturer\'s label, patch-test new products for 24 to 48 hours, stop use if irritation occurs, and consult a doctor or dermatologist for any skin condition, eye condition, pregnancy-related question or reaction.',
      'The before-and-after illustration is a stylised drawing and does not predict how any product will look on your face.',
    ],
  },
  {
    heading: '4. Products, ratings and affiliate links',
    paragraphs: [
      'Product ratings shown in the app are editorial summaries prepared by us from publicly available reviews at the date of the app version. They are not live retailer data, may be out of date, and are not guarantees of quality, safety or suitability. Verify current information with the retailer and manufacturer.',
      'Some links open third-party retailers. As an Amazon Associate we earn from qualifying purchases. Links marked "Paid link" are affiliate links: if you buy through them we may receive a commission at no extra cost to you. This does not influence which products are listed or how they are rated.',
      'We do not sell products and are not a party to any purchase. Retailer terms, prices, shipping and returns are theirs alone.',
    ],
  },
  {
    heading: '5. Your data stays on your device',
    paragraphs: [
      'The app has no server. Your profile, routines, timings, kit and feedback are stored only in your browser on this device. Optional anonymous usage statistics are also stored only on this device unless you export and send them. See the Privacy Policy for details.',
      'You are responsible for the device and browser you use. Clearing browser data removes all app data.',
    ],
  },
  {
    heading: '6. Feedback and sharing',
    paragraphs: [
      'When you submit feedback you grant us a worldwide, royalty-free licence to use it to improve the app. Do not include personal data about other people or confidential information. Feedback leaves your device only when you choose to share, email or export it.',
      'Invite links contain a random code and no personal information. Only share the app with people who want it.',
    ],
  },
  {
    heading: '7. Acceptable use',
    paragraphs: [
      'Do not attempt to interfere with the app, circumvent the admin passphrase on a device that is not yours, or use the app\'s content to make health or safety claims.',
      'The app\'s text, illustrations and code are protected by copyright and are licensed to you for personal, non-commercial use.',
    ],
  },
  {
    heading: '8. Disclaimer and limitation of liability',
    paragraphs: [
      'The app is provided "as is" and "as available" without warranties of any kind, express or implied, including fitness for a particular purpose and non-infringement.',
      'To the fullest extent permitted by law, {company} will not be liable for any indirect, incidental, special or consequential damages, or for any skin reaction, injury, loss of data or purchase decision arising from use of the app or linked retailers. Where liability cannot be excluded it is limited to the amount you paid for the app, which is zero.',
      'Nothing in these Terms limits rights that consumer law gives you and that cannot be waived.',
    ],
  },
  {
    heading: '9. Changes',
    paragraphs: [
      'We may update the app and these Terms. The version and effective date are shown at the top of this page. Continued use after a change means you accept the new Terms; if you do not, uninstall the app.',
    ],
  },
  {
    heading: '10. Governing law',
    paragraphs: [
      'These Terms are governed by the laws of {jurisdiction}, without regard to conflict-of-law rules, except where mandatory consumer law of your country of residence applies.',
    ],
  },
];

export const PRIVACY = [
  {
    heading: 'Summary',
    paragraphs: [
      'Blendwise does not collect, transmit or sell personal data. Everything you enter stays in your browser on your device. There are no accounts, no cookies, no ad networks and no third-party scripts.',
    ],
  },
  {
    heading: 'What is stored on your device',
    paragraphs: [
      'Preferences: skill level, skin type, illustration skin tone, favourites, consent choices and a random install id.',
      'Routine history: which looks you ran, how long each step took, and completion status. Used for the Insights page and the personalised time estimate.',
      'My Kit: product names, categories and opening dates you enter.',
      'Feedback: the feedback text you write, its type, and an optional contact field you may leave empty. Stored until you delete it or choose to send it.',
      'Anonymous usage statistics (only if you opt in): event names such as "look_start", coarse values such as a minute range or page id, the random install id, a random per-session id, the hour of the event and the screen orientation. Never free text, never your name, never location, IP address or device identifiers.',
    ],
  },
  {
    heading: 'What leaves your device',
    paragraphs: [
      'Nothing, unless you take one of these actions: (a) tap Share or Invite, which uses your device\'s share sheet with a link and text you can see first; (b) tap Email, Copy or Share on a feedback item; (c) tap Export in Settings or Admin, which saves a JSON file you control; (d) tap a retailer link, which opens the retailer\'s website in your browser under their privacy policy.',
      'If the app is configured with a feedback endpoint (shown in Settings when present), feedback you submit is sent to that HTTPS address when online. This build has no endpoint configured.',
    ],
  },
  {
    heading: 'Your choices and rights',
    paragraphs: [
      'Turn anonymous statistics on or off at any time in Settings. Turning them off stops new events; use "Delete usage statistics" to erase existing ones.',
      'Export all your data as JSON (portability) or delete everything (erasure) from Settings at any time. Uninstalling the app or clearing site data has the same effect.',
      'Because we hold no data about you, we cannot identify you from an export or respond to access requests about server data; there is none. For questions contact {contact}.',
    ],
  },
  {
    heading: 'Children',
    paragraphs: [
      'The app is not directed at children under {age}. We do not knowingly collect any information from anyone; nothing is collected at all.',
    ],
  },
  {
    heading: 'Security',
    paragraphs: [
      'The app is served over HTTPS, uses a strict Content Security Policy and loads no external code. The admin area is protected by a locally hashed passphrase; it is intended to stop casual access on a shared device and is not a substitute for device security.',
    ],
  },
  {
    heading: 'Changes to this policy',
    paragraphs: [
      'Effective {effective}, version {version}. Changes will be shown here with a new date, and the consent screen will appear again if the changes affect what is stored.',
    ],
  },
];

export function fillLegal(text) {
  return text
    .replace(/\{company\}/g, LEGAL_META.company)
    .replace(/\{address\}/g, LEGAL_META.address)
    .replace(/\{contact\}/g, LEGAL_META.contact)
    .replace(/\{jurisdiction\}/g, LEGAL_META.jurisdiction)
    .replace(/\{effective\}/g, LEGAL_META.effective)
    .replace(/\{version\}/g, String(LEGAL_META.version))
    .replace(/\{age\}/g, '13');
}
