'use client';

import React, { useState, useRef } from 'react';
import { X, Paperclip, Send } from 'lucide-react';
import { useAuth } from '@clerk/nextjs';
import { useCreatePost } from '@/lib/hooks/usePosts';
import { useToast } from '@/components/common/Toast';

const POST_TYPES = [
  { value: 'COLLABORATION_REQUEST', label: 'Collaboration' },
  { value: 'HELP_REQUEST', label: 'Help Request' },
  { value: 'TESTING_REQUEST', label: 'Testing' },
  { value: 'OPEN_SOURCE_CONTRIBUTION', label: 'Open Source' },
  { value: 'STARTUP_IDEA', label: 'Startup Idea' },
  { value: 'TECHNICAL_DISCUSSION', label: 'Discussion' },
];

const STAGES = ['Idea', 'Planning', 'In Progress', 'Testing', 'Launched'];
const stageToStatus: Record<string, string> = {
  Idea: 'IDEATION', Planning: 'PLANNING', 'In Progress': 'IN_PROGRESS',
  Testing: 'BETA', Launched: 'COMPLETED',
};

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export function NewPostModal({ onClose }: { onClose: () => void }) {
  const createPost = useCreatePost();
  const fileRef = useRef<HTMLInputElement>(null);
  const toast = useToast();
  const { getToken } = useAuth();

  const [form, setForm] = useState({
    title: '', description: '', type: 'COLLABORATION_REQUEST',
    status: 'IDEATION', visibility: 'PUBLIC', teamSize: '', repositoryUrl: '', deadline: '',
  });
  const [skills, setSkills] = useState<string[]>([]);
  const [skillInput, setSkillInput] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');
  const [attachedFiles, setAttachedFiles] = useState<File[]>([]);
  const [uploading, setUploading] = useState(false);

  const set = (k: string, v: string) => setForm((p) => ({ ...p, [k]: v }));

  const addSkill = () => {
    if (skillInput.trim() && !skills.includes(skillInput.trim())) {
      setSkills((p) => [...p, skillInput.trim()]);
      setSkillInput('');
    }
  };

  const addTag = () => {
    if (tagInput.trim() && !tags.includes(tagInput.trim())) {
      setTags((p) => [...p, tagInput.trim()]);
      setTagInput('');
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    setAttachedFiles((prev) => [...prev, ...files].slice(0, 5));
    // Reset input so same file can be re-selected
    e.target.value = '';
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setUploading(true);

    const payload: any = {
      title: form.title,
      description: form.description,
      type: form.type,
      status: form.status,
      visibility: form.visibility,
      tags,
    };
    if (form.teamSize) payload.teamSize = parseInt(form.teamSize);
    if (form.repositoryUrl) payload.repositoryUrl = form.repositoryUrl;
    if (form.deadline) payload.deadline = new Date(form.deadline).toISOString();

    if (attachedFiles.length > 0) {
      try {
        const formData = new FormData();
        attachedFiles.forEach((f) => formData.append('files', f));

        const token = await getToken();
        const headers: Record<string, string> = {};
        if (token) headers.Authorization = `Bearer ${token}`;

        const res = await fetch(`${API_URL}/uploads`, { method: 'POST', body: formData, headers });
        if (res.ok) {
          const data = await res.json();
          payload.attachments = data.files;
        } else {
          toast('Upload failed. Please try again.', 'error');
          setUploading(false);
          return;
        }
      } catch {
        toast('Upload failed. Please check your connection.', 'error');
        setUploading(false);
        return;
      }
    }

    try {
      await createPost.mutateAsync(payload);
      toast('Post published successfully!');
      onClose();
    } catch {
      toast('Failed to publish post. Please try again.', 'error');
    } finally {
      setUploading(false);
    }
  };

  const isSubmitting = createPost.isPending || uploading;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
      <div className="bg-card border border-border rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-border">
          <h2 className="text-xl font-bold">Create New Post</h2>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* Type */}
          <div>
            <label className="block text-sm font-medium mb-1.5">Post Type</label>
            <select value={form.type} onChange={(e) => set('type', e.target.value)}
              className="w-full bg-input border border-border rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-primary">
              {POST_TYPES.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
            </select>
          </div>

          {/* Title */}
          <div>
            <label className="block text-sm font-medium mb-1.5">Title</label>
            <input required value={form.title} onChange={(e) => set('title', e.target.value)}
              placeholder="What are you working on?"
              className="w-full bg-input border border-border rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-primary" />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium mb-1.5">Description</label>
            <textarea required rows={4} value={form.description} onChange={(e) => set('description', e.target.value)}
              placeholder="Describe your project, what help you need..."
              className="w-full bg-input border border-border rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-primary resize-none" />
          </div>

          {/* Skills */}
          <div>
            <label className="block text-sm font-medium mb-1.5">Required Skills</label>
            <div className="flex gap-2">
              <input value={skillInput} onChange={(e) => setSkillInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addSkill())}
                placeholder="Add a skill..."
                className="flex-1 bg-input border border-border rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-primary" />
              <button type="button" onClick={addSkill} className="px-4 py-2 bg-border hover:bg-border/80 rounded-lg text-sm font-medium">Add</button>
            </div>
            {skills.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {skills.map((s) => (
                  <span key={s} className="flex items-center gap-1 bg-primary/10 text-primary text-xs px-3 py-1 rounded-full">
                    {s}
                    <button type="button" onClick={() => setSkills((p) => p.filter((x) => x !== s))}><X className="w-3 h-3" /></button>
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Tags */}
          <div>
            <label className="block text-sm font-medium mb-1.5">Tags</label>
            <div className="flex gap-2">
              <input value={tagInput} onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                placeholder="Add a tag..."
                className="flex-1 bg-input border border-border rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-primary" />
              <button type="button" onClick={addTag} className="px-4 py-2 bg-border hover:bg-border/80 rounded-lg text-sm font-medium">Add</button>
            </div>
            {tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {tags.map((t) => (
                  <span key={t} className="flex items-center gap-1 bg-border text-foreground text-xs px-3 py-1 rounded-full">
                    {t}
                    <button type="button" onClick={() => setTags((p) => p.filter((x) => x !== t))}><X className="w-3 h-3" /></button>
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Stage + Team Size */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1.5">Project Stage</label>
              <select
                value={Object.entries(stageToStatus).find(([, v]) => v === form.status)?.[0] ?? 'Idea'}
                onChange={(e) => set('status', stageToStatus[e.target.value])}
                className="w-full bg-input border border-border rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-primary">
                {STAGES.map((s) => <option key={s}>{s}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5">Team Size</label>
              <input type="number" min="1" value={form.teamSize} onChange={(e) => set('teamSize', e.target.value)}
                placeholder="e.g. 3"
                className="w-full bg-input border border-border rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-primary" />
            </div>
          </div>

          {/* GitHub Repo */}
          <div>
            <label className="block text-sm font-medium mb-1.5">GitHub Repo</label>
            <input value={form.repositoryUrl} onChange={(e) => set('repositoryUrl', e.target.value)}
              placeholder="https://github.com/..."
              className="w-full bg-input border border-border rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-primary" />
          </div>

          {/* Deadline */}
          <div>
            <label className="block text-sm font-medium mb-1.5">Deadline</label>
            <input type="date" value={form.deadline} onChange={(e) => set('deadline', e.target.value)}
              className="w-full bg-input border border-border rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-primary" />
          </div>

          {/* Attachments */}
          <div>
            <label className="block text-sm font-medium mb-1.5">Attachments (PDFs, ZIPs, design mocks, screenshots)</label>
            <div onClick={() => fileRef.current?.click()}
              className="border border-dashed border-border rounded-xl p-8 text-center cursor-pointer hover:border-primary/50 transition-colors">
              <Paperclip className="w-6 h-6 mx-auto mb-2 text-muted-foreground" />
              <p className="text-sm">
                <span className="text-primary font-medium">Click to upload</span>
                <span className="text-muted-foreground"> or drag & drop</span>
              </p>
              <p className="text-xs text-muted-foreground mt-1">PDF, ZIP, images, design files · max 20MB each · up to 5 files</p>
              <input ref={fileRef} type="file" multiple className="hidden"
                accept=".pdf,.zip,.png,.jpg,.jpeg,.gif,.webp,.sketch" onChange={handleFileChange} />
            </div>
            {attachedFiles.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {attachedFiles.map((f, i) => (
                  <span key={i} className="flex items-center gap-1.5 text-xs px-3 py-1 rounded-full bg-border/60 text-foreground">
                    <Paperclip className="w-3 h-3" />{f.name}
                    <button type="button" onClick={() => setAttachedFiles((p) => p.filter((_, j) => j !== i))}>
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Submit */}
          <button type="submit" disabled={isSubmitting || !form.title || !form.description}
            className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-primary to-secondary text-white font-semibold py-3 rounded-xl disabled:opacity-50 transition-opacity">
            {isSubmitting ? (uploading && attachedFiles.length > 0 ? 'Uploading...' : 'Publishing...') : 'Publish Post'}
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
}
