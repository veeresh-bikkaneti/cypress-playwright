# TypeScript for Cypress: A Beginner's Progressive Guide

This guide is designed to teach you **just enough** TypeScript to be effective with Cypress automation. You don't need to be a TypeScript expert to write great tests!

## 1. The Basics: Types

TypeScript adds "types" to JavaScript variables. This helps catch errors *before* you run your code.

### 1.1. Primitive Types
The most common types you'll use are `string`, `number`, and `boolean`.

```typescript
// Explicitly typing variables
let username: string = 'testuser';
let retryCount: number = 3;
let isAdmin: boolean = true;

// TypeScript can also "infer" types automatically
let url = 'https://google.com'; // TypeScript knows this is a string
```

### 1.2. Arrays
Defining lists of items.

```typescript
let validUsers: string[] = ['alice', 'bob', 'charlie'];
let scores: number[] = [95, 82, 70];
```

---

## 2. Arguments & Functions

When writing helper functions, you should define what kind of data the function expects.

```typescript
// A function that logs in a user
function login(username: string, attempts: number) {
  // ... code to login
  console.log(`Logging in as ${username}, attempt ${attempts}`);
}

// Correct usage
login('admin', 1);

// Error! TypeScript will complain:
// login('admin', 'one'); // Argument of type 'string' is not assignable to parameter of type 'number'.
```

### 2.1. Arrow Functions
You'll see these everywhere in Cypress tests (`() => { ... }`).

```typescript
// Standard function
const add = function(a: number, b: number): number {
  return a + b;
};

// Arrow function equivalent
const addArrow = (a: number, b: number): number => {
  return a + b;
};

// In Cypress tests:
describe('Login Feature', () => { // Arrow function
  it('should login successfully', () => { // Arrow function
    cy.visit('/login');
  });
});
```

---

## 3. Interfaces: The Power of Structure

Interfaces are arguably the most useful TypeScript feature for testing. They let you define the "shape" of your data, like API responses or fixture files.

### 3.1. Defining an Interface

```typescript
// Define the shape of a User object
interface User {
  id: number;
  username: string;
  email: string;
  isActive: boolean;
  role?: string; // '?' means this field is optional
}
```

### 3.2. Using Interfaces in Tests

```typescript
// 1. Arrange: Create data that matches the interface
const newUser: User = {
  id: 101,
  username: 'new_hire',
  email: 'hire@company.com',
  isActive: true
  // 'role' is missing, but that's okay because it's optional
};

// 2. Act/Assert: Use it in an API test
it('should create a user', () => {
  cy.request('POST', '/api/users', newUser).then((response) => {
    // We can even type the response body!
    const body = response.body as User;
    expect(body.username).to.eq(newUser.username);
  });
});
```

---

## 4. Cypress Custom Commands with TypeScript

One of the trickiest parts of Cypress + TypeScript is adding custom commands (like `cy.login()`) so TypeScript knows they exist.

### 4.1. The "Declaration Merging" Pattern

In `cypress/support/commands.ts`:

```typescript
// 1. Write the command
Cypress.Commands.add('login', (email: string, password: string) => {
  cy.get('#email').type(email);
  cy.get('#password').type(password);
  cy.get('button[type="submit"]').click();
});

// 2. Tell TypeScript about it
declare global {
  namespace Cypress {
    interface Chainable {
      /**
       * Custom command to login via UI
       * @example cy.login('user@test.com', 'password123')
       */
      login(email: string, password: string): Chainable<void>;
    }
  }
}
```

### 4.2. Using it in tests
Now, when you type `cy.`, VS Code will suggest `.login()` and show you that it needs an email and password!

```typescript
cy.login('admin@test.com', '123456'); // ✅ Valid
// cy.login('admin@test.com'); // ❌ Error: Expected 2 arguments, but got 1.
```

---

## 5. Summary Checklist

- [ ] use `let` and `const` (mostly `const`).
- [ ] Use **Interfaces** for your API payloads and responses.
- [ ] Use **Arrow Functions** (`() => {}`) for `describe`, `it`, and callbacks.
- [ ] Don't be afraid of the `any` type when you are stuck, but try to avoid it.
- [ ] Use VS Code's IntelliSense—if it suggests strict types, listen to it!

Happy Coding! 🚀
