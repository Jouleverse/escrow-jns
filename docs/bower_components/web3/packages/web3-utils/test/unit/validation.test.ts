﻿/*
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

/* eslint-disable jest/no-conditional-expect */

import { InvalidBlockError } from 'web3-errors';
import { compareBlockNumbers } from '../../src/validation';
import {
	compareBlockNumbersInvalidData,
	compareBlockNumbersValidData,
} from '../fixtures/validation';

describe('validation', () => {
	describe('compareBlockNumbers', () => {
		it.each([...compareBlockNumbersValidData, ...compareBlockNumbersInvalidData])(
			'%s',
			(input, output) => {
				if (output instanceof InvalidBlockError) {
					expect(() => compareBlockNumbers(input[0], input[1])).toThrow(output);
				} else {
					expect(compareBlockNumbers(input[0], input[1])).toEqual(output);
				}
			},
		);
	});
});
