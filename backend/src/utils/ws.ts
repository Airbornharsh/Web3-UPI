export const parseWsStringToObject = async (data: string) => {
  try {
    const parsedData = JSON.parse(data)

    if (typeof parsedData !== 'object') {
      if (parsedData['type']) {
        if (parsedData['data']) {
          return {
            type: parsedData['type'],
            data: parsedData['data'],
          }
        } else {
          throw new Error('Data not present')
        }
      } else {
        throw new Error('Type not present')
      }
    } else {
      throw new Error('Message Should be Object')
    }
  } catch (e: any) {
    console.log(e)
    return {
      type: WS_MESSAGE_IN,
      data: null,
    }
  }
}

export const parseWsObjectToString = async (data: {
  type: string
  data: any
}) => {
  return JSON.stringify(data)
}

export const WS_MESSAGE_IN = 'message-in'
export const WS_MESSAGE_OUT = 'message-out'
