import { NextResponse } from 'next/server';
import { GoogleGenAI } from '@google/genai';
import { supabaseAdmin } from '@/lib/supabase';

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export async function POST(req) {
  try {
    const { messages, userContact = null } = await req.json();

    if (userContact && (userContact.email || userContact.phone)) {
      await supabaseAdmin.from('leads').insert([{
        name: userContact.name || 'Anonymous Visitor',
        email: userContact.email || 'not_provided@lead.com',
        phone: userContact.phone || null,
        website: userContact.website || null,
        interest: userContact.interest || 'General Growth & SEO Audit',
        chat_summary: (messages || []).map(m => `${m.role}: ${m.content}`).join('\n').slice(0, 1500)
      }]);
    }

    const systemInstruction = `You are 'Flywheel AI', the enterprise sales & growth strategist. Be concise, punchy, and request contact for a free competitor dossier.`;
    const formattedHistory = (messages || []).map(m => `${m.role.toUpperCase()}: ${m.content}`).join('\n');

    const response = await ai.models.generateContent({
      model: 'gemini-1.5-flash',
      contents: `${systemInstruction}\n\nChat History:\n${formattedHistory}\n\nASSISTANT:`
    });

    return NextResponse.json({ success: true, reply: response.text?.trim?.() ?? '' });
  } catch (error) {
    console.error('Chat error', error?.message || error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
