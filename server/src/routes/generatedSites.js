import express from 'express';
import multer from 'multer';
import { authenticate } from '../middleware/auth.js';
import GeneratedSite from '../models/GeneratedSite.js';
import { generateWebsiteFromResume } from '../services/aiService.js';

const router = express.Router();

// Configure multer for file uploads
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'text/plain' || file.originalname.endsWith('.txt')) {
      cb(null, true);
    } else {
      cb(new Error('Only .txt files are allowed'));
    }
  },
});

// All routes require authentication
router.use(authenticate);

// GET /api/generated-sites - List all sites for user
router.get('/', async (req, res) => {
  try {
    const sites = await GeneratedSite.find({ user: req.user._id })
      .sort({ createdAt: -1 });
    res.json(sites);
  } catch (error) {
    console.error('Error fetching sites:', error);
    res.status(500).json({ message: 'Failed to fetch sites' });
  }
});

// GET /api/generated-sites/:id - Get single site
router.get('/:id', async (req, res) => {
  try {
    const site = await GeneratedSite.findOne({
      _id: req.params.id,
      user: req.user._id,
    });

    if (!site) {
      return res.status(404).json({ message: 'Site not found' });
    }

    res.json(site);
  } catch (error) {
    console.error('Error fetching site:', error);
    res.status(500).json({ message: 'Failed to fetch site' });
  }
});

// POST /api/generated-sites - Create new site
router.post('/', upload.single('resumeFile'), async (req, res) => {
  try {
    let resumeText = req.body.resumeText;

    // If file was uploaded, use its content
    if (req.file) {
      resumeText = req.file.buffer.toString('utf-8');
    }

    if (!resumeText || resumeText.trim().length === 0) {
      return res.status(400).json({ message: 'Resume text is required' });
    }

    // Create site record with pending status
    const site = new GeneratedSite({
      user: req.user._id,
      title: req.body.title || 'My Portfolio Site',
      resumeText: resumeText.trim(),
      status: 'processing',
    });
    await site.save();

    // Start async generation process
    generateSiteAsync(site._id, resumeText.trim());

    res.status(201).json(site);
  } catch (error) {
    console.error('Error creating site:', error);
    res.status(500).json({ message: 'Failed to create site' });
  }
});

// Async function to generate site (runs in background)
async function generateSiteAsync(siteId, resumeText) {
  try {
    const site = await GeneratedSite.findById(siteId);
    if (!site) return;

    // Generate HTML from resume using Llama and save to file
    const generation = await generateWebsiteFromResume(resumeText, siteId.toString());

    if (!generation.success) {
      site.status = 'failed';
      site.errorMessage = 'Failed to generate website content';
      await site.save();
      return;
    }

    // Save the generated HTML content and URL
    site.generatedPrompt = generation.htmlContent;
    site.siteUrl = generation.siteUrl;
    site.status = 'completed';

    await site.save();
    console.log(`✅ Site ${siteId} generation completed: ${site.status}`);
  } catch (error) {
    console.error(`❌ Site ${siteId} generation failed:`, error);
    try {
      await GeneratedSite.findByIdAndUpdate(siteId, {
        status: 'failed',
        errorMessage: error.message || 'Unknown error occurred',
      });
    } catch (updateError) {
      console.error('Failed to update site status:', updateError);
    }
  }
}

// PUT /api/generated-sites/:id - Update site
router.put('/:id', async (req, res) => {
  try {
    const { title, description } = req.body;

    const site = await GeneratedSite.findOneAndUpdate(
      { _id: req.params.id, user: req.user._id },
      { title, description },
      { new: true }
    );

    if (!site) {
      return res.status(404).json({ message: 'Site not found' });
    }

    res.json(site);
  } catch (error) {
    console.error('Error updating site:', error);
    res.status(500).json({ message: 'Failed to update site' });
  }
});

// DELETE /api/generated-sites/:id - Delete site
router.delete('/:id', async (req, res) => {
  try {
    const site = await GeneratedSite.findOneAndDelete({
      _id: req.params.id,
      user: req.user._id,
    });

    if (!site) {
      return res.status(404).json({ message: 'Site not found' });
    }

    res.json({ message: 'Site deleted successfully' });
  } catch (error) {
    console.error('Error deleting site:', error);
    res.status(500).json({ message: 'Failed to delete site' });
  }
});

export default router;
