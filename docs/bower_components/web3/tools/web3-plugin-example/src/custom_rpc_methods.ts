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
import { Web3PluginBase } from 'web3-core';

import { Web3Context } from './reexported_web3_context';

type CustomRpcApi = {
	custom_rpc_method: () => string;
	custom_rpc_method_with_parameters: (parameter1: string, parameter2: number) => string;
};

export class CustomRpcMethodsPlugin extends Web3PluginBase<CustomRpcApi> {
	public pluginNamespace = 'customRpcMethods';

	public async customRpcMethod() {
		return this.requestManager.send({
			method: 'custom_rpc_method',
			params: [],
		});
	}

	public async customRpcMethodWithParameters(parameter1: string, parameter2: number) {
		return this.requestManager.send({
			method: 'custom_rpc_method_with_parameters',
			params: [parameter1, parameter2],
		});
	}
}

// Module Augmentation
declare module './reexported_web3_context' {
	interface Web3Context {
		customRpcMethods: CustomRpcMethodsPlugin;
	}
}

export { Web3Context };
