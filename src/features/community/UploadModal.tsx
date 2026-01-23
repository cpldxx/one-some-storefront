import { useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Plus, Loader2, CheckCircle, AlertCircle, X } from 'lucide-react';
import { uploadImage } from '@/lib/upload';
import { createPost } from '@/lib/community';
import { PostTags } from '@/types/database';
import { useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { FILTERS } from '@/constants/filters';

interface UploadFormData {
  description: string;
  gender: string;
  season: string;
  style: string;
  brand: string;
  category: string;
}

interface UploadModalProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export function UploadModal({ open: controlledOpen, onOpenChange }: UploadModalProps) {
  const [internalOpen, setInternalOpen] = useState(false);
  
  // 외부에서 제어하거나 내부 상태 사용
  const open = controlledOpen !== undefined ? controlledOpen : internalOpen;
  const setOpen = onOpenChange || setInternalOpen;
  
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const { register, handleSubmit, reset, control } = useForm<UploadFormData>({
    defaultValues: {
      description: '',
      gender: '',
      season: '',
      style: '',
      brand: '',
      category: '',
    },
  });

  const queryClient = useQueryClient();

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const onSubmit = async (data: UploadFormData) => {
    if (!imageFile) {
      setMessage({ type: 'error', text: 'Please select an image to upload' });
      return;
    }

    // Check if user is logged in
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      setMessage({ type: 'error', text: 'Please login to create a post' });
      setTimeout(() => {
        window.location.href = '/login';
      }, 1500);
      return;
    }

    const userId = user.id; // Use actual user ID
    setMessage(null);
    setIsLoading(true);
    try {
      console.log('[UploadModal] Starting upload...');
      
      // 1. Upload image to R2
      console.log('[UploadModal] Uploading image to R2...');
      const imageUrl = await uploadImage(imageFile);
      console.log('[UploadModal] Image uploaded:', imageUrl);

      // 2. Create tags object
      const tags: PostTags = {
        gender: data.gender ? [data.gender] : [],
        season: data.season ? [data.season] : [],
        style: data.style ? [data.style] : [],
        brand: data.brand ? [data.brand] : [],
        category: data.category ? [data.category] : [],
      };
      console.log('[UploadModal] Tags:', tags);

      // 3. Create post in Supabase
      console.log('[UploadModal] Creating post in Supabase...');
      await createPost(
        {
          imageUrl,
          description: data.description,
          tags,
        },
        userId
      );
      console.log('[UploadModal] Post created successfully!');

      // 4. Refetch queries
      queryClient.invalidateQueries({ queryKey: ['style-posts'] });

      // 5. Show success message
      setMessage({ type: 'success', text: 'Your outfit has been shared!' });
      
      // 6. Close modal and reset form after delay
      setTimeout(() => {
        setOpen(false);
        reset();
        setImageFile(null);
        setImagePreview(null);
        setMessage(null);
      }, 1500);
    } catch (error) {
      console.error('[UploadModal] Upload error:', error);
      setMessage({ type: 'error', text: 'Failed to upload. Please try again.' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      {/* 외부 제어가 아닐 때만 트리거 버튼 표시 */}
      {controlledOpen === undefined && (
        <DialogTrigger asChild>
          <Button
            size="lg"
            className="fixed bottom-24 right-4 md:bottom-auto md:relative rounded-full w-14 h-14 p-0 md:w-auto md:h-auto md:px-4 md:py-2 flex items-center justify-center"
          >
            <Plus className="w-6 h-6" />
            <span className="hidden md:inline ml-2">Create Post</span>
          </Button>
        </DialogTrigger>
      )}

      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create New Post</DialogTitle>
          <DialogDescription>
            Share your outfit with the community. Add a photo, description, and tags.
          </DialogDescription>
        </DialogHeader>

        {/* Success/Error Message */}
        {message && (
          <div className={`p-3 rounded-lg flex items-start gap-2 animate-in fade-in slide-in-from-top-2 duration-200 ${
            message.type === 'success' 
              ? 'bg-green-50 border border-green-200' 
              : 'bg-red-50 border border-red-200'
          }`}>
            {message.type === 'success' ? (
              <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
            ) : (
              <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
            )}
            <p className={`text-sm flex-1 ${
              message.type === 'success' ? 'text-green-600' : 'text-red-600'
            }`}>
              {message.text}
            </p>
            <button 
              type="button" 
              onClick={() => setMessage(null)}
              className={`transition-colors ${
                message.type === 'success' 
                  ? 'text-green-400 hover:text-green-600' 
                  : 'text-red-400 hover:text-red-600'
              }`}
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 pb-4">
          {/* Image Upload */}
          <div>
            <label className="block text-sm font-medium mb-2">Image</label>
            <div className="relative w-full aspect-square bg-gray-100 rounded-lg overflow-hidden border-2 border-dashed border-gray-300">
              {imagePreview ? (
                <>
                  <img
                    src={imagePreview}
                    alt="Preview"
                    className="w-full h-full object-cover"
                  />
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  />
                </>
              ) : (
                <label className="w-full h-full flex items-center justify-center cursor-pointer hover:bg-gray-50 transition-colors">
                  <div className="text-center">
                    <Plus className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                    <p className="text-sm text-gray-600">Click to upload image</p>
                  </div>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="hidden"
                  />
                </label>
              )}
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium mb-2">Description</label>
            <textarea
              placeholder="Describe your outfit..."
              {...register('description', { required: true })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-gray-900 resize-none"
              rows={3}
            />
          </div>

          {/* Gender */}
          <div>
            <label className="block text-sm font-medium mb-2">Gender</label>
            <Controller
              name="gender"
              control={control}
              render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select gender" />
                  </SelectTrigger>
                  <SelectContent>
                    {FILTERS.gender.map((gender) => (
                      <SelectItem key={gender} value={gender}>
                        {gender}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
          </div>

          {/* Season */}
          <div>
            <label className="block text-sm font-medium mb-2">Season</label>
            <Controller
              name="season"
              control={control}
              render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select season" />
                  </SelectTrigger>
                  <SelectContent>
                    {FILTERS.season.map((season) => (
                      <SelectItem key={season} value={season}>
                        {season}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
          </div>

          {/* Style */}
          <div>
            <label className="block text-sm font-medium mb-2">Style</label>
            <Controller
              name="style"
              control={control}
              render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select style" />
                  </SelectTrigger>
                  <SelectContent>
                    {FILTERS.style.map((style) => (
                      <SelectItem key={style} value={style}>
                        {style}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
          </div>

          {/* Brand */}
          <div>
            <label className="block text-sm font-medium mb-2">Brand</label>
            <Controller
              name="brand"
              control={control}
              render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select brand" />
                  </SelectTrigger>
                  <SelectContent>
                    {FILTERS.brand.map((brand) => (
                      <SelectItem key={brand} value={brand}>
                        {brand}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
          </div>

          {/* Category */}
          <div>
            <label className="block text-sm font-medium mb-2">Category</label>
            <Controller
              name="category"
              control={control}
              render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {FILTERS.category.map((category) => (
                      <SelectItem key={category} value={category}>
                        {category}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
          </div>

          {/* Submit Button */}
          <Button
            type="submit"
            className="w-full"
            disabled={isLoading || !imageFile}
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Uploading...
              </>
            ) : (
              'Create Post'
            )}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
