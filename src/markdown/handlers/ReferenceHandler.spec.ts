import { ReferenceHandler, REFERENCE_HANDLER_ID } from './ReferenceHandler';
import { parseStringWithHandler } from '../../testUtils';
import { REFERENCE_MAP_KEY } from 'txp/types';

describe('txp / markdown / handlers / class ReferenceHandler', () => {
	it('it parses and returns references as metadata', () => {
		const handler = new ReferenceHandler();
		const parsed = parseStringWithHandler(
			'[a]: <link1>\n[b]: <link2> "title"\n[c] <malformed>',
			handler
		);
		expect(
			parsed.flushGetFormattedLines().metadata[REFERENCE_MAP_KEY]
		).toEqual({
			a: { url: 'link1', title: undefined },
			b: { url: 'link2', title: 'title' },
		});
	});
});
