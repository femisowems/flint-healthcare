import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { resumeText } = await request.json();
    
    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 1500));

    // Basic mocked parsing logic based on keywords
    const lowerText = resumeText.toLowerCase();
    
    const tags = [];
    if (lowerText.includes('icu') || lowerText.includes('intensive care')) tags.push('ICU');
    if (lowerText.includes('pediatric') || lowerText.includes('peds')) tags.push('Pediatric');
    if (lowerText.includes('surgery') || lowerText.includes('surgical')) tags.push('Surgical');
    if (lowerText.includes('er ') || lowerText.includes('emergency')) tags.push('ER');
    
    // Guess experience simply by looking for numbers near "years"
    const match = lowerText.match(/(\d+)\+?\s*(?:years?|yrs?)/);
    const experience = match ? parseInt(match[1], 10) : Math.floor(Math.random() * 5) + 1;

    return NextResponse.json({
      experience,
      specialization: tags[0] || 'General Nursing',
      tags,
      suggestedStage: 'Screening',
    });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to parse resume' }, { status: 500 });
  }
}
