// Version: 1
// Author: Evan Liu <evan@blockcoach.com>
// Date: 2023.6.7
const JNS = artifacts.require("JNS");

contract("JNS", (accounts) => {

	it("should have no JNS at first", async() => {
		const jns = await JNS.deployed(); // this will be NOT the console env, so
		  										// the testsuite can be run in the console again and again
		const balance = await jns.totalSupply(); // no need to call()!
		assert.equal(balance.toNumber(), 0, "00000000");
	});

	it("should have 1 JNS supply after creation", async() => {
		const jns = await JNS.deployed();
		await jns.claim("hello"); // no need to .send()!
		const balance = await jns.totalSupply();
		assert.equal(balance.toNumber(), 1, "00000000");
	});

	it("should have 1 JNS for the claimer", async() => {
		const jns = await JNS.deployed();
		const balance = await jns.balanceOf(accounts[0]); // state is kept within the suite
		assert.equal(balance.toNumber(), 1, "00000000");
	});

})
