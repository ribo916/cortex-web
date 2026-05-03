import { NextResponse } from 'next/server'

export async function POST() {
  if (process.env.NEXT_PUBLIC_ENABLE_ASK !== 'true') {
    return NextResponse.json({ error: 'Ask feature is not enabled' }, { status: 503 })
  }
  return NextResponse.json({ error: 'Not implemented' }, { status: 501 })
}
