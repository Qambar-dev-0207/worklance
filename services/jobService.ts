import { connectDB, isMockDB } from '@/lib/db';
import Job from '@/models/Job';
import { mockStore } from '@/lib/mockStore';

export interface GetJobsQuery {
  keyword?: string;
  location?: string;
  type?: string;
  postedBy?: string;
}

export interface CreateJobInput {
  title: string;
  company: string;
  companyAbout?: string;
  companyIndustry?: string;
  companySize?: string;
  companyWebsite?: string;
  location: string;
  type?: 'Full-time' | 'Part-time' | 'Contract' | 'Remote' | 'Hybrid';
  salary: string;
  description: string;
  responsibilities?: string | string[];
  requirements?: string | string[];
  benefits?: string | string[];
  tags?: string | string[];
  postedBy: string;
}

export class JobService {
  static async getJobs(query: GetJobsQuery) {
    await connectDB();
    const { keyword, location, type, postedBy } = query;

    if (isMockDB()) {
      let filtered = [...mockStore.jobs];

      if (postedBy) {
        filtered = filtered.filter((j) => j.postedBy === postedBy);
      }

      if (keyword) {
        const k = keyword.toLowerCase();
        filtered = filtered.filter(
          (j) =>
            j.title.toLowerCase().includes(k) ||
            j.company.toLowerCase().includes(k) ||
            j.tags.some((t) => t.toLowerCase().includes(k))
        );
      }

      if (location) {
        filtered = filtered.filter((j) => j.location.toLowerCase().includes(location.toLowerCase()));
      }

      if (type && type !== 'All') {
        filtered = filtered.filter((j) => j.type === type);
      }

      return filtered;
    }

    const filterQuery: any = {};

    if (postedBy) {
      filterQuery.postedBy = postedBy;
    }

    if (keyword) {
      filterQuery.$or = [
        { title: { $regex: keyword, $options: 'i' } },
        { company: { $regex: keyword, $options: 'i' } },
        { tags: { $in: [new RegExp(keyword, 'i')] } },
      ];
    }

    if (location) {
      filterQuery.location = { $regex: location, $options: 'i' };
    }

    if (type && type !== 'All') {
      filterQuery.type = type;
    }

    return await Job.find(filterQuery).sort({ createdAt: -1 });
  }

  static async getJobById(id: string) {
    await connectDB();

    if (isMockDB()) {
      return mockStore.jobs.find((j) => j._id === id || j.id === id) || null;
    }

    return await Job.findById(id);
  }

  static async createJob(input: CreateJobInput) {
    await connectDB();

    const parsedResponsibilities = Array.isArray(input.responsibilities)
      ? input.responsibilities
      : (input.responsibilities || '').split('\n').filter(Boolean);
    const parsedRequirements = Array.isArray(input.requirements)
      ? input.requirements
      : (input.requirements || '').split('\n').filter(Boolean);
    const parsedBenefits = Array.isArray(input.benefits)
      ? input.benefits
      : (input.benefits || '').split('\n').filter(Boolean);
    const parsedTags = Array.isArray(input.tags)
      ? input.tags
      : (input.tags || '').split(',').map((t: string) => t.trim()).filter(Boolean);

    if (isMockDB()) {
      const newJob = {
        _id: 'job_' + Date.now(),
        id: 'job_' + Date.now(),
        title: input.title,
        company: input.company,
        companyAbout: input.companyAbout || '',
        companyIndustry: input.companyIndustry || '',
        companySize: input.companySize || '',
        companyWebsite: input.companyWebsite || '',
        location: input.location,
        type: input.type || 'Full-time',
        salary: input.salary,
        description: input.description,
        responsibilities: parsedResponsibilities,
        requirements: parsedRequirements,
        benefits: parsedBenefits,
        tags: parsedTags,
        postedBy: input.postedBy,
        applicantCount: 0,
        createdAt: new Date().toISOString(),
      };

      mockStore.jobs.unshift(newJob as any);
      return newJob;
    }

    return await Job.create({
      title: input.title,
      company: input.company,
      companyAbout: input.companyAbout || '',
      companyIndustry: input.companyIndustry || '',
      companySize: input.companySize || '',
      companyWebsite: input.companyWebsite || '',
      location: input.location,
      type: input.type || 'Full-time',
      salary: input.salary,
      description: input.description,
      responsibilities: parsedResponsibilities,
      requirements: parsedRequirements,
      benefits: parsedBenefits,
      tags: parsedTags,
      postedBy: input.postedBy,
    });
  }

  static async updateJob(id: string, updates: Partial<CreateJobInput>, userId: string) {
    await connectDB();

    if (isMockDB()) {
      const jobIndex = mockStore.jobs.findIndex((j) => j._id === id || j.id === id);
      if (jobIndex === -1) return null;

      const existing = mockStore.jobs[jobIndex];
      if (existing.postedBy && existing.postedBy !== userId) {
        throw new Error('Unauthorized to edit this job posting');
      }

      const updated = {
        ...existing,
        ...updates,
        updatedAt: new Date().toISOString(),
      };
      mockStore.jobs[jobIndex] = updated as any;
      return updated;
    }

    const job = await Job.findById(id);
    if (!job) return null;

    if (job.postedBy && job.postedBy.toString() !== userId) {
      throw new Error('Unauthorized to edit this job posting');
    }

    Object.assign(job, updates);
    return await job.save();
  }

  static async deleteJob(id: string, userId: string) {
    await connectDB();

    if (isMockDB()) {
      const jobIndex = mockStore.jobs.findIndex((j) => j._id === id || j.id === id);
      if (jobIndex === -1) return false;

      const existing = mockStore.jobs[jobIndex];
      if (existing.postedBy && existing.postedBy !== userId) {
        throw new Error('Unauthorized to delete this job posting');
      }

      mockStore.jobs.splice(jobIndex, 1);
      return true;
    }

    const job = await Job.findById(id);
    if (!job) return false;

    if (job.postedBy && job.postedBy.toString() !== userId) {
      throw new Error('Unauthorized to delete this job posting');
    }

    await Job.findByIdAndDelete(id);
    return true;
  }
}
