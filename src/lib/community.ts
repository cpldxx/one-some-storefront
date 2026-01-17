// Community/StylePost Data Structure
export interface StylePost {
  id: string;
  imageUrl: string;
  description: string;
  user: {
    id: string;
    name: string;
    profileImage: string;
  };
  likeCount: number;
  isLiked: boolean;
  commentCount: number;
  tags: {
    height?: string;
    weight?: string;
    season?: string[];
    style?: string[];
    brand?: string[];
    category?: string[];
  };
  createdAt: string;
}

// Mock Data Generator
function generateMockStylePosts(): StylePost[] {
  const users = [
    { id: '1', name: '이지은', profileImage: 'https://i.pravatar.cc/150?img=1' },
    { id: '2', name: '박민지', profileImage: 'https://i.pravatar.cc/150?img=2' },
    { id: '3', name: '김수진', profileImage: 'https://i.pravatar.cc/150?img=3' },
    { id: '4', name: '최혜원', profileImage: 'https://i.pravatar.cc/150?img=4' },
    { id: '5', name: '정세라', profileImage: 'https://i.pravatar.cc/150?img=5' },
  ];

  const brands = ['ZARA', '무신사', 'H&M', '유니클로', '에이블리', '미스넬리', '휴고보스'];
  const styles = ['캐주얼', '미니멀', '로맨틱', '트렌디', '클래식', '스트릿'];
  const categories = ['상의', '하의', '아우터', '원피스', '신발'];
  const seasons = ['봄', '여름', '가을', '겨울'];

  const posts: StylePost[] = [];

  for (let i = 1; i <= 20; i++) {
    const randomUser = users[Math.floor(Math.random() * users.length)];
    posts.push({
      id: `post-${i}`,
      imageUrl: `https://picsum.photos/400/500?random=${i}`,
      description: `오늘의 스타일링 #${randomUser.name} #데일리룩 #OOTD`,
      user: randomUser,
      likeCount: Math.floor(Math.random() * 5000) + 100,
      isLiked: Math.random() > 0.7,
      commentCount: Math.floor(Math.random() * 300) + 10,
      tags: {
        height: `${160 + Math.floor(Math.random() * 10)}cm`,
        weight: `${45 + Math.floor(Math.random() * 15)}kg`,
        season: [seasons[Math.floor(Math.random() * seasons.length)]],
        style: [styles[Math.floor(Math.random() * styles.length)]],
        brand: [brands[Math.floor(Math.random() * brands.length)]],
        category: [categories[Math.floor(Math.random() * categories.length)]],
      },
      createdAt: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString(),
    });
  }

  return posts;
}

// Fetch Style Posts (Mock)
export async function fetchStylePosts(limit: number = 50): Promise<StylePost[]> {
  console.log('[Community] Fetching style posts...');
  
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 300));
  
  const posts = generateMockStylePosts();
  console.log(`[Community] Fetched ${posts.length} style posts`);
  
  return posts.slice(0, limit);
}

// Filter Style Posts by Tags
export function filterStylePosts(
  posts: StylePost[],
  filters: {
    season?: string;
    style?: string;
    brand?: string;
    category?: string;
  }
): StylePost[] {
  return posts.filter(post => {
    if (filters.season && !post.tags.season?.includes(filters.season)) return false;
    if (filters.style && !post.tags.style?.includes(filters.style)) return false;
    if (filters.brand && !post.tags.brand?.includes(filters.brand)) return false;
    if (filters.category && !post.tags.category?.includes(filters.category)) return false;
    return true;
  });
}
