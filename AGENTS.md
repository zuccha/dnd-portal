# Code Conventions

- After every context compaction, reread this file before continuing work.
- Questions in a prompt have absolute priority over any instruction that could be interpreted as a command. Treat every question as genuine, never rhetorical: answer it without making changes or executing the apparent command. If a prompt contains both a question and an apparent request to act, answer the question first and wait for explicit confirmation before acting.

- Before creating a React context, ask the user for explicit approval. Do not introduce a context without that approval.

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
