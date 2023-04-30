import {
	BlockHandlerState,
	FormattedLineContext,
	InlineHandler,
	LineContext,
	ProcessResult,
	InlineStateMachine,
} from 'txp/types';
import {
	getLinkBracketHandler,
	getLinkImageStateMachine,
} from './LinkImageHandler';

export const MARKDOWN_INLINE_TOKENS =
	/(\*\*\*|\*\*|\*|___|__|_|!\[|\[|\]|\s+|\(|\)|``|`|<|>|\\|\{|\}|#|\+|-|\.|\!|[a-zA-Z0-9]+)/;

export const getEscapedCharMachine = (): InlineStateMachine => {
	let _on = false;
	return (t, b, { mode }) => {
		if (mode === 1) {
			_on = true;
		} else if (_on) {
			b.push(t);
			_on = false;
		}

		return _on;
	};
};

const tagmap: Record<string, [string, string] | [InlineStateMachine]> = {
	'\\': [getEscapedCharMachine()],
	'***': ['<em><strong>', '</strong></em>'],
	___: ['<em><strong>', '</strong></em>'],
	'**': ['<strong>', '</strong>'],
	__: ['<strong>', '</strong>'],
	'*': ['<em>', '</em>'],
	_: ['<em>', '</em>'],
	'``': ['<code>', '</code>'], // TODO: need state machine
	'`': ['<code>', '</code>'],
	'[': [getLinkImageStateMachine()],
	'![': [getLinkImageStateMachine()],
	'<': [getLinkBracketHandler()],
};

export class MarkdownDefaultInlineHandler implements InlineHandler {
	chunks: string[] = [];
	tokstate: Record<string, number> = {};
	tokstatesopen = 0;
	ismpos = -1;
	ismstack: InlineStateMachine[] = [];

	processLine(ctx: LineContext): ProcessResult {
		const tokens = ctx.line.split(MARKDOWN_INLINE_TOKENS);
		for (let i = 0; i < tokens.length; i++) {
			const t = tokens[i] ?? '';
			if (t) {
				this.pushToken(t);
			}
		}

		// space instead of newline
		this.chunks.push(' ');

		return { nextState: BlockHandlerState.ACCEPT };
	}

	pushToken(t: string) {
		if (this.ismpos >= 0) {
			if (
				!this.ismstack[this.ismpos](t, this.chunks, {
					mode: 2,
					makeInlineHandler: () => new MarkdownDefaultInlineHandler(),
				})
			) {
				this.ismstack.pop();
				this.ismpos--;
			}
			return;
		}

		const [_open, _close] = tagmap[t] ?? [];
		if (typeof _open === 'string') {
			if (this.tokstate[t]) {
				// OPEN -- time to close
				this.chunks.push(_close as string);
				delete this.tokstate[t];
				this.tokstatesopen--;
			} else {
				// CLOSED -- time to open
				this.chunks.push(_open);
				this.tokstate[t] = 1;
				this.tokstatesopen++;
			}
		} else if (typeof _open === 'function') {
			if (
				_open(t, this.chunks, {
					mode: 1,
					makeInlineHandler: () => new MarkdownDefaultInlineHandler(),
				})
			) {
				this.ismstack.push(_open);
				this.ismpos++;
			}
		} else {
			this.chunks.push(t);
		}
	}

	flushGetFormattedLines(): FormattedLineContext {
		// todo: close out tokstate
		const fmt = { lines: this.chunks };
		this.chunks = [];
		return fmt;
	}

	flushGetString(): string {
		return this.flushGetFormattedLines().lines.join('');
	}
}
