import fs from "fs";
import path from "path";

const users = JSON.parse(
  fs.readFileSync(
    path.join(__dirname, "../../cypress/fixtures/users.json"),
    "utf-8",
  ),
) as {
  valid_credentials: { emailId: string; password: string };
  admin_credentials: { emailId: string; password: string };
  invalid_credentials: {
    invalid_email: { emailId: string; password: string };
    invalid_password: { emailId: string; password: string };
    wrong_email_format: { emailId: string; password: string };
  };
};

/** Single source of truth: cypress/fixtures/users.json */
export const testData = {
  validCredentials: users.valid_credentials,
  adminCredentials: users.admin_credentials,
  invalidCredentials: {
    invalidEmail: users.invalid_credentials.invalid_email,
    invalidPassword: users.invalid_credentials.invalid_password,
    wrongEmailFormat: users.invalid_credentials.wrong_email_format,
  },
} as const;

export type Credentials = {
  emailId: string;
  password: string;
};
