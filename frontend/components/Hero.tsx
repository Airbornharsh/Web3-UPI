import UpiList from './UpiList'

export const Hero = () => {
  return (
    <div className="text-black pt-10 flex justify-center flex-col items-center gap-2">
      <h1 className="text-xl font-semibold">Scan and Pay</h1>
      <UpiList />
    </div>
  )
}
