import {
	BlockHandlerState,
	FormattedLineContext,
	InlineHandler,
	LineContext,
	ParseHandler,
} from 'txp/types.mts';
import { AbstractBlockHandler } from './AbstractBlockHandler.mts';

export const REGEX_MATCH_EITHER = /^(\s*)([*+-]|\d+\.)(\s+)(.*)/;

export class ListHandler extends AbstractBlockHandler {
	_id = 'markdown.block.list';
	state = 0;
	type = 1;
	depth = -1;
	types: number[] = [];
	indents: string[] = [];
	lineBuff = '';
	makeParseHandler: () => ParseHandler = undefined as any;

	canHandle({ line, lineNum }: LineContext) {
		if (line.match(REGEX_MATCH_EITHER)) {
			return BlockHandlerState.ACCEPT;
		}

		return BlockHandlerState.REJECT;
	}

	_pushLineBuff() {
		if (this.lineBuff.trim() != '') {
			const parser = this.makeParseHandler();
			const formatted = parser.parseString(this.lineBuff);
			const indent = this.depth > -1 ? '  '.repeat(this.depth) : '';
			this._lines.push(`${indent}<li>${formatted}</li>`);
		}

		this.lineBuff = '';
	}

	_openList() {
		const indent = this.depth > -1 ? '  '.repeat(this.depth) : '';
		this._lines.push(
			`${indent}<${this.types[this.depth] === 1 ? 'ul' : 'ol'}>`
		);
	}

	_closeList() {
		const indent = this.depth > -1 ? '  '.repeat(this.depth) : '';
		this._lines.push(
			`${indent}</${this.types[this.depth] === 1 ? 'ul' : 'ol'}>`
		);
	}

	_pushLevel(itemtype: string, indent: string) {
		this.types.push(itemtype.length === 1 ? 1 : 2);
		this.indents.push(indent);
		this.depth++;
		this._openList();
	}

	_popLevel() {
		this._pushLineBuff();
		this._closeList();
		this.types.pop();
		this.indents.pop();
		this.depth--;
	}

	processLine({
		line,
		lineNum,
		makeInlineHandler,
		makeParseHandler,
	}: LineContext) {
		/* steps:
		- detect indent level (indent + itemtype + windent)
		- if level == 0, set indent and open list
		- else if indent > previous
		  - push new indent level and open embedded list
		- else if indent < previous
		  - close list and pop indent level
		*/
		const [_matched, indent = '', itemtype = '', windent = '', text = ''] =
			line.match(REGEX_MATCH_EITHER) ?? [];

		// match continuations by initial indent + space-as-marker-length + indent-after-mark
		const eindent = indent + ' '.repeat(itemtype.length) + windent;

		// we assume state == 0 immediately proceeds after canProcess()
		if (this.state === 0) {
			this.makeParseHandler = makeParseHandler;
			this._pushLevel(itemtype, eindent);
			this.state = 1;
			this.lineBuff = text;
			return this.makeAccept();
		}

		if (!_matched) {
			return this._pushIfContinuation(line);
		}

		// for now, we'll assume that pure indent length is good enough to determine next
		// list item level
		const lastIndent = this.indents[this.depth];
		if (eindent.length > lastIndent.length) {
			this._pushLineBuff();
			this._pushLevel(itemtype, eindent);
		} else if (eindent.length < lastIndent.length) {
			this._popLevel();
		} else {
			this._pushLineBuff();
		}

		// todo: handle switch in type?
		this.lineBuff += text;

		return this.makeAccept();
	}

	private _pushIfContinuation(line: string) {
		const indent = this.indents[this.depth];
		const [, wspace] = line.match(/^(\s+).*/) ?? [];

		if (!wspace || !wspace.startsWith(indent)) {
			// list is done!
			while (this.depth > -1) {
				this._popLevel();
			}
			return this.makeReject();
		}

		this.lineBuff += '\n' + line.substring(indent.length);
		return this.makeAccept();
	}

	flushGetFormattedLines(): FormattedLineContext {
		if (this.lineBuff != '') {
			this._pushLineBuff();
		}
		while (this.depth > -1) {
			this._popLevel();
		}

		const lines = this._lines;

		this.state = 0;
		this.depth = -1;
		this.types = [];
		this.indents = [];
		this._lines = [];
		this.lineBuff = '';

		return {
			lines,
		};
	}
}
