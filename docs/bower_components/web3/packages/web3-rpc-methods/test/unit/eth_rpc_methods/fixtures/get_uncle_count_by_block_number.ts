/*
This file is part of web3.js.

web3.js is free software: you can redistribute it and/or modify
it under the terms of the GNU Lesser General Public License as published by
the Free Software Foundation, either version 3 of the License, or
(at your option) any later version.

web3.js is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
GNU Lesser General Public License for more details.

You should have received a copy of the GNU Lesser General Public License
along with web3.js.  If not, see <http://www.gnu.org/licenses/>.
*/
import { BlockNumberOrTag, BlockTags } from 'web3-types';

export const mockRpcResponse = '0xb';

/**
 * Array consists of:
 * - Test title
 * - Input parameters:
 *     - blockNumber
 */
type TestData = [string, [BlockNumberOrTag]];
export const testData: TestData[] = [
	// blockNumber = BlockTag
	['blockNumber = BlockTags.LATEST', [BlockTags.LATEST]],
	['blockNumber = BlockTags.EARLIEST', [BlockTags.EARLIEST]],
	['blockNumber = BlockTags.PENDING', [BlockTags.PENDING]],
	['blockNumber = BlockTags.SAFE', [BlockTags.SAFE]],
	['blockNumber = BlockTags.FINALIZED', [BlockTags.FINALIZED]],
	// blockNumber = Numbers
	['blockNumber = "0x4b7"', ['0x4b7']],
];
