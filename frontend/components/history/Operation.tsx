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
import { OperationQuery } from '@/utils/types'
import { BASE_LAMPORTS } from '@/utils/config'

const Operation = () => {
  const { operations, setOperations } = useAuth()

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
    let duration = 5
    for (
      let i = operations.page.current - 2 > 0 ? operations.page.current - 2 : 1;
      i <= operations.page.last && i <= operations.page.total && duration > 0;
      i++, duration--
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
    <TabsContent value="operation">
      <Card className="w-[98vw] max-w-[80rem] ">
        <CardHeader>
          <CardTitle>Operation</CardTitle>
          <CardDescription>
            <div className="mt-2 flex flex-wrap gap-2">
              <div className="w-full sm:max-w-32">
                <Select
                  onValueChange={(val) =>
                    setOperations((o) => {
                      return {
                        ...o,
                        query: {
                          ...o.query,
                          operation: val,
                        } as OperationQuery,
                      }
                    })
                  }
                  defaultValue={operations.query.operation}
                >
                  <SelectTrigger className="min-w-32">
                    <SelectValue placeholder="Operation" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      <SelectLabel>Operation</SelectLabel>
                      <SelectItem value="ALL">
                        <span>ALL</span>
                      </SelectItem>
                      <SelectItem value="DEPOSIT">
                        <span>Deposit</span>
                      </SelectItem>
                      <SelectItem value="WITHDRAW">
                        <span>Withdraw</span>
                      </SelectItem>
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </div>
              <div className="w-full sm:max-w-32">
                <Select
                  onValueChange={(val) =>
                    setOperations((o) => {
                      return {
                        ...o,
                        query: {
                          ...o.query,
                          status: val,
                        } as OperationQuery,
                      }
                    })
                  }
                  defaultValue={operations.query.status}
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
                    setOperations((o) => {
                      return {
                        ...o,
                        query: {
                          ...o.query,
                          order: val,
                        } as OperationQuery,
                      }
                    })
                  }
                  defaultValue={operations.query.order}
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
                  <TableCell>
                    {parseInt(operation.fee) / BASE_LAMPORTS}
                  </TableCell>
                  <TableCell>{operation.status}</TableCell>
                  <TableCell>
                    {new Date(operation.createdAt).toLocaleDateString()}{' '}
                    {new Date(operation.createdAt).toLocaleTimeString()}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          <Pagination className="mt-6 text-white">
            <PaginationContent>{renderPaginationItems()}</PaginationContent>
          </Pagination>
        </CardContent>
      </Card>
    </TabsContent>
  )
}

export default Operation
