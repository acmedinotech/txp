import {
	BlockHandlerState,
	FormattedLineContext,
	LineContext,
} from 'txp/types.mts';
import { AbstractBlockHandler } from './AbstractBlockHandler.mts';

export class HorizontalRuleHandler extends AbstractBlockHandler {
	_id = 'markdown.block.horizontalrule';

	canHandle({ line }: LineContext) {
		if (line.match(/^(\*\*\*+|---+|___+)$/)) {
			return BlockHandlerState.ACCEPT;
		}
		return BlockHandlerState.REJECT;
	}

	processLine(ctx: LineContext) {
		return this.makeComplete();
	}

	flushGetFormattedLines(): FormattedLineContext {
		return {
			lines: ['<hr />'],
		};
	}
}
