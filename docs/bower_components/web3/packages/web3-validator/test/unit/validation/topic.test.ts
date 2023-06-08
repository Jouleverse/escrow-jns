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

import { isFilterObject } from '../../../src/validation/filter';
import {
	invalidFilterObjectData,
	isTopicData,
	isTopicInBloomData,
	validFilterObjectData,
} from '../../fixtures/validation';
import { isTopic, isTopicInBloom } from '../../../src/validation/topic';

describe('validation', () => {
	describe('filter', () => {
		describe('isFilterObject', () => {
			describe('valid cases', () => {
				it.each(validFilterObjectData)('%s', input => {
					expect(isFilterObject(input)).toBeTruthy();
				});
			});

			describe('invalid cases', () => {
				it.each(invalidFilterObjectData)('%s', input => {
					expect(isFilterObject(input)).toBeFalsy();
				});
			});
		});
	});
	describe('isTopic', () => {
		describe('valid cases', () => {
			it.each(isTopicData)('%s', data => {
				expect(isTopic(data.in)).toBe(data.out);
			});
		});
	});
	describe('isTopicInBloom', () => {
		describe('valid cases', () => {
			it.each(isTopicInBloomData)('%s', data => {
				expect(isTopicInBloom(data.in[0], data.in[1])).toBe(data.out);
			});
		});
	});
});
