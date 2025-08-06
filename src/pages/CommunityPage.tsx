import LiveWorkoutFeed from "@/components/social/LiveWorkoutFeed";

export default function CommunityPage() {
  return (
    <div className="container mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">Community</h1>
        <p className="text-muted-foreground">
          Connect with fellow Phoenix users, share your workouts, and stay motivated together
        </p>
      </div>
      
      <LiveWorkoutFeed />
    </div>
  );
}