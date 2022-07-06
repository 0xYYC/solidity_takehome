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

    it("deposit total updated", async () => {
      
      expect(await grant.depositedBalance(signers[1].address)).to.be.eq(
        ethers.utils.parseEther("15")
      );           
    });

    it("should remove", async () => {
      
      await  grant.connect(signers[1]).remove(); 

      expect(await grant.depositedBalance(signers[1].address)).to.be.eq(
        ethers.utils.parseEther("0")
      );           
    });

    

    
    
  });

  

  


  

  
});
