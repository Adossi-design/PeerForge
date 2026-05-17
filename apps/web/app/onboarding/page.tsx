'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Zap, ArrowRight, X } from 'lucide-react';
import { useCurrentUser, useUpdateProfile } from '@/lib/hooks/useApi';
import { useToast } from '@/components/common/Toast';

const SUGGESTED_SKILLS = [
  'JavaScript', 'TypeScript', 'Python', 'React', 'Next.js', 'Node.js',
  'NestJS', 'Go', 'Rust', 'Java', 'C++', 'C#', 'Swift', 'Kotlin',
  'Docker', 'Kubernetes', 'AWS', 'PostgreSQL', 'MongoDB', 'Redis',
  'GraphQL', 'REST APIs', 'Machine Learning', 'AI/ML', 'Data Science',
  'Figma', 'UI/UX', 'DevOps', 'Cybersecurity', 'Blockchain',
];

const SUGGESTED_INTERESTS = [
  'Open Source', 'Startups', 'Web Development', 'Mobile Apps', 'Game Dev',
  'AI Research', 'Competitive Programming', 'Hackathons', 'Freelancing',
  'System Design', 'Cloud Computing', 'Embedded Systems',
];

const STEPS = ['Profile', 'Skills', 'Interests'];

const field: React.CSSProperties = {
  backgroundColor: '#161b22',
  border: '1px solid #2f2f2f',
  color: '#d1d5db',
  borderRadius: '8px',
  padding: '10px 14px',
  fontSize: '14px',
  width: '100%',
  outline: 'none',
};

