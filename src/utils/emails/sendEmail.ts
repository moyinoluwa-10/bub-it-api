import nodemailer, { Transporter, SendMailOptions } from "nodemailer";
import { env } from "../../config/env";

let transporter: Transporter | null = null;

const createTransporter = (): Transporter => {
  if (transporter) return transporter;

  transporter = nodemailer.createTransport({
    service: env.EMAIL_SMTP_SERVICE || undefined, // optional
    host: env.EMAIL_SMTP_HOST,
    port: env.EMAIL_SMTP_PORT,
    secure: env.EMAIL_SMTP_SECURE,
    auth: {
      user: env.EMAIL_SMTP_USER,
      pass: env.EMAIL_SMTP_PASS,
    },
  });

  return transporter;
};

export const sendEmail = async (
  mailOptions: SendMailOptions
): Promise<void> => {
  const t = createTransporter();
  await t.sendMail({
    from:
      mailOptions.from ?? `${env.EMAIL_FROM_NAME} <${env.EMAIL_FROM_ADDRESS}>`,
    ...mailOptions,
  });
};
