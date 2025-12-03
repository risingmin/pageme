import OpenAI from 'openai';
import { writeFile, mkdir } from 'fs/promises';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Ollama configuration
const OLLAMA_BASE_URL = process.env.OLLAMA_BASE_URL || 'http://localhost:11434/v1';
const OLLAMA_MODEL = process.env.OLLAMA_MODEL || 'gemma3:12b';

// Initialize OpenAI-compatible client for Ollama
const llm = new OpenAI({
  apiKey: 'ollama', // Ollama doesn't need a real key
  baseURL: OLLAMA_BASE_URL,
});

// PageMe System Prompt
const PAGEME_SYSTEM_PROMPT = `You are a talented web designer creating a personal portfolio website from a resume. Generate a complete, visually impressive single-page HTML website.

REQUIREMENTS:
- Use HTML with TailwindCSS via CDN (include <script src="https://cdn.tailwindcss.com"></script>)
- Create a modern, visually appealing design with personality - NOT a boring template.
- Use creative color schemes (gradients, accent colors), but VISUALLY AESTHETIC AND PLEASING.
- It should have interesting typography, and visual hierarchy
- But readability comes first: especially for header, where name should be in adequate contrast to the background for good visibility.
- Include subtle animations or hover effects using Tailwind classes
- Add visual elements like colored section backgrounds, cards with shadows, skill badges/tags, timeline layouts for experience
- Structure: Hero section with name → About/Summary → Skills (as styled tags/badges) → Experience (timeline or cards) → Projects (if any) → Education → Contact

DESIGN INSPIRATION:
- Use a bold hero section with a gradient or colored background
- Display skills as colorful pill-shaped badges
- Show work experience as a vertical timeline or elegant cards
- Add subtle hover effects on interactive elements
- Use proper whitespace and visual breathing room

OUTPUT: Return ONLY the complete index.html file inside a single html code block. No explanations, no other files.`;

/**
 * Extract HTML from Llama's response (looks for ```html code block)
 */
function extractHtmlFromResponse(response) {
  // Try to find HTML code block
  const htmlMatch = response.match(/```html\n([\s\S]*?)```/);
  if (htmlMatch) {
    return htmlMatch[1].trim();
  }
  
  // Try to find any code block that looks like HTML
  const codeBlockMatch = response.match(/```\n?(<!DOCTYPE[\s\S]*?)```/i);
  if (codeBlockMatch) {
    return codeBlockMatch[1].trim();
  }
  
  // If no code block, check if the response itself is HTML
  if (response.trim().startsWith('<!DOCTYPE') || response.trim().startsWith('<html')) {
    return response.trim();
  }
  
  return null;
}

/**
 * Save generated HTML to the file system
 */
async function saveGeneratedSite(siteId, htmlContent) {
  const sitesDir = join(__dirname, '..', '..', 'generated-sites', siteId);
  const filePath = join(sitesDir, 'index.html');
  
  // Create directory if it doesn't exist
  await mkdir(sitesDir, { recursive: true });
  
  // Write the HTML file
  await writeFile(filePath, htmlContent, 'utf-8');
  
  console.log(`💾 Site saved to: ${filePath}`);
  
  return filePath;
}

/**
 * Escape HTML special characters
 */
function escapeHtml(text) {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

/**
 * Generate a website from resume text using Llama (Ollama, Together AI, etc.)
 */
export async function generateWebsiteFromResume(resumeText, siteId) {
  try {
    console.log(`🤖 Calling Ollama (model: ${OLLAMA_MODEL}) to generate website...`);
    console.log(`📄 Resume text (first 500 chars): ${resumeText.substring(0, 500)}`);
    console.log(`📄 Resume text length: ${resumeText.length} characters`);
    
    const response = await llm.chat.completions.create({
      model: OLLAMA_MODEL,
      messages: [
        { role: 'system', content: PAGEME_SYSTEM_PROMPT },
        { role: 'user', content: `Here is my resume:\n\n${resumeText}\n\nPlease generate a personal portfolio website based on this resume.` },
      ],
      max_tokens: 8192,
      temperature: 0.7,
    });

    const generatedContent = response.choices[0]?.message?.content;
    
    if (!generatedContent) {
      throw new Error('No content generated from LLM');
    }

    console.log('✅ LLM response received');
    
    // Extract HTML from the response
    const htmlContent = extractHtmlFromResponse(generatedContent);
    
    if (!htmlContent) {
      console.error('Failed to extract HTML from response:', generatedContent.substring(0, 500));
      throw new Error('Could not extract HTML from LLM response');
    }

    // Save the HTML file
    await saveGeneratedSite(siteId, htmlContent);
    
    return {
      success: true,
      htmlContent: htmlContent,
      siteUrl: `/sites/${siteId}/index.html`,
    };
  } catch (error) {
    console.error('Llama API error:', error);
    throw error;
  }
}

/**
 * Mock website generation for testing without API keys
 */
async function generateMockWebsite(resumeText, siteId) {
  // Extract name from resume (simple heuristic - first line or first capitalized words)
  const lines = resumeText.trim().split('\n');
  const name = lines[0]?.trim() || 'Portfolio Site';
  
  // Create a more realistic mock HTML
  const mockHtml = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${escapeHtml(name)} - Portfolio</title>
    <script src="https://cdn.tailwindcss.com"></script>
</head>
<body class="bg-gray-50 text-gray-800 min-h-screen">
    <div class="max-w-4xl mx-auto px-4 py-12">
        <!-- Header -->
        <header class="text-center mb-12">
            <h1 class="text-4xl font-bold text-gray-900 mb-4">${escapeHtml(name)}</h1>
            <p class="text-lg text-gray-600">Personal Portfolio</p>
        </header>
        
        <!-- About Section -->
        <section class="bg-white rounded-2xl shadow-sm p-8 mb-8">
            <h2 class="text-2xl font-semibold mb-4 text-gray-900">About</h2>
            <div class="text-gray-600 whitespace-pre-wrap leading-relaxed">${escapeHtml(resumeText)}</div>
        </section>
        
        <!-- Footer -->
        <footer class="text-center text-gray-500 text-sm py-8">
            <p>Generated by PageMe</p>
            <p class="mt-2 text-xs">This is a preview. Add your Llama API key for full AI-generated sites.</p>
        </footer>
    </div>
</body>
</html>`;

  // Save the mock site
  await saveGeneratedSite(siteId, mockHtml);

  return {
    success: true,
    htmlContent: mockHtml,
    siteUrl: `/sites/${siteId}/index.html`,
  };
}
