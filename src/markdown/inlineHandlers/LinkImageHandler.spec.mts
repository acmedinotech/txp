import {
	getLinkBracketHandler,
	getLinkImageStateMachine,
} from './LinkImageHandler.mts';
import { feedStateMachine } from '../../testUtils.mts';

describe('txp / markdown / inlineHandler / LinkImageHandler', () => {
	describe('#getLinkImageStateMachine()', () => {
		const linkImage = getLinkImageStateMachine();
		const scenarios = [
			{
				name: 'parses basic link',
				input: '[label](http://link)',
				expected: `<a href='http://link'>label </a>`,
			},
			{
				name: 'parses link with formatted label',
				input: '[`label`](http://link)',
				expected: `<a href='http://link'><code>label</code> </a>`,
			},
			{
				name: 'parse link w/ formatted label & title',
				input: `[**\`label\`**](http://link "title here")`,
				expected: `<a href='http://link' title='title here'><strong><code>label</code></strong> </a>`,
			},
			{
				name: 'parses partial bad link',
				input: '[sz',
				expected: `<a href=''>sz </a>`,
			},
			{
				name: 'parses partial bad link #2',
				input: '[sz](")',
				expected: `<a href=''>sz </a>`,
			},
			{
				name: 'parses basic image',
				input: '![label](http://link)',
				expected: `<img src='http://link' alt='label' />`,
			},
			{
				name: 'parses basic image w/ title (redundant but supported)',
				input: '![label](http://link "title here")',
				expected: `<img src='http://link' alt='title here' />`,
			},
			{
				name: 'parses partial bad image',
				input: '![sz',
				expected: `<img src='' alt='sz' />`,
			},
			{
				name: 'parses linked image',
				input: '[![image label](image-url)](url)',
				expected: `<a href='url'><img src='image-url' alt='image label' /></a>`,
			},
		];

		for (const { name, input, expected } of scenarios) {
			it(`${name} -- ${input}`, () => {
				const buff: string[] = [];
				feedStateMachine(input, buff, linkImage);
				const formatted = buff.join('');
				expect(formatted).toEqual(expected);
			});
		}
	});

	describe('#getLinkBracketHandler()', () => {
		const linkBracket = getLinkBracketHandler();
		const scenarios = [
			{
				name: 'parses <any>',
				input: '<anything "here">',
				expected: `<a href='anything &quot;here&quot;'>anything "here"</a>`,
			},
		];

		for (const { name, input, expected } of scenarios) {
			it(name, () => {
				const buff: string[] = [];
				feedStateMachine(input, buff, linkBracket);
				const formatted = buff.join('');
				expect(formatted).toEqual(expected);
			});
		}
	});
});
