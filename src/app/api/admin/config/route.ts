
import { NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';

const configPath = path.resolve(process.cwd(), 'src/lib/config.json');

// Ensure the config file exists on startup if it doesn't
async function ensureConfigFile() {
    try {
        await fs.access(configPath);
    } catch (error) {
        await fs.writeFile(configPath, JSON.stringify({ baseUrl: "https://hdhub4u.cologne" }, null, 2), 'utf8');
    }
}

ensureConfigFile();


export async function GET() {
  try {
    const fileContents = await fs.readFile(configPath, 'utf8');
    const config = JSON.parse(fileContents);
    return NextResponse.json(config);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to read configuration' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const { baseUrl } = await request.json();
    if (!baseUrl || typeof baseUrl !== 'string') {
      return NextResponse.json({ error: 'Invalid baseUrl provided' }, { status: 400 });
    }

    const fileContents = await fs.readFile(configPath, 'utf8');
    const config = JSON.parse(fileContents);
    config.baseUrl = baseUrl;

    await fs.writeFile(configPath, JSON.stringify(config, null, 2), 'utf8');

    return NextResponse.json(config);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update configuration' }, { status: 500 });
  }
}
