import idl from './config/idl.json'

interface Format2 {
  address: string
  metadata: Metadata
  instructions: Instruction[]
  accounts: Account[]
  types: Type[]
}

interface Metadata {
  name: string
  version: string
  spec: string
  description: string
}

interface Instruction {
  name: string
  discriminator: number[]
  accounts: InstructionAccount[]
  args: Arg[]
  returns?: string
}

interface InstructionAccount {
  name: string
  writable: boolean
  signer: boolean
  address?: string
}

interface Arg {
  name: string
  type: string
}

interface Account {
  name: string
  discriminator: number[]
}

interface Type {
  name: string
  type: TypeDefinition
}

interface TypeDefinition {
  kind: string
  fields: TypeField[]
}

interface TypeField {
  name: string
  type: string | TypeFieldVector
}

interface TypeFieldVector {
  vec: string
}

export const convertFormat2ToFormat1 = () => {
  const format2 = idl
  const format1 = {
    version: format2.metadata.version,
    name: format2.metadata.name,
    instructions: format2.instructions.map((instr) => ({
      name: instr.name,
      accounts: instr.accounts.map((acc) => ({
        name: acc.name,
        isMut: acc.writable,
        isSigner: acc.signer,
      })),
      args: instr.args,
      returns: instr.returns,
    })),
    accounts: format2.types.map((type) => ({
      name: type.name,
      type: {
        kind: type.type.kind,
        fields: type.type.fields,
      },
    })),
    metadata: {
      address: format2.address,
    },
  }

  return format1
}
