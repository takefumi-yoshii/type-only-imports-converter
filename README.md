# type-only-imports-converter

This is Migration tool for new "Type-only" import clause (v3.8).
By rearrange TypeScript AST Node, it take a new SRC code.

### Input
```typescript
import type { TypeAlias } from './a'
import { Interface } from './b'
import { TypeAlias as TYPEALIAS, Const } from './a'
import { Let, Interface as INTERFACE } from './b'
```

Type definitions are rewritten into "Type-only" import clauses,
Classified as not affect runtime.

### Output
```typescript
import { Const } from './a';
import { Let } from './b';
import type { TypeAlias, TypeAlias as TYPEALIAS } from './a';
import type { Interface, Interface as INTERFACE } from './b';
```

# Try it.

`lib` is the directory of the tool.
Perform the conversion of `app/src`.

```
＄ cd lib
$ yarn install
$ yarn dev
```

The converted SRC code is output to `app / dist`.
