/**
 * Ways to write an email that work everywhere.
 * A bare mailto: link does nothing when the visitor has no mail app set up (common on desktops)
 * and is often blocked inside embedded pages, so Gmail and Outlook open their own compose window
 * in a new tab instead.
 */
export type ComposeLink = { id: 'gmail' | 'outlook' | 'app'; label: string; href: string };

export function composeLinks(email: string, subject = 'Hello Shubham — via your portfolio', body = 'Hi Shubham,\n\n'): ComposeLink[] {
  const to = encodeURIComponent(email);
  const su = encodeURIComponent(subject);
  const bo = encodeURIComponent(body);
  return [
    { id: 'gmail', label: 'Gmail', href: `https://mail.google.com/mail/?view=cm&fs=1&to=${to}&su=${su}&body=${bo}` },
    { id: 'outlook', label: 'Outlook', href: `https://outlook.office.com/mail/deeplink/compose?to=${to}&subject=${su}&body=${bo}` },
    { id: 'app', label: 'Mail app', href: `mailto:${email}?subject=${su}&body=${bo}` },
  ];
}

/** Copies text, falling back to a hidden textarea where the async clipboard API is blocked (e.g. in iframes). */
export async function copyText(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    try {
      const ta = document.createElement('textarea');
      ta.value = text;
      ta.setAttribute('readonly', '');
      ta.style.position = 'fixed';
      ta.style.opacity = '0';
      document.body.appendChild(ta);
      ta.select();
      const ok = document.execCommand('copy');
      ta.remove();
      return ok;
    } catch {
      return false;
    }
  }
}
