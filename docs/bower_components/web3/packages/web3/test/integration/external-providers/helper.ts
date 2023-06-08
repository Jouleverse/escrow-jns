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

import { SupportedProviders } from 'web3-types';
import Web3 from '../../../src/index';

/**
 * Performs basic RPC calls (like `eth_accounts`, `eth_blockNumber` and `eth_sendTransaction`)
 * @param provider - an instance of a compatible provider
 */
export async function performBasicRpcCalls(provider: SupportedProviders) {
	const web3 = new Web3(provider);

	const accounts = await web3.eth.getAccounts();
	expect(accounts).toBeDefined();
	expect(accounts.length).toBeGreaterThan(0);

	// get the last block number
	const blockNumber0 = await web3.eth.getBlockNumber();
	expect(typeof blockNumber0).toBe('bigint');

	// send a transaction
	const tx = await web3.eth.sendTransaction({
		to: accounts[1],
		from: accounts[0],
		value: '1',
	});
	expect(tx.status).toBe(BigInt(1));

	const blockNumber1 = await web3.eth.getBlockNumber();
	expect(typeof blockNumber1).toBe('bigint');

	// After sending a transaction, the blocknumber is supposed to be greater than or equal the block number before sending the transaction
	expect(blockNumber1).toBeGreaterThanOrEqual(blockNumber0);
}
