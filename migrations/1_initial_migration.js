const JNS = artifacts.require("JNS");
const Escrow = artifacts.require("Escrow");

module.exports = function(deployer, network, accounts) {
  deployer.deploy(JNS);
  deployer.deploy(Escrow); // 0 deployer & seller 1 buyer 2 arbitrator 
};
