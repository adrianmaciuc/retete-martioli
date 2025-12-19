import { useState, useEffect } from "react";
import { Button } from "./ui/button";
import { Card } from "./ui/card";
import { RotateCw } from "lucide-react";

interface AvatarSelectorProps {
  currentAvatar: string;
  onSelect: (avatarUrl: string) => void;
  isLoading?: boolean;
}

export function AvatarSelector({ currentAvatar, onSelect, isLoading = false }: AvatarSelectorProps) {
  const [avatars, setAvatars] = useState<string[]>([]);
  const [selectedAvatar, setSelectedAvatar] = useState<string>(currentAvatar);

  // Generate random avatar URLs using DiceBear Avatars
  const generateAvatarUrls = () => {
    const urls: string[] = [];
    const styles = ["avataaars", "personas", "pixel-art"];
    
    for (let i = 0; i < 12; i++) {
      const randomSeed = Math.random().toString(36).substring(2, 15);
      const style = styles[i % styles.length];
      urls.push(`https://api.dicebear.com/8.x/${style}/svg?seed=${randomSeed}`);
    }
    return urls;
  };

  useEffect(() => {
    setAvatars(generateAvatarUrls());
  }, []);

  const handleRandomize = () => {
    setAvatars(generateAvatarUrls());
  };

  const handleSelect = (avatarUrl: string) => {
    setSelectedAvatar(avatarUrl);
    onSelect(avatarUrl);
  };

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-lg font-semibold mb-4">Select Avatar</h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
          {avatars.map((avatar, index) => (
            <Card
              key={`${avatar}-${index}`}
              className={`p-3 cursor-pointer transition-all ${
                selectedAvatar === avatar
                  ? "ring-2 ring-primary border-primary"
                  : "hover:border-primary/50"
              }`}
              onClick={() => handleSelect(avatar)}
            >
              <img
                src={avatar}
                alt={`Avatar ${index + 1}`}
                className="w-full h-auto rounded-lg"
              />
            </Card>
          ))}
        </div>
      </div>

      <Button
        onClick={handleRandomize}
        variant="outline"
        size="sm"
        disabled={isLoading}
        className="w-full sm:w-auto"
      >
        <RotateCw className="w-4 h-4 mr-2" />
        Get More Avatars
      </Button>
    </div>
  );
}
