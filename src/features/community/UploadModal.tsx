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
import { Plus, Loader2 } from 'lucide-react';
import { uploadImage } from '@/lib/upload';
import { createPost } from '@/lib/community';
import { PostTags } from '@/types/database';
import { useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';

interface UploadFormData {
  description: string;
  season: string;
  style: string;
  brand: string;
  category: string;
}

const SEASONS = ['Spring', 'Summer', 'Fall', 'Winter'];
const STYLES = ['Casual', 'Minimal', 'Romantic', 'Trendy', 'Classic', 'Street'];
const BRANDS = ['ZARA', 'Musinsa', 'H&M', 'Uniqlo', 'Ably', 'Miss Nelly', 'Hugo Boss'];
const CATEGORIES = ['Top', 'Bottom', 'Outer', 'Dress', 'Shoes', 'Accessories'];

export function UploadModal() {
  const [open, setOpen] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { register, handleSubmit, reset, control } = useForm<UploadFormData>({
    defaultValues: {
      description: '',
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
      alert('Please select an image');
      return;
    }

    // 👇 여기를 이렇게 바꿔서 실제 유저 확인 👇
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      alert("로그인이 필요합니다!");
      // 로그인 페이지로 보내버리기
      window.location.href = '/login';
      return;
    }

    const userId = user.id; // 진짜 유저 ID 사용
    // 👆 여기까지 수정 👆

    setIsLoading(true);
    try {
      // 1. R2에 이미지 업로드
      const imageUrl = await uploadImage(imageFile);

      // 2. 태그 객체 생성
      const tags: PostTags = {
        season: data.season ? [data.season] : [],
        style: data.style ? [data.style] : [],
        brand: data.brand ? [data.brand] : [],
        category: data.category ? [data.category] : [],
      };

      // 3. Supabase에 포스트 생성
      await createPost(
        {
          imageUrl,
          description: data.description,
          tags,
        },
        userId
      );

      // 4. Query 재실행
      queryClient.invalidateQueries({ queryKey: ['style-posts'] });

      // 5. 모달 닫기 및 폼 초기화
      setOpen(false);
      reset();
      setImageFile(null);
      setImagePreview(null);
      alert('Post created successfully!');
    } catch (error) {
      console.error('Upload error:', error);
      alert('Failed to upload post. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          size="lg"
          className="fixed bottom-24 right-4 md:bottom-auto md:relative rounded-full w-14 h-14 p-0 md:w-auto md:h-auto md:px-4 md:py-2 flex items-center justify-center"
        >
          <Plus className="w-6 h-6" />
          <span className="hidden md:inline ml-2">Create Post</span>
        </Button>
      </DialogTrigger>

      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create New Post</DialogTitle>
          <DialogDescription>
            Share your outfit with the community. Add a photo, description, and tags.
          </DialogDescription>
        </DialogHeader>

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
                    {SEASONS.map((season) => (
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
                    {STYLES.map((style) => (
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
                    {BRANDS.map((brand) => (
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
                    {CATEGORIES.map((category) => (
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
