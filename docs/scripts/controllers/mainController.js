angular.module('EscrowJNS')
	.controller('mainCtrl', function ($rootScope, $scope, $location, $routeParams, $q) {

		var web3 = $rootScope.web3;

		$scope.init = async function () {

			////////////////////// parse uri ////////////////////////////
			// entry /jns/:jnsId
			$scope.jnsId = $routeParams.jnsId;
			// entry /offer/:addressId
			$scope.offerId = $routeParams.addressId;

			console.log($scope.jnsId);
			console.log($scope.offerId);

			if ($scope.jnsId !== undefined) {
				$scope.jnsId = $scope.jnsId.toLowerCase(); // must in format {name}.j
				// pre-process two exceptions: GM.j Nana.j
				if ($scope.jnsId == "gm.j") $scope.jnsId = "GM.j";
				if ($scope.jnsId == "nana.j") $scope.jnsId = "Nana.j";
			}

			// check name format
			var matched = $scope.jnsId.match(/(.*)\.j$/);
			if (matched == null) {
				// not ending with .j
				$scope.jnsIdError = "错误的格式";
			}
			var name = matched[1]; // the (.*) part
			$scope.jnsInfo = await getJNSInfo(name);

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

		async function getJNSInfo(jnsName) {
			var jns_contract = new web3.eth.Contract(jns_ABI, jns_contract_address);

			// search jns
			var token_id = await jns_contract.methods._nslookup(jnsName).call();
			console.log(jnsName, token_id);
			var owner_address = await jns_contract.methods.ownerOf(token_id).call();
			var owner_jnsId = await jns_contract.methods._whois(owner_address).call();
			if (owner_jnsId !== 0) {
				console.log(owner_jnsId);
				owner_jnsId = await jns_contract.methods._allTokensName(owner_jnsId).call();
				owner_jnsId += '.j';
			}
			var bound_address = await jns_contract.methods._bound(token_id).call();
			var token_uri = await jns_contract.methods.tokenURI(token_id).call();
			var img = parseTokenURI(token_uri).image;

			var info = {
				name: jnsName,
				tokenId: token_id,
				ownerAddress: owner_address,
				ownerJNSId: owner_jnsId,
				boundAddress: bound_address,
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

