import path from "path";

/** Setup project writes this; authenticated specs load it via test.use(). */
export const AUTH_STATE = path.join(__dirname, ".auth/user.json");
