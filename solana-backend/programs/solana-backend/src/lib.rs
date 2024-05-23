use anchor_lang::prelude::*;

declare_id!("32AJow2Fr4jpuGxH4TdBwZH3dKvkPKKXpFbqEDZPU3VC");

#[program]
pub mod solana_backend {
    use super::*;

    pub fn initialize(ctx: Context<Initialize>) -> Result<()> {
        Ok(())
    }
}

#[derive(Accounts)]
pub struct Initialize {}
