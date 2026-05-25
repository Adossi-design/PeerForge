'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Save, LogOut, X, ChevronDown, Camera } from 'lucide-react';
import { useCurrentUser, useUpdateProfile } from '@/lib/hooks/useApi';
import { useClerk } from '@clerk/nextjs';
import { useToast } from '@/components/common/Toast';

const SKILL_LEVELS = ['Beginner', 'Intermediate', 'Advanced', 'Expert'];

function compressImage(file: File): Promise<string> {
  return new Promise((resolve) => {
    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      const MAX = 400;
      const scale = Math.min(MAX / img.width, MAX / img.height, 1);
      const canvas = document.createElement('canvas');
      canvas.width = img.width * scale;
      canvas.height = img.height * scale;
      canvas.getContext('2d')!.drawImage(img, 0, 0, canvas.width, canvas.height);
      URL.revokeObjectURL(url);
      resolve(canvas.toDataURL('image/jpeg', 0.7));
    };
    img.src = url;
  });
}

export default function SettingsPage() {
  const { data: user, isLoading } = useCurrentUser();
  const updateProfile = useUpdateProfile();
  const { signOut } = useClerk();
  const fileRef = useRef<HTMLInputElement>(null);
  const toast = useToast();

  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [skillInput, setSkillInput] = useState('');
  const [interestInput, setInterestInput] = useState('');
  const [skills, setSkills] = useState<string[]>([]);
  const [interests, setInterests] = useState<string[]>([]);

  const [form, setForm] = useState({
    fullName: '', username: '', university: '', country: '', bio: '',
    githubUrl: '', portfolioUrl: '', linkedinUrl: '', skillLevel: 'Intermediate',
  });

  useEffect(() => {
    if (user) {
      setForm({
        fullName: user.fullName ?? '',
        username: user.username ?? '',
        university: user.university ?? '',
        country: user.country ?? '',
        bio: user.bio ?? '',
        githubUrl: user.githubUrl ?? '',
        portfolioUrl: user.portfolioUrl ?? '',
        linkedinUrl: user.linkedinUrl ?? '',
        skillLevel: 'Intermediate',
      });
      setSkills(user.skills ?? []);
      setInterests(user.interests ?? []);
    }
  }, [user]);

  const set = (k: string, v: string) => setForm((p) => ({ ...p, [k]: v }));

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const compressed = await compressImage(file);
      setAvatarPreview(compressed);
    } finally {
      setUploading(false);
    }
  };

  const addSkill = () => {
    const s = skillInput.trim();
    if (s && !skills.includes(s)) setSkills((p) => [...p, s]);
    setSkillInput('');
  };

  const addInterest = () => {
    const i = interestInput.trim();
    if (i && !interests.includes(i)) setInterests((p) => [...p, i]);
    setInterestInput('');
  };

  const handleSave = async () => {
    if (!user?.id) return;
    const { skillLevel, ...formData } = form;
    try {
      await updateProfile.mutateAsync({
        id: user.id,
        data: {
          ...formData,
          skills,
          interests,
          ...(avatarPreview ? { avatarUrl: avatarPreview } : {}),
        },
      });
      toast('Profile saved successfully!');
    } catch {
      toast('Failed to save profile. Please try again.', 'error');
    }
  };

  const avatarSrc = avatarPreview ?? user?.avatarUrl ?? null;
  const initials = user?.fullName
    ? user.fullName.split(' ').map((w) => w[0]).join('').slice(0, 3).toUpperCase()
    : 'U';

  const field = {
    backgroundColor: '#161b22',
    border: '1px solid #2f2f2f',
    color: '#d1d5db',
    borderRadius: '8px',
    padding: '10px 14px',
    fontSize: '14px',
    width: '100%',
    outline: 'none',
  } as React.CSSProperties;

  if (isLoading) return (
    <div className="w-full px-4 sm:px-8 py-8">
      <div className="h-96 rounded-2xl animate-pulse mx-auto" style={{ backgroundColor: '#1a1a1a', maxWidth: '680px' }} />
    </div>
  );

  return (
    <div className="w-full px-4 sm:px-8 py-8">
      <div className="mb-6 mx-auto" style={{ maxWidth: '680px' }}>
        <h1 className="text-2xl font-bold text-white">Settings</h1>
        <p className="text-sm mt-0.5" style={{ color: '#6b7280' }}>Manage your profile and preferences</p>
      </div>

      <div className="card rounded-2xl p-6 mx-auto" style={{ backgroundColor: '#1a1a1a', border: '1px solid #242424', maxWidth: '680px' }}>
        <div className="space-y-5">

          {/* Avatar */}
          <div className="flex items-center gap-4 pb-5" style={{ borderBottom: '1px solid #242424' }}>
            <div className="relative group cursor-pointer flex-shrink-0" onClick={() => fileRef.current?.click()}>
              <div className="w-16 h-16 rounded-full flex items-center justify-center font-bold text-white overflow-hidden"
                style={{ backgroundColor: '#2a2a2a', fontSize: '16px' }}>
                {avatarSrc
                  ? <img src={avatarSrc} alt="avatar" className="w-full h-full object-cover" />
                  : initials}
              </div>
              <div className="absolute inset-0 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                style={{ backgroundColor: 'rgba(0,0,0,0.55)' }}>
                {uploading
                  ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  : <Camera className="w-4 h-4 text-white" />}
              </div>
              <div className="absolute -bottom-0.5 -right-0.5 w-5 h-5 rounded-full flex items-center justify-center"
                style={{ backgroundColor: '#4f46e5' }}>
                <Camera className="w-3 h-3 text-white" />
              </div>
              <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} />
            </div>
            <div>
              <p className="text-sm font-semibold text-white">{user?.fullName ?? 'Your Name'}</p>
              <p className="text-xs mt-0.5" style={{ color: '#6b7280' }}>Click the camera icon to update your profile picture</p>
            </div>
          </div>

          {/* Full Name */}
          <div>
            <label className="block text-sm font-medium text-white mb-1.5">Full Name</label>
            <input value={form.fullName} onChange={(e) => set('fullName', e.target.value)} style={field} placeholder="Your full name" />
          </div>

          {/* Username + Skill Level */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-white mb-1.5">Username</label>
              <input value={form.username} onChange={(e) => set('username', e.target.value)} style={field} />
            </div>
            <div>
              <label className="block text-sm font-medium text-white mb-1.5">Skill Level</label>
              <div className="relative">
                <select value={form.skillLevel} onChange={(e) => set('skillLevel', e.target.value)}
                  style={{ ...field, appearance: 'none', cursor: 'pointer', paddingRight: '36px' }}>
                  {SKILL_LEVELS.map((l) => <option key={l} style={{ backgroundColor: '#1a1a1a' }}>{l}</option>)}
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none" style={{ color: '#6b7280' }} />
              </div>
            </div>
          </div>

          {/* University */}
          <div>
            <label className="block text-sm font-medium text-white mb-1.5">University</label>
            <input value={form.university} onChange={(e) => set('university', e.target.value)} style={field} />
          </div>

          {/* Country */}
          <div>
            <label className="block text-sm font-medium text-white mb-1.5">Country</label>
            <input value={form.country} onChange={(e) => set('country', e.target.value)} style={field} />
          </div>

          {/* Bio */}
          <div>
            <label className="block text-sm font-medium text-white mb-1.5">Bio</label>
            <textarea rows={4} value={form.bio} onChange={(e) => set('bio', e.target.value)}
              style={{ ...field, resize: 'vertical' }} />
          </div>

          {/* Skills */}
          <div>
            <label className="block text-sm font-medium text-white mb-1.5">Skills</label>
            <div className="flex gap-2 mb-2">
              <input value={skillInput} onChange={(e) => setSkillInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addSkill())}
                placeholder="Add a skill..." style={{ ...field, flex: 1 }} />
              <button type="button" onClick={addSkill}
                className="px-5 text-sm font-medium text-white rounded-lg"
                style={{ backgroundColor: '#242424', border: '1px solid #3f3f3f', minWidth: '64px' }}>
                Add
              </button>
            </div>
            {skills.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {skills.map((s) => (
                  <span key={s} className="flex items-center gap-1.5 text-xs px-3 py-1 rounded-full"
                    style={{ backgroundColor: '#1e3a5f', color: '#60a5fa', border: '1px solid #2d5a8e' }}>
                    {s}
                    <button onClick={() => setSkills((p) => p.filter((x) => x !== s))}><X className="w-3 h-3" /></button>
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Interests */}
          <div>
            <label className="block text-sm font-medium text-white mb-1.5">Interests</label>
            <div className="flex gap-2 mb-2">
              <input value={interestInput} onChange={(e) => setInterestInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addInterest())}
                placeholder="Add an interest..." style={{ ...field, flex: 1 }} />
              <button type="button" onClick={addInterest}
                className="px-5 text-sm font-medium text-white rounded-lg"
                style={{ backgroundColor: '#242424', border: '1px solid #3f3f3f', minWidth: '64px' }}>
                Add
              </button>
            </div>
            {interests.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {interests.map((i) => (
                  <span key={i} className="flex items-center gap-1.5 text-xs px-3 py-1 rounded-full"
                    style={{ backgroundColor: '#2d1f5e', color: '#a78bfa', border: '1px solid #4c3a8e' }}>
                    {i}
                    <button onClick={() => setInterests((p) => p.filter((x) => x !== i))}><X className="w-3 h-3" /></button>
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* GitHub URL */}
          <div>
            <label className="block text-sm font-medium text-white mb-1.5">GitHub URL</label>
            <input value={form.githubUrl} onChange={(e) => set('githubUrl', e.target.value)} style={field} />
          </div>

          {/* Portfolio URL */}
          <div>
            <label className="block text-sm font-medium text-white mb-1.5">Portfolio URL</label>
            <input value={form.portfolioUrl} onChange={(e) => set('portfolioUrl', e.target.value)} style={field} />
          </div>

          {/* LinkedIn URL */}
          <div>
            <label className="block text-sm font-medium text-white mb-1.5">LinkedIn URL</label>
            <input value={form.linkedinUrl} onChange={(e) => set('linkedinUrl', e.target.value)} style={field} />
          </div>

          {/* Actions */}
          <div className="flex items-center justify-between pt-4" style={{ borderTop: '1px solid #242424' }}>
            <button onClick={() => signOut()} className="flex items-center gap-2 text-sm" style={{ color: '#ef4444' }}>
              <LogOut className="w-4 h-4" />Sign Out
            </button>
            <button onClick={handleSave} disabled={updateProfile.isPending}
              className="flex items-center gap-2 text-sm font-semibold px-5 py-2.5 rounded-lg disabled:opacity-50"
              style={{ backgroundColor: '#2563eb', color: '#fff' }}>
              <Save className="w-4 h-4" />
              {updateProfile.isPending ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
