import mongoose from 'mongoose';

const generatedSiteSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    title: {
      type: String,
      default: 'My Portfolio Site',
    },
    status: {
      type: String,
      enum: ['pending', 'processing', 'completed', 'failed'],
      default: 'pending',
    },
    resumeText: {
      type: String,
      required: true,
    },
    generatedPrompt: {
      type: String,
    },
    siteUrl: {
      type: String,
    },
    description: {
      type: String,
    },
    errorMessage: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

// Virtual for id
generatedSiteSchema.virtual('id').get(function () {
  return this._id.toHexString();
});

generatedSiteSchema.set('toJSON', {
  virtuals: true,
  transform: (doc, ret) => {
    delete ret._id;
    delete ret.__v;
    return ret;
  },
});

const GeneratedSite = mongoose.model('GeneratedSite', generatedSiteSchema);

export default GeneratedSite;
