import React from 'react'
import DiceImg from '@/assets/dice.jpg'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { Card, CardContent, CardFooter } from '@/components/ui/card'

const games = [
  {
    image: DiceImg,
    title: 'Dice Game',
    details: 'Win by Drag',
    link: '/games/dice',
  },
]
const Page = () => {
  return (
    <main className="flex">
      <div className="mt-4">
        {games.map((game) => {
          return (
            <Card
              key={game.link}
              className="bg-secondary max-w-sm overflow-hidden rounded p-0 shadow-lg"
            >
              <CardContent className="p-0">
                <Image className="w-full" src={game.image} alt={game.title} />
                <div className="px-6 py-4">
                  <div className="mb-2 text-xl font-bold">{game.title}</div>
                  <p className="text-base text-gray-200">{game.details}</p>
                </div>
              </CardContent>
              <CardFooter>
                <Link href={'/games/dice'}>
                  <Button>BET Now</Button>
                </Link>
              </CardFooter>
            </Card>
          )
        })}
      </div>
    </main>
  )
}

export default Page
