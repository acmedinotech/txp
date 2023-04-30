import {
	BlockHandlerState,
	FormattedLineContext,
	LineContext,
	ProcessResult,
} from 'txp/types.mts';
import { AbstractBlockHandler } from './AbstractBlockHandler.mts';

export class DataHandler extends AbstractBlockHandler {
	_id = 'markdown.block.data';
	canHandle({ line, lineNum }: LineContext): BlockHandlerState {
		return lineNum === 0 && line === '---'
			? BlockHandlerState.ACCEPT
			: BlockHandlerState.REJECT;
	}
	processLine(ctx: LineContext): ProcessResult {
		if (ctx.lineNum > 0 && ctx.line === '---') {
			return {
				nextState: BlockHandlerState.COMPLETE,
			};
		}
		return {
			nextState: BlockHandlerState.ACCEPT,
		};
	}
	flushGetFormattedLines(): FormattedLineContext {
		const metadata = { ...this.meta };
		this.meta = {};
		return {
			lines: [],
			metadata,
		};
	}
}
