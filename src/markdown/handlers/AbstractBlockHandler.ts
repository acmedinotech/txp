import {
	BlockHandler,
	BlockHandlerState,
	FormattedLineContext,
	InlineHandler,
	LineContext,
	ProcessResult,
} from 'txp/types';
import { MarkdownDefaultInlineHandler } from '../inlineHandlers/index';

export class AbstractBlockHandler implements BlockHandler {
	readonly _id: string;
	inline: InlineHandler;
	meta: any = {};
	_lines: string[] = [];

	constructor() {
		this.inline = new MarkdownDefaultInlineHandler();
		this._id = this + '';
	}

	id() {
		return this._id;
	}

	canHandle(ctx: LineContext): BlockHandlerState {
		throw new Error('Method not implemented.');
	}

	processLine(ctx: LineContext): ProcessResult {
		throw new Error('Method not implemented.');
	}

	flushGetFormattedLines(): FormattedLineContext {
		throw new Error('Method not implemented.');
	}

	makeAccept(): ProcessResult {
		return {
			nextState: BlockHandlerState.ACCEPT,
		};
	}

	makeComplete(): ProcessResult {
		return {
			nextState: BlockHandlerState.COMPLETE,
		};
	}

	makeReject(): ProcessResult {
		return {
			nextState: BlockHandlerState.REJECT,
		};
	}
}
