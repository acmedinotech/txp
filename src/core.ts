import {
	BlockHandler,
	BlockHandlerState,
	InlineHandler,
	LineContext,
	ParseHandler,
	ProcessResult,
} from './types';
import { convertFmtListToString } from './utils';

export class GenericParseHandler implements ParseHandler {
	defaultHandlers: BlockHandler[] = [];
	metadata: any = {};

	getLastParsedMetadata() {
		return this.metadata;
	}

	addHandlerTop(h: BlockHandler) {
		this.defaultHandlers.unshift(h);
	}

	addHandler(h: BlockHandler) {
		this.defaultHandlers.push(h);
	}

	makeInlineHandler(): InlineHandler {
		throw new Error('makeInlineHandler() not implemented');
	}

	makeParseHandler(): ParseHandler {
		throw new Error('makeParseHandler() not implemented');
	}

	/**
	 *
	 * @param main
	 * @param handlerMeta
	 */
	mergeMetadata(main: any, handlerMeta: any) {
		for (const [handlerId, map] of Object.entries(handlerMeta) as [
			string,
			any
		]) {
			if (!main[handlerId]) {
				main[handlerId] = map;
				continue;
			}

			for (const key in map) {
				main[handlerId][key] = map[key];
			}
		}
	}

	parseString(src: string): string {
		const metadata: any = {};

		let i = 0;
		let lineNum = 0;
		const lines = src.split(/(?:\r\n|\r|\n)/g);
		const buffer: (string | ((meta: any) => string))[] = [];

		let lastHandler: BlockHandler | undefined;

		const flushHandler = (result: ProcessResult) => {
			const formatted = (
				lastHandler as BlockHandler
			).flushGetFormattedLines(metadata);
			if (formatted.metadata) {
				this.mergeMetadata(metadata, formatted.metadata);
			}
			// todo: save formatted.metadata
			buffer.push(...formatted.lines);
			if (result.nextState === BlockHandlerState.REJECT) {
				i--;
			}
			lastHandler = undefined;
		};

		while (i < lines.length) {
			lineNum = i;
			const line = lines[i++];
			let lineCtx: LineContext = {
				line,
				lineNum,
				makeInlineHandler: () => this.makeInlineHandler(),
				makeParseHandler: () => this.makeParseHandler(),
			};

			if (!lastHandler) {
				for (const handler of this.defaultHandlers) {
					if (
						handler.canHandle(lineCtx) === BlockHandlerState.ACCEPT
					) {
						lastHandler = handler;
						break;
					}
				}
			}

			if (!lastHandler) {
				if (line.trim() != '') {
					// todo: only output when log level is warn
					console.warn('WARNING: handler not found for line: ', {
						line,
						lineNum,
					});
				}

				buffer.push(line);

				continue;
			}

			const result = lastHandler.processLine(lineCtx);
			if (
				result.nextState === BlockHandlerState.COMPLETE ||
				result.nextState === BlockHandlerState.REJECT
			) {
				flushHandler(result);
			} else if (result.nextState === BlockHandlerState.BRANCH) {
				// @todo: implement branch
				console.warn('! not implemented: BRANCH');
			}
		}

		if (lastHandler) {
			flushHandler(
				lastHandler.processLine({
					line: '',
					lineNum: lineNum + 1,
					makeInlineHandler: () => this.makeInlineHandler(),
					makeParseHandler: () => this.makeParseHandler(),
				})
			);
		}

		return convertFmtListToString(buffer, metadata);
	}
}
