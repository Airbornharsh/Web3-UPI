'use client'
import React from 'react'
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
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { TabsContent } from '@/components/ui/tabs'
import { useAuth } from '@/context/AuthContext'
import { TransactionQuery } from '@/utils/types'

const Transaction = () => {
  const { transactions, setTransactions } = useAuth()

  const renderPaginationItems = () => {
    const paginationItems = []

    // Previous Button
    paginationItems.push(
      <PaginationItem key="prev">
        <PaginationPrevious
          onClick={() => {
            if (transactions.page.current === 1) return
            const temp = {
              ...transactions,
              query: {
                ...transactions.query,
                page: transactions.page.current - 1,
              },
            }
            setTransactions(temp)
          }}
        />
      </PaginationItem>,
    )

    // Page numbers
    for (
      let i = transactions.page.first;
      i <= transactions.page.last && i <= transactions.page.total;
      i++
    ) {
      paginationItems.push(
        <PaginationItem key={i}>
          <PaginationLink
            onClick={() => {
              const temp = {
                ...transactions,
                query: {
                  ...transactions.query,
                  page: i,
                },
              }
              setTransactions(temp)
            }}
            isActive={i === transactions.page.current}
          >
            {i}
          </PaginationLink>
        </PaginationItem>,
      )
    }

    // Ellipsis
    if (transactions.page.last < transactions.page.total) {
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
            if (transactions.page.current === transactions.page.total) return
            const temp = {
              ...transactions,
              query: {
                ...transactions.query,
                page: transactions.page.current + 1,
              },
            }
            setTransactions(temp)
          }}
        />
      </PaginationItem>,
    )

    return paginationItems
  }

  return (
    <TabsContent value="transaction">
      <Card className="w-[98vw] max-w-[80rem] ">
        <CardHeader>
          <CardTitle>Transaction</CardTitle>
          <CardDescription>
            <div className="mt-2 flex flex-wrap gap-2">
              <div className="w-full sm:max-w-32">
                <Select
                  onValueChange={(val) =>
                    setTransactions((o) => {
                      return {
                        ...o,
                        query: {
                          ...o.query,
                          status: val,
                        } as TransactionQuery,
                      }
                    })
                  }
                  defaultValue={transactions.query.status}
                >
                  <SelectTrigger className="min-w-32">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      <SelectLabel>Status</SelectLabel>
                      <SelectItem value="ALL">
                        <span>ALL</span>
                      </SelectItem>
                      <SelectItem value="COMPLETED">
                        <span>Completed</span>
                      </SelectItem>
                      <SelectItem value="PENDING">
                        <span>Pending</span>
                      </SelectItem>
                      <SelectItem value="FAILED">
                        <span>Failed</span>
                      </SelectItem>
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </div>
              <div className="w-full sm:max-w-32">
                <Select
                  onValueChange={(val) =>
                    setTransactions((o) => {
                      return {
                        ...o,
                        query: {
                          ...o.query,
                          order: val,
                        } as TransactionQuery,
                      }
                    })
                  }
                  defaultValue={transactions.query.order}
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
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-2">
          <Table>
            <TableHeader>
              <TableRow>
                {/* <TableHead className="w-[100px]">Transaction Id</TableHead> */}
                <TableHead className="w-[100px]">Signature</TableHead>
                <TableHead>Sender</TableHead>
                <TableHead>Reciever</TableHead>
                <TableHead>Amount(SOL)</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Created At</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {transactions.data?.map((transaction) => (
                <TableRow key={transaction.id}>
                  {/* <TableCell>{operation.id}</TableCell> */}
                  <TableCell>
                    {transaction.signature
                      ? transaction.signature.slice(0, 12) +
                        '...' +
                        transaction.signature.slice(-12)
                      : 'From Local Wallet'}
                  </TableCell>
                  <TableCell>{transaction.senderId as number}</TableCell>
                  <TableCell>{transaction.recieverId as number}</TableCell>
                  <TableCell>{transaction.amount}</TableCell>
                  <TableCell>{transaction.status}</TableCell>
                  <TableCell>
                    {new Date(transaction.createdAt).toLocaleDateString()}{' '}
                    {new Date(transaction.createdAt).toLocaleTimeString()}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
            <Pagination className="mt-6 text-white">
              <PaginationContent>{renderPaginationItems()}</PaginationContent>
            </Pagination>
          </Table>
        </CardContent>
      </Card>
    </TabsContent>
  )
}

export default Transaction
