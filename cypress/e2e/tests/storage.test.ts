/**
 * STORAGE TESTING - Cookies, localStorage & sessionStorage
 *
 * Cypress-only jar round-trips stay (they prove cy.setCookie/getCookie).
 * Dashboard visits use a real login token, never a mock JWT.
 * Assertion-less visits are gone.
 */

describe("Storage Testing - Cookies & Local Storage", () => {
  describe("Cookie Management", () => {
    beforeEach(() => {
      cy.clearCookies();
      cy.visit("/");
    });

    it("should set a cookie", () => {
      cy.setCookie("testCookie", "testValue");
      cy.getCookie("testCookie").then((cookie) => {
        expect(cookie).to.not.be.null;
        expect(cookie.value).to.equal("testValue");
      });
    });

    it("should set cookie with options", () => {
      cy.setCookie("secureCookie", "secureValue", {
        path: "/",
        httpOnly: true,
        expiry: Math.floor(Date.now() / 1000) + 3600,
      });
      cy.getCookie("secureCookie").should((cookie) => {
        expect(cookie).to.exist;
        expect(cookie.httpOnly).to.eq(true);
        expect(cookie.path).to.eq("/");
      });
    });

    it("should get all cookies", () => {
      cy.setCookie("cookie1", "value1");
      cy.setCookie("cookie2", "value2");
      cy.setCookie("cookie3", "value3");
      cy.getCookies().then((cookies) => {
        expect(cookies).to.have.length(3);
        const names = cookies.map((c) => c.name);
        expect(names).to.include("cookie1");
        expect(names).to.include("cookie2");
        expect(names).to.include("cookie3");
      });
    });

    it("should clear a specific cookie", () => {
      cy.setCookie("cookieToDelete", "value");
      cy.setCookie("cookieToKeep", "value");
      cy.clearCookie("cookieToDelete");
      cy.getCookie("cookieToDelete").should("be.null");
      cy.getCookie("cookieToKeep").should("exist");
    });

    it("should clear all cookies", () => {
      cy.setCookie("cookie1", "value1");
      cy.setCookie("cookie2", "value2");
      cy.clearCookies();
      cy.getCookies().should("have.length", 0);
    });

    it("should verify cookie set by server", () => {
      cy.request({
        method: "POST",
        url: "/api/auth/login",
        body: { email: "test@example.com", password: "password123" },
      });
      cy.getCookie("authToken").should((cookie) => {
        expect(cookie).to.exist;
        expect(cookie.httpOnly).to.eq(true);
      });
      cy.request("GET", "/api/auth/me").its("status").should("eq", 200);
    });

    it("cy.getAllCookies() returns cookies set on this origin", () => {
      cy.setCookie("allCookie", "v");
      cy.getAllCookies().should((cookies) => {
        expect(cookies.map((c) => c.name)).to.include("allCookie");
      });
    });

    it("cy.clearAllCookies() removes every cookie", () => {
      cy.setCookie("a", "1");
      cy.setCookie("b", "2");
      cy.clearAllCookies();
      cy.getAllCookies().should("have.length", 0);
    });

    it("should assert on cookie properties", () => {
      cy.setCookie("propCookie", "propValue", {
        path: "/",
        httpOnly: false,
        secure: false,
      });
      cy.getCookie("propCookie").should((cookie) => {
        expect(cookie.name).to.equal("propCookie");
        expect(cookie.value).to.equal("propValue");
        expect(cookie.path).to.equal("/");
        expect(cookie.httpOnly).to.equal(false);
      });
    });
  });

  describe("localStorage Management", () => {
    beforeEach(() => {
      cy.request("POST", "/api/auth/login", {
        email: "test@example.com",
        password: "password123",
      }).then((res) => {
        cy.visit("/dashboard", {
          onBeforeLoad(win) {
            win.localStorage.setItem("authToken", res.body.token);
            win.localStorage.setItem("user", JSON.stringify(res.body.user));
          },
        });
      });
      cy.getByTestId("page-title").should("contain", "Dashboard");
    });

    it("should set localStorage item", () => {
      cy.window().then((win) => {
        win.localStorage.setItem("testKey", "testValue");
      });
      cy.window()
        .its("localStorage")
        .invoke("getItem", "testKey")
        .should("equal", "testValue");
    });

    it("should store complex object in localStorage", () => {
      const userData = {
        id: 1,
        name: "Test User",
        preferences: { theme: "dark", lang: "en" },
      };
      cy.window().then((win) => {
        win.localStorage.setItem("userData", JSON.stringify(userData));
      });
      cy.window().then((win) => {
        const stored = JSON.parse(win.localStorage.getItem("userData"));
        expect(stored).to.deep.equal(userData);
      });
    });

    it("should clear specific localStorage key", () => {
      cy.window().then((win) => {
        win.localStorage.setItem("toDelete", "value");
        win.localStorage.setItem("toKeep", "value");
      });
      cy.clearLocalStorage("toDelete");
      cy.window().then((win) => {
        expect(win.localStorage.getItem("toDelete")).to.be.null;
        expect(win.localStorage.getItem("toKeep")).to.equal("value");
      });
    });

    it("should clear localStorage matching pattern", () => {
      cy.window().then((win) => {
        win.localStorage.setItem("prefix_item1", "value1");
        win.localStorage.setItem("prefix_item2", "value2");
        win.localStorage.setItem("other_item", "value3");
      });
      cy.clearLocalStorage(/^prefix_/);
      cy.window().then((win) => {
        expect(win.localStorage.getItem("prefix_item1")).to.be.null;
        expect(win.localStorage.getItem("prefix_item2")).to.be.null;
        expect(win.localStorage.getItem("other_item")).to.equal("value3");
      });
    });

    it("should use UI buttons to set localStorage", () => {
      cy.getByTestId("set-storage-btn").click();
      cy.window().then((win) => {
        expect(win.localStorage.getItem("testKey")).to.equal(
          "cypress-test-value",
        );
      });
      cy.getByTestId("storage-result").should("contain", "localStorage set");
    });

    it("should clear localStorage via UI", () => {
      cy.window().then((win) => {
        win.localStorage.setItem("testItem", "testValue");
      });
      cy.getByTestId("clear-storage-btn").click();
      cy.getByTestId("storage-result").should("contain", "cleared");
    });

    it("should clear authentication on logout", () => {
      cy.getByTestId("user-email").should("contain", "test@example.com");
      cy.getByTestId("logout-link").click();
      cy.url().should("include", "/login");
      cy.window().then((win) => {
        expect(win.localStorage.getItem("authToken")).to.eq(null);
        expect(win.sessionStorage.getItem("authToken")).to.eq(null);
      });
    });
  });

  describe("sessionStorage Management", () => {
    beforeEach(() => {
      cy.visit("/");
    });

    it("should set sessionStorage item", () => {
      cy.window().then((win) => {
        win.sessionStorage.setItem("sessionKey", "sessionValue");
      });
      cy.window()
        .its("sessionStorage")
        .invoke("getItem", "sessionKey")
        .should("equal", "sessionValue");
    });

    it("should clear all sessionStorage", () => {
      cy.window().then((win) => {
        win.sessionStorage.setItem("key1", "value1");
        win.sessionStorage.setItem("key2", "value2");
      });
      cy.clearAllSessionStorage();
      cy.window().then((win) => {
        expect(win.sessionStorage.length).to.equal(0);
      });
    });
  });

  describe("Cypress 12 getAll storage", () => {
    it("cy.getAllLocalStorage() then cy.clearAllLocalStorage()", () => {
      cy.visit("/");
      cy.window().then((win) => win.localStorage.setItem("k", "v"));
      cy.getAllLocalStorage().should((map) => {
        const bags = Object.values(map);
        expect(bags.some((bag) => bag && bag.k === "v")).to.eq(true);
      });
      cy.clearAllLocalStorage();
      cy.getAllLocalStorage().should((map) => {
        Object.values(map).forEach((bag) => {
          expect(bag).to.not.have.property("k");
        });
      });
    });

    it("cy.getAllSessionStorage() round-trips a key", () => {
      cy.visit("/");
      cy.window().then((win) => win.sessionStorage.setItem("s", "1"));
      cy.getAllSessionStorage().should((map) => {
        const bags = Object.values(map);
        expect(bags.some((bag) => bag && bag.s === "1")).to.eq(true);
      });
    });
  });

  describe("Storage isolation", () => {
    it("should demonstrate storage isolation", () => {
      cy.clearCookies();
      cy.clearLocalStorage();
      cy.clearAllSessionStorage();
      cy.visit("/");
      cy.getCookies().should("have.length", 0);
      cy.window().then((win) => {
        expect(win.localStorage.getItem("authToken")).to.eq(null);
      });
    });

    it("should assert localStorage values", () => {
      cy.visit("/");
      cy.window().then((win) => {
        win.localStorage.setItem("count", "42");
      });
      cy.window()
        .its("localStorage")
        .invoke("getItem", "count")
        .should("equal", "42");
    });
  });
});
