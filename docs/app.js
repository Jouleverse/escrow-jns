'use strict';

angular.module('EscrowJNS', ['ngRoute','ui.bootstrap'])
	.config(function($routeProvider, $locationProvider) {
		$routeProvider.
			when('/', {
				templateUrl: 'views/main.html',
				controller: 'mainCtrl'
			}).
			when('/jns/:jnsId', { // e.g. love.j
				templateUrl: 'views/main.html',
				controller: 'mainCtrl'
			}).
			when('/offer/:addressId', { // e.g. 0x3D86Dd50C2f333d3d79Da2DE6bCd5706adD7a20c
				templateUrl: 'views/main.html',
				controller: 'mainCtrl'
			}).
			otherwise({
				redirectTo: '/'
			});

		$locationProvider.html5Mode(false); // use 404.html trick for static deployment on gh-pages
	})
	.run(function($rootScope) {
		var web3 = new Web3();

		var protocol = location.protocol;

		//var hostname = 'localhost';
		var hostname = 'rpc.jnsdao.com';
		var port = (hostname == 'localhost' || hostname == '127.0.0.1')? 8501 : // local dev
			(protocol == 'http:' ? 8502 : 8503); // production

		var rpc_node_url = protocol + '//' + hostname + ':' + port;
		console.log(rpc_node_url);
		web3.setProvider(new web3.providers.HttpProvider(rpc_node_url));

		$rootScope.web3 = web3;
		window.web3 = web3; //XXX inject it to console for debugging

		//if(!web3.isConnected()) {
		if (!web3.eth.net.isListening()) { // fix: make it compatible with web3 1.8.2
			dialogModalShowTxt('无法连接到区块链网络', '无法连接到RPC服务，请检查你的网络连接是否畅通');
		}
	});