export default function OnboardingPage() {
  const router = useRouter();
  const { data: user } = useCurrentUser();
  const updateProfile = useUpdateProfile();
  const toast = useToast();

  const [step, setStep] = useState(0);
  const [form, setForm] = useState({ fullName: '', username: '', bio: '', university: '', country: '' });
  const [skills, setSkills] = useState<string[]>([]);
  const [interests, setInterests] = useState<string[]>([]);
  const [skillInput, setSkillInput] = useState('');
  const [interestInput, setInterestInput] = useState('');
  const [saving, setSaving] = useState(false);

  React.useEffect(() => {
    if (user) {
      setForm({
        fullName: user.fullName ?? '',
        username: user.username?.startsWith('user_') ? '' : (user.username ?? ''),
        bio: user.bio ?? '',
        university: user.university ?? '',
        country: user.country ?? '',
      });
      setSkills(user.skills ?? []);
      setInterests(user.interests ?? []);
    }
  }, [user]);

  const set = (k: string, v: string) => setForm((p) => ({ ...p, [k]: v }));

  const toggleSkill = (s: string) =>
    setSkills((p) => p.includes(s) ? p.filter((x) => x !== s) : [...p, s]);

  const toggleInterest = (i: string) =>
    setInterests((p) => p.includes(i) ? p.filter((x) => x !== i) : [...p, i]);

  const addCustomSkill = () => {
    const s = skillInput.trim();
    if (s && !skills.includes(s)) setSkills((p) => [...p, s]);
    setSkillInput('');
  };

  const addCustomInterest = () => {
    const i = interestInput.trim();
    if (i && !interests.includes(i)) setInterests((p) => [...p, i]);
    setInterestInput('');
  };

  const handleFinish = async () => {
    if (!user?.id) return;
    setSaving(true);
    try {
      await updateProfile.mutateAsync({
        id: user.id,
        data: { ...form, skills, interests } as any,
      });
      router.replace('/home');
    } catch {
      toast('Failed to save profile. Please try again.', 'error');
    } finally {
      setSaving(false);
    }
  };

  const canNext = step === 0
    ? form.fullName.trim().length > 0 && form.username.trim().length >= 3
    : true;

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12" style={{ backgroundColor: '#0d0d0d' }}>
      <div className="w-full" style={{ maxWidth: '480px' }}>

        {/* Logo */}
        <div className="flex flex-col items-center mb-8">
          <div className="w-12 h-12 rounded-2xl flex items-center justify-center mb-3"
            style={{ background: 'linear-gradient(135deg, #4f46e5, #7c3aed)' }}>
            <Zap className="w-6 h-6 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-white">Welcome to PeerForge</h1>
          <p className="text-sm mt-1" style={{ color: '#6b7280' }}>Let's set up your profile</p>
        </div>

        {/* Step indicators */}
        <div className="flex items-center justify-center gap-2 mb-8">
          {STEPS.map((label, i) => (
            <React.Fragment key={label}>
              <div className="flex items-center gap-1.5">
                <div
                  className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold"
                  style={{
                    backgroundColor: i <= step ? '#4f46e5' : '#1f1f1f',
                    color: i <= step ? '#fff' : '#6b7280',
                  }}
                >
                  {i + 1}
                </div>
                <span className="text-xs font-medium" style={{ color: i === step ? '#d1d5db' : '#6b7280' }}>
                  {label}
                </span>
              </div>
              {i < STEPS.length - 1 && (
                <div className="w-8 h-px" style={{ backgroundColor: i < step ? '#4f46e5' : '#2f2f2f' }} />
              )}
            </React.Fragment>
          ))}
        </div>

        {/* Card */}
        <div className="rounded-2xl p-6" style={{ backgroundColor: '#1a1a1a', border: '1px solid #242424' }}>

          {/* Step 0 — Profile */}
          {step === 0 && (
            <div className="space-y-4">
              <div>
                <h2 className="text-lg font-bold text-white mb-1">Your profile</h2>
                <p className="text-sm mb-4" style={{ color: '#6b7280' }}>This is how others will find and recognize you.</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-white mb-1.5">
                  Full Name <span style={{ color: '#ef4444' }}>*</span>
                </label>
                <input value={form.fullName} onChange={(e) => set('fullName', e.target.value)}
                  style={field} placeholder="Jane Doe" />
              </div>
              <div>
                <label className="block text-sm font-medium text-white mb-1.5">
                  Username <span style={{ color: '#ef4444' }}>*</span>
                </label>
                <input
                  value={form.username}
                  onChange={(e) => set('username', e.target.value.toLowerCase().replace(/\s/g, ''))}
                  style={field} placeholder="janedoe"
                />
                {form.username.length > 0 && form.username.length < 3 && (
                  <p className="text-xs mt-1" style={{ color: '#f87171' }}>At least 3 characters</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-white mb-1.5">University</label>
                <input value={form.university} onChange={(e) => set('university', e.target.value)}
                  style={field} placeholder="MIT, Stanford, etc." />
              </div>
              <div>
                <label className="block text-sm font-medium text-white mb-1.5">Country</label>
                <input value={form.country} onChange={(e) => set('country', e.target.value)}
                  style={field} placeholder="United States" />
              </div>
              <div>
                <label className="block text-sm font-medium text-white mb-1.5">Bio</label>
                <textarea rows={3} value={form.bio} onChange={(e) => set('bio', e.target.value)}
                  style={{ ...field, resize: 'vertical' }}
                  placeholder="Tell others what you're building or interested in..." />
              </div>
            </div>
          )}

          {/* Step 1 — Skills */}
          {step === 1 && (
            <div>
              <h2 className="text-lg font-bold text-white mb-1">Your skills</h2>
              <p className="text-sm mb-4" style={{ color: '#6b7280' }}>Select the technologies and skills you work with.</p>
              <div className="flex gap-2 mb-4">
                <input value={skillInput} onChange={(e) => setSkillInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addCustomSkill())}
                  placeholder="Add a custom skill..." style={{ ...field, flex: 1 }} />
                <button onClick={addCustomSkill}
                  className="px-4 text-sm font-medium text-white rounded-lg"
                  style={{ backgroundColor: '#242424', border: '1px solid #3f3f3f', whiteSpace: 'nowrap' }}>
                  Add
                </button>
              </div>
              {skills.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-4 p-3 rounded-xl"
                  style={{ backgroundColor: '#111111', border: '1px solid #1f1f1f' }}>
                  {skills.map((s) => (
                    <span key={s} className="flex items-center gap-1.5 text-xs px-3 py-1 rounded-full"
                      style={{ backgroundColor: '#1e3a5f', color: '#60a5fa', border: '1px solid #2d5a8e' }}>
                      {s}
                      <button onClick={() => setSkills((p) => p.filter((x) => x !== s))}>
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                </div>
              )}
              <div className="flex flex-wrap gap-2">
                {SUGGESTED_SKILLS.filter((s) => !skills.includes(s)).map((s) => (
                  <button key={s} onClick={() => toggleSkill(s)}
                    className="text-xs px-3 py-1.5 rounded-full transition-colors hover:opacity-80"
                    style={{ backgroundColor: '#1f1f1f', color: '#9ca3af', border: '1px solid #2f2f2f' }}>
                    + {s}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Step 2 — Interests */}
          {step === 2 && (
            <div>
              <h2 className="text-lg font-bold text-white mb-1">Your interests</h2>
              <p className="text-sm mb-4" style={{ color: '#6b7280' }}>What areas are you passionate about?</p>
              <div className="flex gap-2 mb-4">
                <input value={interestInput} onChange={(e) => setInterestInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addCustomInterest())}
                  placeholder="Add a custom interest..." style={{ ...field, flex: 1 }} />
                <button onClick={addCustomInterest}
                  className="px-4 text-sm font-medium text-white rounded-lg"
                  style={{ backgroundColor: '#242424', border: '1px solid #3f3f3f', whiteSpace: 'nowrap' }}>
                  Add
                </button>
              </div>
              {interests.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-4 p-3 rounded-xl"
                  style={{ backgroundColor: '#111111', border: '1px solid #1f1f1f' }}>
                  {interests.map((i) => (
                    <span key={i} className="flex items-center gap-1.5 text-xs px-3 py-1 rounded-full"
                      style={{ backgroundColor: '#2d1f5e', color: '#a78bfa', border: '1px solid #4c3a8e' }}>
                      {i}
                      <button onClick={() => setInterests((p) => p.filter((x) => x !== i))}>
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                </div>
              )}
              <div className="flex flex-wrap gap-2">
                {SUGGESTED_INTERESTS.filter((i) => !interests.includes(i)).map((i) => (
                  <button key={i} onClick={() => toggleInterest(i)}
                    className="text-xs px-3 py-1.5 rounded-full transition-colors hover:opacity-80"
                    style={{ backgroundColor: '#1f1f1f', color: '#9ca3af', border: '1px solid #2f2f2f' }}>
                    + {i}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Navigation */}
          <div className="flex items-center justify-between mt-6 pt-5" style={{ borderTop: '1px solid #242424' }}>
            {step > 0 ? (
              <button onClick={() => setStep((s) => s - 1)}
                className="text-sm font-medium transition-colors hover:text-white"
                style={{ color: '#6b7280' }}>
                Back
              </button>
            ) : (
              <button onClick={() => router.replace('/home')}
                className="text-sm transition-colors hover:text-white"
                style={{ color: '#6b7280' }}>
                Skip for now
              </button>
            )}

            {step < STEPS.length - 1 ? (
              <button
                onClick={() => setStep((s) => s + 1)}
                disabled={!canNext}
                className="flex items-center gap-2 text-sm font-semibold text-white px-5 py-2.5 rounded-lg disabled:opacity-40 transition-opacity hover:opacity-90"
                style={{ background: 'linear-gradient(135deg, #4f46e5, #7c3aed)' }}
              >
                Next <ArrowRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                onClick={handleFinish}
                disabled={saving}
                className="flex items-center gap-2 text-sm font-semibold text-white px-5 py-2.5 rounded-lg disabled:opacity-50 transition-opacity hover:opacity-90"
                style={{ background: 'linear-gradient(135deg, #4f46e5, #7c3aed)' }}
              >
                {saving ? 'Saving…' : 'Finish'} {!saving && <ArrowRight className="w-4 h-4" />}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
