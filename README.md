# TextExpress (txp)

TextExpress (txp) is a little framework for building custom text processors (such as Markdown to HTML).

A processor is made up of a parser and multiple `BlockHandler`s. The parser typically processes line-by-line and will do the following on each line:

- find a handler that accepts the beginning of the line
- if no eligible handler found, throw error
- otherwise, process line
  - handler can consume entire line. if it will process the next line potentially, it returns `accept`, otherwise, it returns `complete`
- if handler returned `accept`, on the next line, it can then either `reject` (resulting in looking up a handler), `accept`, or `complete`

This process repeats until all the lines are consumed without error.
