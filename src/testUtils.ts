import { MarkdownParseHandler } from './markdown/index';
import { MarkdownDefaultInlineHandler } from './markdown/inlineHandlers/index';
import { BlockHandler, InlineStateMachine } from './types';

export const parseStringWithHandler = (
	source: string,
	handler: BlockHandler
) => {
	let lineNum = 0;
	for (const line of source.split(/\n/g)) {
		handler.processLine({
			line,
			lineNum,
			makeInlineHandler: () => new MarkdownDefaultInlineHandler(),
			makeParseHandler: () => new MarkdownParseHandler(),
		});
		lineNum++;
	}
	return handler;
};

export const getFormattedStringWithHandler = (
	source: string,
	handler: BlockHandler
) => {
	return parseStringWithHandler(source, handler)
		.flushGetFormattedLines()
		.lines.join('\n');
};

export const getHandler = (sampleText: string) => {
	const handler = new MarkdownDefaultInlineHandler();
	let lineNum = 0;
	for (const line of sampleText.split(/\n/g)) {
		handler.processLine({
			line,
			lineNum,
			makeInlineHandler: () => undefined as any,
			makeParseHandler: () => new MarkdownParseHandler(),
		});
		lineNum++;
	}
	return handler;
};

/**
 * @todo add checks for other starting tokens of 2+ length (e.g. '``')
 */
export const getInlineTokens = (s: string): string[] => {
	if (s[0] === '!') {
		return ['![', ...s.substring(2).split('')];
	} else {
		return s.split('');
	}
};

export const feedStateMachine = (
	text: string,
	buff: string[],
	machine: InlineStateMachine
) => {
	let i = 0;
	const makeInlineHandler = () => new MarkdownDefaultInlineHandler();
	for (const t of getInlineTokens(text)) {
		const doMore = machine(t, buff, {
			mode: i++ === 0 ? 1 : 2,
			makeInlineHandler,
		});
		if (!doMore) {
			break;
		}
	}
	machine('', buff, { mode: 9, makeInlineHandler });
};
