type EmailMessage = {
  to: string;
  subject: string;
  html: string;
};

export async function sendEmail(message: EmailMessage) {
  void message;
  return { ok: true };
}

export function notificationTemplate(title: string, body: string) {
  return `<!doctype html><html><body><h1>${title}</h1><p>${body}</p></body></html>`;
}
