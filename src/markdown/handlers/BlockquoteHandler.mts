import {
	BlockHandlerState,
	FormattedLineContext,
	LineContext,
	ParseHandler,
} from 'txp/types.mts';
import { AbstractBlockHandler } from './AbstractBlockHandler.mts';

export class BlockquoteHandler extends AbstractBlockHandler {
	_id = 'markdown.block.blockquote';
	state = 0; // 0: nothing, 1: in code
	parseHandler: ParseHandler = undefined as any;

	canHandle({ line, lineNum }: LineContext) {
		if (line.match(/^\s*>/)) {
			return BlockHandlerState.ACCEPT;
		}
		return BlockHandlerState.REJECT;
	}

	processLine({ line, lineNum, makeParseHandler }: LineContext) {
		const [, bracket, rest] = line.split(/^\s*(>)(.*)/);

		if (this.state === 0) {
			this.state = 1;
			this.parseHandler = makeParseHandler();
		} else if (bracket != '>') {
			return this.makeReject();
		}

		this._lines.push(rest);
		return this.makeAccept();
	}

	flushGetFormattedLines(): FormattedLineContext {
		const ret = [
			`<blockquote>`,
			this.parseHandler.parseString(this._lines.join('\n')),
			`</blockquote>`,
		];
		this._lines = [];
		this.state = 0;
		this.parseHandler = undefined as any;
		return {
			lines: ret,
		};
	}
}
