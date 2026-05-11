import { prisma } from '@/lib/prisma'

export async function GET() {
  const divisions = await prisma.division.findMany()

  return Response.json({
    success: true,
    data: divisions,
  })
}