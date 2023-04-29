import {
	BlockHandlerState,
	FormattedLineContext,
	LineContext,
} from '../../types';
import { AbstractBlockHandler } from './AbstractBlockHandler';

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
