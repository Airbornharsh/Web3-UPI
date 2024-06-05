import * as anchor from '@coral-xyz/anchor'
import { Program } from '@coral-xyz/anchor'
import { SolanaDepositWithdraw } from '../target/types/solana_deposit_withdraw'
import * as assert from 'assert'

describe('solana_deposit_withdraw', () => {
  // Configure the client to use the local cluster.
  const provider = anchor.AnchorProvider.local()
  anchor.setProvider(provider)

  const program = anchor.workspace
    .SolanaDepositWithdraw as Program<SolanaDepositWithdraw>

  const state = anchor.web3.Keypair.generate()
  const vault = anchor.web3.Keypair.generate()
  const admin = provider.wallet
  const user = anchor.web3.Keypair.generate()

  it('Initializes the state', async () => {
    await program.methods
      .initialize(admin.publicKey)
      .accounts({
        state: state.publicKey,
        admin: admin.publicKey,
        // systemProgram: anchor.web3.SystemProgram.programId,
      })
      .signers([state])
      .rpc()

    const stateAccount = await program.account.state.fetch(state.publicKey)
    assert.strictEqual(
      stateAccount.admin.toBase58(),
      admin.publicKey.toBase58(),
    )
    assert.strictEqual(stateAccount.totalFunds.toNumber(), 0)
  })

  // it("Creates a user account", async () => {
  //   await program.methods.createUserAccount().accounts({
  //     userAccount: user.publicKey,
  //     user: user.publicKey,
  //     // systemProgram: anchor.web3.SystemProgram.programId,
  //   }).signers([user]).rpc();

  //   const userAccount = await program.account.userAccount.fetch(user.publicKey);
  //   assert.strictEqual(userAccount.owner.toBase58(), user.publicKey.toBase58());
  //   assert.strictEqual(userAccount.balance.toNumber(), 0);
  // });

  // it("Deposits funds", async () => {
  //   const depositAmount = new anchor.BN(1000);

  //   await provider.connection.requestAirdrop(user.publicKey, depositAmount.toNumber());
  //   await program.methods.deposit(depositAmount).accounts({
  //     user: user.publicKey,
  //     userAccount: user.publicKey,
  //     vault: vault.publicKey,
  //     state: state.publicKey,
  //     // systemProgram: anchor.web3.SystemProgram.programId,
  //   }).signers([user]).rpc();

  //   const userAccount = await program.account.userAccount.fetch(user.publicKey);
  //   const stateAccount = await program.account.state.fetch(state.publicKey);

  //   assert.strictEqual(userAccount.balance.toNumber(), depositAmount.toNumber());
  //   assert.strictEqual(stateAccount.totalFunds.toNumber(), depositAmount.toNumber());
  //   assert.strictEqual(stateAccount.users.length, 1);
  //   assert.strictEqual(stateAccount.users[0].toBase58(), user.publicKey.toBase58());
  // });

  // it("Withdraws funds", async () => {
  //   const withdrawAmount = new anchor.BN(500);

  //   await program.methods.withdraw(withdrawAmount).accounts({
  //     user: user.publicKey,
  //     userAccount: user.publicKey,
  //     vault: vault.publicKey,
  //     state: state.publicKey,
  //     // systemProgram: anchor.web3.SystemProgram.programId,
  //   }).signers([user]).rpc();

  //   const userAccount = await program.account.userAccount.fetch(user.publicKey);
  //   const stateAccount = await program.account.state.fetch(state.publicKey);

  //   assert.strictEqual(userAccount.balance.toNumber(), 500);
  //   assert.strictEqual(stateAccount.totalFunds.toNumber(), 500);
  // });

  // it("Checks user balance", async () => {
  //   const balance = await program.methods.getBalance().accounts({
  //     user: user.publicKey,
  //     userAccount: user.publicKey,
  //   }).rpc();

  //   assert.strictEqual(parseInt(balance), 500);
  // });
})
