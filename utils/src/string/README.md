# String Utilities

String helpers from `@core/utils`. Import the `string` namespace and call the functions below.

## Usage

```ts
import { string } from '@core/utils';
```

## API

### replacePlaceholder

Replaces `{key}` placeholders in a template with values from an object.

```ts
string.replacePlaceholder('Hello {name}', { name: 'World' });
// 'Hello World'

string.replacePlaceholder('Hi {firstName} {lastName}', {
  firstName: 'Jane',
  lastName: 'Doe',
});
// 'Hi Jane Doe'
```

Placeholders that are missing in the data object are left unchanged.

---

### isEmail

Returns whether the input is a valid email-style string (non-empty, contains `@` and a dot in the domain part).

```ts
string.isEmail('user@example.com');  // true
string.isEmail('invalid');           // false
string.isEmail('');                  // false
```

---

### isPhoneNumber

Returns whether the input is a valid international phone number (E.164-style): 10–15 digits, with optional `+` and common formatting (spaces, hyphens, parentheses, dots).

```ts
string.isPhoneNumber('+1 555 123 4567');   // true
string.isPhoneNumber('+44 20 7123 4567');  // true
string.isPhoneNumber('(555) 123-4567');    // true
string.isPhoneNumber('invalid');           // false
string.isPhoneNumber('123');               // false (too short)
```
