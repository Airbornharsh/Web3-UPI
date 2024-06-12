import React from 'react'
import {
  AccountBalanceWallet,
  SwapHoriz,
  Savings,
  AttachMoney,
  SportsEsports,
} from '@mui/icons-material'
import ConnectWalletFirst from './ConnectWalletFirst'
import Link from 'next/link'

const Intro = () => {
  return (
    <div className="bg-background text-foreground flex flex-col items-center p-6">
      <header className="mb-12 text-center">
        <h1 className="mb-4 text-5xl font-bold">Welcome to WPI</h1>
        <p className="mx-auto max-w-2xl text-xl">
          A simple and secure way to manage your tokens
        </p>
      </header>
      <ConnectWalletFirst />
      <div className="mt-10 grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
        <FeatureCard
          icon={<AccountBalanceWallet />}
          title="Connect Your Wallet"
          description="Securely connect your wallet to start managing your tokens."
        />
        <FeatureCard
          icon={<SwapHoriz />}
          title="Transfer Tokens"
          description="Send tokens to others using their UPI ID or by scanning their QR code."
        />
        <FeatureCard
          icon={<Savings />}
          title="Deposit Tokens"
          description="Deposit tokens into your account to keep them safe and ready to use."
        />
        <FeatureCard
          icon={<AttachMoney />}
          title="Withdraw Tokens"
          description="Withdraw tokens from your account whenever you need them."
        />
        <Link href="/games">
          <FeatureCard
            icon={<SportsEsports />}
            title="Play Games"
            description="Play games and win tokens. Have fun while earning tokens."
          />
        </Link>
      </div>
    </div>
  )
}

const FeatureCard = ({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode
  title: string
  description: string
}) => {
  return (
    <section className="bg-card text-card-foreground transform rounded-xl p-6 shadow-lg transition-transform hover:scale-105 hover:shadow-2xl">
      <div className="text-primary mb-4 flex items-center">
        <div className="text-3xl">{icon}</div>
        <h2 className="ml-4 text-2xl font-semibold">{title}</h2>
      </div>
      <p>{description}</p>
    </section>
  )
}

export default Intro
