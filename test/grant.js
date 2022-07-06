const { expect, assert } = require("chai");
const { ethers } = require("hardhat");

describe("Grant", function () {
  const amount = ethers.utils.parseEther("100");
  let token, grant, signers;
  
  beforeEach(async () => {
    const TokenFactory = await ethers.getContractFactory("ERC20");
    token = await TokenFactory.deploy("token", "TKN");
    await token.deployed();

    const GrantFactory = await ethers.getContractFactory("Grant");
    grant = await GrantFactory.deploy(token.address);
    await grant.deployed();


    signers = await ethers.getSigners();
    await token.mint(signers[1].address, amount);
    await token.mint(signers[2].address, amount);

    const amount_1 = ethers.utils.parseEther("10");
    const amount_2 = ethers.utils.parseEther("5");
    
    token.connect(signers[1]).approve(grant.address,amount_1);
    await grant.connect(signers[1]).deposit(amount_1);
    token.connect(signers[1]).approve(grant.address,amount_2);
    await grant.connect(signers[1]).deposit(amount_2); 

    token.connect(signers[2]).approve(grant.address,amount_2);
    await grant.connect(signers[2]).deposit(amount_2); 

  });

  describe("Deposit balance", async () => {

    it("funder total deposit total updated", async () => {
      
      expect(await grant.DepositedBalanceOf(signers[1].address)).to.be.eq(
        ethers.utils.parseEther("15")
      );           
    });

    it("all funders total deposit total updated", async () => {
      
      expect(await grant.totalDeposited()).to.be.eq(
        ethers.utils.parseEther("20")
      );           
    });
  });

  describe("Remove", async () => { 

    it("should not remove if not a funder", async () => {      
      await  expect(grant.connect(signers[3]).remove()).to.be.revertedWith('Not a funder');               
    });

    it("should remove if a funder", async () => {   

      await  expect(grant.connect(signers[2]).remove());
      expect(await grant.connect(signers[2]).totalDeposited()).to.be.eq(ethers.utils.parseEther("15"));  
      expect(await token.connect(signers[2]).balanceOf(signers[2].address)).to.be.eq(ethers.utils.parseEther("100"));
      
    });

    it("should not remove twice", async () => {   

      await  expect(grant.connect(signers[2]).remove());
      await  expect(grant.connect(signers[2]).remove()).to.be.revertedWith('Not a funder');

    });

    it("should not be able to remove after timelock", async () => {
      
      const oneyear = 366 * 24 * 60 * 60;
      await hre.network.provider.request({
          method: "evm_increaseTime",
          params: [oneyear]
      });

      await  expect(grant.connect(signers[1]).remove()).to.be.revertedWith('late to remove');

    });
  });

  describe("Claim", async () => {

    it("should not be able to claim if not pass the timelock yet", async () => {      
      await  expect(grant.connect(signers[0]).claim()).to.be.revertedWith('Not pass the timelock yet');               
    });

    describe("Claim after timelock", async () => {
      beforeEach(async () => {
        const oneyear = 366 * 24 * 60 * 60;
        await hre.network.provider.request({
            method: "evm_increaseTime",
            params: [oneyear]
        });  
      });
   
      it("should not be able to claim if not the recipient", async () => {     
        
        await  expect(grant.connect(signers[3]).claim()).to.be.revertedWith('Not a recipient');               
      });     

      it("should be able to claim after the timelock", async () => {     
        await  grant.connect(signers[0]).claim();
        expect(await token.connect(signers[0]).balanceOf(signers[0].address)).to.be.eq(ethers.utils.parseEther("20"));

      });

      it("should not be able to claim twice", async () => {     
        await  grant.connect(signers[0]).claim();
        await expect( grant.connect(signers[0]).claim()).to.be.revertedWith("Already claimed");
      });
    });

  });


});
