import React from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import Operation from '@/components/history/Operation'

const Page = () => {
  return (
    <main>
      <Tabs defaultValue="operation" className="w-[300px]">
        <TabsList className="mt-2 grid w-full grid-cols-2">
          <TabsTrigger value="operation">operation</TabsTrigger>
          <TabsTrigger value="transaction">transaction</TabsTrigger>
        </TabsList>
        <Operation />
        <TabsContent value="transaction"></TabsContent>
      </Tabs>
    </main>
  )
}

export default Page
