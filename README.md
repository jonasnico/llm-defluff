# llm-defluff

Strip filler preambles and closers from LLM responses. Streaming support included.

Every LLM loves to open with *"Great question!"* and close with *"Let me know if you need anything else!"*. This library removes that fluff.

## Install

```bash
npm install llm-defluff
```

## Usage

### One-shot

```ts
import { defluff } from 'llm-defluff'

defluff("Great question! The answer is 42.")
// → "The answer is 42."

defluff("The answer is 42. Let me know if you need help!", { closers: true })
// → "The answer is 42."

defluff("Sure! I'd be happy to help! The capital of France is Paris. Feel free to ask more!", {
  openers: true,
  closers: true,
})
// → "The capital of France is Paris."
```

### Streaming

The streaming API buffers only the opening sentences, resolves whether they're filler, then passes everything else through with zero overhead.

```ts
import { createStripper } from 'llm-defluff'

const stripper = createStripper()

for await (const chunk of stream) {
  const out = stripper.push(chunk)
  if (out) process.stdout.write(out)
}

// Flush any remaining buffered content when the stream ends
const remaining = stripper.flush()
if (remaining) process.stdout.write(remaining)
```

## API

### `defluff(input, options?)`

Strip filler from a complete response string.

| Option | Type | Default | Description |
|---|---|---|---|
| `openers` | `boolean` | `true` | Strip filler from the start |
| `closers` | `boolean` | `false` | Strip filler from the end (one-shot only) |
| `threshold` | `number` | `0.8` | Confidence required to strip (0–1) |

### `createStripper(options?)`

Create a streaming defluffer. Returns an object with:

- **`push(chunk)`** — Feed a chunk. Returns content to emit, or `null` if still buffering.
- **`flush()`** — Call when the stream ends. Returns any remaining buffered content.
- **`getState()`** — Current state: `"buffering"` | `"stripping"` | `"passthrough"`

| Option | Type | Default | Description |
|---|---|---|---|
| `threshold` | `number` | `0.8` | Confidence required to strip (0–1) |

## How it works

Instead of maintaining a denylist of phrases, `llm-defluff` uses weighted heuristic scoring:

**Opener signals:** affirmation words, meta-commentary ("here's what", "let me"), short length, no factual content (numbers, named entities), pivot markers (`!`, `—`, `–`, `-`, `:`)

**Closer signals:** offer patterns ("let me know", "feel free"), second-person pronouns, no factual content, question marks

Each signal contributes a weight. If the combined score exceeds the threshold, the sentence is stripped.

The streaming state machine:

```
BUFFERING → STRIPPING → PASSTHROUGH
```

`push()` holds chunks in `BUFFERING` until a complete sentence arrives, then evaluates in `STRIPPING`. Once the opener is resolved (stripped or kept), the state moves to `PASSTHROUGH` and all further chunks flow through directly. `flush()` forces resolution when the stream ends early.

Latency hit is only at the start (1–2 sentences). After that, zero overhead.

## License

MIT
