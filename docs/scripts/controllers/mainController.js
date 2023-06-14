angular.module('EscrowJNS')
	.controller('mainCtrl', function ($rootScope, $scope, $location, $routeParams, $q) {

		var web3 = $rootScope.web3;

		//////////////////////////////////////////////////////////////////////////////
		// write functionalities in page scope                                      //
		//////////////////////////////////////////////////////////////////////////////
			$scope.makeOffer = function(jns_token_id) {
				const DIALOG_TITLE = '发起邀约';

				console.log(jns_token_id);
				if (jns_token_id <= 0) { 
					dialogShowTxt(DIALOG_TITLE, '错误：JNS token id ' + jnsId + ' 必须大于0');
				} else {
					if (window.ethereum && window.ethereum.isConnected()) {
						web3.setProvider(window.ethereum);
						const connectedAccount = window.ethereum.selectedAddress;

						console.log($scope.offerInfo.seller, connectedAccount);
						if ($scope.offerInfo.seller.toLowerCase() == connectedAccount.toLowerCase()) {
							dialogShowTxt(DIALOG_TITLE, '错误：不能向自己发起邀约');
						} else {
							const escrow_contract = new web3.eth.Contract(ESCROW_ABI, ESCROW_CONTRACT_ADDRESS);
							const _message = web3.utils.padRight('0x00', 64); //暂不用
							console.log(_message);
							const makeOffer_call = escrow_contract.methods.create(DEFAULT_ARBITRATOR, JNS_CONTRACT_ADDRESS, jns_token_id, _message);
							makeOffer_call.estimateGas({from: connectedAccount}).then((gas) => {
								console.log(gas);
								dialogShowTxt(DIALOG_TITLE, '上链请求提交中…… 请留意web3钱包的弹出确认。');
								makeOffer_call.send({from: connectedAccount}, handlerShowTx(DIALOG_TITLE))
									.then(handlerShowRct(DIALOG_TITLE))
									.catch((err) => { dialogShowTxt(DIALOG_TITLE, '错误：' + err) })
							}).catch((err) => {
									dialogShowTxt(DIALOG_TITLE, '错误：无法评估gas：' + err.data.message); //展示合约逻辑报错
							});
						}

					} else {
						dialogShowTxt(DIALOG_TITLE, '错误：没有web3环境，无法完成操作');
					}
				}

			}

			$scope.abortOffer = function(offerInfo) {
				const DIALOG_TITLE = '取消邀约';

				if (window.ethereum && window.ethereum.isConnected()) {
					web3.setProvider(window.ethereum);
					const connectedAccount = window.ethereum.selectedAddress;

					const escrow_contract = new web3.eth.Contract(ESCROW_ABI, ESCROW_CONTRACT_ADDRESS);

					if (offerInfo.buyer.toLowerCase() !== connectedAccount.toLowerCase()) {
						dialogShowTxt(DIALOG_TITLE, '错误：只有邀约发起人可以取消邀约');
					} else {
						const abortOffer_call = escrow_contract.methods.abort();
						abortOffer_call.estimateGas({from: connectedAccount}).then((gas) => {
							console.log(gas);
							dialogShowTxt(DIALOG_TITLE, '上链请求提交中…… 请留意web3钱包的弹出确认。');
							abortOffer_call.send({from: connectedAccount}, handlerShowTx(DIALOG_TITLE))
								.then(handlerShowRct(DIALOG_TITLE))
								.catch((err) => { dialogShowTxt(DIALOG_TITLE, '错误：' + err) })
						}).catch((err) => {
							dialogShowTxt(DIALOG_TITLE, '错误：无法评估gas：' + err.data.message); //展示合约逻辑报错
						});
					}

				} else {
					dialogShowTxt(DIALOG_TITLE, '错误：没有web3环境，无法完成操作');
				}

			}
			$scope.approve = function(jns_token_id) {
				const DIALOG_TITLE = '授权合约托管';

				console.log(jns_token_id);
				if (jns_token_id <= 0) { 
					dialogShowTxt(DIALOG_TITLE, '错误：JNS token id ' + jnsId + ' 必须大于0');
				} else {
					if (window.ethereum && window.ethereum.isConnected()) {
						web3.setProvider(window.ethereum);
						const connectedAccount = window.ethereum.selectedAddress;

						if ($scope.offerInfo.seller.toLowerCase() !== connectedAccount.toLowerCase()) {
							dialogShowTxt(DIALOG_TITLE, '错误：只有该JNS域名的持有者可以进行授权');
						} else {
							const jns_contract = new web3.eth.Contract(JNS_ABI, JNS_CONTRACT_ADDRESS);
							const approve_call = jns_contract.methods.approve(ESCROW_CONTRACT_ADDRESS, jns_token_id);
							approve_call.estimateGas({from: connectedAccount}).then((gas) => {
								console.log(gas);
								dialogShowTxt(DIALOG_TITLE, '上链请求提交中…… 请留意web3钱包的弹出确认。');
								approve_call.send({from: connectedAccount}, handlerShowTx(DIALOG_TITLE))
									.then(handlerShowRct(DIALOG_TITLE))
									.catch((err) => { dialogShowTxt(DIALOG_TITLE, '错误：' + err) })
							}).catch((err) => {
									dialogShowTxt(DIALOG_TITLE, '错误：无法评估gas：' + err.data.message); //展示合约逻辑报错
							});
						}

					} else {
						dialogShowTxt(DIALOG_TITLE, '错误：没有web3环境，无法完成操作');
					}
				}

			}

			$scope.acceptOffer = function(offerInfo) {
				const DIALOG_TITLE = '接受邀约';

				if (window.ethereum && window.ethereum.isConnected()) {
					web3.setProvider(window.ethereum);
					const connectedAccount = window.ethereum.selectedAddress;

					const escrow_contract = new web3.eth.Contract(ESCROW_ABI, ESCROW_CONTRACT_ADDRESS);

					if (offerInfo.seller.toLowerCase() !== connectedAccount.toLowerCase()) {
						dialogShowTxt(DIALOG_TITLE, '错误：只有该JNS域名的持有者可以接受邀约');
					} else {
						// 需要先approve!
						const acceptOffer_call = escrow_contract.methods.accept(offerInfo.buyer);
						acceptOffer_call.estimateGas({from: connectedAccount}).then((gas) => {
							console.log(gas);
							dialogShowTxt(DIALOG_TITLE, '上链请求提交中…… 请留意web3钱包的弹出确认。');
							acceptOffer_call.send({from: connectedAccount}, handlerShowTx(DIALOG_TITLE))
								.then(handlerShowRct(DIALOG_TITLE))
								.catch((err) => { dialogShowTxt(DIALOG_TITLE, '错误：' + err) })
						}).catch((err) => {
							dialogShowTxt(DIALOG_TITLE, '错误：无法评估gas：' + err.data.message); //展示合约逻辑报错
						});
					}

				} else {
					dialogShowTxt(DIALOG_TITLE, '错误：没有web3环境，无法完成操作');
				}

			}

			$scope.confirmOffer = function(offerInfo) {
				const DIALOG_TITLE = '确认发货';

				if (window.ethereum && window.ethereum.isConnected()) {
					web3.setProvider(window.ethereum);
					const connectedAccount = window.ethereum.selectedAddress;

					const escrow_contract = new web3.eth.Contract(ESCROW_ABI, ESCROW_CONTRACT_ADDRESS);

					if (offerInfo.seller.toLowerCase() !== connectedAccount.toLowerCase()) {
						dialogShowTxt(DIALOG_TITLE, '错误：只有该JNS域名的原持有者可以确认发货');
					} else {
						const confirmOffer_call = escrow_contract.methods.confirm(offerInfo.buyer);
						confirmOffer_call.estimateGas({from: connectedAccount}).then((gas) => {
							console.log(gas);
							dialogShowTxt(DIALOG_TITLE, '上链请求提交中…… 请留意web3钱包的弹出确认。');
							confirmOffer_call.send({from: connectedAccount}, handlerShowTx(DIALOG_TITLE))
								.then(handlerShowRct(DIALOG_TITLE))
								.catch((err) => { dialogShowTxt(DIALOG_TITLE, '错误：' + err) })
						}).catch((err) => {
							dialogShowTxt(DIALOG_TITLE, '错误：无法评估gas：' + err.data.message); //展示合约逻辑报错
						});
					}

				} else {
					dialogShowTxt(DIALOG_TITLE, '错误：没有web3环境，无法完成操作');
				}

			}

		//////////////////////////////////////////////////////////////////////////////
		// read functionalities in page scope                                       //
		//////////////////////////////////////////////////////////////////////////////
		$scope.init = async function () {

			$scope.ZERO_ADDRESS = '0x0000000000000000000000000000000000000000';
			$scope.ESCROW_CONTRACT_ADDRESS = ESCROW_CONTRACT_ADDRESS;

			////////////////////// parse uri ////////////////////////////
			// entry /jns/:jnsId
			$scope.jnsId = $routeParams.jnsId;
			// entry /offer/:addressId
			$scope.offerId = $routeParams.addressId;

			console.log($scope.jnsId);
			console.log($scope.offerId);

			if ($scope.offerId !== undefined) {
				const escrow_contract = new web3.eth.Contract(ESCROW_ABI, ESCROW_CONTRACT_ADDRESS);
				$scope.offerInfo = await escrow_contract.methods.transactions($scope.offerId).call();

				if ($scope.offerInfo.tokenId > 0) {
					$scope.jnsInfo = await getJNSInfoByTokenId($scope.offerInfo.tokenId);

					if ($scope.offerInfo.state == 0 && $scope.jnsInfo.ownerAddress.toLowerCase() !== $scope.offerId.toLowerCase()) {
						$scope.jnsInfo.tokenId = 0;
						$scope.offerInfo.seller = $scope.ZERO_ADDRESS;
					}
				} else {
					$scope.jnsInfo = { 
						tokenId : 0,
						ownerAddress: $scope.ZERO_ADDRESS,
					};
					$scope.offerInfo.seller = $scope.ZERO_ADDRESS;
					$scope.offerInfo.buyer = $scope.offerId;
				} 

				console.log($scope.offerInfo);
			}

			if ($scope.jnsId !== undefined) {
				$scope.jnsId = $scope.jnsId.toLowerCase(); // must in format {name}.j
				// pre-process two exceptions: GM.j Nana.j
				if ($scope.jnsId == "gm.j") $scope.jnsId = "GM.j";
				if ($scope.jnsId == "nana.j") $scope.jnsId = "Nana.j";

				// check name format
				var matched = $scope.jnsId.match(/(.*)\.j$/);
				if (matched == null) {
					// not ending with .j
					$scope.jnsIdError = "错误的格式";
				}
				var name = matched[1]; // the (.*) part
				$scope.jnsInfo = await getJNSInfo(name);

				if ($scope.jnsInfo !== undefined) {

					//检查当前连接的地址是否已经make offer
					if (window.ethereum && window.ethereum.isConnected()) {
						web3.setProvider(window.ethereum);
						const connectedAccount = window.ethereum.selectedAddress;

						const escrow_contract = new web3.eth.Contract(ESCROW_ABI, ESCROW_CONTRACT_ADDRESS);
						$scope.offerInfo = await escrow_contract.methods.transactions(connectedAccount).call();

						if ($scope.offerInfo.state == 0 && $scope.jnsInfo.ownerAddress != ESCROW_CONTRACT_ADDRESS) {
							$scope.offerInfo.seller = $scope.jnsInfo.ownerAddress;
							$scope.offerInfo.buyer = connectedAccount;
						}

						/*if ($scope.offerInfo.buyer.toLowerCase() == connectedAccount.toLowerCase()) {
							$scope.offerInfo.buyerName = '我';
						}*/

						console.log($scope.offerInfo);

					}

				}

			}


			if ($scope.jnsInfo !== undefined && $scope.offerInfo !== undefined) {
				// locate the jns
				if ($scope.jnsInfo.ownerAddress.toLowerCase() == $scope.offerInfo.seller.toLowerCase()) {
					$scope.jns_location = 'SELLER';
				} else if ($scope.jnsInfo.ownerAddress.toLowerCase() == ESCROW_CONTRACT_ADDRESS.toLowerCase()) {
					$scope.jns_location = 'ESCROW';
				} else if ($scope.jnsInfo.ownerAddress.toLowerCase() == $scope.offerInfo.buyer.toLowerCase()) {
					$scope.jns_location = 'BUYER';
				} else {
					$scope.jns_location = 'UNKNOWN';
				}
				console.log($scope.jns_location, $scope.jnsInfo.ownerAddress, $scope.offerInfo.seller, $scope.offerInfo.buyer);

				// query names
				$scope.offerInfo.sellerName = await getBoundJNSId($scope.offerInfo.seller) || '---';
				$scope.offerInfo.buyerName = await getBoundJNSId($scope.offerInfo.buyer) || '---';
				$scope.offerInfo.arbitratorName = await getBoundJNSId($scope.offerInfo.arbitrator) || '---';
				console.log($scope.offerInfo.sellerName, $scope.offerInfo.buyerName, $scope.offerInfo.arbitratorName);
			}

			////////////////////// blockchain info ////////////////////////////
			var blockHeight = $scope.blockHeight = await getBlockHeight();
			var blockInfo = await getBlockInfo(blockHeight);
			blockInfo.time_localestring = new Date(parseInt(blockInfo.timestamp * 1000n)).toLocaleString('zh-CN', { timezone: 'UTC', timeZoneName: 'short' });
			var current = Date.now() / 1000;
			console.log("local time: ", current, " block time: ", blockInfo.timestamp);
			if (current - parseInt(blockInfo.timestamp) < 60) { // last block is within 60 sec
				$scope.status = "🟢 正常";
			} else {
				$scope.status = "🔴 异常";
			}

			$scope.$apply();

		}

		async function getBoundJNSId(addr) {
			const jns_contract = new web3.eth.Contract(JNS_ABI, JNS_CONTRACT_ADDRESS);
			const jns_token_id = await jns_contract.methods._whois(addr).call();
			if (jns_token_id > 0) {
				const jns_name = await jns_contract.methods._allTokensName(jns_token_id).call();
				return jns_name + '.j';
			} else {
				return undefined;
			}
		}

		async function getJNSInfo(jns_name) {
			var jns_contract = new web3.eth.Contract(JNS_ABI, JNS_CONTRACT_ADDRESS);

			// search jns
			var token_id = await jns_contract.methods._nslookup(jns_name).call();
			console.log(jns_name, token_id);
			
			if (token_id > 0) {
				return getJNSInfoByTokenId(token_id);
			} else {
				return undefined; //not found
			}
		}

		async function getJNSInfoByTokenId(token_id) {
			var jns_contract = new web3.eth.Contract(JNS_ABI, JNS_CONTRACT_ADDRESS);
			var owner_address = await jns_contract.methods.ownerOf(token_id).call();
			var owner_jnsId = await jns_contract.methods._whois(owner_address).call();
			if (owner_jnsId !== 0) {
				console.log(owner_jnsId);
				owner_jnsId = await jns_contract.methods._allTokensName(owner_jnsId).call();
				owner_jnsId = owner_jnsId ? (owner_jnsId + '.j') : '';
			}
			var bound_address = await jns_contract.methods._bound(token_id).call();
			var approved_spender = await jns_contract.methods.getApproved(token_id).call();
			var token_uri = await jns_contract.methods.tokenURI(token_id).call();
			var img = parseTokenURI(token_uri).image;

			var info = {
				name: token_uri.name,
				tokenId: token_id,
				ownerAddress: owner_address,
				ownerJNSId: owner_jnsId,
				boundAddress: bound_address,
				spenderAddress: approved_spender,
				tokenURI: token_uri,
				logo: img
			}

			console.log(info);

			return info;
		}



		function getBlockHeight() {
			var deferred = $q.defer();

			//var height = parseInt(web3.eth.blockNumber, 10);
			var height = web3.eth.getBlockNumber(); // fix: make it compatible with web3 1.8.2

			// intentionally delay...
			window.setTimeout(function() {
				deferred.resolve(height);
			}, 0 /*Math.floor(Math.random() * 3000) + 2000*/);

			return deferred.promise;
		}

		function getBlockInfo(blockNum) {
			var deferred = $q.defer();

			var blockInfo = web3.eth.getBlock(blockNum); // it is a promise 

			// intentionally delay...
			window.setTimeout(function() {
				deferred.resolve(blockInfo);
			}, 0 /*Math.floor(Math.random() * 3000) + 2000*/);

			return deferred.promise;
		}

		$scope.init();

		//////////////////////////////////////////////////////////////////////////////
		// helper functionalities NOT in page scope                                 //
		//////////////////////////////////////////////////////////////////////////////
		function hex2a(hexx) {
			var hex = hexx.toString();//force conversion
			var str = '';
			for (var i = 0; i < hex.length; i += 2)
				str += String.fromCharCode(parseInt(hex.substr(i, 2), 16));
			return str;
		}

		function parseTokenURI(tokenURI) {
			var [t, s] = tokenURI.split(',');
			if (t == 'data:application/json;base64') {
				var metadata = JSON.parse(atob(s));
				/*var [t2, s2] = metadata.image.split(',');
				if (t2 == 'data:image/svg+xml;base64') {
					var svg = atob(s2);
					metadata.image = svg;
				}*/
				return metadata;
			}
			return null;
		}

	});

