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
import WebSocketProvider from 'web3-providers-ws';
// eslint-disable-next-line import/no-extraneous-dependencies
import { Contract, decodeEventABI } from 'web3-eth-contract';
import { AbiEventFragment, Web3BaseProvider } from 'web3-types';
import { numberToHex } from 'web3-utils';
// eslint-disable-next-line import/no-extraneous-dependencies
import { IpcProvider } from 'web3-providers-ipc';
import { Web3Eth } from '../../src';
import { LogsSubscription } from '../../src/web3_subscriptions';
import {
	closeOpenConnection,
	createTempAccount,
	describeIf,
	getSystemTestProviderUrl,
	isSocket,
	isWs,
} from '../fixtures/system_test_utils';
import { BasicAbi, BasicBytecode } from '../shared_fixtures/build/Basic';
import { eventAbi, Resolve } from './helper';

const checkEventCount = 2;

type MakeFewTxToContract = {
	sendOptions: Record<string, unknown>;
	contract: Contract<typeof BasicAbi>;
	testDataString: string;
};
const makeFewTxToContract = async ({
	contract,
	sendOptions,
	testDataString,
}: MakeFewTxToContract): Promise<void> => {
	const prs = [];
	for (let i = 0; i < checkEventCount; i += 1) {
		// eslint-disable-next-line no-await-in-loop
		prs.push(await contract.methods?.firesStringEvent(testDataString).send(sendOptions));
	}
};
describeIf(isSocket)('subscription', () => {
	let clientUrl: string;
	let providerWs: WebSocketProvider | IpcProvider;
	let contract: Contract<typeof BasicAbi>;
	const testDataString = 'someTestString';

	beforeAll(() => {
		clientUrl = getSystemTestProviderUrl();
		providerWs = isWs ? new WebSocketProvider(clientUrl) : new IpcProvider(clientUrl);
		contract = new Contract(BasicAbi, undefined, {
			provider: providerWs,
		});
	});
	afterAll(async () => {
		providerWs.disconnect();
		await closeOpenConnection(contract);
	});

	describe('logs', () => {
		it(`wait for ${checkEventCount} logs with from block`, async () => {
			const tempAcc = await createTempAccount();
			const from = tempAcc.address;
			const deployOptions: Record<string, unknown> = {
				data: BasicBytecode,
				arguments: [10, 'string init value'],
			};

			const sendOptions = { from, gas: '1000000' };
			const contractDeployed = await contract.deploy(deployOptions).send(sendOptions);
			const web3Eth = new Web3Eth(providerWs as Web3BaseProvider);
			const fromBlock = await web3Eth.getTransactionCount(
				String(contractDeployed.options.address),
			);

			await makeFewTxToContract({ contract: contractDeployed, sendOptions, testDataString });

			const sub: LogsSubscription = await web3Eth.subscribe('logs', {
				fromBlock: numberToHex(fromBlock),
				address: contractDeployed.options.address,
			});

			let count = 0;

			const pr = new Promise((resolve: Resolve) => {
				sub.on('data', (data: any) => {
					count += 1;
					const decodedData = decodeEventABI(
						eventAbi as AbiEventFragment & { signature: string },
						data,
						[],
					);
					expect(decodedData.returnValues['0']).toBe(testDataString);
					if (count >= checkEventCount) {
						resolve();
					}
				});
			});

			await pr;
			await web3Eth.clearSubscriptions();
		});
	});
});
