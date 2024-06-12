'use client'
import React, { useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Slider } from '@/components/ui/slider'
import { useCustomWallet } from '@/context/CustomWalletContext'
import { BACKEND_URL, BASE_LAMPORTS, DICE_MULTIPLIER } from '@/utils/config'
import solIcon from '@/assets/sol.png'
import Image from 'next/image'
import { useLoader } from '@/context/LoaderContext'
import axios from 'axios'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination'
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useAuth } from '@/context/AuthContext'
import { DiceGame, User } from '@/utils/types'

const Page = () => {
  const { setIsLoading, setErrorToastMessage, setToastMessage } = useLoader()
  const { balance, solPrice } = useCustomWallet()
  const { token, isAuthenticated, setUser, user } = useAuth()
  const [botCount, setBotCount] = React.useState<number>(0)
  const botCountRef = React.useRef<number>(0)
  const [botRunning, setBotRunning] = React.useState<boolean>(false)
  const [games, setGames] = React.useState<{
    page: {
      total: number
      current: number
      first: number
      last: number
    }
    data: DiceGame[]
    query: {
      order: 'asc' | 'desc'
      win: 'WON' | 'LOST' | 'ALL'
      page: number
      limit: number
    }
  }>({
    page: {
      total: 0,
      current: 1,
      first: 1,
      last: 1,
    },
    data: [],
    query: {
      order: 'desc',
      win: 'ALL',
      page: 1,
      limit: 10,
    },
  })
  const [config, setConfig] = React.useState<{
    multiplier: number
    rollUnder: number
    winChance: number
    betAmount: string
    profitOnWin: number
  }>({
    multiplier: 1.98,
    rollUnder: 50,
    winChance: 50,
    betAmount: '0',
    profitOnWin: 0,
  })

  const getGamesData = async () => {
    try {
      const response = await axios.get(`${BACKEND_URL}/v1/games/dice`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        params: {
          ...games.query,
        },
      })
      const responseData = response.data
      if (responseData.status) {
        setGames((prev) => ({
          ...prev,
          data: responseData.games,
          page: {
            ...prev.page,
            total: responseData.totalPages,
            current: responseData.currentPage,
            last: responseData.lastPage,
          },
        }))
      } else {
        setErrorToastMessage(responseData.message)
      }
    } catch (e: any) {
      console.log(e)
      if (e.response.data.message) setErrorToastMessage(e.response.data.message)
      else setErrorToastMessage('Something went wrong')
    } finally {
    }
  }

  useEffect(() => {
    if (isAuthenticated) getGamesData()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    isAuthenticated,
    games.query.limit,
    games.query.page,
    games.query.win,
    games.query.order,
  ])

  const onSliderChange = (value: number) => {
    if (value < 2) {
      value = 2
    }
    if (value > 98) {
      value = 98
    }
    setConfig((prev) => ({
      ...prev,
      multiplier: parseFloat((DICE_MULTIPLIER / (100 - value)).toFixed(4)),
      profitOnWin: parseFloat(
        (parseFloat(prev.betAmount) * prev.multiplier).toFixed(9),
      ),
      rollUnder: value,
      winChance: 100 - value,
    }))
  }

  const bet = async () => {
    try {
      if (!isAuthenticated) {
        setErrorToastMessage('Please login to place bet')
        return false
      }
      if (parseFloat(config.betAmount) < 0.0001) {
        setErrorToastMessage('Bet Amount must be greater than 0.0001')
        return false
      }
      if (parseInt(user?.walletBalance!) < parseFloat(config.betAmount)) {
        setErrorToastMessage('Insufficient Balance')
        return false
      }
      const response = await axios.post(
        `${BACKEND_URL}/v1/games/dice`,
        {
          betAmount: parseFloat(config.betAmount) * BASE_LAMPORTS,
          rollUnder: config.rollUnder,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      )
      const responseData = response.data
      if (responseData.status) {
        if (responseData.game.win) {
          setToastMessage('You win')
        } else {
          setErrorToastMessage('You lose')
        }
        if (games.query.page === 1 && games.query.order === 'desc') {
          getGamesData()
        }
        setUser({
          ...user,
          walletBalance: responseData.user.walletBalance,
        } as User)
        return true
      } else {
        setErrorToastMessage(responseData.message)
        return false
      }
    } catch (e: any) {
      console.log(e)
      if (e.response.data.message) setErrorToastMessage(e.response.data.message)
      else setErrorToastMessage('Something went wrong')
      return false
    } finally {
    }
  }

  const startBot = async () => {
    try {
      setBotRunning(true)
      setToastMessage('Started Bot 🤖')
      await new Promise((resolve) => setTimeout(resolve, 200))
      while (botCount > 0 && botCountRef.current > 0) {
        const res = await bet()
        if (!res) {
          break
        }
        setBotCount((prev) => prev - 1)
        botCountRef.current = botCountRef.current - 1
      }
      await getGamesData()
      await new Promise((resolve) => setTimeout(resolve, 200))
      setBotCount(0)
      setToastMessage('Bot Stopped 🛑')
      setBotRunning(false)
    } catch (e) {
      console.log(e)
    }
  }

  const stopBot = () => {
    setBotCount(0)
    botCountRef.current = 0
    setBotRunning(false)
  }

  const renderPaginationItems = () => {
    const paginationItems = []

    // Previous Button
    paginationItems.push(
      <PaginationItem key="prev">
        <PaginationPrevious
          onClick={() => {
            if (games.page.current === 1) return
            const temp = {
              ...games,
              query: {
                ...games.query,
                page: games.page.current - 1,
              },
            }
            setGames(temp)
          }}
        />
      </PaginationItem>,
    )

    // Page numbers
    let duration = 5
    for (
      let i = games.page.current - 2 > 0 ? games.page.current - 2 : 1;
      i <= games.page.last && i <= games.page.total && duration > 0;
      i++, duration--
    ) {
      paginationItems.push(
        <PaginationItem key={i}>
          <PaginationLink
            onClick={() => {
              const temp = {
                ...games,
                query: {
                  ...games.query,
                  page: i,
                },
              }
              setGames(temp)
            }}
            isActive={i === games.page.current}
          >
            {i}
          </PaginationLink>
        </PaginationItem>,
      )
    }

    // Ellipsis
    if (games.page.last < games.page.total) {
      paginationItems.push(
        <PaginationItem key="ellipsis">
          <PaginationEllipsis />
        </PaginationItem>,
      )
    }

    // Next Button
    paginationItems.push(
      <PaginationItem key="next">
        <PaginationNext
          onClick={() => {
            if (games.page.current === games.page.total) return
            const temp = {
              ...games,
              query: {
                ...games.query,
                page: games.page.current + 1,
              },
            }
            setGames(temp)
          }}
        />
      </PaginationItem>,
    )

    return paginationItems
  }
  return (
    <main className="flex flex-col items-center gap-10 pb-10">
      <div className="mt-2 flex w-[96%] flex-col-reverse gap-2 md:flex-row">
        <Card className="w-[92vw] min-w-[16rem] max-w-[20rem]">
          <CardContent className="flex w-full flex-col gap-3 p-3">
            <div className="relative flex flex-col gap-1">
              <div className="flex justify-between">
                <Label className="text-xs font-bold md:text-sm">
                  Bet Amount
                </Label>
                <Label className="text-xs">
                  $
                  {solPrice * parseFloat(config.betAmount)
                    ? (solPrice * parseFloat(config.betAmount)).toFixed(2)
                    : (0).toFixed(2)}
                </Label>
              </div>
              <Input
                type="number"
                placeholder="Bet Amount"
                className="bg-background h-8 max-w-full border-0 pr-8 text-sm text-white"
                value={config.betAmount.toString()}
                onChange={(e) => {
                  // if (parseFloat(e.target.value) < 0) {
                  //   e.target.value = '0'
                  // }
                  setConfig((prev) => ({
                    ...prev,
                    profitOnWin: parseFloat(
                      (parseFloat(e.target.value) * config.multiplier).toFixed(
                        4,
                      ),
                    ),
                    betAmount: e.target.value,
                  }))
                }}
              />
              <Image
                src={solIcon}
                alt="sol"
                width={24}
                height={24}
                className="absolute bottom-[0.2rem] right-[0.2rem]"
              />
            </div>
            <div className="relative flex flex-col gap-1">
              <div className="flex justify-between">
                <Label className="text-xs font-bold md:text-sm">
                  Profit on Win
                </Label>
                <Label className="text-xs">
                  $
                  {solPrice * config.profitOnWin
                    ? (solPrice * config.profitOnWin).toFixed(2)
                    : (0).toFixed(2)}
                </Label>
              </div>
              <Input
                type="number"
                placeholder="Profit on Win"
                disabled={true}
                className="bg-background h-8 max-w-full border-0 pr-8 text-sm text-white"
                value={config.profitOnWin.toString()}
              />
              <Image
                src={solIcon}
                alt="sol"
                width={24}
                height={24}
                className="absolute bottom-[0.2rem] right-[0.2rem]"
              />
            </div>
            <Button className="w-full" onClick={bet}>
              BET
            </Button>
            <Label className="text-xs font-bold md:text-sm">Bot Count</Label>
            <Input
              type="number"
              placeholder="COUNT"
              className="bg-background h-8 max-w-full border-0 pr-8 text-sm text-white"
              value={botCount.toString()}
              disabled={botRunning}
              onChange={(e) => {
                setBotCount(parseInt(e.target.value))
                botCountRef.current = parseInt(e.target.value)
              }}
            />
            <Button
              className="w-full"
              onClick={botRunning ? stopBot : startBot}
            >
              {botRunning ? 'STOP BOT' : 'START BOT'}
            </Button>
          </CardContent>
        </Card>
        <Card className="h-[16rem] w-[92vw] md:min-h-[40rem] md:max-w-[calc(100%-20rem)]">
          <CardContent className="h-full">
            <div className="flex h-[calc(16rem-6rem)] w-full flex-col items-center justify-center gap-2 md:h-[calc(40rem-6rem)]">
              <ul className="flex w-[90%] max-w-[30rem] justify-between">
                <li>0</li>
                <li>25</li>
                <li>50</li>
                <li>75</li>
                <li>100</li>
              </ul>
              <Slider
                onValueChange={(value) => onSliderChange(value[0])}
                defaultValue={[50]}
                max={100}
                step={1}
                value={[config.rollUnder]}
                className="w-[90%] max-w-[30rem]"
              />
            </div>
            <Card className="">
              <CardContent className="flex flex-wrap items-center justify-between p-2 md:p-4">
                <div className="flex w-[30%] flex-col gap-1">
                  <Label className="text-xs font-bold md:text-sm">
                    Multiplier
                  </Label>
                  <Input
                    type="number"
                    placeholder="Multiplier"
                    className="bg-background h-8 w-full border-0 text-sm text-white"
                    value={config.multiplier.toString()}
                    onChange={(e) => {
                      if (parseFloat(e.target.value) < 1) {
                        e.target.value = '1'
                      }
                      setConfig((prev) => ({
                        ...prev,
                        multiplier: parseFloat(e.target.value),
                        rollUnder: parseFloat(
                          (
                            DICE_MULTIPLIER / parseFloat(e.target.value)
                          ).toFixed(2),
                        ),
                        winChance: parseFloat(
                          (
                            100 -
                            DICE_MULTIPLIER / parseFloat(e.target.value)
                          ).toFixed(2),
                        ),
                        profitOnWin: parseFloat(
                          (
                            parseFloat(prev.betAmount) *
                            parseFloat(e.target.value)
                          ).toFixed(4),
                        ),
                      }))
                    }}
                  />
                </div>
                <div className="flex w-[30%] flex-col gap-1">
                  <Label className="text-xs font-bold md:text-sm">
                    Roll Under
                  </Label>
                  <Input
                    type="number"
                    placeholder="Multiplier"
                    className="bg-background h-8 w-full border-0 text-sm text-white"
                    value={config.rollUnder.toString()}
                    onChange={(e) => {
                      if (parseFloat(e.target.value) < 2) {
                        e.target.value = '2'
                      }
                      if (parseFloat(e.target.value) > 98) {
                        e.target.value = '98'
                      }
                      setConfig((prev) => ({
                        ...prev,
                        rollUnder: parseFloat(e.target.value),
                        winChance: 100 - parseFloat(e.target.value),
                        multiplier: parseFloat(
                          (
                            DICE_MULTIPLIER /
                            (100 - parseFloat(e.target.value))
                          ).toFixed(4),
                        ),
                        profitOnWin:
                          parseFloat(prev.betAmount) *
                          parseFloat(
                            (
                              DICE_MULTIPLIER /
                              (100 - parseFloat(e.target.value))
                            ).toFixed(4),
                          ),
                      }))
                    }}
                  />
                </div>
                <div className="flex w-[30%] flex-col gap-1">
                  <Label className="text-xs font-bold md:text-sm">
                    Win Chance
                  </Label>
                  <Input
                    type="number"
                    placeholder="Multiplier"
                    className="bg-background h-8 w-full border-0 text-sm text-white"
                    value={config.winChance.toString()}
                    onChange={(e) => {
                      if (parseFloat(e.target.value) < 2) {
                        e.target.value = '2'
                      }
                      if (parseFloat(e.target.value) > 98) {
                        e.target.value = '98'
                      }
                      setConfig((prev) => ({
                        ...prev,
                        winChance: parseFloat(e.target.value),
                        rollUnder: 100 - parseFloat(e.target.value),
                        multiplier: parseFloat(
                          (
                            DICE_MULTIPLIER / parseFloat(e.target.value)
                          ).toFixed(4),
                        ),
                        profitOnWin:
                          parseFloat(prev.betAmount) *
                          parseFloat(
                            (
                              DICE_MULTIPLIER / parseFloat(e.target.value)
                            ).toFixed(4),
                          ),
                      }))
                    }}
                  />
                </div>
              </CardContent>
            </Card>
          </CardContent>
        </Card>
      </div>
      <div className="w-[96%]">
        <div className="flex gap-2">
          <div className="w-full sm:max-w-32">
            <Select
              onValueChange={(val) =>
                setGames((o) => {
                  return {
                    ...o,
                    query: {
                      ...o.query,
                      win: val,
                    } as {
                      order: 'asc' | 'desc'
                      win: 'WON' | 'LOST' | 'ALL'
                      page: number
                      limit: number
                    },
                  }
                })
              }
              defaultValue={games.query.win}
            >
              <SelectTrigger className="min-w-32">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectLabel>Result</SelectLabel>
                  <SelectItem value="ALL">
                    <span>ALL</span>
                  </SelectItem>
                  <SelectItem value="WON">
                    <span>WON</span>
                  </SelectItem>
                  <SelectItem value="LOST">
                    <span>LOST</span>
                  </SelectItem>
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>
          <div className="w-full sm:max-w-32">
            <Select
              onValueChange={(val) =>
                setGames((o) => {
                  return {
                    ...o,
                    query: {
                      ...o.query,
                      order: val,
                    } as {
                      order: 'asc' | 'desc'
                      win: 'WON' | 'LOST' | 'ALL'
                      page: number
                      limit: number
                    },
                  }
                })
              }
              defaultValue={games.query.order}
            >
              <SelectTrigger className="min-w-32">
                <SelectValue placeholder="Order" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectLabel>Order</SelectLabel>
                  <SelectItem value="asc">
                    <span>Ascending</span>
                  </SelectItem>
                  <SelectItem value="desc">
                    <span>Descending</span>
                  </SelectItem>
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>
        </div>
        <Table className="w-full">
          <TableHeader>
            <TableRow>
              <TableHead className="w-[150px]">Id</TableHead>
              <TableHead>Bet Amount</TableHead>
              <TableHead>Win Amount</TableHead>
              <TableHead>Win</TableHead>
              <TableHead>Created At</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {games.data.map((game) => (
              <TableRow key={game.id}>
                <TableCell>{game.id}</TableCell>
                <TableCell>
                  {parseInt(game.betAmount!) / BASE_LAMPORTS}
                </TableCell>
                <TableCell>
                  {parseInt(game.winAmount!) / BASE_LAMPORTS}
                </TableCell>
                <TableCell>{game.win ? 'WON' : 'LOST'}</TableCell>
                <TableCell>
                  {new Date(game.createdAt).toLocaleDateString()}{' '}
                  {new Date(game.createdAt).toLocaleTimeString()}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        <Pagination className="mt-6 text-white">
          <PaginationContent>{renderPaginationItems()}</PaginationContent>
        </Pagination>
      </div>
    </main>
  )
}

export default Page
