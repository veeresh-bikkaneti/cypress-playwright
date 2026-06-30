# TypeScript Coding Standards

## Language Settings

- TypeScript strict mode enabled
- Node.js v20+ required
- Target: ES2022+

## Type Safety

- All functions must have explicit return types
- No `any` type — use proper types or generics
- All imports must be used
- Use `readonly` for properties that shouldn't change

## Code Quality

- Single responsibility principle
- No duplicated code — extract to helpers
- Meaningful variable and function names
- Comments for complex logic only

## Formatting

- 4 spaces indentation
- Single quotes for strings
- Trailing commas in multi-line structures
- Semicolons required
- Line length: 100 characters max

## File Naming

- Test files: `*.spec.ts` (camelCase describe blocks)
- Page Objects: `*.ts` (PascalCase class names)
- Fixtures: `*.fixture.ts`
- Helpers: `*.ts` (camelCase exports)

## Import Order

1. External packages (`@playwright/test`, etc.)
2. Internal page objects (`../pages/*`)
3. Internal fixtures (`../fixtures/*`)
4. Internal helpers (`../helpers/*`)
