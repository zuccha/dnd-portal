# Code Conventions

- Add a section separator before every top-level type, function, or exported variable declaration, using this format:

  ```ts
  //------------------------------------------------------------------------------
  // Descriptive Name
  //------------------------------------------------------------------------------
  ```

- When an object literal has sibling properties where one value is formatted across multiple lines, format all sibling properties with object values across multiple lines for consistency.

- Order properties within object literals alphabetically.

- When returning a localized resource by extending `localizeResource(...)`, place properties from the shared localized resource immediately after the spread, then add a blank line before resource-specific properties.

- Ensure fallback and default values satisfy their runtime schemas, even when TypeScript accepts a value that does not.
