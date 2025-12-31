import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';
import pdfParse from 'pdf-parse';

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

// Helper function to extract text from file
async function extractFileContent(fileUrl: string, fileType: string): Promise<string> {
    try {
        // Fetch the file
        const response = await fetch(fileUrl);
        if (!response.ok) {
            throw new Error('Failed to fetch file');
        }

        // Handle different file types
        if (['TXT', 'MD', 'CSV'].includes(fileType.toUpperCase())) {
            // Text files - read directly
            const text = await response.text();
            // Limit to first 50,000 characters to avoid token limits
            return text.substring(0, 50000);
        } else if (fileType.toUpperCase() === 'PDF') {
            // For PDFs, use pdf-parse to extract text
            try {
                const arrayBuffer = await response.arrayBuffer();
                const buffer = Buffer.from(arrayBuffer);
                const data = await pdfParse(buffer);
                // Limit to first 50,000 characters to avoid token limits
                return data.text.substring(0, 50000);
            } catch (pdfError) {
                console.error('PDF parsing error:', pdfError);
                return 'PDF content could not be extracted. Please download and review the file directly.';
            }
        } else {
            // For other file types (DOCX, PPTX, etc.), return a message
            return `File type ${fileType} detected. Content extraction for this file type is limited. Please review the file directly for detailed information.`;
        }
    } catch (error) {
        console.error('Error extracting file content:', error);
        return '';
    }
}

export async function POST(request: NextRequest) {
    try {
        const { action, fileTitle, fileDescription, question, fileUrl, fileType } = await request.json();

        if (!process.env.OPENAI_API_KEY) {
            return NextResponse.json({ 
                error: 'AI service not configured. Please add OPENAI_API_KEY to your environment variables.' 
            }, { status: 500 });
        }

        // Extract file content if file URL is provided
        let fileContent = '';
        if (fileUrl && fileType) {
            fileContent = await extractFileContent(fileUrl, fileType);
        }

        if (action === 'generate_flashcards') {
            const systemPrompt = `You are a helpful study assistant. Generate exactly 5 study flashcards based on the provided document content. Each flashcard should have a clear question and a detailed answer. Make the questions test important concepts from the document.`;

            const userPrompt = `Document Title: "${fileTitle}"
${fileDescription ? `Description: ${fileDescription}` : ''}

${fileContent ? `Document Content:\n${fileContent.substring(0, 30000)}` : 'No file content available. Use the title and description to create general study flashcards.'}

Generate exactly 5 study flashcards based on this document. Each flashcard should test important concepts.

Return your response as a valid JSON array in this exact format:
[{"question": "Question text here", "answer": "Detailed answer text here"}]

Make sure each question tests a different important concept from the document. Return ONLY the JSON array, no markdown code blocks, no explanations.`;

            const completion = await openai.chat.completions.create({
                model: 'gpt-4o-mini',
                messages: [
                    { role: 'system', content: systemPrompt },
                    { role: 'user', content: userPrompt }
                ],
                temperature: 0.7,
            });

            const responseText = completion.choices[0]?.message?.content || '';
            let flashcards;

            try {
                // Try to parse as JSON first
                let parsed;
                try {
                    parsed = JSON.parse(responseText);
                } catch {
                    // If not valid JSON, try to extract JSON array from markdown code blocks
                    const jsonMatch = responseText.match(/```(?:json)?\s*(\[[\s\S]*?\])\s*```/) || responseText.match(/(\[[\s\S]*?\])/);
                    if (jsonMatch) {
                        parsed = JSON.parse(jsonMatch[1]);
                    } else {
                        throw new Error('No JSON found');
                    }
                }
                
                // Handle different response formats
                flashcards = parsed.flashcards || parsed.cards || (Array.isArray(parsed) ? parsed : []);
                
                // Ensure we have valid flashcards
                if (!Array.isArray(flashcards) || flashcards.length === 0) {
                    throw new Error('Invalid flashcard format');
                }
                
                // Take first 5 and ensure proper format
                flashcards = flashcards.slice(0, 5).map((card: any) => ({
                    question: card.question || String(card.q || card.Q || 'Question'),
                    answer: card.answer || String(card.a || card.A || 'Answer')
                }));
            } catch (parseError) {
                console.error('Flashcard parsing error:', parseError);
                // Fallback: create flashcards from title/description
                flashcards = [
                    { question: `What is the main topic of "${fileTitle}"?`, answer: fileDescription || 'Review the document for details.' },
                    { question: `What are key concepts in "${fileTitle}"?`, answer: 'Review the document to identify key concepts.' },
                    { question: `How would you summarize "${fileTitle}"?`, answer: fileDescription || 'This document covers the topic mentioned in the title.' },
                    { question: `What should you remember from "${fileTitle}"?`, answer: 'Focus on main points, definitions, and important details.' },
                    { question: `What questions might be asked about "${fileTitle}"?`, answer: 'Questions typically cover main concepts and applications.' }
                ];
            }

            return NextResponse.json({ flashcards });
        }

        if (action === 'ask_question') {
            const systemPrompt = `You are a helpful study assistant. Answer questions about academic documents clearly and accurately based on the provided content. If the question cannot be answered from the document, say so politely.`;

            const userPrompt = `Document Title: "${fileTitle}"
${fileDescription ? `Description: ${fileDescription}` : ''}

${fileContent ? `Document Content:\n${fileContent}` : 'Limited file content available. Answer based on the title and description provided.'}

User Question: "${question}"

Provide a clear, helpful answer based on the document content. If you cannot answer from the available content, explain what information would be needed.`;

            const completion = await openai.chat.completions.create({
                model: 'gpt-4o-mini',
                messages: [
                    { role: 'system', content: systemPrompt },
                    { role: 'user', content: userPrompt }
                ],
                temperature: 0.7,
            });

            const answer = completion.choices[0]?.message?.content || 'I apologize, but I could not generate a response. Please try again.';
            return NextResponse.json({ answer });
        }

        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });

    } catch (error: any) {
        console.error('AI Error:', error);
        
        // Provide helpful error messages
        if (error.message?.includes('API key')) {
            return NextResponse.json({ 
                error: 'AI service configuration error. Please check your API key.' 
            }, { status: 500 });
        }
        
        return NextResponse.json({ 
            error: error.message || 'AI request failed. Please try again.' 
        }, { status: 500 });
    }
}
