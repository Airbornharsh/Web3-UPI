use anchor_lang::prelude::*;

declare_id!("5iwV4AcnutP5BPUbvzcsHYkzgzdPRcyEXEJLDA4i6a2L");

#[program]
pub mod solana_deposit_withdraw {
    use super::*;

    pub fn initialize(ctx: Context<Initialize>, admin: Pubkey) -> Result<()> {
        let state = &mut ctx.accounts.state;
        state.admin = admin;
        state.total_funds = 0;
        Ok(())
    }

    pub fn create_user_account(ctx: Context<CreateUserAccount>) -> Result<()> {
        let user_account = &mut ctx.accounts.user_account;
        user_account.balance = 0;
        user_account.owner = *ctx.accounts.user.key;
        Ok(())
    }

    pub fn get_balance(ctx: Context<GetBalance>) -> Result<u64> {
        let user_account = &ctx.accounts.user_account;
        Ok(user_account.balance)
    }

    pub fn deposit(ctx: Context<Deposit>, amount: u64) -> Result<()> {
        let user_account = &mut ctx.accounts.user_account;
        let state = &mut ctx.accounts.state;

        **ctx
            .accounts
            .user
            .to_account_info()
            .try_borrow_mut_lamports()? -= amount;
        **ctx
            .accounts
            .vault
            .to_account_info()
            .try_borrow_mut_lamports()? += amount;

        user_account.balance += amount;
        state.total_funds += amount;

        if !state.users.contains(&user_account.owner) {
            state.users.push(user_account.owner);
        }

        Ok(())
    }

    pub fn withdraw(ctx: Context<Withdraw>, amount: u64) -> Result<()> {
        let user_account = &mut ctx.accounts.user_account;
        let state = &mut ctx.accounts.state;

        assert!(user_account.balance >= amount, "Insufficient funds");

        **ctx
            .accounts
            .vault
            .to_account_info()
            .try_borrow_mut_lamports()? -= amount;
        **ctx
            .accounts
            .user
            .to_account_info()
            .try_borrow_mut_lamports()? += amount;

        user_account.balance -= amount;
        state.total_funds -= amount;

        if user_account.balance == 0 {
            state.users.retain(|&user| user != user_account.owner);
        }

        Ok(())
    }
}

#[derive(Accounts)]
pub struct Initialize<'info> {
    #[account(init, payer = admin, space = 8 + 32 + 8 + 4 + (32 * 1000))]
    pub state: Account<'info, State>,
    #[account(mut)]
    pub admin: Signer<'info>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct CreateUserAccount<'info> {
    #[account(init, payer = user, space = 8 + 32 + 8)]
    pub user_account: Account<'info, UserAccount>,
    #[account(mut)]
    pub user: Signer<'info>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct GetBalance<'info> {
    #[account(mut)]
    pub user: Signer<'info>,
    #[account(mut)]
    pub user_account: Account<'info, UserAccount>,
}

#[derive(Accounts)]
pub struct Deposit<'info> {
    #[account(mut)]
    pub user: Signer<'info>,
    #[account(mut)]
    pub user_account: Account<'info, UserAccount>,
    #[account(mut)]
    /// CHECK: This is not dangerous because we don't read or write from this account
    pub vault: AccountInfo<'info>,
    #[account(mut)]
    pub state: Account<'info, State>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct Withdraw<'info> {
    #[account(mut)]
    pub user: Signer<'info>,
    #[account(mut)]
    pub user_account: Account<'info, UserAccount>,
    #[account(mut)]
    /// CHECK: This is not dangerous because we don't read or write from this account
    pub vault: AccountInfo<'info>,
    #[account(mut)]
    pub state: Account<'info, State>,
    pub system_program: Program<'info, System>,
}

#[account]
pub struct State {
    pub admin: Pubkey,
    pub total_funds: u64,
    pub users: Vec<Pubkey>, // List of user public keys
}

#[account]
pub struct UserAccount {
    pub owner: Pubkey,
    pub balance: u64,
}

// #[error]
// pub enum ErrorCode {
//     #[msg("Insufficient funds")]
//     InsufficientFunds,
// }
