'use client';

import React, { useState } from 'react';
import { useUser } from '@clerk/nextjs';
import { usePosts, useCreatePost } from '@/lib/hooks/usePosts';
import { PostType, ProjectStatus, PostVisibility } from '@peerforge/api/src/types';

const POST_TYPES = Object.values(PostType);
const PROJECT_STATUSES = Object.values(ProjectStatus);
const VISIBILITIES = Object.values(PostVisibility);

export default function PostsPage() {
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    type: POST_TYPES[0] || 'COLLABORATION_REQUEST',
    status: PROJECT_STATUSES[0] || 'IDEATION',
    visibility: VISIBILITIES[0] || 'PUBLIC',
    tags: '',
    teamSize: 1,
  });
  const [attachments, setAttachments] = useState<File[]>([]);

  const { data: posts, isLoading, error: fetchError } = usePosts();
  const createPostMutation = useCreatePost();
  const { user } = useUser();

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === 'teamSize' ? parseInt(value) : value,
    }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setAttachments((prev) => [...prev, ...files]);
    // Reset the input
    e.target.value = '';
  };

  const removeAttachment = (index: number) => {
    setAttachments((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      await createPostMutation.mutateAsync({
        title: formData.title,
        description: formData.description,
        type: formData.type,
        status: formData.status,
        visibility: formData.visibility,
        tags: formData.tags
          .split(',')
          .map((t) => t.trim())
          .filter((t) => t),
        teamSize: formData.teamSize,
      });

      // Convert files to base64 attachments
      const convertedAttachments = await Promise.all(
        attachments.map(
          (file) =>
            new Promise<{ name: string; url: string; size: number; type: string }>(
              (resolve) => {
                const reader = new FileReader();
                reader.onload = (e) => {
                  resolve({
                    name: file.name,
                    url: e.target?.result as string,
                    size: file.size,
                    type: file.type,
                  });
                };
                reader.readAsDataURL(file);
              }
            )
        )
      );

  const postData: any = {
        title: formData.title,
        description: formData.description,
        type: formData.type,
        status: formData.status,
        visibility: formData.visibility,
        tags: formData.tags
          .split(',')
          .map((t) => t.trim())
          .filter((t) => t),
        teamSize: formData.teamSize,
        userId: user?.id,
      };

      if (convertedAttachments.length > 0) {
        postData.attachments = convertedAttachments;
      }

      await createPostMutation.mutateAsync(postData);

      setFormData({
        title: '',
        description: '',
        type: POST_TYPES[0] || 'COLLABORATION_REQUEST',
        status: PROJECT_STATUSES[0] || 'IDEATION',
        visibility: VISIBILITIES[0] || 'PUBLIC',
        tags: '',
        teamSize: 1,
      });
      setAttachments([]);
      setShowCreateForm(false);
    } catch (error) {
      console.error('Failed to create post:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Header */}
      <div className="border-b border-slate-200 bg-white shadow-sm">
        <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-slate-900">Projects</h1>
              <p className="mt-1 text-slate-600">
                Discover and collaborate on exciting projects
              </p>
            </div>
            <button
              onClick={() => setShowCreateForm(!showCreateForm)}
              className="rounded-lg bg-blue-600 px-6 py-2 font-semibold text-white hover:bg-blue-700 transition-colors"
            >
              {showCreateForm ? 'Cancel' : 'Create Project'}
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Create Form */}
        {showCreateForm && (
          <div className="mb-8 rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="mb-6 text-xl font-bold text-slate-900">
              Create New Project
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div>
                  <label className="block text-sm font-medium text-slate-700">
                    Title
                  </label>
                  <input
                    type="text"
                    name="title"
                    value={formData.title}
                    onChange={handleInputChange}
                    required
                    className="mt-1 block w-full rounded-md border border-slate-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none"
                    placeholder="Project title"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700">
                    Type
                  </label>
                  <select
                    name="type"
                    value={formData.type}
                    onChange={handleInputChange}
                    className="mt-1 block w-full rounded-md border border-slate-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none"
                  >
                    {POST_TYPES.map((type) => (
                      <option key={type} value={type}>
                        {type.replace(/_/g, ' ')}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700">
                    Status
                  </label>
                  <select
                    name="status"
                    value={formData.status}
                    onChange={handleInputChange}
                    className="mt-1 block w-full rounded-md border border-slate-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none"
                  >
                    {PROJECT_STATUSES.map((status) => (
                      <option key={status} value={status}>
                        {status}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700">
                    Visibility
                  </label>
                  <select
                    name="visibility"
                    value={formData.visibility}
                    onChange={handleInputChange}
                    className="mt-1 block w-full rounded-md border border-slate-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none"
                  >
                    {VISIBILITIES.map((visibility) => (
                      <option key={visibility} value={visibility}>
                        {visibility}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700">
                    Team Size
                  </label>
                  <input
                    type="number"
                    name="teamSize"
                    value={formData.teamSize}
                    onChange={handleInputChange}
                    min="1"
                    className="mt-1 block w-full rounded-md border border-slate-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700">
                    Tags (comma-separated)
                  </label>
                  <input
                    type="text"
                    name="tags"
                    value={formData.tags}
                    onChange={handleInputChange}
                    className="mt-1 block w-full rounded-md border border-slate-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none"
                    placeholder="e.g., react, typescript, web"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700">
                  Description
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  required
                  rows={4}
                  className="mt-1 block w-full rounded-md border border-slate-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none"
                  placeholder="Describe your project..."
                />
              </div>

              <div>
                                <label className="block text-sm font-medium text-slate-700">
                                  Attachments (Optional)
                                </label>
                                <div className="mt-1 flex items-center gap-2">
                                  <input
                                    type="file"
                                    multiple
                                    onChange={handleFileChange}
                                    className="block w-full rounded-md border border-slate-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none"
                                  />
                                </div>
                              </div>

                              {attachments.length > 0 && (
                                <div>
                                  <label className="block text-sm font-medium text-slate-700">
                                    Selected Files ({attachments.length})
                                  </label>
                                  <div className="mt-2 space-y-2">
                                    {attachments.map((file, index) => (
                                      <div
                                        key={index}
                                        className="flex items-center justify-between rounded-md border border-slate-200 bg-slate-50 px-3 py-2"
                                      >
                                        <div className="flex items-center gap-2">
                                          <span className="text-sm text-slate-600">
                                            {file.name}
                                          </span>
                                          <span className="text-xs text-slate-500">
                                            ({(file.size / 1024).toFixed(2)} KB)
                                          </span>
                                        </div>
                                        <button
                                          type="button"
                                          onClick={() => removeAttachment(index)}
                                          className="text-red-600 hover:text-red-700 font-medium text-sm"
                                        >
                                          Remove
                                        </button>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              )}

              <div className="flex gap-3 pt-4">
                <button
                  type="submit"
                  disabled={createPostMutation.isPending}
                  className="rounded-lg bg-blue-600 px-6 py-2 font-semibold text-white hover:bg-blue-700 disabled:opacity-50 transition-colors"
                >
                  {createPostMutation.isPending ? 'Creating...' : 'Create Project'}
                </button>
                {createPostMutation.error && (
                  <div className="flex items-center text-red-600">
                    {(createPostMutation.error as Error).message ||
                      'Failed to create project'}
                  </div>
                )}
              </div>
            </form>
          </div>
        )}

        {/* Posts List */}
        <div>
          {isLoading ? (
            <div className="text-center py-12">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <p className="mt-4 text-slate-600">Loading projects...</p>
            </div>
          ) : fetchError ? (
            <div className="rounded-lg border border-red-200 bg-red-50 p-6">
              <p className="text-red-700">
                {fetchError instanceof Error
                  ? fetchError.message
                  : 'Failed to load projects. Make sure the backend API is running.'}
              </p>
            </div>
          ) : !posts || posts.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-slate-600">No projects yet. Create one to get started!</p>
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {posts.map((post) => (
                <div
                  key={post.id}
                  className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm hover:shadow-md transition-shadow"
                >
                  <div className="mb-3 flex items-start justify-between">
                    <h3 className="text-lg font-semibold text-slate-900">
                      {post.title}
                    </h3>
                    <span className="inline-flex items-center rounded-full bg-blue-100 px-3 py-1 text-xs font-medium text-blue-800">
                      {post.type.replace(/_/g, ' ')}
                    </span>
                  </div>

                  <p className="mb-4 line-clamp-3 text-slate-600">
                    {post.description}
                  </p>

                  <div className="mb-4 flex items-center gap-2">
                    {post.author.avatarUrl ? (
                      <img
                        src={post.author.avatarUrl}
                        alt={post.author.username}
                        className="h-8 w-8 rounded-full"
                      />
                    ) : (
                      <div className="h-8 w-8 rounded-full bg-slate-200"></div>
                    )}
                    <span className="text-sm text-slate-600">
                      {post.author.username}
                    </span>
                  </div>

                  <div className="mb-4 space-y-1 text-sm text-slate-600">
                    <div>
                      <span className="font-medium">Status:</span> {post.status}
                    </div>
                    <div>
                      <span className="font-medium">Visibility:</span>{' '}
                      {post.visibility}
                    </div>
                    {post.teamSize && (
                      <div>
                        <span className="font-medium">Team Size:</span>{' '}
                        {post.teamSize}
                      </div>
                    )}
                  </div>

                  {post.tags && post.tags.length > 0 && (
                    <div className="mb-4 flex flex-wrap gap-2">
                      {(typeof post.tags === 'string'
                        ? JSON.parse(post.tags)
                        : post.tags
                      ).map((tag: string) => (
                        <span
                          key={tag}
                          className="inline-flex items-center rounded-full bg-slate-100 px-2 py-1 text-xs text-slate-700"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}

                  <div className="flex gap-4 border-t border-slate-100 pt-4 text-sm text-slate-600">
                    <div>💬 {post._count.comments} comments</div>
                    <div>❤️ {post._count.likes} likes</div>
                  </div>

                  <button className="mt-4 w-full rounded-lg bg-slate-100 px-4 py-2 font-medium text-slate-900 hover:bg-slate-200 transition-colors">
                    View Details
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
