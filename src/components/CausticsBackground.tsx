import causticsTexture from "@/assets/caustics-texture.jpg";

/**
 * Deep-water caustics — luxurious submarine ambience.
 * Pure GPU: two copies of a light-filament texture drift imperceptibly
 * (60–90s cycles) in opposite directions, screen-blended over OLED black.
 */
export const CausticsBackground = () => {
  return (
    <div className="caustics-wrap" aria-hidden="true">
      {/* Primary filament sheet — slow drift */}
      <div
        className="caustic-sheet caustic-a"
        style={{ backgroundImage: `url(${causticsTexture})` }}
      />
      {/* Secondary sheet — counter-drift + flipped for interference shimmer */}
      <div
        className="caustic-sheet caustic-b"
        style={{ backgroundImage: `url(${causticsTexture})` }}
      />
      {/* Deep light blobs — very slow breathing */}
      <div className="caustic-blobs" />
      {/* Vignette to keep edges OLED-black */}
      <div className="caustic-vignette" />
    </div>
  );
};

export default CausticsBackground;
