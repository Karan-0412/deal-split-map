// Generate consistent avatar colors for users
const avatarColors = [
  "#FF6B6B", // Red
  "#4ECDC4", // Teal
  "#45B7D1", // Blue
  "#96CEB4", // Green
  "#FECA57", // Yellow
  "#FF9FF3", // Pink
  "#54A0FF", // Light Blue
  "#5F27CD", // Purple
  "#00D2D3", // Cyan
  "#FF9F43", // Orange
  "#10AC84", // Emerald
  "#EE5A52", // Coral
  "#0ABDE3", // Sky Blue
  "#C44569", // Dark Pink
  "#F8B500", // Amber
];

export const generateAvatarColor = (userId: string): string => {
  // Create a simple hash from the user ID
  let hash = 0;
  for (let i = 0; i < userId.length; i++) {
    const char = userId.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  
  // Use the hash to pick a color from our palette
  const colorIndex = Math.abs(hash) % avatarColors.length;
  return avatarColors[colorIndex];
};

export const getInitials = (name: string): string => {
  return name
    .split(' ')
    .map(part => part.charAt(0))
    .join('')
    .toUpperCase()
    .slice(0, 2);
};