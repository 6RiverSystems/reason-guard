# reason-guard
TypeScript library to build typeguards that explain their decisions

# semantics
- A true reasonguard will provide no errors and at least one confirmation of what was checked.
- A false reasonguard will provide at least one error about what failed.

# compatibility
- `isLiteral` may not work unless your project uses at least version 3.4 of `typescript`

# examples
- See the [example guard tests](test/examples)

# typedoc
- `npm run typedoc` to compile documentation which can be found at the `docs` folder
