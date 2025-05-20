import { useState, useRef, FormEvent, ChangeEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { PhotoIcon, ArrowUpTrayIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { Button } from '../components/Button';
import { createPost } from '../api/posts';

export const CreatePostPage = () => {
  const [image, setImage] = useState<File | null>(null);
  const [caption, setCaption] = useState('');
  const [preview, setPreview] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  const handleImageChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setError('Please select an image file');
      return;
    }

    setImage(file);
    setError('');

    // Create preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (!image) {
      setError('Please select an image to upload');
      return;
    }

    setIsSubmitting(true);
    setError('');

    try {
      const formData = new FormData();
      formData.append('image', image);
      if (caption) formData.append('caption', caption);

      await createPost(formData);
      navigate('/', { replace: true });
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to create post. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const removeImage = () => {
    setImage(null);
    setPreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="max-w-2xl mx-auto py-8 px-4 sm:px-6 lg:py-12">
      <div className="card">
        <h1 className="text-2xl font-bold text-primary-900 dark:text-primary-100 mb-6">
          Create New Post
        </h1>

        {error && (
          <div className="bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-400 p-3 rounded-md mb-4">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Image Upload */}
          <div>
            <label className="block text-sm font-medium text-primary-700 dark:text-primary-300 mb-2">
              Photo
            </label>

            {preview ? (
              <div className="relative rounded-lg overflow-hidden">
                <img
                  src={preview}
                  alt="Preview"
                  className="w-full h-auto max-h-[500px] object-contain bg-primary-100 dark:bg-primary-800"
                />
                <button
                  type="button"
                  onClick={removeImage}
                  className="absolute top-2 right-2 p-1 bg-primary-900/70 dark:bg-primary-900/90 rounded-full text-white hover:bg-primary-800 dark:hover:bg-primary-800"
                  aria-label="Remove image"
                >
                  <XMarkIcon className="h-5 w-5" />
                </button>
              </div>
            ) : (
              <div
                className="border-2 border-dashed border-primary-300 dark:border-primary-700 rounded-lg p-12 text-center cursor-pointer hover:border-primary-400 dark:hover:border-primary-600 transition-colors"
                onClick={() => fileInputRef.current?.click()}
              >
                <PhotoIcon className="mx-auto h-12 w-12 text-primary-500 dark:text-primary-400" />
                <div className="mt-4 flex flex-col items-center">
                  <span className="text-sm font-medium text-primary-700 dark:text-primary-300">
                    Click to upload or drag and drop
                  </span>
                  <span className="mt-1 text-xs text-primary-500 dark:text-primary-400">
                    PNG, JPG, GIF up to 10MB
                  </span>
                </div>
              </div>
            )}

            <input
              type="file"
              ref={fileInputRef}
              accept="image/*"
              onChange={handleImageChange}
              className="hidden"
            />
          </div>

          {/* Caption */}
          <div>
            <label htmlFor="caption" className="block text-sm font-medium text-primary-700 dark:text-primary-300 mb-2">
              Caption
            </label>
            <textarea
              id="caption"
              name="caption"
              rows={4}
              className="form-input"
              placeholder="Write a caption..."
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
            />
          </div>

          {/* Submit Button */}
          <div className="flex justify-end">
            <Button
              type="button"
              variant="secondary"
              className="mr-2"
              onClick={() => navigate(-1)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              icon={<ArrowUpTrayIcon className="h-5 w-5" />}
              isLoading={isSubmitting}
              disabled={!image || isSubmitting}
            >
              Post
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}; 