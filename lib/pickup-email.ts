// The browser and API accept one unquoted mailbox at a public DNS-style domain.
const mailbox = /^[a-z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?(?:\.[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?)+$/i;

export function isValidPickupEmail(value: string): boolean {
  const email = value.trim();
  const local = email.split('@')[0];
  return email.length <= 254 && local.length <= 64 && mailbox.test(email)
    && !local.startsWith('.') && !local.endsWith('.') && !local.includes('..');
}
