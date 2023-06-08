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
import { DEFAULT_RETURN_FORMAT } from 'web3-types';
import { Web3PromiEvent } from 'web3-core';
import { SupportedProviders, TransactionReceipt } from 'web3-types';
import { TransactionBlockTimeoutError } from 'web3-errors';
// eslint-disable-next-line import/no-extraneous-dependencies
import { Web3 } from 'web3';
import { Web3Account } from 'web3-eth-accounts';
import { SendTransactionEvents } from '../../src';

import {
	closeOpenConnection,
	getSystemTestProvider,
	isSocket,
	itIf,
	waitForOpenConnection,
	createLocalAccount,
	sendFewSampleTxs,
} from '../fixtures/system_test_utils';

const MAX_32_SIGNED_INTEGER = 2147483647;
const gas = 21000;
/* eslint-disable jest/no-standalone-expect */
describe('defaults', () => {
	let web3: Web3;
	let clientUrl: string | SupportedProviders;
	let account1: Web3Account;
	let account2: Web3Account;

	beforeEach(() => {
		clientUrl = getSystemTestProvider();
		web3 = new Web3(clientUrl);
		// Make the test run faster by casing the polling to start after 2 blocks
		web3.eth.transactionBlockTimeout = 2;

		// Increase other timeouts so only `transactionBlockTimeout` would be reached
		web3.eth.transactionSendTimeout = MAX_32_SIGNED_INTEGER;
		web3.eth.transactionPollingTimeout = MAX_32_SIGNED_INTEGER;
		web3.eth.blockHeaderTimeout = MAX_32_SIGNED_INTEGER / 1000;
	});

	afterEach(async () => {
		web3.eth.transactionBlockTimeout = 50;
		await closeOpenConnection(web3.eth);
	});

	describe('defaults', () => {
		it('should fail if transaction was not mined within `transactionBlockTimeout` blocks', async () => {
			account1 = await createLocalAccount(web3);
			account2 = await createLocalAccount(web3);
			// Setting a high `nonce` when sending a transaction, to cause the RPC call to stuck at the Node
			const sentTx: Web3PromiEvent<
				TransactionReceipt,
				SendTransactionEvents<typeof DEFAULT_RETURN_FORMAT>
			> = web3.eth.sendTransaction({
				from: account1.address,
				to: account2.address,
				gas,
				value: '0x1',
				// Give a high nonce so the transaction stuck forever.
				// However, make this random to be able to run the test many times without receiving an error that indicate submitting the same transaction twice.
				nonce: Number.MAX_SAFE_INTEGER,
			});

			// Some providers (mostly used for development) will make blocks only when there are new transactions
			// So, send 2 transactions, one after another, because in this test `transactionBlockTimeout = 2`.
			// eslint-disable-next-line no-void
			await sendFewSampleTxs(2);

			try {
				await sentTx;
				throw new Error(
					'The test should fail if there is no exception when sending a transaction that could not be mined within transactionBlockTimeout',
				);
			} catch (error) {
				// eslint-disable-next-line jest/no-conditional-expect
				expect(error).toBeInstanceOf(TransactionBlockTimeoutError);
				// eslint-disable-next-line jest/no-conditional-expect
				expect((error as Error).message).toMatch(/was not mined within [0-9]+ blocks/);
			}
			await closeOpenConnection(web3.eth);
		});

		// The code of this test case is identical to the pervious one except for `eth.enableExperimentalFeatures = true`
		// TODO: And this test case will be removed once https://github.com/web3/web3.js/issues/5521 is implemented.
		itIf(isSocket)(
			'should fail if transaction was not mined within `transactionBlockTimeout` blocks - when subscription is used',
			async () => {
				account1 = await createLocalAccount(web3);
				account2 = await createLocalAccount(web3);
				await waitForOpenConnection(web3.eth);
				// using subscription to get the new blocks and fire `TransactionBlockTimeoutError` is currently supported only
				//	with `enableExperimentalFeatures.useSubscriptionWhenCheckingBlockTimeout` equal true.
				web3.eth.enableExperimentalFeatures.useSubscriptionWhenCheckingBlockTimeout = true;

				// Setting a high `nonce` when sending a transaction, to cause the RPC call to stuck at the Node
				const sentTx: Web3PromiEvent<
					TransactionReceipt,
					SendTransactionEvents<typeof DEFAULT_RETURN_FORMAT>
				> = web3.eth.sendTransaction({
					from: account1.address,
					to: account2.address,
					gas,
					value: '0x1',
					type: '0x1',
					// Give a high nonce so the transaction stuck forever.
					// However, make this random to be able to run the test many times without receiving an error that indicate submitting the same transaction twice.
					nonce: Number.MAX_SAFE_INTEGER,
				});

				// Some providers (mostly used for development) will make blocks only when there are new transactions
				// So, send 2 transactions, one after another, because in this test `transactionBlockTimeout = 2`.
				// eslint-disable-next-line no-void, @typescript-eslint/no-unsafe-call
				void sendFewSampleTxs(2);

				await expect(sentTx).rejects.toThrow(/was not mined within [0-9]+ blocks/);

				await expect(sentTx).rejects.toThrow(TransactionBlockTimeoutError);

				await closeOpenConnection(web3.eth);
			},
		);
	});
});
