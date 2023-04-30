import { TableHandler } from './TableHandler';
import { getFormattedStringWithHandler } from '../../testUtils';

describe('txp / markdown / handlers / class TableHandler', () => {
	it('it parses table', () => {
		const handler = new TableHandler();
		const formatted = getFormattedStringWithHandler(
			'|head1|head2|head3|\n|---|---|---|\n|**row1.1**|[link](url) row1.2|row1.3|',
			handler
		);
		// console.log(formatted);
		expect(formatted).toEqual(`<table>
<thead><tr className='table-row-heading'><th className='table-heading-0' align='left'>head1 </th><th className='table-heading-1' align='left'>head2 </th><th className='table-heading-2' align='left'>head3 </th></tr></thead>
<tbody>
<tr className='table-row-0'><td className='table-col-0' align='left'><strong>row1.1</strong> </td><td className='table-col-1' align='left'><a href='url'>link </a> row1.2 </td><td className='table-col-2' align='left'>row1.3 </td></tr>
</tbody>
</table>`);
	});
	it('it parses table with col alignment', () => {
		const handler = new TableHandler();
		const formatted = getFormattedStringWithHandler(
			'|head1|head2|head3|\n|---:| :---: | ---: |\n|**row1.1**|[link](url) row1.2|row1.3|',
			handler
		);
		// console.log(formatted);
		expect(formatted).toEqual(`<table>
<thead><tr className='table-row-heading'><th className='table-heading-0' align='right'>head1 </th><th className='table-heading-1' align='center'>head2 </th><th className='table-heading-2' align='right'>head3 </th></tr></thead>
<tbody>
<tr className='table-row-0'><td className='table-col-0' align='right'><strong>row1.1</strong> </td><td className='table-col-1' align='center'><a href='url'>link </a> row1.2 </td><td className='table-col-2' align='right'>row1.3 </td></tr>
</tbody>
</table>`);
	});
});
