import { NextResponse } from 'next/server';
import { connectMongoDb } from '@/libs/connection';
import Team from '@/models/Team';

export async function POST(req) {
  await connectMongoDb();

  try {
    const { name } = await req.json();

    if (!name || typeof name !== 'string') {
      return NextResponse.json({ error: 'Invalid team name' }, { status: 400 });
    }

    // Check for duplicate team
    const existing = await Team.findOne({ name });
    if (existing) {
      return NextResponse.json({ error: 'Team already exists' }, { status: 409 });
    }

    const team = await Team.create({ name });
    return NextResponse.json(team, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }

//   for fetching teams 
}

export const GET = async (params) => {
    await connectMongoDb()
    try {
        const teams = await Team.find()
        return NextResponse.json(teams)
    } catch (error) {
        console.log("failed to fetch teams:", error);
        return NextResponse.json({ error: 'Error fetching teams'}, {status: 500})
    }
}