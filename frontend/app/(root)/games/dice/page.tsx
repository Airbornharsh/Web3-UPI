'use client'
import React from 'react'
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
import { useAuth } from '@/context/AuthContext'
import { User } from '@/utils/types'

const Page = () => {
  const { setIsLoading, setErrorToastMessage, setToastMessage } = useLoader()
  const { balance, solPrice } = useCustomWallet()
  const { token, isAuthenticated, setUser, user } = useAuth()
  const [config, setConfig] = React.useState<{
    multiplier: number
    rollUnder: number
    winChance: number
    betAmount: number
    profitOnWin: number
  }>({
    multiplier: 1.98,
    rollUnder: 50,
    winChance: 50,
    betAmount: 0,
    profitOnWin: 0,
  })

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
      profitOnWin: Math.ceil(prev.betAmount * prev.multiplier),
      rollUnder: value,
      winChance: 100 - value,
    }))
  }

  const bet = async () => {
    try {
      setIsLoading(true)
      if (!isAuthenticated) {
        setErrorToastMessage('Please login to place bet')
        setIsLoading(false)
        return
      }
      if (config.betAmount < 0.0001) {
        setErrorToastMessage('Bet Amount must be greater than 0.0001')
        setIsLoading(false)
        return
      }
      if (parseInt(user?.walletBalance!) < config.betAmount) {
        setIsLoading(false)
        return
        setErrorToastMessage('Insufficient Balance')
      }
      const response = await axios.post(
        `${BACKEND_URL}/v1/games/dice`,
        {
          betAmount: config.betAmount,
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
        setUser({
          ...user,
          walletBalance: responseData.user.walletBalance,
        } as User)
      } else {
        setErrorToastMessage(responseData.message)
      }
    } catch (e: any) {
      console.log(e)
      if (e.message) setErrorToastMessage(e.message)
      else setErrorToastMessage('Something went wrong')
    } finally {
      setIsLoading(false)
    }
  }
  const renderPaginationItems = () => {
    const paginationItems = []

    // Previous Button
    paginationItems.push(
      <PaginationItem key="prev">
        <PaginationPrevious
          onClick={() => {
            if (operations.page.current === 1) return
            const temp = {
              ...operations,
              query: {
                ...operations.query,
                page: operations.page.current - 1,
              },
            }
            setOperations(temp)
          }}
        />
      </PaginationItem>,
    )

    // Page numbers
    for (
      let i = operations.page.first;
      i <= operations.page.last && i <= operations.page.total;
      i++
    ) {
      paginationItems.push(
        <PaginationItem key={i}>
          <PaginationLink
            onClick={() => {
              const temp = {
                ...operations,
                query: {
                  ...operations.query,
                  page: i,
                },
              }
              setOperations(temp)
            }}
            isActive={i === operations.page.current}
          >
            {i}
          </PaginationLink>
        </PaginationItem>,
      )
    }

    // Ellipsis
    if (operations.page.last < operations.page.total) {
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
            if (operations.page.current === operations.page.total) return
            const temp = {
              ...operations,
              query: {
                ...operations.query,
                page: operations.page.current + 1,
              },
            }
            setOperations(temp)
          }}
        />
      </PaginationItem>,
    )

    return paginationItems
  }
  return (
    <main className="flex flex-col items-center">
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
                  {solPrice * (config.betAmount / BASE_LAMPORTS)
                    ? (solPrice * (config.betAmount / BASE_LAMPORTS)).toFixed(2)
                    : (0).toFixed(2)}
                </Label>
              </div>
              <Input
                type="number"
                placeholder="Bet Amount"
                className="bg-background h-8 max-w-full border-0 pr-8 text-sm text-white"
                value={(config.betAmount / BASE_LAMPORTS).toString()}
                onChange={(e) => {
                  if (parseFloat(e.target.value) < 0) {
                    e.target.value = '0'
                  }
                  setConfig((prev) => ({
                    ...prev,
                    profitOnWin: Math.ceil(
                      parseInt(e.target.value) *
                        BASE_LAMPORTS *
                        config.multiplier,
                    ),
                    betAmount: parseFloat(e.target.value) * BASE_LAMPORTS,
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
                  {(solPrice * config.profitOnWin) / BASE_LAMPORTS
                    ? ((solPrice * config.profitOnWin) / BASE_LAMPORTS).toFixed(
                        2,
                      )
                    : (0).toFixed(2)}
                </Label>
              </div>
              <Input
                type="number"
                placeholder="Profit on Win"
                disabled={true}
                className="bg-background h-8 max-w-full border-0 pr-8 text-sm text-white"
                value={(config.profitOnWin / BASE_LAMPORTS).toString()}
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
                        profitOnWin: Math.ceil(
                          prev.betAmount * parseFloat(e.target.value),
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
                        profitOnWin: Math.ceil(
                          prev.betAmount *
                            parseFloat(
                              (
                                DICE_MULTIPLIER /
                                (100 - parseFloat(e.target.value))
                              ).toFixed(4),
                            ),
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
                        profitOnWin: Math.ceil(
                          prev.betAmount *
                            parseFloat(
                              (
                                DICE_MULTIPLIER / parseFloat(e.target.value)
                              ).toFixed(4),
                            ),
                        ),
                      }))
                    }}
                  />
                </div>
              </CardContent>
            </Card>
          </CardContent>
        </Card>
        <Table>
          <TableHeader>
            <TableRow>
              {/* <TableHead className="w-[100px]">Operation Id</TableHead> */}
              <TableHead className="w-[100px]">Signature</TableHead>
              <TableHead>Operation</TableHead>
              <TableHead>To</TableHead>
              <TableHead>Amount(SOL)</TableHead>
              <TableHead>Fee(SOL)</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Created At</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {operations.data?.map((operation) => (
              <TableRow key={operation.id}>
                {/* <TableCell>{operation.id}</TableCell> */}
                <TableCell>
                  {operation.signature
                    ? operation.signature.slice(0, 12) +
                      '...' +
                      operation.signature.slice(-12)
                    : ''}
                </TableCell>
                <TableCell>{operation.operation}</TableCell>
                <TableCell>
                  {operation.to ? operation.to.upiId : operation.toId}
                </TableCell>
                <TableCell>
                  {parseInt(operation.amount) / BASE_LAMPORTS}
                </TableCell>
                <TableCell>{parseInt(operation.fee) / BASE_LAMPORTS}</TableCell>
                <TableCell>{operation.status}</TableCell>
                <TableCell>
                  {new Date(operation.createdAt).toLocaleDateString()}{' '}
                  {new Date(operation.createdAt).toLocaleTimeString()}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
          <Pagination className="mt-6 text-white">
            <PaginationContent>{renderPaginationItems()}</PaginationContent>
          </Pagination>
        </Table>
      </div>
    </main>
  )
}

export default Page
