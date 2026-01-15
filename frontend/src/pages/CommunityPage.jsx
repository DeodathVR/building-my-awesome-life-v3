import React, { useState } from 'react';
import { Users, Heart, Send, Trophy, Calendar, Target, Flame, MessageCircle } from 'lucide-react';
import { Card } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Textarea } from '../components/ui/textarea';
import { useApp } from '../context/AppContext';
import { toast } from 'sonner';
import { formatDistanceToNow } from 'date-fns';

const CommunityPage = () => {
  const { communityPosts, challenges, createPost, likePost } = useApp();
  const [newPostContent, setNewPostContent] = useState('');
  const [isPosting, setIsPosting] = useState(false);

  const handleSubmitPost = async () => {
    if (!newPostContent.trim()) {
      toast.error('Please write something to share');
      return;
    }

    setIsPosting(true);
    try {
      await createPost(newPostContent.trim());
      setNewPostContent('');
      toast.success('Post shared!', { description: 'Your update is now visible to the community' });
    } catch (err) {
      toast.error('Failed to post');
    }
    setIsPosting(false);
  };

  const handleLike = async (postId) => {
    await likePost(postId);
  };

  const getChallengeIcon = (type) => {
    switch (type) {
      case 'focus': return Flame;
      case 'habit': return Target;
      default: return Trophy;
    }
  };

  return (
    <div className="min-h-screen pb-32 md:pb-8 px-6 py-8" data-testid="community-page">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12 animate-fade-in">
          <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-6">
            <Users className="w-8 h-8 text-primary" strokeWidth={1.5} />
          </div>
          <h1 className="font-heading text-3xl md:text-4xl font-bold text-foreground mb-4">
            Community
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Share your wins, get inspired, and join challenges with fellow habit builders.
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Feed */}
          <div className="lg:col-span-2 space-y-6">
            {/* Post Creator */}
            <Card className="p-6 rounded-2xl shadow-soft border-border/50">
              <h3 className="font-heading text-lg font-semibold mb-4 flex items-center gap-2">
                <MessageCircle className="w-5 h-5 text-primary" />
                Share Your Progress
              </h3>
              <Textarea
                placeholder="Share a win, milestone, or encouragement... (e.g., 'Hit 7 days of meditation! 🌟')"
                value={newPostContent}
                onChange={(e) => setNewPostContent(e.target.value)}
                className="rounded-xl resize-none mb-4"
                rows={3}
                data-testid="community-post-input"
              />
              <div className="flex justify-between items-center">
                <p className="text-sm text-muted-foreground">
                  Posts are anonymous. Be kind and encouraging!
                </p>
                <Button 
                  onClick={handleSubmitPost}
                  disabled={isPosting || !newPostContent.trim()}
                  className="rounded-full"
                  data-testid="community-post-submit"
                >
                  <Send className="w-4 h-4 mr-2" />
                  {isPosting ? 'Posting...' : 'Share'}
                </Button>
              </div>
            </Card>

            {/* Posts Feed */}
            <div className="space-y-4">
              <h3 className="font-heading text-lg font-semibold">Recent Updates</h3>
              
              {communityPosts.length === 0 ? (
                <Card className="p-8 rounded-2xl text-center border-dashed border-2">
                  <Users className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <h4 className="font-heading text-lg font-semibold mb-2">No posts yet</h4>
                  <p className="text-muted-foreground">Be the first to share your progress!</p>
                </Card>
              ) : (
                <div className="space-y-4 stagger-children">
                  {communityPosts.map((post) => (
                    <Card 
                      key={post.id}
                      className="p-5 rounded-2xl shadow-soft border-border/50 hover:shadow-md transition-all"
                      data-testid={`community-post-${post.id}`}
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <p className="text-foreground leading-relaxed mb-3">{post.content}</p>
                          <div className="flex items-center gap-4 text-sm text-muted-foreground">
                            <span>
                              {formatDistanceToNow(new Date(post.created_at), { addSuffix: true })}
                            </span>
                          </div>
                        </div>
                        <button
                          onClick={() => handleLike(post.id)}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-secondary hover:bg-secondary/80 transition-colors group"
                          data-testid={`like-post-${post.id}`}
                        >
                          <Heart 
                            className={`w-4 h-4 transition-colors ${post.likes > 0 ? 'text-red-500 fill-red-500' : 'text-muted-foreground group-hover:text-red-500'}`} 
                          />
                          <span className="text-sm font-medium">{post.likes}</span>
                        </button>
                      </div>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Challenges Sidebar */}
          <div className="space-y-6">
            <h3 className="font-heading text-lg font-semibold flex items-center gap-2">
              <Trophy className="w-5 h-5 text-accent-foreground" />
              Join a Challenge
            </h3>

            <div className="space-y-4">
              {challenges.map((challenge) => {
                const Icon = getChallengeIcon(challenge.type);
                return (
                  <Card 
                    key={challenge.id}
                    className="p-5 rounded-2xl shadow-soft border-border/50 hover:shadow-md transition-all cursor-pointer group"
                    data-testid={`challenge-card-${challenge.id}`}
                  >
                    <div className="flex items-start gap-4">
                      <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${
                        challenge.type === 'focus' ? 'bg-accent/20' : 'bg-primary/10'
                      }`}>
                        <Icon className={`w-6 h-6 ${
                          challenge.type === 'focus' ? 'text-accent-foreground' : 'text-primary'
                        }`} strokeWidth={1.5} />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-heading font-semibold mb-1 group-hover:text-primary transition-colors">
                          {challenge.title}
                        </h4>
                        <p className="text-sm text-muted-foreground mb-2">{challenge.description}</p>
                        <div className="flex items-center gap-2 text-xs">
                          <Calendar className="w-3.5 h-3.5" />
                          <span>{challenge.duration} days</span>
                        </div>
                      </div>
                    </div>
                    <Button 
                      variant="outline" 
                      className="w-full mt-4 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      Join Challenge
                    </Button>
                  </Card>
                );
              })}
            </div>

            {/* Inspirational Quote */}
            <Card className="p-6 rounded-2xl shadow-soft border-border/50 bg-gradient-to-br from-secondary/50 to-transparent">
              <blockquote className="text-center">
                <p className="text-foreground italic mb-3">
                  "We are what we repeatedly do. Excellence, then, is not an act, but a habit."
                </p>
                <cite className="text-sm text-muted-foreground">— Aristotle</cite>
              </blockquote>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CommunityPage;
