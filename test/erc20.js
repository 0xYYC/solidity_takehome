const { expect, assert } = require("chai");
const { ethers } = require("hardhat");

describe("ECR20", function () {
  const initialSupply = ethers.utils.parseEther("100");
  let token, game, signers;
  const addressNull = "0x0000000000000000000000000000000000000000";

  beforeEach(async () => {
    const TokenFactory = await ethers.getContractFactory("ERC20");
    token = await TokenFactory.deploy("token", "TKN");
    await token.deployed();

    const GameFactory = await ethers.getContractFactory("Game");
    game = await GameFactory.deploy();
    await game.deployed();


    signers = await ethers.getSigners();
    await token.mint(signers[0].address, initialSupply);

  });

  describe("transfer functionality", async () => {

    it("transfers successfully", async () => {
      await token.transfer(signers[1].address, ethers.utils.parseEther("5"));
      expect(await token.balanceOf(signers[0].address)).to.be.eq(
        ethers.utils.parseEther("95")
      );
      expect(await token.balanceOf(signers[1].address)).to.be.eq(
        ethers.utils.parseEther("5")
      );
    });

    it("does not transfer more than balance", async () => {
      const tx = token.transfer(
        signers[1].address,
        ethers.utils.parseEther("500")
      );
      await expect(tx).to.be.revertedWith("ERC20: insufficient-balance");
    });

    it("transfer to address 0 should fail", async () => {
      await expect(token.transfer(addressNull, ethers.utils.parseEther("5"))).to.be.
      revertedWith('Arithmetic operation underflowed or overflowed outside of an unchecked block');    
    });
    it("transfer to contract address should fail", async () => {
      await expect(token.transfer(token.address, ethers.utils.parseEther("5"))).to.be.
      revertedWith('Arithmetic operation underflowed or overflowed outside of an unchecked block');      
    });
    
  });

  describe("transferFrom and approve functionality with EOA address", async () => {
    
    it("should not transferFrom without approve first", async () => {
      await expect(token.connect(signers[1]).transferFrom(signers[0].address,signers[2].address,ethers.utils.parseEther("5"))).to.be.
      revertedWith('ERC20: insufficient-allowance');      
    });

    it("should transferFrom with approve first", async () => {
      
      const allowed = ethers.utils.parseEther("5");
      await token.approve(signers[1].address, allowed);

      await token.connect(signers[1]).transferFrom(signers[0].address,signers[2].address,allowed);

      expect(await token.balanceOf(signers[2].address)).to.be.eq(allowed);          

    });

    it("should not spend more than total allowance", async () => {
      
      const allowed = ethers.utils.parseEther("5");
      await token.approve(signers[1].address, allowed);

      const spend_1 = ethers.utils.parseEther("4");
      const spend_2 = ethers.utils.parseEther("2");
      

      await token.connect(signers[1]).transferFrom(signers[0].address, signers[2].address, spend_1);
      await expect(token.connect(signers[1]).transferFrom(signers[0].address, signers[2].address, spend_2)).to.be.revertedWith
      ('ERC20: insufficient-allowance');      
    });
  });

  describe("transferFrom and approve functionality with smart contract address", async () => {
    
    it("should not transferFrom without approve first", async () => {
      
      const allowed = ethers.utils.parseEther("5");
      await expect( game.transfer(token.address, signers[1].address, allowed)).to.be.revertedWith('ERC20: insufficient-allowance');      
    });

    it("should transferFrom with approve first", async () => {
      
      const allowed = ethers.utils.parseEther("5");

      await token.approve(game.address,allowed);
      await game.transfer(token.address, signers[2].address, allowed);

      expect(await token.balanceOf(signers[2].address)).to.be.eq(allowed);  
            
    });

    it("should be able to transfer to the contract address itsef ", async () => {
      
      const allowed = ethers.utils.parseEther("5");

      await token.approve(game.address,allowed);
      await game.transfer(token.address, game.address, allowed);

      expect(await token.balanceOf(game.address)).to.be.eq(allowed);  
            
    });

  });


  


  

  
});
