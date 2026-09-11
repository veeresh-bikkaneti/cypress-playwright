import { Page, Locator, expect } from "@playwright/test";

export class LoginPage {
  readonly page: Page;
  readonly loginContainer: Locator;
  readonly emailAddressTxt: Locator;
  readonly passwordTxt: Locator;
  readonly signinBtn: Locator;
  readonly rememberCheckbox: Locator;
  readonly loginAlert: Locator;
  readonly emailError: Locator;
  readonly passwordError: Locator;
  readonly forgotPasswordLink: Locator;
  readonly backToHomeLink: Locator;
  readonly navLoginLink: Locator;

  constructor(page: Page) {
    this.page = page;
    this.loginContainer = page.getByTestId("login-container");
    this.emailAddressTxt = page.getByLabel("Email Address");
    this.passwordTxt = page.getByLabel("Password");
    this.signinBtn = page.getByRole("button", { name: "Sign In" });
    this.rememberCheckbox = page.getByRole("checkbox", { name: "Remember me" });
    this.loginAlert = page.getByRole("alert");
    this.emailError = page.getByText("Please enter a valid email address");
    this.passwordError = page.getByText(
      "Password must be at least 6 characters",
    );
    this.forgotPasswordLink = page.getByRole("link", {
      name: "Forgot Password?",
    });
    this.backToHomeLink = page.getByRole("link", { name: "Back to Home" });
    this.navLoginLink = page.getByRole("link", { name: "Login" });
  }

  async launchApplication() {
    await this.page.goto("/");
  }

  async navigateToLogin() {
    await this.page.goto("/login");
  }

  async login(emailId: string, password: string, rememberMe = false) {
    await this.navigateToLogin();
    await this.emailAddressTxt.fill(emailId);
    await this.passwordTxt.fill(password);
    if (rememberMe) {
      await this.rememberCheckbox.check();
    }
    await this.signinBtn.click();
  }

  async loginFromHome(emailId: string, password: string) {
    await this.launchApplication();
    await this.navLoginLink.click();
    await this.emailAddressTxt.fill(emailId);
    await this.passwordTxt.fill(password);
    await this.signinBtn.click();
  }

  async validateLoginError(errorMessage: string) {
    await expect(this.loginAlert).toBeVisible();
    await expect(this.loginAlert).toContainText(errorMessage);
  }

  async validateEmailError() {
    await expect(this.emailError).toHaveClass(/show/);
  }

  async validatePasswordError() {
    await expect(this.passwordError).toHaveClass(/show/);
  }

  async validateSuccessfulLogin() {
    await expect(this.loginAlert).toContainText("Login successful");
    await expect(this.page).toHaveURL(/.*\/dashboard/);
  }
}
