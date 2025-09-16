// app/api/programs/route.js
import { connectMongoDb } from '@/libs/connection';
// import Programs from '@/models/Programs';
import Program from '@/models/Program';
import { NextResponse } from 'next/server';

export async function POST(req) {
  await connectMongoDb();

  try {
    const { name, category, type } = await req.json();

    // Validation
    if (!name || !category) {
      return NextResponse.json(
        { error: 'Program name and category are required' },
        { status: 400 }
      );
    }

    // Check for duplicate program names (case insensitive)
    const existingProgram = await Program.findOne({
      name: { $regex: new RegExp(`^${name}$`, 'i') },
      category
    });

    if (existingProgram) {
      return NextResponse.json(
        { error: 'A program with this name already exists in the selected category' },
        { status: 409 }
      );
    }

    // Create new program
    const program = await Program.create({ name, category, type });
    return NextResponse.json(
      { message: 'Program created successfully', program },
      { status: 201 }
    );

  } catch (error) {
    console.error('Error creating program:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Optional: GET endpoint to fetch programs
export async function GET() {
  await connectMongoDb();

  try {
    const programs = await Program.find().sort({ createdAt: -1 });
    return NextResponse.json(programs);
  } catch (error) {
    console.error('Error fetching programs:', error);
    return NextResponse.json(
      { error: 'Failed to fetch programs' },
      { status: 500 }
    );
  }
}