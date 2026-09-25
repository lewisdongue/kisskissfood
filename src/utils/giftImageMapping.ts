/**
 * Gift Image Mapping Utility
 * 
 * Maps gift names to their local image paths in /public/gifts/
 * 
 * Priority order for image display:
 * 1. Local image (from this mapping)
 * 2. Database URL (from marketplace_gifts.image_url)
 * 3. Icon fallback (lucide-react icons)
 * 
 * Available images in /public/gifts/:
 * - call.png (The Siren's Call)
 * - Cosmic-Sovereignty.png
 * - Crown.png
 * - Diamond.png
 * - Eternal-legend.png
 * - GamePad.png
 * - Infinity_Diamond.png
 * - LuxuryBag.png
 * - Oracle.png
 * - Rocket.png
 * - SmartPhone.png
 * 
 * To add more local images:
 * 1. Place the image in /public/gifts/ directory
 * 2. Add the mapping in the imageMap below
 * 3. The local image will take priority over database URLs
 */

export const getGiftImagePath = (giftName: string): string | null => {
  const normalizedName = giftName.toLowerCase().trim();
  
  // Map gift names to their corresponding image files
  const imageMap: Record<string, string | null> = {
    // Premium Gifts (up to $300)
    "the siren's call": "/gifts/call.png",
    "infinite diamond": "/gifts/Infinity_Diamond.png",
    "the oracle": "/gifts/Oracle.png",
    "cosmic sovereignty": "/gifts/Cosmic-Sovereignty.png",
    "eternal legend": "/gifts/Eternal-legend.png",
    
    // Regular Gifts (use icons - no image needed)
    "sparkle": null,
    "heart": null,
    "gift box": null,
    "headphones": null,
    "idea": null,
    "timepiece": null,
    
    // Regular Gifts (with images)
    "smartphone": "/gifts/SmartPhone.png",
    "gamepad": "/gifts/GamePad.png",
    "luxury bag": "/gifts/LuxuryBag.png",
    "diamond": "/gifts/Diamond.png",
    "crown": "/gifts/Crown.png",
    "rocket": "/gifts/Rocket.png",
  };
  
  return imageMap[normalizedName] || null;
};

/**
 * Check if a gift has a local image available
 */
export const hasLocalImage = (giftName: string): boolean => {
  return getGiftImagePath(giftName) !== null;
};

