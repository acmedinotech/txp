import {
	BlockHandlerState,
	FormattedLineContext,
	LineContext,
} from 'txp/types.mts';
import { AbstractBlockHandler } from './AbstractBlockHandler.mts';

export class CodeHandler extends AbstractBlockHandler {
	_id = 'markdown.block.code';
	type = 1; // 1: backtick, 2: indent
	state = 0; // 0: nothing, 1: in code
	lang = '';

	canHandle({ line, lineNum }: LineContext) {
		if (line.match(/^(```|    |\t\t)/)) {
			return BlockHandlerState.ACCEPT;
		}
		return BlockHandlerState.REJECT;
	}

	processLine({ line, lineNum, makeInlineHandler }: LineContext) {
		const prefix = line.substring(0, 4);

		if (this.state === 0) {
			if (prefix.startsWith('    ')) {
				this._lines.push(line.substring(4));
				this.type = 2;
			} else if (prefix.startsWith('\t\t')) {
				this._lines.push(line.substring(2));
				this.type = 2;
			} else {
				this.lang = line.substring(3);
			}
			this.state = 1;
			return {
				nextState: BlockHandlerState.ACCEPT,
			};
		}

		if (this.type === 2) {
			if (prefix.startsWith('    ')) {
				this._lines.push(line.substring(4));
			} else if (prefix.startsWith('\t\t')) {
				this._lines.push(line.substring(2));
			} else {
				return {
					nextState: BlockHandlerState.REJECT,
				};
			}
		} else {
			// todo: make ===?
			if (line.startsWith('```')) {
				return {
					nextState: BlockHandlerState.COMPLETE,
				};
			}
			this._lines.push(line);
		}

		return {
			nextState: BlockHandlerState.ACCEPT,
		};
	}

	flushGetFormattedLines(): FormattedLineContext {
		const ret = [
			`<pre><code class='language-${this.lang || 'text'}'>` +
				this._lines
					.join('\n')
					.replace(/</g, '&lt;')
					.replace(/>/g, '&gt;') +
				`</code></pre>`,
		];
		this._lines = [];
		this.type = 1;
		this.state = 0;
		this.lang = '';
		return {
			lines: ret,
		};
	}
}
